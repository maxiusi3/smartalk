// Zustand 状态管理 - 全局应用状态

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient, type User, type Chapter, type LearningProgress } from './api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  updateUserPreferences: (preferences: Partial<User['preferences']>) => Promise<boolean>
}

interface LearningState {
  chapters: Chapter[]
  currentChapter: Chapter | null
  currentLesson: any | null
  progress: LearningProgress[]
  isLoading: boolean
  
  // Actions
  loadChapters: () => Promise<void>
  setCurrentChapter: (chapter: Chapter) => void
  setCurrentLesson: (lesson: any) => void
  updateProgress: (chapterId: string, lessonId: string, progress: number, score?: number) => Promise<void>
  completeLesson: (chapterId: string, lessonId: string, score: number) => Promise<void>
}

interface UIState {
  sidebarOpen: boolean
  currentTheme: 'light' | 'dark'
  currentInterest: 'travel' | 'movie' | 'workplace' | null

  // Actions
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setCurrentInterest: (interest: 'travel' | 'movie' | 'workplace' | null) => void
}

// 认证状态管理
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        
        try {
          const response = await apiClient.login(email, password)
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            })
            return true
          } else {
            set({ isLoading: false })
            return false
          }
        } catch (error) {
          set({ isLoading: false })
          return false
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true })
        
        try {
          const response = await apiClient.register(email, password, name)
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            })
            return true
          } else {
            set({ isLoading: false })
            return false
          }
        } catch (error) {
          set({ isLoading: false })
          return false
        }
      },

      logout: () => {
        apiClient.logout()
        set({
          user: null,
          isAuthenticated: false,
        })
      },

      updateUserPreferences: async (preferences: Partial<User['preferences']>) => {
        try {
          const response = await apiClient.updateUserPreferences(preferences)

          if (response.success && response.data) {
            set({
              user: response.data,
              isAuthenticated: true // 设置用户为已认证状态
            })
            return true
          }
          return false
        } catch (error) {
          console.error('Failed to update user preferences:', error)
          return false
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// 学习状态管理
export const useLearningStore = create<LearningState>((set, get) => ({
  chapters: [],
  currentChapter: null,
  currentLesson: null,
  progress: [],
  isLoading: false,

  loadChapters: async () => {
    set({ isLoading: true })
    
    try {
      const response = await apiClient.getChapters()
      
      if (response.success && response.data) {
        set({ chapters: response.data, isLoading: false })
      } else {
        set({ isLoading: false })
      }
    } catch (error) {
      set({ isLoading: false })
    }
  },

  setCurrentChapter: (chapter: Chapter) => {
    set({ currentChapter: chapter })
  },

  setCurrentLesson: (lesson: any) => {
    set({ currentLesson: lesson })
  },

  updateProgress: async (chapterId: string, lessonId: string, progress: number, score?: number) => {
    try {
      const response = await apiClient.updateProgress(chapterId, lessonId, progress, score)
      
      if (response.success && response.data) {
        const { progress: currentProgress } = get()
        const updatedProgress = currentProgress.filter(
          p => !(p.chapterId === chapterId && p.lessonId === lessonId)
        )
        updatedProgress.push(response.data)
        
        set({ progress: updatedProgress })
      }
    } catch (error) {
      console.error('Failed to update progress:', error)
    }
  },

  completeLesson: async (chapterId: string, lessonId: string, score: number) => {
    try {
      const response = await apiClient.completeLesson(chapterId, lessonId, score)
      
      if (response.success && response.data) {
        const { progress: currentProgress } = get()
        const updatedProgress = currentProgress.filter(
          p => !(p.chapterId === chapterId && p.lessonId === lessonId)
        )
        updatedProgress.push(response.data)
        
        set({ progress: updatedProgress })
      }
    } catch (error) {
      console.error('Failed to complete lesson:', error)
    }
  },
}))

// UI状态管理
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      currentTheme: 'light',
      currentInterest: null,

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }))
      },

      setTheme: (theme: 'light' | 'dark') => {
        set({ currentTheme: theme })
      },

      setCurrentInterest: (interest: 'travel' | 'movie' | 'workplace' | null) => {
        set({ currentInterest: interest })
      },
    }),
    {
      name: 'ui-storage',
    }
  )
)
