/**
 * RescueModeService - 救援模式服务 (Web版本)
 * 移植自 mobile/src/services/RescueModeController.ts
 * 在用户连续3次发音训练失败时触发救援模式
 * 仅在"发音训练"（pronunciation_training）阶段生效，不影响听音辨义
 */

import { webStorageAdapter } from '../adapters/WebStorageAdapter';
import { webAnalyticsAdapter } from '../adapters/WebAnalyticsAdapter';
import { progressManager } from '../progressManager';
import { performanceMonitor } from '../utils/PerformanceMonitor';

// 救援模式状态
export interface RescueModeState {
  isActive: boolean;
  triggeredAt: string;
  keywordId: string;
  userId: string;
  
  // 错误计数
  consecutivePronunciationFailures: number;
  totalPronunciationAttempts: number;
  
  // 触发条件
  triggerThreshold: number; // 默认3次连续发音失败
  
  // 救援资源
  rescueVideoUrl: string; // 口型特写慢动作视频
  phoneticTips: string[]; // 发音技巧
  
  // 降低标准
  loweredPassThreshold: number; // 从70分降到60分
  bonusScoring: boolean; // 启用奖励评分
  
  // 用户反馈
  supportiveMessage: string;
  
  // 会话信息
  sessionId: string;
  learningPhase: 'context_guessing' | 'pronunciation_training';
}

// 救援模式配置
export interface RescueModeConfig {
  // 触发条件
  triggerThreshold: number; // 连续发音失败次数
  enabledPhases: ('context_guessing' | 'pronunciation_training')[];
  
  // 评分调整
  normalPassThreshold: number; // 正常通过分数 (70)
  rescuePassThreshold: number; // 救援模式通过分数 (60)
  bonusPoints: number; // 奖励分数
  
  // 救援资源
  rescueVideoSettings: {
    playbackSpeed: number; // 0.5x 慢速播放
    loopCount: number; // 循环播放次数
    showPhoneticGuide: boolean;
  };
  
  // 用户体验
  supportiveMessages: string[];
  encouragementLevel: 'gentle' | 'motivational' | 'technical';
  
  // 分析追踪
  trackingEnabled: boolean;
  effectivenessTracking: boolean;
}

// 救援模式事件
export interface RescueModeEvent {
  eventId: string;
  eventType: 'triggered' | 'video_played' | 'tips_shown' | 'user_improved' | 'exited';
  timestamp: string;
  
  // 上下文信息
  userId: string;
  keywordId: string;
  sessionId: string;
  
  // 发音数据
  consecutiveFailures: number;
  totalAttempts: number;
  scoreBeforeRescue?: number;
  scoreAfterRescue?: number;
  
  // 救援效果
  rescueEffective: boolean;
  timeInRescueMode?: number; // ms
  
  // 元数据
  learningPhase: string;
  difficulty: string;
  phoneticTipsUsed: string[];
}

export class RescueModeService {
  private static instance: RescueModeService;
  private rescueModeStates: Map<string, RescueModeState> = new Map();
  private rescueModeEvents: RescueModeEvent[] = [];
  private rescueModeConfig: RescueModeConfig;
  
  // 存储键
  private readonly STORAGE_KEY_STATES = 'rescue_mode_states';
  private readonly STORAGE_KEY_EVENTS = 'rescue_mode_events';
  private readonly STORAGE_KEY_CONFIG = 'rescue_mode_config';

  private constructor() {
    this.rescueModeConfig = this.getDefaultConfig();
    this.loadLocalData();
  }

