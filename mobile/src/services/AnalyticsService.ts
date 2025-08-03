import { ApiService } from './ApiService';

export interface AnalyticsEvent {
  userId: string;
  eventType: string;
  eventData?: Record<string, any>;
  timestamp?: Date;
}

export interface AnalyticsConfig {
  batchSize: number;
  flushInterval: number; // milliseconds
  maxRetries: number;
  enabled: boolean;
}

/**
 * Analytics Service
 * 前端分析事件收集和上报服务
 */
export class AnalyticsService {
  private static instance: AnalyticsService;
  private eventQueue: AnalyticsEvent[] = [];
  private config: AnalyticsConfig;
  private flushTimer: NodeJS.Timeout | null = null;
  private isOnline: boolean = true;

  private constructor() {
    this.config = {
      batchSize: 10,
      flushInterval: 5000, // 5 seconds
      maxRetries: 3,
      enabled: true,
    };

    this.startFlushTimer();
    this.setupNetworkListener();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * 配置Analytics服务
   */
  public configure(config: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    if (this.config.enabled) {
      this.startFlushTimer();
    }
  }

  /**
   * 跟踪事件
   */
  public track(eventType: string, eventData?: Record<string, any>, userId?: string): void {
    if (!this.config.enabled) {
      return;
    }

    // 获取用户ID（从全局状态或参数）
    const finalUserId = userId || this.getCurrentUserId();
    if (!finalUserId) {
      console.warn('Analytics: No user ID available for event:', eventType);
      return;
    }

    const event: AnalyticsEvent = {
      userId: finalUserId,
      eventType,
      eventData: this.sanitizeEventData(eventData),
      timestamp: new Date(),
    };

    this.eventQueue.push(event);

    // 如果队列达到批量大小，立即发送
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * 立即发送所有排队的事件
   */
  public async flush(): Promise<void> {
    if (this.eventQueue.length === 0 || !this.isOnline) {
      return;
    }

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      if (eventsToSend.length === 1) {
        await this.sendSingleEvent(eventsToSend[0]);
      } else {
        await this.sendBatchEvents(eventsToSend);
      }
    } catch (error) {
      console.error('Analytics: Failed to send events:', error);
      // 重新加入队列以便重试
      this.eventQueue.unshift(...eventsToSend);
    }
  }

  /**
   * 发送单个事件
   */
  private async sendSingleEvent(event: AnalyticsEvent): Promise<void> {
    try {
      await ApiService.post('/analytics/events', event);
    } catch (error) {
      console.error('Analytics: Failed to send single event:', error);
      throw error;
    }
  }

  /**
   * 批量发送事件
   */
  private async sendBatchEvents(events: AnalyticsEvent[]): Promise<void> {
    try {
      await ApiService.post('/analytics/events/batch', { events });
    } catch (error) {
      console.error('Analytics: Failed to send batch events:', error);
      throw error;
    }
  }

  /**
   * 启动定时发送器
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * 设置网络状态监听
   */
  private setupNetworkListener(): void {
    // 在React Native中，可以使用NetInfo来监听网络状态
    // 这里简化处理，假设网络总是可用
    this.isOnline = true;
  }

  /**
   * 获取当前用户ID
   */
  private getCurrentUserId(): string | null {
    // 从全局状态管理中获取用户ID
    try {
      // 动态导入以避免循环依赖
      const { useAppStore } = require('@/store/useAppStore');
      const state = useAppStore.getState();
      return state.user?.id || null;
    } catch (error) {
      console.warn('Analytics: Failed to get user ID from store:', error);
      return null;
    }
  }

  /**
   * 清理事件数据
   */
  private sanitizeEventData(eventData?: Record<string, any>): Record<string, any> {
    if (!eventData) {
      return {};
    }

    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(eventData)) {
      if (typeof key === 'string' && key.length <= 50) {
        if (
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean' ||
          value === null
        ) {
          sanitized[key] = value;
        } else if (Array.isArray(value)) {
          sanitized[key] = value.slice(0, 10); // 限制数组长度
        } else if (typeof value === 'object' && value !== null) {
          // 简单对象，只保留一层
          sanitized[key] = JSON.parse(JSON.stringify(value));
        }
      }
    }

    return sanitized;
  }

  /**
   * 清理资源
   */
  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // 发送剩余事件
    this.flush();
  }
}

// 导出单例实例
export const analytics = AnalyticsService.getInstance();

