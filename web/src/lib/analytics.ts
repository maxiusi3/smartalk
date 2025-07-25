// 开芯说 Web版本 - 分析跟踪系统
// 基于移动端AnalyticsService的Web适配版本

export interface AnalyticsEvent {
  eventName: string
  eventType: 'user_action' | 'system_event' | 'learning_progress' | 'conversion'
  timestamp: number
  userId?: string
  sessionId: string
  properties: Record<string, any>
  context: {
    page: string
    userAgent: string
    viewport: { width: number; height: number }
    referrer?: string
  }
}

export interface UserActivationEvent {
  userId: string
  activationType: 'story_preview_completed' | 'first_clue_collected' | 'magic_moment_achieved'
  timestamp: number
  metadata: Record<string, any>
}

export interface ConversionFunnelStep {
  step: string
  stepIndex: number
  timestamp: number
  userId?: string
  sessionId: string
  success: boolean
  metadata?: Record<string, any>
}

export interface UserFeedback {
  userId?: string
  sessionId: string
  feedbackType: 'rating' | 'text' | 'nps' | 'bug_report'
  content: string | number
  context: string
  timestamp: number
  metadata?: Record<string, any>
}

class AnalyticsService {
  private sessionId: string
  private userId?: string
  private events: AnalyticsEvent[] = []
  private funnelSteps: ConversionFunnelStep[] = []
  private feedbacks: UserFeedback[] = []
  private isEnabled: boolean = true
  private isInitialized: boolean = false

  constructor() {
    this.sessionId = this.generateSessionId()
    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      this.initializeSession()
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeSession() {
    // 只在浏览器环境中初始化
    if (typeof window === 'undefined') return

    this.isInitialized = true

    // 记录会话开始
    this.trackEvent('session_start', 'system_event', {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      referrer: document.referrer
    })
  }

  setUserId(userId: string) {
    this.userId = userId
    this.trackEvent('user_identified', 'user_action', {
      userId,
      previousSessionId: this.sessionId
    })
  }

  // 核心事件跟踪方法
  trackEvent(
    eventName: string,
    eventType: AnalyticsEvent['eventType'],
    properties: Record<string, any> = {}
  ) {
    if (!this.isEnabled) return

    // 确保在浏览器环境中且已初始化
    if (typeof window === 'undefined') return
    if (!this.isInitialized) {
      this.initializeSession()
    }

    const event: AnalyticsEvent = {
      eventName,
      eventType,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
      properties,
      context: {
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        referrer: document.referrer
      }
    }

    this.events.push(event)
    this.sendEventToServer(event)
  }

  // 用户激活事件跟踪
  trackActivation(
    activationType: UserActivationEvent['activationType'],
    metadata: Record<string, any> = {}
  ) {
    if (!this.userId) {
      console.warn('Cannot track activation without userId')
      return
    }

    const activationEvent: UserActivationEvent = {
      userId: this.userId,
      activationType,
      timestamp: Date.now(),
      metadata
    }

    this.trackEvent('user_activation', 'conversion', {
      activationType,
      ...metadata
    })

    this.sendActivationToServer(activationEvent)
  }

  // 转化漏斗跟踪
  trackFunnelStep(
    step: string,
    stepIndex: number,
    success: boolean,
    metadata: Record<string, any> = {}
  ) {
    const funnelStep: ConversionFunnelStep = {
      step,
      stepIndex,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
      success,
      metadata
    }

    this.funnelSteps.push(funnelStep)
    
    this.trackEvent('funnel_step', 'conversion', {
      step,
      stepIndex,
      success,
      ...metadata
    })

    this.sendFunnelStepToServer(funnelStep)
  }

  // 用户反馈收集
  collectFeedback(
    feedbackType: UserFeedback['feedbackType'],
    content: string | number,
    context: string,
    metadata: Record<string, any> = {}
  ) {
    const feedback: UserFeedback = {
      userId: this.userId,
      sessionId: this.sessionId,
      feedbackType,
      content,
      context,
      timestamp: Date.now(),
      metadata
    }

    this.feedbacks.push(feedback)
    
    this.trackEvent('user_feedback', 'user_action', {
      feedbackType,
      context,
      hasContent: !!content,
      ...metadata
    })

    this.sendFeedbackToServer(feedback)
  }

  // 学习进度跟踪
  trackLearningProgress(
    progressType: 'story_preview_start' | 'story_preview_complete' | 'clue_attempt' | 'clue_success' | 'milestone_reached' | 'theater_mode_start' | 'theater_mode_complete' | 'achievement_unlocked',
    data: Record<string, any>
  ) {
    this.trackEvent(progressType, 'learning_progress', data)
  }

  // 页面访问跟踪
  trackPageView(page: string, additionalData: Record<string, any> = {}) {
    this.trackEvent('page_view', 'user_action', {
      page,
      timestamp: Date.now(),
      ...additionalData
    })
  }

  // 用户交互跟踪
  trackUserInteraction(
    interactionType: 'click' | 'scroll' | 'hover' | 'focus' | 'input',
    element: string,
    additionalData: Record<string, any> = {}
  ) {
    this.trackEvent('user_interaction', 'user_action', {
      interactionType,
      element,
      ...additionalData
    })
  }

  // 错误跟踪
  trackError(
    errorType: 'javascript_error' | 'api_error' | 'media_error' | 'user_error',
    errorMessage: string,
    errorDetails: Record<string, any> = {}
  ) {
    this.trackEvent('error_occurred', 'system_event', {
      errorType,
      errorMessage,
      ...errorDetails
    })
  }

  // 性能指标跟踪
  trackPerformance(
    metricName: string,
    value: number,
    unit: string = 'ms'
  ) {
    this.trackEvent('performance_metric', 'system_event', {
      metricName,
      value,
      unit,
      timestamp: Date.now()
    })
  }

  // 获取新用户激活率
  getActivationRate(): Promise<number> {
    return this.sendAnalyticsQuery('activation_rate', {
      timeRange: '7d',
      userId: this.userId
    })
  }

  // 获取转化漏斗数据
  getFunnelData(): Promise<any> {
    return this.sendAnalyticsQuery('funnel_analysis', {
      sessionId: this.sessionId,
      userId: this.userId
    })
  }

  // 发送事件到服务器
  private async sendEventToServer(event: AnalyticsEvent) {
    // 只在浏览器环境中发送
    if (typeof window === 'undefined') return

    try {
      const response = await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      // 静默处理错误，避免影响用户体验
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to send analytics event:', error)
      }
    }
  }

