import { getStoryByTheme } from '@/data/stories'
import { useLearningStore } from '@/store/learning-store'

/**
 * 学习流程管理器
 * 统一管理学习流程的状态和导航逻辑
 */
export class LearningFlowManager {
  /**
   * 初始化学习会话
   */
  static initializeLearningSession(interest: string, userId?: string): boolean {
    try {
      const story = getStoryByTheme(interest)
      
      if (!story) {
        console.error(`Story not found for interest: ${interest}`)
        return false
      }
      
      const finalUserId = userId || `guest-user-${Date.now()}`
      const { startLearningSession } = useLearningStore.getState()
      
      startLearningSession(story, finalUserId)
      console.log(`Learning session initialized for ${interest} with user ${finalUserId}`)
      
      return true
    } catch (error) {
      console.error('Failed to initialize learning session:', error)
      return false
    }
  }

  /**
   * 验证学习流程状态
   */
  static validateLearningState(requiredPhase: string, interest: string): {
    isValid: boolean
    redirectTo?: string
    reason?: string
  } {
    const { currentStory, progress, canAccessMagicMoment } = useLearningStore.getState()

    // 检查基本学习状态
    if (!currentStory || !progress) {
      return {
        isValid: false,
        redirectTo: `/story-preview/${interest}`,
        reason: 'No learning session found'
      }
    }

    // 检查故事主题匹配
    if (!this.isStoryMatchingInterest(currentStory.id, interest)) {
      return {
        isValid: false,
        redirectTo: `/story-preview/${interest}`,
        reason: 'Story theme mismatch'
      }
    }

    // 检查阶段权限
    const currentPhase = progress.currentPhase

    switch (requiredPhase) {
      case 'preview':
        // 预览阶段总是可以访问
        return { isValid: true }

      case 'collecting':
        if (currentPhase === 'preview') {
          return {
            isValid: false,
            redirectTo: `/story-preview/${interest}`,
            reason: 'Preview phase not completed'
          }
        }
        return { isValid: true }

      case 'magic-moment':
        if (currentPhase !== 'collecting' || !canAccessMagicMoment()) {
          return {
            isValid: false,
            redirectTo: `/story-clues/${interest}`,
            reason: 'Not ready for magic moment'
          }
        }
        return { isValid: true }

      default:
        return {
          isValid: false,
          redirectTo: `/story-preview/${interest}`,
          reason: `Unknown phase: ${requiredPhase}`
        }
    }
  }

  /**
   * 获取下一个学习阶段的路由
   */
  static getNextRoute(interest: string): string {
    const { progress, canAccessMagicMoment } = useLearningStore.getState()
    
    if (!progress) {
      return `/story-preview/${interest}`
    }

    switch (progress.currentPhase) {
      case 'preview':
        return `/story-clues/${interest}`
      case 'collecting':
        return canAccessMagicMoment() 
          ? `/magic-moment/${interest}` 
          : `/story-clues/${interest}`
      case 'magic-moment':
        return '/learning'
      default:
        return `/story-preview/${interest}`
    }
  }

  /**
   * 完成当前阶段并导航到下一阶段
   */
  static completeCurrentPhaseAndNavigate(interest: string, router: any): void {
    const { progress, completePreviewPhase, completeMagicMoment } = useLearningStore.getState()
    
    if (!progress) {
      console.error('No learning progress found')
      return
    }

    switch (progress.currentPhase) {
      case 'preview':
        completePreviewPhase()
        router.push(`/story-clues/${interest}`)
        break
        
      case 'collecting':
        // 收集阶段通过收集所有关键词自动完成
        const nextRoute = this.getNextRoute(interest)
        router.push(nextRoute)
        break
        
      case 'magic-moment':
        completeMagicMoment()
        router.push('/learning')
        break
        
      default:
        console.warn(`Unknown phase: ${progress.currentPhase}`)
        router.push(`/story-preview/${interest}`)
    }
  }

  /**
   * 检查故事是否匹配兴趣主题
   */
  private static isStoryMatchingInterest(storyId: string, interest: string): boolean {
    // 标准化比较
    const normalizedStoryId = storyId.toLowerCase()
    const normalizedInterest = interest.toLowerCase()
    
    // 检查直接匹配或包含关系
    return normalizedStoryId.includes(normalizedInterest) || 
           normalizedInterest.includes(normalizedStoryId) ||
           this.getThemeFromStoryId(storyId) === this.normalizeInterest(interest)
  }

  /**
   * 从故事ID提取主题
   */
  private static getThemeFromStoryId(storyId: string): string {
    if (storyId.includes('travel')) return 'travel'
    if (storyId.includes('movie')) return 'movies'
    if (storyId.includes('workplace')) return 'workplace'
    return storyId
  }

  /**
   * 标准化兴趣主题
   */
  private static normalizeInterest(interest: string): string {
    const interestMap: Record<string, string> = {
      'travel': 'travel',
      'movie': 'movies',
      'movies': 'movies',
      'workplace': 'workplace',
      'work': 'workplace'
    }
    
    return interestMap[interest.toLowerCase()] || interest
  }

  /**
   * 重置学习状态
   */
  static resetLearningState(): void {
    const { resetLearning } = useLearningStore.getState()
    resetLearning()
    console.log('Learning state reset')
  }

  /**
   * 获取学习统计信息
   */
  static getLearningStats(): {
    totalKeywords: number
    collectedKeywords: number
    progressPercent: number
    currentPhase: string
    canAccessMagicMoment: boolean
  } {
    const { currentStory, progress, canAccessMagicMoment } = useLearningStore.getState()
    
    if (!currentStory || !progress) {
      return {
        totalKeywords: 0,
        collectedKeywords: 0,
        progressPercent: 0,
        currentPhase: 'unknown',
        canAccessMagicMoment: false
      }
    }

    const totalKeywords = currentStory.keywords.length
    const collectedKeywords = progress.collectedKeywords
    const progressPercent = (collectedKeywords / totalKeywords) * 100

    return {
      totalKeywords,
      collectedKeywords,
      progressPercent,
      currentPhase: progress.currentPhase,
      canAccessMagicMoment: canAccessMagicMoment()
    }
  }
}