  static getInstance(): RescueModeService {
    if (!RescueModeService.instance) {
      RescueModeService.instance = new RescueModeService();
    }
    return RescueModeService.instance;
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): RescueModeConfig {
    return {
      triggerThreshold: 3, // 连续3次发音失败触发
      enabledPhases: ['pronunciation_training'], // 仅在发音训练阶段启用
      normalPassThreshold: 70, // 正常70分通过
      rescuePassThreshold: 60, // 救援模式60分通过
      bonusPoints: 5, // 奖励5分
      rescueVideoSettings: {
        playbackSpeed: 0.5, // 0.5倍速慢放
        loopCount: 3, // 循环3次
        showPhoneticGuide: true,
      },
      supportiveMessages: [
        '🆘 别担心，让我来帮你！看看这个慢动作示范',
        '💪 发音需要练习，我们一步步来！',
        '🎯 专注看口型，你一定可以的！',
        '✨ 慢慢来，每个人都有自己的节奏',
        '🌟 不要放弃，我相信你能做到！',
        '🤝 让我们一起克服这个困难！'
      ],
      encouragementLevel: 'gentle',
      trackingEnabled: true,
      effectivenessTracking: true,
    };
  }

  // ===== 核心功能 =====

  /**
   * 记录发音失败
   */
  async recordPronunciationFailure(
    userId: string,
    keywordId: string,
    sessionId: string,
    pronunciationScore: number,
    phoneticTips: string[] = []
  ): Promise<boolean> {
    try {
      // 检查是否在启用的学习阶段
      if (!this.rescueModeConfig.enabledPhases.includes('pronunciation_training')) {
        return false;
      }

      // 获取或创建用户状态
      let state = this.rescueModeStates.get(userId);
      if (!state) {
        state = {
          isActive: false,
          triggeredAt: '',
          keywordId,
          userId,
          consecutivePronunciationFailures: 0,
          totalPronunciationAttempts: 0,
          triggerThreshold: this.rescueModeConfig.triggerThreshold,
          rescueVideoUrl: this.generateRescueVideoUrl(keywordId),
          phoneticTips: this.generatePhoneticTips(keywordId),
          loweredPassThreshold: this.rescueModeConfig.rescuePassThreshold,
          bonusScoring: true,
          supportiveMessage: '',
          sessionId,
          learningPhase: 'pronunciation_training',
        };
      }

      // 更新失败计数
      state.consecutivePronunciationFailures++;
      state.totalPronunciationAttempts++;
      state.keywordId = keywordId;
      state.sessionId = sessionId;
      state.phoneticTips = phoneticTips.length > 0 ? phoneticTips : this.generatePhoneticTips(keywordId);

      // 检查是否需要触发救援模式
      const shouldTrigger = state.consecutivePronunciationFailures >= state.triggerThreshold && !state.isActive;

      if (shouldTrigger) {
        await this.triggerRescueMode(state, pronunciationScore);
      }

      this.rescueModeStates.set(userId, state);
      await this.saveLocalData();

      return shouldTrigger;

    } catch (error) {
      console.error('Error recording pronunciation failure:', error);
      return false;
    }
  }

  /**
   * 触发救援模式
   */
  private async triggerRescueMode(state: RescueModeState, scoreBeforeRescue: number): Promise<void> {
    // 开始性能监控
    performanceMonitor.startFocusModeActivation();
    
    state.isActive = true;
    state.triggeredAt = new Date().toISOString();
    state.supportiveMessage = this.getRandomSupportiveMessage();

    // 记录触发事件
    this.recordEvent({
      eventType: 'triggered',
      userId: state.userId,
      keywordId: state.keywordId,
      sessionId: state.sessionId,
      consecutiveFailures: state.consecutivePronunciationFailures,
      totalAttempts: state.totalPronunciationAttempts,
      scoreBeforeRescue,
      rescueEffective: false, // 将在后续更新
      learningPhase: state.learningPhase,
      difficulty: 'unknown',
      phoneticTipsUsed: state.phoneticTips,
    });

    // 同步到progressManager
    await this.syncToProgressManager(state);
    
    // 结束性能监控
    performanceMonitor.endFocusModeActivation();
  }

