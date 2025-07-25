import { AnalyticsService } from './AnalyticsService';

/**
 * Conversion Funnel Tracker
 * 专门跟踪用户转化漏斗的分析服务
 */
export class ConversionFunnelTracker {
  private static instance: ConversionFunnelTracker;
  private analytics: AnalyticsService;
  private sessionStartTime: Date | null = null;
  private currentFunnelStep: string | null = null;

  private constructor() {
    this.analytics = AnalyticsService.getInstance();
  }

  public static getInstance(): ConversionFunnelTracker {
    if (!ConversionFunnelTracker.instance) {
      ConversionFunnelTracker.instance = new ConversionFunnelTracker();
    }
    return ConversionFunnelTracker.instance;
  }

  /**
   * 开始跟踪用户会话
   */
  public startSession(userId: string): void {
    this.sessionStartTime = new Date();
    this.analytics.track('app_launch', {
      sessionId: this.generateSessionId(),
      timestamp: this.sessionStartTime.getTime(),
      platform: 'mobile',
      version: '1.0.0',
    }, userId);
  }

  /**
   * 跟踪引导流程开始
   */
  public trackOnboardingStart(userId: string): void {
    this.currentFunnelStep = 'onboarding_start';
    this.analytics.track('onboarding_start', {
      sessionId: this.generateSessionId(),
      timestamp: Date.now(),
      previousStep: null,
    }, userId);
  }

  /**
   * 跟踪引导流程完成
   */
  public trackOnboardingComplete(userId: string, duration: number, stepsCompleted: number): void {
    this.currentFunnelStep = 'onboarding_complete';
    this.analytics.track('onboarding_complete', {
      sessionId: this.generateSessionId(),
      duration,
      stepsCompleted,
      timestamp: Date.now(),
      previousStep: 'onboarding_start',
    }, userId);
  }

  /**
   * 跟踪兴趣选择
   */
  public trackInterestSelection(userId: string, interestId: string, interestName: string, selectionTime: number): void {
    this.currentFunnelStep = 'interest_selected';
    this.analytics.track('interest_selected', {
      sessionId: this.generateSessionId(),
      interestId,
      interestName,
      selectionTime,
      timestamp: Date.now(),
      previousStep: 'onboarding_complete',
    }, userId);
  }

  /**
   * 跟踪视频预览开始
   */
  public trackVideoPreviewStart(userId: string, dramaId: string, interestId: string): void {
    this.currentFunnelStep = 'video_preview_start';
    this.analytics.track('video_play_start', {
      sessionId: this.generateSessionId(),
      dramaId,
      interestId,
      videoType: 'preview',
      timestamp: Date.now(),
      previousStep: 'interest_selected',
    }, userId);
  }

  /**
   * 跟踪视频预览完成
   */
  public trackVideoPreviewComplete(userId: string, dramaId: string, duration: number, completionRate: number): void {
    this.currentFunnelStep = 'video_preview_complete';
    this.analytics.track('video_play_complete', {
      sessionId: this.generateSessionId(),
      dramaId,
      duration,
      completionRate,
      videoType: 'preview',
      timestamp: Date.now(),
      previousStep: 'video_preview_start',
    }, userId);
  }

  /**
   * 跟踪vTPR学习开始
   */
  public trackVTPRStart(userId: string, keywordId: string, dramaId: string): void {
    this.currentFunnelStep = 'vtpr_start';
    this.analytics.track('keyword_attempt', {
      sessionId: this.generateSessionId(),
      keywordId,
      dramaId,
      attemptType: 'start',
      timestamp: Date.now(),
      previousStep: 'video_preview_complete',
    }, userId);
  }

  /**
   * 跟踪vTPR答题结果
   */
  public trackVTPRAnswer(
    userId: string, 
    keywordId: string, 
    isCorrect: boolean, 
    attempts: number, 
    timeSpent: number,
    selectedOption?: string
  ): void {
    this.analytics.track('keyword_attempt', {
      sessionId: this.generateSessionId(),
      keywordId,
      isCorrect,
      attempts,
      timeSpent,
      selectedOption,
      timestamp: Date.now(),
      previousStep: 'vtpr_start',
    }, userId);

    if (isCorrect) {
      this.analytics.track('keyword_unlock', {
        sessionId: this.generateSessionId(),
        keywordId,
        attempts,
        timeSpent,
        timestamp: Date.now(),
      }, userId);
    }
  }

  /**
   * 跟踪里程碑达成
   */
  public trackMilestoneReached(
    userId: string, 
    milestoneType: string, 
    dramaId: string, 
    keywordsCompleted: number,
    totalKeywords: number,
    accuracy: number
  ): void {
    this.currentFunnelStep = 'milestone_reached';
    this.analytics.track('milestone_reached', {
      sessionId: this.generateSessionId(),
      milestoneType,
      dramaId,
      keywordsCompleted,
      totalKeywords,
      accuracy,
      timestamp: Date.now(),
      previousStep: 'keyword_unlock',
    }, userId);
  }

