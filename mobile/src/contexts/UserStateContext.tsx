import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import UserStateService, { UserProgress, SessionState, UserSettings } from '@/services/UserStateService';
import { AnalyticsService } from '@/services/AnalyticsService';

interface UserStateContextType {
  // 用户状态
  userProgress: UserProgress | null;
  sessionState: SessionState | null;
  userSettings: UserSettings | null;
  
  // 加载状态
  isLoading: boolean;
  isInitialized: boolean;
  
  // 用户操作
  initializeUser: (userId: string) => Promise<void>;
  updateUserProgress: (updates: Partial<UserProgress>) => Promise<void>;
  updateUserSettings: (updates: Partial<UserSettings>) => Promise<void>;
  
  // 会话管理
  startSession: (screen: string) => Promise<SessionState>;
  updateSession: (updates: Partial<SessionState>) => Promise<void>;
  endSession: () => Promise<void>;
  
  // 学习进度
  markChapterCompleted: (chapterId: string) => Promise<void>;
  markKeywordMastered: (keywordId: string) => Promise<void>;
  updateStreak: () => Promise<void>;
  
  // 会话恢复
  hasUnfinishedSession: boolean;
  restoreSession: () => Promise<void>;
  discardSession: () => Promise<void>;
  
  // 数据管理
  exportUserData: () => Promise<string>;
  clearAllData: () => Promise<void>;
}

const UserStateContext = createContext<UserStateContextType | undefined>(undefined);

interface UserStateProviderProps {
  children: ReactNode;
}

/**
 * UserStateProvider - V2 全局用户状态管理
 * 提供用户进度、会话状态、设置的统一管理
 */
