/**
 * useLearningProgress - V2 学习进度管理Hook
 * 提供组件级别的学习进度功能
 * 自动处理进度跟踪、会话管理、状态同步
 */

import { useEffect, useCallback, useState, useRef } from 'react';
import LearningProgressService, { 
  OverallProgress,
  StoryProgress,
  ThemeProgress,
  KeywordProgress,
  LearningSession,
  SessionRecoveryData,
  LearningMode,
  LearningStatus
} from '@/services/LearningProgressService';
import { useUserState } from '@/contexts/UserStateContext';

// 学习进度Hook状态
interface LearningProgressState {
  // 进度数据
  overallProgress: OverallProgress | null;
  currentThemeProgress: ThemeProgress | null;
  currentStoryProgress: StoryProgress | null;
  
  // 会话数据
  activeSession: LearningSession | null;
  sessionRecoveryData: SessionRecoveryData | null;
  
  // 统计数据
  learningStats: {
    totalTimeSpent: number;
    totalKeywordsLearned: number;
    overallAccuracy: number;
    currentStreak: number;
    sessionsThisWeek: number;
  } | null;
  
  // 复习数据
  reviewKeywords: KeywordProgress[];
  
  // 状态
  loading: boolean;
  error: string | null;
  syncing: boolean;
}

/**
 * 学习进度管理Hook
 */
export const useLearningProgress = () => {
  const { userProgress } = useUserState();
  const [state, setState] = useState<LearningProgressState>({
    overallProgress: null,
    currentThemeProgress: null,
    currentStoryProgress: null,
    activeSession: null,
    sessionRecoveryData: null,
    learningStats: null,
    reviewKeywords: [],
    loading: false,
    error: null,
    syncing: false,
  });

  const learningProgressService = LearningProgressService.getInstance();
  const syncInterval = useRef<NodeJS.Timeout | null>(null);

  // 初始化
  useEffect(() => {
    if (userProgress?.userId) {
      loadUserProgress();
      startPeriodicSync();
    }
    
    return () => {
      stopPeriodicSync();
    };
  }, [userProgress?.userId]);

  const loadUserProgress = useCallback(async () => {
    if (!userProgress?.userId) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // 加载整体进度
      const overallProgress = await learningProgressService.getUserProgress(userProgress.userId);
      
      // 加载活跃会话
      const activeSession = learningProgressService.getActiveSession();
      
      // 加载会话恢复数据
      const sessionRecoveryData = await learningProgressService.getSessionRecoveryData();
      
      // 加载学习统计
      const learningStats = learningProgressService.getLearningStats(userProgress.userId);
      
      // 加载复习关键词
      const reviewKeywords = learningProgressService.getKeywordsForReview(userProgress.userId);

      setState(prev => ({
        ...prev,
        overallProgress,
        activeSession,
        sessionRecoveryData,
        learningStats,
        reviewKeywords,
        loading: false,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || '加载学习进度失败',
      }));
    }
  }, [userProgress?.userId]);

  const startPeriodicSync = useCallback(() => {
    syncInterval.current = setInterval(() => {
      if (userProgress?.userId) {
        syncProgress();
      }
    }, 60000); // 每分钟同步一次
  }, [userProgress?.userId]);

  const stopPeriodicSync = useCallback(() => {
    if (syncInterval.current) {
      clearInterval(syncInterval.current);
      syncInterval.current = null;
    }
  }, []);

  const syncProgress = useCallback(async () => {
    if (!userProgress?.userId) return;

    try {
      setState(prev => ({ ...prev, syncing: true }));
      
      // 重新加载最新数据
      await loadUserProgress();
      
      setState(prev => ({ ...prev, syncing: false }));
      
    } catch (error) {
      setState(prev => ({ ...prev, syncing: false }));
      console.error('Error syncing progress:', error);
    }
  }, [userProgress?.userId, loadUserProgress]);

  // 会话管理
  const startLearningSession = useCallback(async (
    storyId: string,
    themeId: string,
    mode: LearningMode
  ) => {
    if (!userProgress?.userId) return null;

    try {
      const session = await learningProgressService.startLearningSession(
        userProgress.userId,
        storyId,
        themeId,
        mode
      );

      setState(prev => ({
        ...prev,
        activeSession: session,
      }));

      return session;

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || '开始学习会话失败',
      }));
      return null;
    }
  }, [userProgress?.userId]);

  const endLearningSession = useCallback(async (
    sessionId: string,
    reason: 'completed' | 'user_exit' | 'interrupted'
  ) => {
    try {
      await learningProgressService.endLearningSession(sessionId, reason);
      
      setState(prev => ({
        ...prev,
        activeSession: null,
      }));

      // 重新加载进度数据
      await loadUserProgress();

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || '结束学习会话失败',
      }));
    }
  }, [loadUserProgress]);

  const recoverLearningSession = useCallback(async (recoveryData: SessionRecoveryData) => {
    try {
      const session = await learningProgressService.recoverLearningSession(recoveryData);
      
      setState(prev => ({
        ...prev,
        activeSession: session,
        sessionRecoveryData: null,
      }));

      return session;

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || '恢复学习会话失败',
      }));
      return null;
    }
  }, []);

  // 进度更新
  const updateKeywordProgress = useCallback(async (
    storyId: string,
    keywordId: string,
    isCorrect: boolean,
    mode: LearningMode,
    timeSpent: number
  ) => {
    if (!userProgress?.userId) return;

    try {
      await learningProgressService.updateKeywordProgress(
        userProgress.userId,
        storyId,
        keywordId,
        isCorrect,
        mode,
        timeSpent
      );

      // 重新加载进度数据
      await loadUserProgress();

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || '更新关键词进度失败',
      }));
    }
  }, [userProgress?.userId, loadUserProgress]);

  // 主题和故事选择
  const selectTheme = useCallback((themeId: string) => {
    if (!state.overallProgress) return;

    const themeProgress = state.overallProgress.themes.find(t => t.themeId === themeId);
    setState(prev => ({
      ...prev,
      currentThemeProgress: themeProgress || null,
      currentStoryProgress: null,
    }));
  }, [state.overallProgress]);

  const selectStory = useCallback((storyId: string) => {
    if (!userProgress?.userId) return;

    const storyProgress = learningProgressService.getStoryProgress(userProgress.userId, storyId);
    setState(prev => ({
      ...prev,
      currentStoryProgress: storyProgress,
    }));
  }, [userProgress?.userId]);

  return {
    // 状态
    ...state,
    
    // 会话管理
    startLearningSession,
    endLearningSession,
    recoverLearningSession,
    
    // 进度管理
    updateKeywordProgress,
    selectTheme,
    selectStory,
    syncProgress,
    
    // 便捷属性
    hasActiveSession: !!state.activeSession,
    canRecoverSession: !!state.sessionRecoveryData,
    hasReviewKeywords: state.reviewKeywords.length > 0,
    isLearning: !!state.activeSession?.isCompleted === false,
    totalProgress: state.overallProgress ? 
      Math.round((state.overallProgress.totalStoriesCompleted / 
        state.overallProgress.themes.reduce((sum, theme) => sum + theme.totalStories, 0)) * 100) : 0,
  };
};

