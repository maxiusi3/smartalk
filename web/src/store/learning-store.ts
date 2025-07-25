import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LearningProgress, LearningSession, VTPRAttempt, Story, StoryKeyword } from '@/types/story'

interface LearningState {
  // 当前学习会话
  currentSession: LearningSession | null
  // 当前故事数据
  currentStory: Story | null
  // 当前学习的词汇
  currentKeyword: StoryKeyword | null
  // 学习进度
  progress: LearningProgress | null
  
  // Actions
  startLearningSession: (story: Story, userId: string) => void
  setCurrentKeyword: (keyword: StoryKeyword | null) => void
  completePreviewPhase: () => void
  collectKeyword: (keywordId: string, attempt: VTPRAttempt) => void
  completeMagicMoment: () => void
  resetLearning: () => void
  
  // Getters
  getCollectedKeywordsCount: () => number
  isKeywordCollected: (keywordId: string) => boolean
  canAccessMagicMoment: () => boolean
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      currentStory: null,
      currentKeyword: null,
      progress: null,

      startLearningSession: (story: Story, userId: string) => {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const now = new Date()
        
        const newSession: LearningSession = {
          sessionId,
          storyId: story.id,
          userId,
          startTime: now,
          progress: {
            storyId: story.id,
            currentPhase: 'preview',
            collectedKeywords: 0,
            totalKeywords: story.keywords.length,
            startTime: now
          },
          attempts: [],
          hasExperiencedMagicMoment: false
        }

        // 重置故事中所有词汇的收集状态
        const resetStory = {
          ...story,
          keywords: story.keywords.map(keyword => ({
            ...keyword,
            isCollected: false
          }))
        }

        set({
          currentSession: newSession,
          currentStory: resetStory,
          progress: newSession.progress,
          currentKeyword: null
        })
      },

      setCurrentKeyword: (keyword: StoryKeyword | null) => {
        set({ currentKeyword: keyword })
      },

      completePreviewPhase: () => {
        const { currentSession, progress } = get()
        if (!currentSession || !progress) return

        const updatedProgress = {
          ...progress,
          currentPhase: 'collecting' as const,
          previewCompletedAt: new Date()
        }

        const updatedSession = {
          ...currentSession,
          progress: updatedProgress
        }

        set({
          currentSession: updatedSession,
          progress: updatedProgress
        })
      },

      collectKeyword: (keywordId: string, attempt: VTPRAttempt) => {
        const { currentSession, currentStory, progress } = get()
        if (!currentSession || !currentStory || !progress) return

        // 更新尝试记录
        const updatedAttempts = [...currentSession.attempts, attempt]

        // 如果答对了，标记词汇为已收集
        let updatedStory = currentStory
        let updatedProgress = progress

        if (attempt.isCorrect) {
          updatedStory = {
            ...currentStory,
            keywords: currentStory.keywords.map(keyword =>
              keyword.id === keywordId
                ? { ...keyword, isCollected: true }
                : keyword
            )
          }

          const collectedCount = updatedStory.keywords.filter(k => k.isCollected).length
          updatedProgress = {
            ...progress,
            collectedKeywords: collectedCount
          }

          // 如果收集完所有词汇，进入魔法时刻阶段
          if (collectedCount === updatedStory.keywords.length) {
            updatedProgress = {
              ...updatedProgress,
              currentPhase: 'magic-moment',
              collectingCompletedAt: new Date()
            }
          }
        }

        const updatedSession = {
          ...currentSession,
          attempts: updatedAttempts,
          progress: updatedProgress
        }

        set({
          currentSession: updatedSession,
          currentStory: updatedStory,
          progress: updatedProgress,
          currentKeyword: null // 清除当前词汇选择
        })
      },

      completeMagicMoment: () => {
        const { currentSession, progress } = get()
        if (!currentSession || !progress) return

        const updatedProgress = {
          ...progress,
          currentPhase: 'completed' as const,
          magicMomentCompletedAt: new Date()
        }

        const updatedSession = {
          ...currentSession,
          progress: updatedProgress,
          hasExperiencedMagicMoment: true,
          endTime: new Date()
        }

        set({
          currentSession: updatedSession,
          progress: updatedProgress
        })
      },

      resetLearning: () => {
        set({
          currentSession: null,
          currentStory: null,
          currentKeyword: null,
          progress: null
        })
      },

      // Getters
      getCollectedKeywordsCount: () => {
        const { currentStory } = get()
        if (!currentStory) return 0
        return currentStory.keywords.filter(k => k.isCollected).length
      },

      isKeywordCollected: (keywordId: string) => {
        const { currentStory } = get()
        if (!currentStory) return false
        const keyword = currentStory.keywords.find(k => k.id === keywordId)
        return keyword?.isCollected || false
      },

      canAccessMagicMoment: () => {
        const { progress, currentStory } = get()
        if (!progress || !currentStory) return false
        return progress.collectedKeywords === currentStory.keywords.length
      }
    }),
    {
      name: 'learning-storage',
      // 只持久化必要的数据
      partialize: (state) => ({
        currentSession: state.currentSession,
        progress: state.progress
      })
    }
  )
)