export const UserStateProvider: React.FC<UserStateProviderProps> = ({ children }) => {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasUnfinishedSession, setHasUnfinishedSession] = useState(false);

  const userStateService = UserStateService.getInstance();
  const analyticsService = AnalyticsService.getInstance();

  // 初始化用户数据
  const initializeUser = async (userId: string) => {
    try {
      setIsLoading(true);
      
      // 并行加载用户数据
      const [progress, settings, existingSession] = await Promise.all([
        userStateService.loadUserProgress(userId),
        userStateService.loadUserSettings(userId),
        userStateService.loadSessionState(userId),
      ]);
      
      setUserProgress(progress);
      setUserSettings(settings);
      
      // 检查是否有未完成的会话
      if (existingSession) {
        const timeSinceLastActivity = Date.now() - new Date(existingSession.lastActivityTime).getTime();
        const maxSessionAge = 24 * 60 * 60 * 1000; // 24小时
        
        if (timeSinceLastActivity < maxSessionAge) {
          setSessionState(existingSession);
          setHasUnfinishedSession(true);
        } else {
          // 会话过期，清除
          await userStateService.endSession();
        }
      }
      
      // 更新连击
      await userStateService.updateStreak();
      const updatedProgress = userStateService.getUserProgress();
      if (updatedProgress) {
        setUserProgress(updatedProgress);
      }
      
      analyticsService.track('user_state_initialized', {
        userId,
        hasUnfinishedSession: hasUnfinishedSession,
        currentStreak: progress.currentStreak,
        wordsMastered: progress.wordsMastered,
        timestamp: Date.now(),
      });
      
      setIsInitialized(true);
      
    } catch (error) {
      console.error('Error initializing user:', error);
      analyticsService.track('user_state_initialization_failed', {
        userId,
        error: error.message,
        timestamp: Date.now(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 更新用户进度
  const updateUserProgress = async (updates: Partial<UserProgress>) => {
    try {
      await userStateService.updateUserProgress(updates);
      const updatedProgress = userStateService.getUserProgress();
      if (updatedProgress) {
        setUserProgress(updatedProgress);
      }
    } catch (error) {
      console.error('Error updating user progress:', error);
    }
  };

  // 更新用户设置
  const updateUserSettings = async (updates: Partial<UserSettings>) => {
    try {
      await userStateService.updateUserSettings(updates);
      const updatedSettings = userStateService.getUserSettings();
      if (updatedSettings) {
        setUserSettings(updatedSettings);
      }
    } catch (error) {
      console.error('Error updating user settings:', error);
    }
  };

  // 开始新会话
  const startSession = async (screen: string): Promise<SessionState> => {
    if (!userProgress) {
      throw new Error('User not initialized');
    }
    
    try {
      const newSession = await userStateService.startSession(userProgress.userId, screen);
      setSessionState(newSession);
      setHasUnfinishedSession(false);
      return newSession;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  };

  // 更新会话状态
  const updateSession = async (updates: Partial<SessionState>) => {
    try {
      await userStateService.updateSessionState(updates);
      const updatedSession = userStateService.getSessionState();
      if (updatedSession) {
        setSessionState(updatedSession);
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  // 结束会话
  const endSession = async () => {
    try {
      await userStateService.endSession();
      setSessionState(null);
      setHasUnfinishedSession(false);
      
      // 刷新用户进度（可能包含会话统计更新）
      const updatedProgress = userStateService.getUserProgress();
      if (updatedProgress) {
        setUserProgress(updatedProgress);
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  // 标记章节完成
  const markChapterCompleted = async (chapterId: string) => {
    try {
      await userStateService.markChapterCompleted(chapterId);
      const updatedProgress = userStateService.getUserProgress();
      if (updatedProgress) {
        setUserProgress(updatedProgress);
      }
    } catch (error) {
      console.error('Error marking chapter completed:', error);
    }
  };

  // 标记单词掌握
  const markKeywordMastered = async (keywordId: string) => {
    try {
      await userStateService.markKeywordMastered(keywordId);
      const updatedProgress = userStateService.getUserProgress();
      if (updatedProgress) {
        setUserProgress(updatedProgress);
      }
    } catch (error) {
      console.error('Error marking keyword mastered:', error);
    }
  };

  // 更新连击
  const updateStreak = async () => {
    try {
      await userStateService.updateStreak();
      const updatedProgress = userStateService.getUserProgress();
      if (updatedProgress) {
        setUserProgress(updatedProgress);
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  // 恢复会话
  const restoreSession = async () => {
    if (sessionState) {
      setHasUnfinishedSession(false);
      
      analyticsService.track('session_restored', {
        sessionId: sessionState.sessionId,
        userId: sessionState.userId,
        timestamp: Date.now(),
      });
    }
  };

  // 丢弃会话
  const discardSession = async () => {
    try {
      if (sessionState) {
        analyticsService.track('session_discarded', {
          sessionId: sessionState.sessionId,
          userId: sessionState.userId,
          timestamp: Date.now(),
        });
      }
      
      await userStateService.endSession();
      setSessionState(null);
      setHasUnfinishedSession(false);
    } catch (error) {
      console.error('Error discarding session:', error);
    }
  };

  // 导出用户数据
  const exportUserData = async (): Promise<string> => {
    if (!userProgress) {
      throw new Error('User not initialized');
    }
    
    try {
      return await userStateService.exportUserData(userProgress.userId);
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  };

  // 清除所有数据
  const clearAllData = async () => {
    if (!userProgress) {
      throw new Error('User not initialized');
    }
    
    try {
      await userStateService.clearAllUserData(userProgress.userId);
      setUserProgress(null);
      setSessionState(null);
      setUserSettings(null);
      setIsInitialized(false);
      setHasUnfinishedSession(false);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  };

  const contextValue: UserStateContextType = {
    // 状态
    userProgress,
    sessionState,
    userSettings,
    isLoading,
    isInitialized,
    hasUnfinishedSession,
    
    // 用户操作
    initializeUser,
    updateUserProgress,
    updateUserSettings,
    
    // 会话管理
    startSession,
    updateSession,
    endSession,
    
    // 学习进度
    markChapterCompleted,
    markKeywordMastered,
    updateStreak,
    
    // 会话恢复
    restoreSession,
    discardSession,
    
    // 数据管理
    exportUserData,
    clearAllData,
  };

  return (
    <UserStateContext.Provider value={contextValue}>
      {children}
    </UserStateContext.Provider>
  );
};

// Hook for using the context
export const useUserState = (): UserStateContextType => {
  const context = useContext(UserStateContext);
  if (context === undefined) {
    throw new Error('useUserState must be used within a UserStateProvider');
  }
  return context;
};

export default UserStateContext;
