/**
 * FocusModeController - 专注模式控制器
 * 在用户连续2次错误选择视频选项时触发专注模式
 * 仅在"听音辨义"（context guessing）阶段生效，不影响发音训练
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalyticsService } from './AnalyticsService';

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

class FocusModeController {
  private static instance: FocusModeController;
  private analyticsService = AnalyticsService.getInstance();
  
  // 状态管理
  private focusModeStates: Map<string, FocusModeState> = new Map(); // userId -> state
  private focusModeConfig: FocusModeConfig;
  private focusModeEvents: FocusModeEvent[] = [];
  
  // 存储键
  private readonly STATES_KEY = 'focus_mode_states';
  private readonly CONFIG_KEY = 'focus_mode_config';
  private readonly EVENTS_KEY = 'focus_mode_events';

  static getInstance(): FocusModeController {
    if (!FocusModeController.instance) {
      FocusModeController.instance = new FocusModeController();
    }
    return FocusModeController.instance;
  }

  constructor() {
    this.focusModeConfig = this.getDefaultConfig();
    this.initializeController();
  }

  // ===== 初始化 =====

  /**
   * 初始化控制器
   */
  private async initializeController(): Promise<void> {
    try {
      await this.loadLocalData();
      
      this.analyticsService.track('focus_mode_controller_initialized', {
        activeStatesCount: this.focusModeStates.size,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error initializing focus mode controller:', error);
    }
  }

  /**
   * 加载本地数据
   */
  private async loadLocalData(): Promise<void> {
    try {
      const statesData = await AsyncStorage.getItem(this.STATES_KEY);
      if (statesData) {
        const states: FocusModeState[] = JSON.parse(statesData);
        states.forEach(state => {
          this.focusModeStates.set(state.userId, state);
        });
      }

      const configData = await AsyncStorage.getItem(this.CONFIG_KEY);
      if (configData) {
        this.focusModeConfig = JSON.parse(configData);
      }

      const eventsData = await AsyncStorage.getItem(this.EVENTS_KEY);
      if (eventsData) {
        this.focusModeEvents = JSON.parse(eventsData);
      }

    } catch (error) {
      console.error('Error loading focus mode data:', error);
    }
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
  recordError(
    userId: string,
    keywordId: string,
    sessionId: string,
    learningPhase: 'context_guessing' | 'pronunciation_training'
  ): boolean {
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
        this.triggerFocusMode(state);
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
  private triggerFocusMode(state: FocusModeState): void {
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

    // 分析追踪
    this.analyticsService.track('focus_mode_triggered', {
      userId: state.userId,
      keywordId: state.keywordId,
      sessionId: state.sessionId,
      consecutiveErrors: state.consecutiveErrors,
      totalAttempts: state.totalAttempts,
      learningPhase: state.learningPhase,
      timestamp: Date.now(),
    });
  }

  /**
   * 记录用户成功
   */
  recordSuccess(userId: string): void {
    try {
      const state = this.focusModeStates.get(userId);
      if (!state) return;

      const wasActive = state.isActive;
      const timeToSuccess = wasActive ? 
        Date.now() - new Date(state.triggeredAt).getTime() : 0;

      // 重置状态
      state.consecutiveErrors = 0;
      state.isActive = false;
      state.highlightCorrectOption = false;
      state.showGlowEffect = false;
      state.supportiveMessage = '';

      if (wasActive) {
        // 记录成功事件
        this.recordEvent({
          eventType: 'user_success',
          userId: state.userId,
          keywordId: state.keywordId,
          sessionId: state.sessionId,
          consecutiveErrors: 0,
          totalAttempts: state.totalAttempts,
          timeToSuccess,
          learningPhase: state.learningPhase,
          difficulty: 'unknown',
        });

        this.analyticsService.track('focus_mode_success', {
          userId: state.userId,
          keywordId: state.keywordId,
          sessionId: state.sessionId,
          timeToSuccess,
          totalAttempts: state.totalAttempts,
          timestamp: Date.now(),
        });
      }

      this.focusModeStates.set(userId, state);
      this.saveLocalData();

    } catch (error) {
      console.error('Error recording focus mode success:', error);
    }
  }

  /**
   * 获取用户专注模式状态
   */
  getFocusModeState(userId: string): FocusModeState | null {
    return this.focusModeStates.get(userId) || null;
  }

  /**
   * 检查是否应该高亮正确选项
   */
  shouldHighlightCorrectOption(userId: string): boolean {
    const state = this.focusModeStates.get(userId);
    return state?.isActive && state?.highlightCorrectOption || false;
  }

  /**
   * 获取专注模式配置
   */
  getFocusModeConfig(): FocusModeConfig {
    return { ...this.focusModeConfig };
  }

  /**
   * 更新专注模式配置
   */
  async updateFocusModeConfig(config: Partial<FocusModeConfig>): Promise<void> {
    this.focusModeConfig = { ...this.focusModeConfig, ...config };
    await this.saveLocalData();
  }

  /**
   * 手动退出专注模式
   */
  exitFocusMode(userId: string): void {
    const state = this.focusModeStates.get(userId);
    if (!state || !state.isActive) return;

    state.isActive = false;
    state.highlightCorrectOption = false;
    state.showGlowEffect = false;
    state.supportiveMessage = '';

    this.recordEvent({
      eventType: 'exited',
      userId: state.userId,
      keywordId: state.keywordId,
      sessionId: state.sessionId,
      consecutiveErrors: state.consecutiveErrors,
      totalAttempts: state.totalAttempts,
      learningPhase: state.learningPhase,
      difficulty: 'unknown',
    });

    this.focusModeStates.set(userId, state);
    this.saveLocalData();
  }

  // ===== 辅助方法 =====

  private getRandomSupportiveMessage(): string {
    const messages = this.focusModeConfig.supportiveMessages;
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private recordEvent(eventData: Omit<FocusModeEvent, 'eventId' | 'timestamp'>): void {
    const event: FocusModeEvent = {
      eventId: `focus_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...eventData,
    };

    this.focusModeEvents.push(event);

    // 保持事件历史在合理范围内
    if (this.focusModeEvents.length > 1000) {
      this.focusModeEvents = this.focusModeEvents.slice(-500);
    }
  }

  // ===== 数据持久化 =====

  private async saveLocalData(): Promise<void> {
    try {
      const states = Array.from(this.focusModeStates.values());
      await AsyncStorage.setItem(this.STATES_KEY, JSON.stringify(states));
      await AsyncStorage.setItem(this.CONFIG_KEY, JSON.stringify(this.focusModeConfig));
      await AsyncStorage.setItem(this.EVENTS_KEY, JSON.stringify(this.focusModeEvents));
    } catch (error) {
      console.error('Error saving focus mode data:', error);
    }
  }

  // ===== 公共API =====

  /**
   * 获取专注模式统计
   */
  getFocusModeStatistics(userId?: string): {
    totalTriggers: number;
    successRate: number;
    averageTimeToSuccess: number;
    mostCommonPhase: string;
    userSpecificStats?: {
      triggers: number;
      successes: number;
      averageErrors: number;
    };
  } {
    const events = userId ? 
      this.focusModeEvents.filter(e => e.userId === userId) : 
      this.focusModeEvents;

    const triggers = events.filter(e => e.eventType === 'triggered').length;
    const successes = events.filter(e => e.eventType === 'user_success').length;
    const successRate = triggers > 0 ? successes / triggers : 0;

    const successEvents = events.filter(e => e.eventType === 'user_success' && e.timeToSuccess);
    const averageTimeToSuccess = successEvents.length > 0 ?
      successEvents.reduce((sum, e) => sum + (e.timeToSuccess || 0), 0) / successEvents.length : 0;

    const phases = events.map(e => e.learningPhase);
    const mostCommonPhase = phases.length > 0 ? 
      phases.reduce((a, b, _, arr) => 
        arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
      ) : 'unknown';

    const result: any = {
      totalTriggers: triggers,
      successRate,
      averageTimeToSuccess,
      mostCommonPhase,
    };

    if (userId) {
      const userEvents = events.filter(e => e.userId === userId);
      const userTriggers = userEvents.filter(e => e.eventType === 'triggered').length;
      const userSuccesses = userEvents.filter(e => e.eventType === 'user_success').length;
      const totalErrors = userEvents.reduce((sum, e) => sum + e.consecutiveErrors, 0);
      const averageErrors = userEvents.length > 0 ? totalErrors / userEvents.length : 0;

      result.userSpecificStats = {
        triggers: userTriggers,
        successes: userSuccesses,
        averageErrors,
      };
    }

    return result;
  }

  /**
   * 重置用户专注模式状态
   */
  resetUserState(userId: string): void {
    this.focusModeStates.delete(userId);
    this.saveLocalData();
  }
}

export default FocusModeController;