  /**
   * 记录发音改善
   */
  async recordPronunciationImprovement(
    userId: string,
    newScore: number,
    passedWithRescue: boolean
  ): Promise<void> {
    try {
      const state = this.rescueModeStates.get(userId);
      if (!state || !state.isActive) return;

      // 开始性能监控
      performanceMonitor.startFocusModeDeactivation();

      const timeInRescueMode = Date.now() - new Date(state.triggeredAt).getTime();

      // 重置失败计数
      state.consecutivePronunciationFailures = 0;
      
      if (passedWithRescue) {
        // 用户在救援模式下成功
        state.isActive = false;
        state.supportiveMessage = '';

        this.recordEvent({
          eventType: 'user_improved',
          userId: state.userId,
          keywordId: state.keywordId,
          sessionId: state.sessionId,
          consecutiveFailures: 0,
          totalAttempts: state.totalPronunciationAttempts,
          scoreAfterRescue: newScore,
          rescueEffective: true,
          timeInRescueMode,
          learningPhase: state.learningPhase,
          difficulty: 'unknown',
          phoneticTipsUsed: state.phoneticTips,
        });

        // 记录成功事件到progressManager
        await this.syncSuccessToProgressManager(state, newScore, timeInRescueMode);
      }

      this.rescueModeStates.set(userId, state);
      await this.saveLocalData();
      
      // 结束性能监控
      performanceMonitor.endFocusModeDeactivation();

    } catch (error) {
      console.error('Error recording pronunciation improvement:', error);
    }
  }

  /**
   * 获取用户救援模式状态
   */
  getRescueModeState(userId: string): RescueModeState | null {
    return this.rescueModeStates.get(userId) || null;
  }

  /**
   * 检查救援模式是否激活
   */
  isRescueModeActive(userId: string): boolean {
    const state = this.rescueModeStates.get(userId);
    return state ? state.isActive : false;
  }

  /**
   * 检查是否应该使用降低的通过标准
   */
  shouldUseLoweredThreshold(userId: string): boolean {
    const state = this.rescueModeStates.get(userId);
    return state?.isActive || false;
  }

  /**
   * 获取当前通过分数阈值
   */
  getCurrentPassThreshold(userId: string): number {
    const state = this.rescueModeStates.get(userId);
    if (state?.isActive) {
      return state.loweredPassThreshold;
    }
    return this.rescueModeConfig.normalPassThreshold;
  }

  /**
   * 计算救援模式下的分数（包含奖励分）
   */
  calculateRescueScore(userId: string, originalScore: number): number {
    const state = this.rescueModeStates.get(userId);
    if (state?.isActive && state.bonusScoring) {
      return Math.min(100, originalScore + this.rescueModeConfig.bonusPoints);
    }
    return originalScore;
  }

  /**
   * 获取救援视频URL
   */
  getRescueVideoUrl(userId: string): string | null {
    const state = this.rescueModeStates.get(userId);
    return state?.isActive ? state.rescueVideoUrl : null;
  }

  /**
   * 获取发音技巧
   */
  getPhoneticTips(userId: string): string[] {
    const state = this.rescueModeStates.get(userId);
    return state?.isActive ? state.phoneticTips : [];
  }

  /**
   * 手动退出救援模式
   */
  async exitRescueMode(userId: string): Promise<void> {
    const state = this.rescueModeStates.get(userId);
    if (!state || !state.isActive) return;

    const timeInRescueMode = Date.now() - new Date(state.triggeredAt).getTime();

    state.isActive = false;
    state.supportiveMessage = '';

    this.recordEvent({
      eventType: 'exited',
      userId: state.userId,
      keywordId: state.keywordId,
      sessionId: state.sessionId,
      consecutiveFailures: state.consecutivePronunciationFailures,
      totalAttempts: state.totalPronunciationAttempts,
      rescueEffective: false,
      timeInRescueMode,
      learningPhase: state.learningPhase,
      difficulty: 'unknown',
      phoneticTipsUsed: state.phoneticTips,
    });

    this.rescueModeStates.set(userId, state);
    await this.saveLocalData();
  }

