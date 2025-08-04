/**
 * FocusModeService - 专注模式服务 (Web版本)
 * 移植自 mobile/src/services/FocusModeController.ts
 * 在用户连续2次错误选择视频选项时触发专注模式
 * 仅在"听音辨义"（context guessing）阶段生效，不影响发音训练
 */

import { webStorageAdapter } from '../adapters/WebStorageAdapter';
import { webAnalyticsAdapter } from '../adapters/WebAnalyticsAdapter';
import { progressManager } from '../progressManager';
import { performanceMonitor } from '../utils/PerformanceMonitor';

// 专注模式状态
export interface FocusModeState {
  isActive: boolean;
  triggeredAt: string;
  keywordId: string;
  userId: string;
  
  // 错误计数
  consecutiveErrors: number;
  totalAttempts: number;
  
  // 触发条件
  triggerThreshold: number; // 默认2次连续错误
  
  // 视觉效果
  highlightCorrectOption: boolean;
  showGlowEffect: boolean;
  
  // 用户反馈
  supportiveMessage: string;
  
  // 会话信息
  sessionId: string;
  learningPhase: 'context_guessing' | 'pronunciation_training';
}

// 专注模式配置
export interface FocusModeConfig {
  // 触发条件
  triggerThreshold: number; // 连续错误次数
  enabledPhases: ('context_guessing' | 'pronunciation_training')[];
  
  // 视觉效果
  highlightStyle: {
    glowColor: string;
    glowIntensity: number;
    animationDuration: number; // ms
    pulseEffect: boolean;
  };
  
  // 用户体验
  supportiveMessages: string[];
  displayDuration: number; // ms
  autoExit: boolean;
  
  // 分析追踪
  trackingEnabled: boolean;
  detailedLogging: boolean;
}

// 专注模式事件
export interface FocusModeEvent {
  eventId: string;
  eventType: 'triggered' | 'activated' | 'option_highlighted' | 'user_success' | 'exited';
  timestamp: string;
  
  // 上下文信息
  userId: string;
  keywordId: string;
  sessionId: string;
  
  // 错误信息
  consecutiveErrors: number;
  totalAttempts: number;
  
  // 结果数据
  helpfulnessRating?: number; // 用户评价专注模式是否有帮助
  timeToSuccess?: number; // 从触发到成功的时间（ms）
  
  // 元数据
  learningPhase: string;
  difficulty: string;
}

export class FocusModeService {
  private static instance: FocusModeService;
  private focusModeStates: Map<string, FocusModeState> = new Map();
  private focusModeEvents: FocusModeEvent[] = [];
  private focusModeConfig: FocusModeConfig;
  
  // 存储键
  private readonly STORAGE_KEY_STATES = 'focus_mode_states';
  private readonly STORAGE_KEY_EVENTS = 'focus_mode_events';
  private readonly STORAGE_KEY_CONFIG = 'focus_mode_config';

  private constructor() {
    this.focusModeConfig = this.getDefaultConfig();
    this.loadLocalData();
  }

  static getInstance(): FocusModeService {
    if (!FocusModeService.instance) {
      FocusModeService.instance = new FocusModeService();
    }
    return FocusModeService.instance;
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): FocusModeConfig {
    return {
      triggerThreshold: 2, // 连续2次错误触发
      enabledPhases: ['context_guessing'], // 仅在听音辨义阶段启用
      highlightStyle: {
        glowColor: '#fbbf24', // 金色发光
        glowIntensity: 0.8,
        animationDuration: 1000,
        pulseEffect: true,
      },
      supportiveMessages: [
        '🎯 专注模式已启动，正确答案会有提示哦！',
        '💡 别担心，我来帮你找到正确答案！',
        '✨ 专注一下，答案就在眼前！',
        '🌟 让我们一起找到正确的选项！',
      ],
      displayDuration: 3000, // 3秒显示时间
      autoExit: true,
      trackingEnabled: true,
      detailedLogging: true,
    };
  }

  // ===== 核心功能 =====

  /**
   * 记录用户选择错误
   */
  async recordError(
    userId: string,
    keywordId: string,
    sessionId: string,
    learningPhase: 'context_guessing' | 'pronunciation_training'
  ): Promise<boolean> {
    try {
      // 检查是否在启用的学习阶段
      if (!this.focusModeConfig.enabledPhases.includes(learningPhase)) {
        return false;
      }

      // 获取或创建用户状态
      let state = this.focusModeStates.get(userId);
      if (!state) {
        state = {
          isActive: false,
          triggeredAt: '',
          keywordId,
          userId,
          consecutiveErrors: 0,
          totalAttempts: 0,
          triggerThreshold: this.focusModeConfig.triggerThreshold,
          highlightCorrectOption: false,
          showGlowEffect: false,
          supportiveMessage: '',
          sessionId,
          learningPhase,
        };
      }

      // 更新错误计数
      state.consecutiveErrors++;
      state.totalAttempts++;
      state.keywordId = keywordId;
      state.sessionId = sessionId;
      state.learningPhase = learningPhase;

      // 检查是否需要触发专注模式
      const shouldTrigger = state.consecutiveErrors >= state.triggerThreshold && !state.isActive;

      if (shouldTrigger) {
        await this.triggerFocusMode(state);
      }

      this.focusModeStates.set(userId, state);
      await this.saveLocalData();

      return shouldTrigger;

    } catch (error) {
      console.error('Error recording focus mode error:', error);
      return false;
    }
  }

