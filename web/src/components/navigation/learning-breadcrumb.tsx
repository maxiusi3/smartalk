'use client'

import { useLearningStore } from '@/store/learning-store'
import { LearningNavigation } from './learning-route-guard'

interface LearningBreadcrumbProps {
  currentPhase: 'preview' | 'collecting' | 'magic-moment'
  interest: string
  className?: string
}

/**
 * 故事探索流程面包屑导航组件
 * 显示当前探索进度和阶段
 */
export function LearningBreadcrumb({ currentPhase, interest, className = '' }: LearningBreadcrumbProps) {
  const { progress, canAccessMagicMoment } = useLearningStore()

  const phases = [
    {
      key: 'preview',
      title: '故事预览',
      icon: '🎬',
      route: `/story-preview/${interest}`
    },
    {
      key: 'collecting',
      title: '收集线索',
      icon: '🔍',
      route: `/story-clues/${interest}`
    },
    {
      key: 'magic-moment',
      title: '魔法时刻',
      icon: '✨',
      route: `/magic-moment/${interest}`
    }
  ]

  const getPhaseStatus = (phaseKey: string) => {
    if (!progress) return 'disabled'
    
    const currentPhaseIndex = phases.findIndex(p => p.key === currentPhase)
    const phaseIndex = phases.findIndex(p => p.key === phaseKey)
    
    if (phaseIndex < currentPhaseIndex) return 'completed'
    if (phaseIndex === currentPhaseIndex) return 'current'
    
    // 检查是否可以访问
    if (phaseKey === 'collecting' && progress.currentPhase !== 'preview') return 'available'
    if (phaseKey === 'magic-moment' && canAccessMagicMoment()) return 'available'
    
    return 'disabled'
  }

  return (
    <nav className={`flex items-center space-x-2 ${className}`} aria-label="故事探索进度">
      {phases.map((phase, index) => {
        const status = getPhaseStatus(phase.key)
        const isLast = index === phases.length - 1
        
        return (
          <div key={phase.key} className="flex items-center">
            {/* 阶段指示器 */}
            <div className={`
              flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${status === 'current' 
                ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                : status === 'completed'
                ? 'bg-success-100 text-success-700'
                : status === 'available'
                ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 cursor-pointer'
                : 'bg-neutral-50 text-neutral-400'
              }
            `}>
              <span className="text-base">{phase.icon}</span>
              <span>{phase.title}</span>
              
              {/* 状态指示 */}
              {status === 'completed' && (
                <svg className="w-4 h-4 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              
              {status === 'current' && (
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              )}
            </div>
            
            {/* 连接线 */}
            {!isLast && (
              <div className={`
                w-8 h-0.5 mx-2
                ${status === 'completed' ? 'bg-success-300' : 'bg-neutral-200'}
              `} />
            )}
          </div>
        )
      })}
    </nav>
  )
}

/**
 * 故事线索发现进度指示器组件
 */
export function LearningProgressIndicator({ interest }: { interest: string }) {
  const { progress, currentStory } = useLearningStore()

  if (!progress || !currentStory) return null

  const totalKeywords = currentStory.keywords.length
  const collectedKeywords = progress.collectedKeywords
  const progressPercent = (collectedKeywords / totalKeywords) * 100

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-neutral-200">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-neutral-700">故事线索发现进度</h3>
        <span className="text-xs text-neutral-500">
          已发现 {collectedKeywords}/{totalKeywords} 个线索
        </span>
      </div>
      
      <div className="w-full bg-neutral-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      <div className="mt-2 text-xs text-neutral-600">
        {progress.currentPhase === 'preview' && '正在观看故事预览'}
        {progress.currentPhase === 'collecting' && '正在收集故事线索'}
        {progress.currentPhase === 'magic-moment' && '准备体验魔法时刻'}
      </div>
    </div>
  )
}
