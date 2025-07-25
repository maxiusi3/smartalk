'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLearningStore } from '@/store/learning-store'

interface LearningRouteGuardProps {
  children: React.ReactNode
  requiredPhase: 'preview' | 'collecting' | 'magic-moment'
  currentRoute: string
  interest: string
}

/**
 * 学习路由守卫组件
 * 确保用户按照正确的顺序访问学习阶段
 */
export function LearningRouteGuard({ 
  children, 
  requiredPhase, 
  currentRoute, 
  interest 
}: LearningRouteGuardProps) {
  const router = useRouter()
  const { currentStory, progress, canAccessMagicMoment } = useLearningStore()

  useEffect(() => {
    // 如果没有学习数据，重定向到故事预览开始学习
    if (!currentStory || !progress) {
      if (currentRoute !== `/story-preview/${interest}`) {
        console.log('No learning session found, redirecting to story preview')
        router.push(`/story-preview/${interest}`)
        return
      }
    }

    // 如果有学习数据，检查阶段权限
    if (currentStory && progress) {
      const currentPhase = progress.currentPhase

      // 检查各个阶段的访问权限
      switch (requiredPhase) {
        case 'preview':
          // 故事预览阶段总是可以访问
          break

        case 'collecting':
          // 线索收集阶段需要完成预览
          if (currentPhase === 'preview') {
            console.log('Preview phase not completed, redirecting to story preview')
            router.push(`/story-preview/${interest}`)
            return
          }
          break

        case 'magic-moment':
          // 魔法时刻需要收集完所有线索
          if (currentPhase !== 'collecting' || !canAccessMagicMoment()) {
            console.log('Not ready for magic moment, redirecting to story clues')
            router.push(`/story-clues/${interest}`)
            return
          }
          break

        default:
          console.warn(`Unknown required phase: ${requiredPhase}`)
      }
    }
  }, [currentStory, progress, requiredPhase, currentRoute, interest, router, canAccessMagicMoment])

  // 如果正在检查权限，显示加载状态
  if (!currentStory && currentRoute !== `/story-preview/${interest}`) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">检查学习状态...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

/**
 * 学习流程导航辅助函数
 */
export const LearningNavigation = {
  /**
   * 获取下一个学习阶段的路由
   */
  getNextRoute: (currentPhase: string, interest: string, canAccessMagicMoment: boolean): string => {
    switch (currentPhase) {
      case 'preview':
        return `/story-clues/${interest}`
      case 'collecting':
        return canAccessMagicMoment ? `/magic-moment/${interest}` : `/story-clues/${interest}`
      case 'magic-moment':
        return `/learning` // 回到学习主页
      default:
        return `/story-preview/${interest}`
    }
  },

  /**
   * 获取当前阶段的标题
   */
  getPhaseTitle: (phase: string): string => {
    switch (phase) {
      case 'preview':
        return '故事预览'
      case 'collecting':
        return '收集线索'
      case 'magic-moment':
        return '魔法时刻'
      default:
        return '学习中'
    }
  },

  /**
   * 检查是否可以访问指定阶段
   */
  canAccessPhase: (
    targetPhase: string, 
    currentPhase: string, 
    canAccessMagicMoment: boolean
  ): boolean => {
    switch (targetPhase) {
      case 'preview':
        return true
      case 'collecting':
        return currentPhase !== 'preview'
      case 'magic-moment':
        return currentPhase === 'collecting' && canAccessMagicMoment
      default:
        return false
    }
  }
}