// 便捷的跟踪函数
export const trackEvent = (eventType: string, eventData?: Record<string, any>, userId?: string) => {
  analytics.track(eventType, eventData, userId);
};

// 预定义的事件跟踪函数
export const trackAppLaunch = (userId: string) => {
  trackEvent('app_launch', { timestamp: Date.now() }, userId);
};

export const trackOnboardingStart = (userId: string) => {
  trackEvent('onboarding_start', { timestamp: Date.now() }, userId);
};

export const trackOnboardingComplete = (userId: string, duration: number) => {
  trackEvent('onboarding_complete', { 
    duration,
    timestamp: Date.now() 
  }, userId);
};

export const trackInterestSelected = (userId: string, interestId: string, interestName: string) => {
  trackEvent('interest_selected', { 
    interestId,
    interestName,
    timestamp: Date.now() 
  }, userId);
};

export const trackVideoPreviewStart = (userId: string, dramaId: string) => {
  trackEvent('video_preview_start', { 
    dramaId,
    timestamp: Date.now() 
  }, userId);
};

export const trackVideoPreviewComplete = (userId: string, dramaId: string, duration: number) => {
  trackEvent('video_preview_complete', { 
    dramaId,
    duration,
    timestamp: Date.now() 
  }, userId);
};

export const trackVTPRStart = (userId: string, keywordId: string) => {
  trackEvent('vtpr_start', { 
    keywordId,
    timestamp: Date.now() 
  }, userId);
};

export const trackVTPRAnswerCorrect = (userId: string, keywordId: string, attempts: number, timeSpent: number) => {
  trackEvent('vtpr_answer_correct', { 
    keywordId,
    attempts,
    timeSpent,
    timestamp: Date.now() 
  }, userId);
};

export const trackVTPRAnswerIncorrect = (userId: string, keywordId: string, attempts: number, selectedOption: string) => {
  trackEvent('vtpr_answer_incorrect', { 
    keywordId,
    attempts,
    selectedOption,
    timestamp: Date.now() 
  }, userId);
};

export const trackVTPRComplete = (userId: string, dramaId: string, totalKeywords: number, totalTime: number, accuracy: number) => {
  trackEvent('vtpr_session_complete', { 
    dramaId,
    totalKeywords,
    totalTime,
    accuracy,
    timestamp: Date.now() 
  }, userId);
};

export const trackMagicMomentStart = (userId: string, dramaId: string) => {
  trackEvent('magic_moment_start', { 
    dramaId,
    timestamp: Date.now() 
  }, userId);
};

export const trackMagicMomentComplete = (userId: string, dramaId: string, userFeedback?: string) => {
  trackEvent('magic_moment_complete', { 
    dramaId,
    userFeedback,
    timestamp: Date.now() 
  }, userId);
};

export const trackError = (userId: string, errorType: string, errorMessage: string, context?: Record<string, any>) => {
  trackEvent(`error_${errorType}`, { 
    errorMessage,
    context,
    timestamp: Date.now() 
  }, userId);
};

export const trackPerformance = (userId: string, metricName: string, value: number, context?: Record<string, any>) => {
  trackEvent(`performance_${metricName}`, {
    value,
    context,
    timestamp: Date.now()
  }, userId);
};

// ===== V2 Enhanced Analytics Functions =====

// Conversion Funnel Tracking
export const trackConversionFunnel = (userId: string, stage: string, properties?: Record<string, any>) => {
  trackEvent(`funnel_${stage}`, {
    stage,
    ...properties,
    timestamp: Date.now()
  }, userId);
};

// Magic Moment Specific Events
export const trackMagicMomentInitiated = (userId: string, chapterId: string, keywordId: string) => {
  trackEvent('magic_moment_initiated', {
    chapterId,
    keywordId,
    timestamp: Date.now()
  }, userId);
};

export const trackMagicMomentFeedbackGiven = (userId: string, chapterId: string, feedback: string, emotionalResponse: string) => {
  trackEvent('magic_moment_feedback_given', {
    chapterId,
    feedback,
    emotionalResponse,
    timestamp: Date.now()
  }, userId);
};

// SRS Engagement Tracking
export const trackSRSSessionStarted = (userId: string, sessionType: string, totalCards: number) => {
  trackEvent('srs_session_started', {
    sessionType,
    totalCards,
    timestamp: Date.now()
  }, userId);
};