  // 发送激活事件到服务器
  private async sendActivationToServer(activation: UserActivationEvent) {
    // 只在浏览器环境中发送
    if (typeof window === 'undefined') return

    try {
      const response = await fetch('/api/analytics/activations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activation)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      // 静默处理错误，避免影响用户体验
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to send activation event:', error)
      }
    }
  }

  // 发送漏斗步骤到服务器
  private async sendFunnelStepToServer(step: ConversionFunnelStep) {
    // 只在浏览器环境中发送
    if (typeof window === 'undefined') return

    try {
      const response = await fetch('/api/analytics/funnel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(step)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      // 静默处理错误，避免影响用户体验
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to send funnel step:', error)
      }
    }
  }

  // 发送反馈到服务器
  private async sendFeedbackToServer(feedback: UserFeedback) {
    // 只在浏览器环境中发送
    if (typeof window === 'undefined') return

    try {
      const response = await fetch('/api/analytics/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      // 静默处理错误，避免影响用户体验
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to send feedback:', error)
      }
    }
  }

  // 发送分析查询
  private async sendAnalyticsQuery(queryType: string, params: Record<string, any>): Promise<any> {
    // 只在浏览器环境中发送
    if (typeof window === 'undefined') return null

    try {
      const response = await fetch('/api/analytics/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ queryType, params })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      // 静默处理错误，避免影响用户体验
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to send analytics query:', error)
      }
      return null
    }
  }

  // 批量发送事件（用于离线时的事件缓存）
  async flushEvents() {
    // 只在浏览器环境中发送
    if (typeof window === 'undefined') return
    if (this.events.length === 0) return

    try {
      const response = await fetch('/api/analytics/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: this.events,
          funnelSteps: this.funnelSteps,
          feedbacks: this.feedbacks
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // 清空本地缓存
      this.events = []
      this.funnelSteps = []
      this.feedbacks = []
    } catch (error) {
      // 静默处理错误，避免影响用户体验
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to flush analytics events:', error)
      }
    }
  }

  // 启用/禁用分析跟踪
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
    this.trackEvent('analytics_toggled', 'system_event', { enabled })
  }

  // 获取当前会话统计
  getSessionStats() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      eventsCount: this.events.length,
      funnelStepsCount: this.funnelSteps.length,
      feedbacksCount: this.feedbacks.length,
      sessionDuration: Date.now() - (this.events[0]?.timestamp || Date.now())
    }
  }
}

// 创建全局分析服务实例
export const analytics = new AnalyticsService()

// 自动页面访问跟踪
if (typeof window !== 'undefined') {
  // 页面加载完成时跟踪
  window.addEventListener('load', () => {
    analytics.trackPageView(window.location.pathname, {
      loadTime: performance.now(),
      referrer: document.referrer
    })
  })

  // 页面卸载时批量发送事件
  window.addEventListener('beforeunload', () => {
    analytics.flushEvents()
  })

  // 错误自动跟踪
  window.addEventListener('error', (event) => {
    analytics.trackError('javascript_error', event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    })
  })

  // 性能指标自动跟踪
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        analytics.trackPerformance('page_load_time', navigation.loadEventEnd - navigation.fetchStart)
        analytics.trackPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart)
        analytics.trackPerformance('first_paint', navigation.responseEnd - navigation.fetchStart)
      }
    }, 0)
  })
}

export default analytics