  // ===== 辅助方法 =====

  /**
   * 生成救援视频URL
   */
  private generateRescueVideoUrl(keywordId: string): string {
    // 这里可以根据关键词生成对应的救援视频URL
    // 暂时使用占位符，实际应该从CDN或视频服务获取
    return `/videos/rescue/${keywordId}_slow_motion.mp4`;
  }

  /**
   * 生成发音技巧
   */
  private generatePhoneticTips(keywordId: string): string[] {
    // 基于关键词生成发音技巧
    const commonTips = [
      '注意舌头的位置',
      '放慢语速，清晰发音',
      '观察口型变化',
      '注意气流的控制'
    ];

    // 根据关键词添加特定技巧
    const specificTips: { [key: string]: string[] } = {
      'hello': ['h音要轻柔', 'e音要饱满', 'l音舌尖抵上颚'],
      'world': ['w音嘴唇要圆', 'r音要卷舌', 'd音要清脆'],
      'pronunciation': ['重音在nun上', '分音节练习', 'tion读作shun'],
    };

    const keywordSpecific = specificTips[keywordId.toLowerCase()] || [];
    return [...commonTips, ...keywordSpecific];
  }

  /**
   * 获取随机支持消息
   */
  private getRandomSupportiveMessage(): string {
    const messages = this.rescueModeConfig.supportiveMessages;
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * 记录事件
   */
  private recordEvent(eventData: Omit<RescueModeEvent, 'eventId' | 'timestamp'>): void {
    const event: RescueModeEvent = {
      eventId: `rescue_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date().toISOString(),
      ...eventData,
    };

    this.rescueModeEvents.push(event);

    // 限制事件数量
    if (this.rescueModeEvents.length > 1000) {
      this.rescueModeEvents.splice(0, this.rescueModeEvents.length - 1000);
    }

    // 发送到分析服务
    if (this.rescueModeConfig.trackingEnabled) {
      webAnalyticsAdapter.trackEvent({
        eventName: `rescue_mode_${event.eventType}`,
        parameters: {
          user_id: event.userId,
          keyword_id: event.keywordId,
          session_id: event.sessionId,
          consecutive_failures: event.consecutiveFailures,
          total_attempts: event.totalAttempts,
          learning_phase: event.learningPhase,
          rescue_effective: event.rescueEffective
        }
      });
    }
  }

  /**
   * 同步到progressManager
   */
  private async syncToProgressManager(state: RescueModeState): Promise<void> {
    try {
      // 记录Rescue Mode触发事件到progressManager
      await progressManager.recordRescueModeTriggered(
        state.userId,
        state.keywordId,
        state.consecutivePronunciationFailures
      );

      console.log('Rescue Mode triggered and synced to progressManager:', state.userId);
    } catch (error) {
      console.warn('Failed to sync to progressManager:', error);
    }
  }

  /**
   * 同步成功事件到progressManager
   */
  private async syncSuccessToProgressManager(
    state: RescueModeState,
    newScore: number,
    timeInRescueMode: number
  ): Promise<void> {
    try {
      // 记录Rescue Mode成功事件
      await progressManager.recordRescueModeSuccess(
        state.userId,
        state.keywordId,
        timeInRescueMode,
        newScore >= state.loweredPassThreshold
      );

      console.log('Rescue Mode success synced to progressManager:', {
        userId: state.userId,
        score: newScore,
        timeInRescue: timeInRescueMode
      });
    } catch (error) {
      console.warn('Failed to sync success to progressManager:', error);
    }
  }

  // ===== 数据持久化 =====

  /**
   * 保存本地数据
   */
  private async saveLocalData(): Promise<void> {
    try {
      // 保存状态
      const statesArray = Array.from(this.rescueModeStates.entries());
      await webStorageAdapter.setItem(this.STORAGE_KEY_STATES, JSON.stringify(statesArray));

      // 保存事件
      await webStorageAdapter.setItem(this.STORAGE_KEY_EVENTS, JSON.stringify(this.rescueModeEvents));

      // 保存配置
      await webStorageAdapter.setItem(this.STORAGE_KEY_CONFIG, JSON.stringify(this.rescueModeConfig));
    } catch (error) {
      console.error('Failed to save rescue mode data:', error);
    }
  }

  /**
   * 加载本地数据
   */
  private async loadLocalData(): Promise<void> {
    try {
      // 加载状态
      const statesData = await webStorageAdapter.getItem(this.STORAGE_KEY_STATES);
      if (statesData) {
        const statesArray = JSON.parse(statesData);
        this.rescueModeStates = new Map(statesArray);
      }

      // 加载事件
      const eventsData = await webStorageAdapter.getItem(this.STORAGE_KEY_EVENTS);
      if (eventsData) {
        this.rescueModeEvents = JSON.parse(eventsData);
      }

      // 加载配置
      const configData = await webStorageAdapter.getItem(this.STORAGE_KEY_CONFIG);
      if (configData) {
        this.rescueModeConfig = { ...this.getDefaultConfig(), ...JSON.parse(configData) };
      }
    } catch (error) {
      console.error('Failed to load rescue mode data:', error);
    }
  }
}

  // ===== 公共API =====

  /**
   * 获取救援模式统计
   */
  getRescueModeStatistics(userId?: string): {
    totalTriggers: number;
    successRate: number;
    averageTimeToImprovement: number;
    effectivenessRate: number;
    userSpecificStats?: {
      triggers: number;
      improvements: number;
      averageFailures: number;
    };
  } {
    const events = userId ?
      this.rescueModeEvents.filter(e => e.userId === userId) :
      this.rescueModeEvents;

    const triggers = events.filter(e => e.eventType === 'triggered').length;
    const improvements = events.filter(e => e.eventType === 'user_improved').length;
    const successRate = triggers > 0 ? improvements / triggers : 0;

    const improvementEvents = events.filter(e => e.eventType === 'user_improved' && e.timeInRescueMode);
    const averageTimeToImprovement = improvementEvents.length > 0 ?
      improvementEvents.reduce((sum, e) => sum + (e.timeInRescueMode || 0), 0) / improvementEvents.length : 0;

    const effectiveEvents = events.filter(e => e.rescueEffective);
    const effectivenessRate = events.length > 0 ? effectiveEvents.length / events.length : 0;

    const result: any = {
      totalTriggers: triggers,
      successRate,
      averageTimeToImprovement,
      effectivenessRate,
    };

    if (userId) {
      const userEvents = events.filter(e => e.userId === userId);
      const userTriggers = userEvents.filter(e => e.eventType === 'triggered').length;
      const userImprovements = userEvents.filter(e => e.eventType === 'user_improved').length;
      const totalFailures = userEvents.reduce((sum, e) => sum + e.consecutiveFailures, 0);
      const averageFailures = userEvents.length > 0 ? totalFailures / userEvents.length : 0;

      result.userSpecificStats = {
        triggers: userTriggers,
        improvements: userImprovements,
        averageFailures,
      };
    }

    return result;
  }

  /**
   * 重置用户救援模式状态
   */
  resetUserState(userId: string): void {
    this.rescueModeStates.delete(userId);
    this.saveLocalData();
  }

  /**
   * 获取救援模式配置
   */
  getConfig(): RescueModeConfig {
    return { ...this.rescueModeConfig };
  }

  /**
   * 更新救援模式配置
   */
  async updateConfig(newConfig: Partial<RescueModeConfig>): Promise<void> {
    this.rescueModeConfig = { ...this.rescueModeConfig, ...newConfig };
    await this.saveLocalData();
  }
}

// 创建单例实例
export const rescueModeService = RescueModeService.getInstance();
