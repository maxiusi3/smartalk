/**
 * RescueModeController - 救援模式控制器
 * 在用户连续3次发音训练失败时触发救援模式
 * 仅在"跟读训练"（pronunciation training）阶段生效，不影响情景猜义
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalyticsService } from './AnalyticsService';

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

class RescueModeController {
  private static instance: RescueModeController;
  private analyticsService = AnalyticsService.getInstance();
  
  // 状态管理
  private rescueModeStates: Map<string, RescueModeState> = new Map(); // userId -> state
  private rescueModeConfig: RescueModeConfig;
  private rescueModeEvents: RescueModeEvent[] = [];
  
  // 存储键
  private readonly STATES_KEY = 'rescue_mode_states';
  private readonly CONFIG_KEY = 'rescue_mode_config';
  private readonly EVENTS_KEY = 'rescue_mode_events';

  static getInstance(): RescueModeController {
    if (!RescueModeController.instance) {
      RescueModeController.instance = new RescueModeController();
    }
    return RescueModeController.instance;
  }

  constructor() {
    this.rescueModeConfig = this.getDefaultConfig();
    this.initializeController();
  }

  // ===== 初始化 =====

  /**
   * 初始化控制器
   */
  private async initializeController(): Promise<void> {
    try {
      await this.loadLocalData();
      
      this.analyticsService.track('rescue_mode_controller_initialized', {
        activeStatesCount: this.rescueModeStates.size,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error initializing rescue mode controller:', error);
    }
  }

  /**
   * 加载本地数据
   */
  private async loadLocalData(): Promise<void> {
    try {
      const statesData = await AsyncStorage.getItem(this.STATES_KEY);
      if (statesData) {
        const states: RescueModeState[] = JSON.parse(statesData);
        states.forEach(state => {
          this.rescueModeStates.set(state.userId, state);
        });
      }

      const configData = await AsyncStorage.getItem(this.CONFIG_KEY);
      if (configData) {
        this.rescueModeConfig = JSON.parse(configData);
      }

      const eventsData = await AsyncStorage.getItem(this.EVENTS_KEY);
      if (eventsData) {
        this.rescueModeEvents = JSON.parse(eventsData);
      }

    } catch (error) {
      console.error('Error loading rescue mode data:', error);
    }
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
  recordPronunciationFailure(
    userId: string,
    keywordId: string,
    sessionId: string,
    pronunciationScore: number,
    phoneticTips: string[] = []
  ): boolean {
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
          rescueVideoUrl: `rescue_video_${keywordId}.mp4`,
          phoneticTips,
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
      state.phoneticTips = phoneticTips;

      // 检查是否需要触发救援模式
      const shouldTrigger = state.consecutivePronunciationFailures >= state.triggerThreshold && !state.isActive;

      if (shouldTrigger) {
        this.triggerRescueMode(state, pronunciationScore);
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
  private triggerRescueMode(state: RescueModeState, scoreBeforeRescue: number): void {
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

    // 分析追踪
    this.analyticsService.track('rescue_mode_triggered', {
      userId: state.userId,
      keywordId: state.keywordId,
      sessionId: state.sessionId,
      consecutiveFailures: state.consecutivePronunciationFailures,
      totalAttempts: state.totalPronunciationAttempts,
      scoreBeforeRescue,
      timestamp: Date.now(),
    });
  }

  /**
   * 记录发音改善
   */
  recordPronunciationImprovement(
    userId: string,
    newScore: number,
    passedWithRescue: boolean
  ): void {
    try {
      const state = this.rescueModeStates.get(userId);
      if (!state || !state.isActive) return;

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

        this.analyticsService.track('rescue_mode_success', {
          userId: state.userId,
          keywordId: state.keywordId,
          sessionId: state.sessionId,
          scoreAfterRescue: newScore,
          timeInRescueMode,
          totalAttempts: state.totalPronunciationAttempts,
          timestamp: Date.now(),
        });
      }

      this.rescueModeStates.set(userId, state);
      this.saveLocalData();

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
  exitRescueMode(userId: string): void {
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
    this.saveLocalData();
  }

  // ===== 辅助方法 =====

  private getRandomSupportiveMessage(): string {
    const messages = this.rescueModeConfig.supportiveMessages;
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private recordEvent(eventData: Omit<RescueModeEvent, 'eventId' | 'timestamp'>): void {
    const event: RescueModeEvent = {
      eventId: `rescue_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...eventData,
    };

    this.rescueModeEvents.push(event);

    // 保持事件历史在合理范围内
    if (this.rescueModeEvents.length > 1000) {
      this.rescueModeEvents = this.rescueModeEvents.slice(-500);
    }
  }

  // ===== 数据持久化 =====

  private async saveLocalData(): Promise<void> {
    try {
      const states = Array.from(this.rescueModeStates.values());
      await AsyncStorage.setItem(this.STATES_KEY, JSON.stringify(states));
      await AsyncStorage.setItem(this.CONFIG_KEY, JSON.stringify(this.rescueModeConfig));
      await AsyncStorage.setItem(this.EVENTS_KEY, JSON.stringify(this.rescueModeEvents));
    } catch (error) {
      console.error('Error saving rescue mode data:', error);
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
}

export default RescueModeController;