  /**
   * 触发专注模式
   */
  private async triggerFocusMode(state: FocusModeState): Promise<void> {
    // 开始性能监控
    performanceMonitor.startFocusModeActivation();

    state.isActive = true;
    state.triggeredAt = new Date().toISOString();
    state.highlightCorrectOption = true;
    state.showGlowEffect = true;
    state.supportiveMessage = this.getRandomSupportiveMessage();

    // 记录触发事件
    this.recordEvent({
      eventType: 'triggered',
      userId: state.userId,
      keywordId: state.keywordId,
      sessionId: state.sessionId,
      consecutiveErrors: state.consecutiveErrors,
      totalAttempts: state.totalAttempts,
      learningPhase: state.learningPhase,
      difficulty: 'unknown',
    });

    // 同步到progressManager
    await this.syncToProgressManager(state);

    // 结束性能监控
    performanceMonitor.endFocusModeActivation();
  }

  /**
   * 记录用户成功
   */
  async recordSuccess(userId: string): Promise<void> {
    const state = this.focusModeStates.get(userId);
    if (!state || !state.isActive) return;

    // 开始性能监控
    performanceMonitor.startFocusModeDeactivation();

    const timeToSuccess = Date.now() - new Date(state.triggeredAt).getTime();

    // 记录成功事件
    this.recordEvent({
      eventType: 'user_success',
      userId: state.userId,
      keywordId: state.keywordId,
      sessionId: state.sessionId,
      consecutiveErrors: state.consecutiveErrors,
      totalAttempts: state.totalAttempts,
      timeToSuccess,
      learningPhase: state.learningPhase,
      difficulty: 'unknown',
    });

    // 重置状态
    state.isActive = false;
    state.consecutiveErrors = 0;
    state.highlightCorrectOption = false;
    state.showGlowEffect = false;
    state.supportiveMessage = '';

    this.focusModeStates.set(userId, state);

    // 同步成功事件到progressManager
    try {
      await progressManager.recordFocusModeSuccess(userId, state.keywordId);
    } catch (error) {
      console.warn('Failed to sync success to progressManager:', error);
    }

    await this.saveLocalData();

    // 结束性能监控
    performanceMonitor.endFocusModeDeactivation();
  }

  /**
   * 获取用户专注模式状态
   */
  getFocusModeState(userId: string): FocusModeState | null {
    return this.focusModeStates.get(userId) || null;
  }

  /**
   * 检查专注模式是否激活
   */
  isFocusModeActive(userId: string): boolean {
    const state = this.focusModeStates.get(userId);
    return state ? state.isActive : false;
  }

  // ===== 辅助方法 =====

  /**
   * 获取随机支持消息
   */
  private getRandomSupportiveMessage(): string {
    const messages = this.focusModeConfig.supportiveMessages;
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * 记录事件
   */
  private recordEvent(eventData: Partial<FocusModeEvent>): void {
    const event: FocusModeEvent = {
      eventId: `focus_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date().toISOString(),
      ...eventData
    } as FocusModeEvent;

    this.focusModeEvents.push(event);

    // 限制事件数量
    if (this.focusModeEvents.length > 1000) {
      this.focusModeEvents.splice(0, this.focusModeEvents.length - 1000);
    }

    // 发送到分析服务
    if (this.focusModeConfig.trackingEnabled) {
      webAnalyticsAdapter.trackEvent({
        eventName: `focus_mode_${event.eventType}`,
        parameters: {
          user_id: event.userId,
          keyword_id: event.keywordId,
          session_id: event.sessionId,
          consecutive_errors: event.consecutiveErrors,
          total_attempts: event.totalAttempts,
          learning_phase: event.learningPhase
        }
      });
    }
  }

  /**
   * 同步到progressManager
   */
  private async syncToProgressManager(state: FocusModeState): Promise<void> {
    try {
      // 记录Focus Mode触发事件到progressManager
      await progressManager.recordFocusModeTriggered(
        state.userId,
        state.keywordId,
        state.consecutiveErrors
      );

      console.log('Focus Mode triggered and synced to progressManager:', state.userId);
    } catch (error) {
      console.warn('Failed to sync to progressManager:', error);
    }
  }

  // ===== 数据持久化 =====

  /**
   * 保存本地数据
   */
  private async saveLocalData(): Promise<void> {
    try {
      // 保存状态
      const statesArray = Array.from(this.focusModeStates.entries());
      await webStorageAdapter.setItem(this.STORAGE_KEY_STATES, JSON.stringify(statesArray));

      // 保存事件
      await webStorageAdapter.setItem(this.STORAGE_KEY_EVENTS, JSON.stringify(this.focusModeEvents));

      // 保存配置
      await webStorageAdapter.setItem(this.STORAGE_KEY_CONFIG, JSON.stringify(this.focusModeConfig));
    } catch (error) {
      console.error('Failed to save focus mode data:', error);
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
        this.focusModeStates = new Map(statesArray);
      }

      // 加载事件
      const eventsData = await webStorageAdapter.getItem(this.STORAGE_KEY_EVENTS);
      if (eventsData) {
        this.focusModeEvents = JSON.parse(eventsData);
      }

      // 加载配置
      const configData = await webStorageAdapter.getItem(this.STORAGE_KEY_CONFIG);
      if (configData) {
        this.focusModeConfig = { ...this.getDefaultConfig(), ...JSON.parse(configData) };
      }
    } catch (error) {
      console.error('Failed to load focus mode data:', error);
    }
  }
}

// 创建单例实例
export const focusModeService = FocusModeService.getInstance();