  /**
   * 跟踪魔法时刻开始（无字幕观看）
   */
  public trackMagicMomentStart(userId: string, dramaId: string): void {
    this.currentFunnelStep = 'magic_moment_start';
    this.analytics.track('video_play_start', {
      sessionId: this.generateSessionId(),
      dramaId,
      videoType: 'magic_moment',
      subtitlesEnabled: false,
      timestamp: Date.now(),
      previousStep: 'milestone_reached',
    }, userId);
  }

  /**
   * 跟踪魔法时刻完成（激活事件）
   */
  public trackActivationComplete(
    userId: string, 
    dramaId: string, 
    duration: number, 
    completionRate: number,
    userFeedback?: string
  ): void {
    this.currentFunnelStep = 'activation_complete';
    
    // 这是关键的激活事件
    this.analytics.track('activation_complete', {
      sessionId: this.generateSessionId(),
      dramaId,
      duration,
      completionRate,
      userFeedback,
      timestamp: Date.now(),
      previousStep: 'magic_moment_start',
      // 计算从开始到激活的总时间
      totalSessionTime: this.sessionStartTime ? Date.now() - this.sessionStartTime.getTime() : null,
    }, userId);

    // 同时发送视频完成事件
    this.analytics.track('video_play_complete', {
      sessionId: this.generateSessionId(),
      dramaId,
      videoType: 'magic_moment',
      duration,
      completionRate,
      subtitlesEnabled: false,
      timestamp: Date.now(),
    }, userId);
  }

  /**
   * 跟踪用户反馈
   */
  public trackUserFeedback(
    userId: string, 
    feedbackType: string, 
    rating: number, 
    comment?: string,
    context?: string
  ): void {
    this.analytics.track('app_foreground', { // Using existing event type
      sessionId: this.generateSessionId(),
      action: 'user_feedback',
      feedbackType,
      rating,
      comment,
      context,
      timestamp: Date.now(),
      previousStep: this.currentFunnelStep,
    }, userId);
  }

  /**
   * 跟踪应用进入后台
   */
  public trackAppBackground(userId: string, timeSpent: number): void {
    this.analytics.track('app_background', {
      sessionId: this.generateSessionId(),
      timeSpent,
      currentStep: this.currentFunnelStep,
      timestamp: Date.now(),
    }, userId);
  }

  /**
   * 跟踪应用回到前台
   */
  public trackAppForeground(userId: string, timeAway: number): void {
    this.analytics.track('app_foreground', {
      sessionId: this.generateSessionId(),
      timeAway,
      currentStep: this.currentFunnelStep,
      timestamp: Date.now(),
    }, userId);
  }

  /**
   * 跟踪错误事件
   */
  public trackError(
    userId: string, 
    errorType: string, 
    errorMessage: string, 
    context?: Record<string, any>
  ): void {
    this.analytics.track('app_background', { // Using existing event type
      sessionId: this.generateSessionId(),
      action: 'error',
      errorType,
      errorMessage,
      context,
      currentStep: this.currentFunnelStep,
      timestamp: Date.now(),
    }, userId);
  }

  /**
   * 跟踪性能指标
   */
  public trackPerformance(
    userId: string, 
    metricName: string, 
    value: number, 
    context?: Record<string, any>
  ): void {
    this.analytics.track('app_foreground', { // Using existing event type
      sessionId: this.generateSessionId(),
      action: 'performance',
      metricName,
      value,
      context,
      timestamp: Date.now(),
    }, userId);
  }

  /**
   * 获取当前漏斗步骤
   */
  public getCurrentFunnelStep(): string | null {
    return this.currentFunnelStep;
  }

  /**
   * 获取会话时长
   */
  public getSessionDuration(): number {
    return this.sessionStartTime ? Date.now() - this.sessionStartTime.getTime() : 0;
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 重置会话
   */
  public resetSession(): void {
    this.sessionStartTime = null;
    this.currentFunnelStep = null;
  }
}

// 导出单例实例
export const conversionTracker = ConversionFunnelTracker.getInstance();

// 便捷的跟踪函数
export const trackConversionEvent = (
  eventType: string, 
  userId: string, 
  data?: Record<string, any>
) => {
  const tracker = ConversionFunnelTracker.getInstance();
  
  switch (eventType) {
    case 'session_start':
      tracker.startSession(userId);
      break;
    case 'onboarding_start':
      tracker.trackOnboardingStart(userId);
      break;
    case 'onboarding_complete':
      tracker.trackOnboardingComplete(userId, data?.duration || 0, data?.stepsCompleted || 0);
      break;
    case 'interest_selected':
      tracker.trackInterestSelection(
        userId, 
        data?.interestId || '', 
        data?.interestName || '', 
        data?.selectionTime || 0
      );
      break;
    case 'activation_complete':
      tracker.trackActivationComplete(
        userId,
        data?.dramaId || '',
        data?.duration || 0,
        data?.completionRate || 0,
        data?.userFeedback
      );
      break;
    default:
      console.warn(`Unknown conversion event type: ${eventType}`);
  }
};