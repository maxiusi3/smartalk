import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { analytics } from '@/lib/analytics'
import { useAuthStore } from '@/lib/store'

// 转化漏斗步骤定义
export const FUNNEL_STEPS = {
  LANDING_PAGE_VIEW: { step: 'landing_page_view', index: 1 },
  HERO_CTA_CLICK: { step: 'hero_cta_click', index: 2 },
  ONBOARDING_START: { step: 'onboarding_start', index: 3 },
  INTEREST_SELECTED: { step: 'interest_selected', index: 4 },
  STORY_PREVIEW_START: { step: 'story_preview_start', index: 5 },
  STORY_PREVIEW_COMPLETE: { step: 'story_preview_complete', index: 6 },
  CLUE_COLLECTION_START: { step: 'clue_collection_start', index: 7 },
  FIRST_CLUE_SUCCESS: { step: 'first_clue_success', index: 8 },
  MILESTONE_REACHED: { step: 'milestone_reached', index: 9 },
  THEATER_MODE_START: { step: 'theater_mode_start', index: 10 },
  MAGIC_MOMENT_COMPLETE: { step: 'magic_moment_complete', index: 11 },
  ACHIEVEMENT_VIEWED: { step: 'achievement_viewed', index: 12 }
} as const

export function useAnalytics() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  // 设置用户ID
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      analytics.setUserId(user.id)
    }
  }, [isAuthenticated, user?.id])

  // 页面跟踪
  const trackPageView = useCallback((page?: string, additionalData?: Record<string, any>) => {
    const currentPage = page || window.location.pathname
    analytics.trackPageView(currentPage, additionalData)
  }, [])

  // 转化漏斗跟踪
  const trackFunnelStep = useCallback((
    stepKey: keyof typeof FUNNEL_STEPS,
    success: boolean = true,
    metadata?: Record<string, any>
  ) => {
    const stepConfig = FUNNEL_STEPS[stepKey]
    analytics.trackFunnelStep(stepConfig.step, stepConfig.index, success, metadata)
  }, [])

  // 学习进度跟踪
  const trackLearningProgress = useCallback((
    progressType: 'story_preview_start' | 'story_preview_complete' | 'clue_attempt' | 'clue_success' | 'milestone_reached' | 'theater_mode_start' | 'theater_mode_complete' | 'achievement_unlocked',
    data: Record<string, any>
  ) => {
    analytics.trackLearningProgress(progressType, data)
  }, [])

  // 用户激活跟踪
  const trackActivation = useCallback((
    activationType: 'story_preview_completed' | 'first_clue_collected' | 'magic_moment_achieved',
    metadata?: Record<string, any>
  ) => {
    analytics.trackActivation(activationType, metadata)
  }, [])

  // 用户交互跟踪
  const trackInteraction = useCallback((
    interactionType: 'click' | 'scroll' | 'hover' | 'focus' | 'input',
    element: string,
    additionalData?: Record<string, any>
  ) => {
    analytics.trackUserInteraction(interactionType, element, additionalData)
  }, [])

  // 反馈收集
  const collectFeedback = useCallback((
    feedbackType: 'rating' | 'text' | 'nps' | 'bug_report',
    content: string | number,
    context: string,
    metadata?: Record<string, any>
  ) => {
    analytics.collectFeedback(feedbackType, content, context, metadata)
  }, [])

  // 错误跟踪
  const trackError = useCallback((
    errorType: 'javascript_error' | 'api_error' | 'media_error' | 'user_error',
    errorMessage: string,
    errorDetails?: Record<string, any>
  ) => {
    analytics.trackError(errorType, errorMessage, errorDetails)
  }, [])

  // 性能跟踪
  const trackPerformance = useCallback((
    metricName: string,
    value: number,
    unit: string = 'ms'
  ) => {
    analytics.trackPerformance(metricName, value, unit)
  }, [])

  // 自定义事件跟踪
  const trackEvent = useCallback((
    eventName: string,
    eventType: 'user_action' | 'system_event' | 'learning_progress' | 'conversion',
    properties?: Record<string, any>
  ) => {
    analytics.trackEvent(eventName, eventType, properties)
  }, [])

  return {
    // 基础跟踪方法
    trackPageView,
    trackEvent,
    trackInteraction,
    trackError,
    trackPerformance,
    
    // 业务特定跟踪方法
    trackFunnelStep,
    trackLearningProgress,
    trackActivation,
    collectFeedback,
    
    // 常用的组合跟踪方法
    trackButtonClick: useCallback((buttonName: string, context?: string) => {
      trackInteraction('click', buttonName, { context })
    }, [trackInteraction]),
    
    trackVideoEvent: useCallback((
      eventType: 'play' | 'pause' | 'ended' | 'seek',
      videoId: string,
      currentTime: number,
      duration?: number
    ) => {
      trackEvent('video_interaction', 'user_action', {
        eventType,
        videoId,
        currentTime,
        duration,
        progress: duration ? (currentTime / duration) * 100 : 0
      })
    }, [trackEvent]),
    
    trackAudioEvent: useCallback((
      eventType: 'play' | 'pause' | 'ended',
      audioId: string,
      context: string
    ) => {
      trackEvent('audio_interaction', 'user_action', {
        eventType,
        audioId,
        context
      })
    }, [trackEvent]),
    
    trackClueAttempt: useCallback((
      clueId: string,
      isCorrect: boolean,
      attemptNumber: number,
      timeSpent: number
    ) => {
      trackLearningProgress('clue_attempt', {
        clueId,
        isCorrect,
        attemptNumber,
        timeSpent
      })
      
      if (isCorrect) {
        trackLearningProgress('clue_success', {
          clueId,
          attemptNumber,
          timeSpent
        })
      }
    }, [trackLearningProgress]),
    
    trackStoryPreview: useCallback((
      storyId: string,
      interest: string,
      action: 'start' | 'complete',
      metadata?: Record<string, any>
    ) => {
      const progressType = action === 'start' ? 'story_preview_start' : 'story_preview_complete'
      
      trackLearningProgress(progressType, {
        storyId,
        interest,
        ...metadata
      })
      
      // 同时跟踪转化漏斗
      if (action === 'start') {
        trackFunnelStep('STORY_PREVIEW_START', true, { storyId, interest })
      } else {
        trackFunnelStep('STORY_PREVIEW_COMPLETE', true, { storyId, interest })
        // 故事预览完成是一个激活事件
        trackActivation('story_preview_completed', { storyId, interest })
      }
    }, [trackLearningProgress, trackFunnelStep, trackActivation]),
    
    trackMagicMoment: useCallback((
      storyId: string,
      interest: string,
      phase: 'milestone' | 'theater_start' | 'theater_complete' | 'achievement',
      metadata?: Record<string, any>
    ) => {
      switch (phase) {
        case 'milestone':
          trackLearningProgress('milestone_reached', { storyId, interest, ...metadata })
          trackFunnelStep('MILESTONE_REACHED', true, { storyId, interest })
          break
        case 'theater_start':
          trackLearningProgress('theater_mode_start', { storyId, interest, ...metadata })
          trackFunnelStep('THEATER_MODE_START', true, { storyId, interest })
          break
        case 'theater_complete':
          trackLearningProgress('theater_mode_complete', { storyId, interest, ...metadata })
          trackFunnelStep('MAGIC_MOMENT_COMPLETE', true, { storyId, interest })
          // 魔法时刻完成是最重要的激活事件
          trackActivation('magic_moment_achieved', { storyId, interest, ...metadata })
          break
        case 'achievement':
          trackLearningProgress('achievement_unlocked', { storyId, interest, ...metadata })
          trackFunnelStep('ACHIEVEMENT_VIEWED', true, { storyId, interest })
          break
      }
    }, [trackLearningProgress, trackFunnelStep, trackActivation]),
    
    // 获取分析数据的方法
    getActivationRate: useCallback(() => {
      return analytics.getActivationRate()
    }, []),
    
    getFunnelData: useCallback(() => {
      return analytics.getFunnelData()
    }, []),
    
    getSessionStats: useCallback(() => {
      return analytics.getSessionStats()
    }, [])
  }
}

// 页面级别的分析跟踪Hook
export function usePageAnalytics(pageName: string, additionalData?: Record<string, any>) {
  const { trackPageView } = useAnalytics()

  useEffect(() => {
    trackPageView(pageName, additionalData)
  }, [pageName, trackPageView]) // 移除 additionalData 依赖，避免不必要的重新渲染
}

// 学习会话跟踪Hook
export function useLearningSession(sessionType: 'story_preview' | 'clue_collection' | 'theater_mode') {
  const { trackEvent } = useAnalytics()
  const [startTime] = useState(() => Date.now()) // 使用useState确保startTime稳定

  useEffect(() => {
    // 会话开始
    trackEvent(`${sessionType}_session_start`, 'learning_progress', {
      sessionType,
      startTime
    })

    return () => {
      // 会话结束 - 清理逻辑
      const endTime = Date.now()
      const duration = endTime - startTime

      trackEvent(`${sessionType}_session_end`, 'learning_progress', {
        sessionType,
        startTime,
        endTime,
        duration
      })
    }
  }, [sessionType, trackEvent, startTime]) // 添加所有依赖项

  return {
    getSessionDuration: useCallback(() => Date.now() - startTime, [startTime])
  }
}