export const trackSRSCardReviewed = (userId: string, cardId: string, assessment: string, responseTime: number, isCorrect: boolean) => {
  trackEvent('srs_card_reviewed', {
    cardId,
    assessment,
    responseTime,
    isCorrect,
    timestamp: Date.now()
  }, userId);
};

export const trackSRSSessionCompleted = (userId: string, sessionId: string, cardsReviewed: number, accuracy: number, duration: number) => {
  trackEvent('srs_session_completed', {
    sessionId,
    cardsReviewed,
    accuracy,
    duration,
    timestamp: Date.now()
  }, userId);
};

// Error Recovery Analytics
export const trackFocusModeTriggered = (userId: string, phase: string, attemptCount: number, keywordId: string) => {
  trackEvent('focus_mode_triggered', {
    phase,
    attemptCount,
    keywordId,
    timestamp: Date.now()
  }, userId);
};

export const trackRescueModeTriggered = (userId: string, phase: string, attemptCount: number, keywordId: string) => {
  trackEvent('rescue_mode_triggered', {
    phase,
    attemptCount,
    keywordId,
    timestamp: Date.now()
  }, userId);
};

export const trackRecoverySuccessful = (userId: string, recoveryType: string, finalAttempts: number, keywordId: string) => {
  trackEvent('recovery_successful', {
    recoveryType,
    finalAttempts,
    keywordId,
    timestamp: Date.now()
  }, userId);
};

// Speaking Tips Analytics
export const trackSpeakingTipsOpened = (userId: string, userLevel: string, currentTheme?: string) => {
  trackEvent('speaking_tips_opened', {
    userLevel,
    currentTheme,
    timestamp: Date.now()
  }, userId);
};

export const trackSpeakingTipViewed = (userId: string, tipId: string, category: string, phrase: string) => {
  trackEvent('speaking_tip_viewed', {
    tipId,
    category,
    phrase,
    timestamp: Date.now()
  }, userId);
};

// Learning Journey Analytics
export const trackChapterSelected = (userId: string, chapterId: string, chapterTitle: string, chapterState: string, interestName: string) => {
  trackEvent('chapter_selected', {
    chapterId,
    chapterTitle,
    chapterState,
    interestName,
    timestamp: Date.now()
  }, userId);
};

export const trackProfileViewed = (userId: string, totalAchievements: number) => {
  trackEvent('profile_viewed', {
    totalAchievements,
    timestamp: Date.now()
  }, userId);
};

export const trackAchievementEarned = (userId: string, achievementId: string, achievementName: string, category: string, rarity: string) => {
  trackEvent('achievement_earned', {
    achievementId,
    achievementName,
    category,
    rarity,
    timestamp: Date.now()
  }, userId);
};

// Learning Map Analytics
export const trackLearningMapViewed = (userId: string, totalChapters: number, completedChapters: number) => {
  trackEvent('learning_map_viewed', {
    totalChapters,
    completedChapters,
    timestamp: Date.now()
  }, userId);
};

// Performance Metrics
export const trackAppStartupTime = (userId: string, startupTime: number) => {
  trackEvent('performance_app_startup', {
    startupTime,
    target: 2000, // 2 seconds target
    meetsTarget: startupTime < 2000,
    timestamp: Date.now()
  }, userId);
};

export const trackVideoLoadingTime = (userId: string, loadingTime: number, videoId: string) => {
  trackEvent('performance_video_loading', {
    loadingTime,
    videoId,
    target: 1000, // 1 second target
    meetsTarget: loadingTime < 1000,
    timestamp: Date.now()
  }, userId);
};

export const trackInteractionResponseTime = (userId: string, interactionType: string, responseTime: number) => {
  trackEvent('performance_interaction_response', {
    interactionType,
    responseTime,
    target: 100, // 100ms target
    meetsTarget: responseTime < 100,
    timestamp: Date.now()
  }, userId);
};

// North Star Metric: User Activation Rate
export const trackUserActivation = (userId: string, activationMethod: string, timeToActivation: number) => {
  trackEvent('user_activation', {
    activationMethod,
    timeToActivation,
    timestamp: Date.now()
  }, userId);
};

// A/B Testing Framework
export const trackABTestAssignment = (userId: string, testName: string, variant: string) => {
  trackEvent('ab_test_assignment', {
    testName,
    variant,
    timestamp: Date.now()
  }, userId);
};

export const trackABTestConversion = (userId: string, testName: string, variant: string, conversionType: string) => {
  trackEvent('ab_test_conversion', {
    testName,
    variant,
    conversionType,
    timestamp: Date.now()
  }, userId);
};