/**
 * 故事进度Hook
 */
export const useStoryProgress = (storyId?: string) => {
  const { userProgress } = useUserState();
  const [storyProgress, setStoryProgress] = useState<StoryProgress | null>(null);
  const [loading, setLoading] = useState(false);

  const learningProgressService = LearningProgressService.getInstance();

  const loadStoryProgress = useCallback(async () => {
    if (!userProgress?.userId || !storyId) return;

    try {
      setLoading(true);
      const progress = learningProgressService.getStoryProgress(userProgress.userId, storyId);
      setStoryProgress(progress);
    } catch (error) {
      console.error('Error loading story progress:', error);
    } finally {
      setLoading(false);
    }
  }, [userProgress?.userId, storyId]);

  useEffect(() => {
    loadStoryProgress();
  }, [loadStoryProgress]);

  return {
    storyProgress,
    loading,
    reload: loadStoryProgress,
    
    // 便捷属性
    isCompleted: storyProgress?.status === 'completed',
    isInProgress: storyProgress?.status === 'in_progress',
    progressPercentage: storyProgress?.progressPercentage || 0,
    completedKeywords: storyProgress?.completedKeywords || 0,
    totalKeywords: storyProgress?.totalKeywords || 0,
    hasCurrentSession: !!storyProgress?.currentSession?.isActive,
  };
};

/**
 * 会话恢复Hook
 */
export const useSessionRecovery = () => {
  const [recoveryData, setRecoveryData] = useState<SessionRecoveryData | null>(null);
  const [loading, setLoading] = useState(false);

  const learningProgressService = LearningProgressService.getInstance();

  const checkRecoveryData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await learningProgressService.getSessionRecoveryData();
      setRecoveryData(data);
    } catch (error) {
      console.error('Error checking recovery data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const recoverSession = useCallback(async () => {
    if (!recoveryData) return null;

    try {
      const session = await learningProgressService.recoverLearningSession(recoveryData);
      setRecoveryData(null);
      return session;
    } catch (error) {
      console.error('Error recovering session:', error);
      return null;
    }
  }, [recoveryData]);

  const dismissRecovery = useCallback(async () => {
    setRecoveryData(null);
    // 清理本地恢复数据
    try {
      await learningProgressService.getSessionRecoveryData(); // 这会清理过期数据
    } catch (error) {
      console.error('Error dismissing recovery:', error);
    }
  }, []);

  useEffect(() => {
    checkRecoveryData();
  }, [checkRecoveryData]);

  return {
    recoveryData,
    loading,
    recoverSession,
    dismissRecovery,
    checkRecoveryData,
    
    // 便捷属性
    canRecover: !!recoveryData?.canRecover,
    storyTitle: recoveryData?.storyId || '',
    progressSnapshot: recoveryData?.progressSnapshot,
  };
};

/**
 * 学习统计Hook
 */
export const useLearningStats = () => {
  const { userProgress } = useUserState();
  const [stats, setStats] = useState<{
    totalTimeSpent: number;
    totalKeywordsLearned: number;
    overallAccuracy: number;
    currentStreak: number;
    sessionsThisWeek: number;
  } | null>(null);

  const learningProgressService = LearningProgressService.getInstance();

  const loadStats = useCallback(() => {
    if (!userProgress?.userId) return;

    const learningStats = learningProgressService.getLearningStats(userProgress.userId);
    setStats(learningStats);
  }, [userProgress?.userId]);

  useEffect(() => {
    loadStats();
    
    // 定期更新统计数据
    const interval = setInterval(loadStats, 30000); // 每30秒更新
    return () => clearInterval(interval);
  }, [loadStats]);

  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    } else {
      return `${minutes}分钟`;
    }
  }, []);

  return {
    stats,
    formatTime,
    reload: loadStats,
    
    // 便捷属性
    formattedTotalTime: stats ? formatTime(stats.totalTimeSpent) : '0分钟',
    accuracyPercentage: stats ? Math.round(stats.overallAccuracy * 100) : 0,
    isOnStreak: (stats?.currentStreak || 0) > 0,
    isActiveThisWeek: (stats?.sessionsThisWeek || 0) > 0,
  };
};

export default useLearningProgress;
