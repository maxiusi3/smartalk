/**
 * useSRSReview - V2 SRS复习系统Hook
 * 提供组件级别的SRS复习功能
 * 自动处理通知管理、复习会话、自评系统
 */

import { useEffect, useCallback, useState, useRef } from 'react';
import SRSNotificationService, { 
  NotificationSettings,
  ScheduledNotification,
  FastReviewSessionService,
  ReviewSession,
  ReviewItem,
  SelfAssessmentResult
} from '@/services/SRSNotificationService';
import { useLearningProgress } from './useLearningProgress';
import { useUserState } from '@/contexts/UserStateContext';

// SRS复习Hook状态
interface SRSReviewState {
  // 通知相关
  notificationSettings: NotificationSettings | null;
  hasNotificationPermission: boolean;
  scheduledNotifications: ScheduledNotification[];
  
  // 复习会话
  currentReviewSession: ReviewSession | null;
  currentReviewItem: ReviewItem | null;
  
  // 状态
  loading: boolean;
  error: string | null;
  requestingPermission: boolean;
}

/**
 * SRS复习系统Hook
 */
export const useSRSReview = () => {
  const { userProgress } = useUserState();
  const { reviewKeywords, hasReviewKeywords } = useLearningProgress();
  
  const [state, setState] = useState<SRSReviewState>({
    notificationSettings: null,
    hasNotificationPermission: false,
    scheduledNotifications: [],
    currentReviewSession: null,
    currentReviewItem: null,
    loading: false,
    error: null,
    requestingPermission: false,
  });

  const srsNotificationService = SRSNotificationService.getInstance();
  const fastReviewService = FastReviewSessionService.getInstance();
  const sessionTimer = useRef<NodeJS.Timeout | null>(null);

  // 初始化
  useEffect(() => {
    if (userProgress?.userId) {
      loadSRSData();
    }
  }, [userProgress?.userId]);

  const loadSRSData = useCallback(async () => {
    if (!userProgress?.userId) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // 加载通知设置
      const settings = srsNotificationService.getNotificationSettings(userProgress.userId);
      
      // 检查通知权限
      const hasPermission = srsNotificationService.hasPermission();
      
      // 加载计划通知
      const notifications = srsNotificationService.getUserScheduledNotifications(userProgress.userId);

      setState(prev => ({
        ...prev,
        notificationSettings: settings,
        hasNotificationPermission: hasPermission,
        scheduledNotifications: notifications,
        loading: false,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || '加载SRS数据失败',
      }));
    }
  }, [userProgress?.userId]);

  // 请求通知权限
  const requestNotificationPermission = useCallback(async () => {
    if (!userProgress?.userId) return false;

    try {
      setState(prev => ({ ...prev, requestingPermission: true }));

      const granted = await srsNotificationService.requestNotificationPermission(userProgress.userId);
      
      setState(prev => ({
        ...prev,
        hasNotificationPermission: granted,
        requestingPermission: false,
      }));

      return granted;

    } catch (error) {
      setState(prev => ({
        ...prev,
        requestingPermission: false,
        error: error.message || '请求通知权限失败',
      }));
      return false;
    }
  }, [userProgress?.userId]);

  // 更新通知设置
  const updateNotificationSettings = useCallback(async (settings: Partial<NotificationSettings>) => {
    if (!userProgress?.userId) return;

    try {
      await srsNotificationService.updateNotificationSettings(userProgress.userId, settings);
      
      const updatedSettings = srsNotificationService.getNotificationSettings(userProgress.userId);
      setState(prev => ({
        ...prev,
        notificationSettings: updatedSettings,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || '更新通知设置失败',
      }));
    }
  }, [userProgress?.userId]);

  // 安排复习提醒
  const scheduleReviewReminder = useCallback(async () => {
    if (!userProgress?.userId || !hasReviewKeywords) return;

    try {
      await srsNotificationService.scheduleReviewReminder(userProgress.userId, reviewKeywords);
      
      // 重新加载计划通知
      const notifications = srsNotificationService.getUserScheduledNotifications(userProgress.userId);
      setState(prev => ({
        ...prev,
        scheduledNotifications: notifications,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || '安排复习提醒失败',
      }));
    }
  }, [userProgress?.userId, hasReviewKeywords, reviewKeywords]);

  // 开始复习会话
  const startReviewSession = useCallback(async () => {
    if (!userProgress?.userId || !hasReviewKeywords) return null;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const session = await fastReviewService.createReviewSession(userProgress.userId, reviewKeywords);
      const firstItem = fastReviewService.getCurrentReviewItem(session.sessionId);

      setState(prev => ({
        ...prev,
        currentReviewSession: session,
        currentReviewItem: firstItem,
        loading: false,
      }));

      // 开始会话计时器
      startSessionTimer(session.sessionId);

      return session;

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || '开始复习会话失败',
      }));
      return null;
    }
  }, [userProgress?.userId, hasReviewKeywords, reviewKeywords]);

  // 开始会话计时器
  const startSessionTimer = useCallback((sessionId: string) => {
    sessionTimer.current = setInterval(() => {
      const session = fastReviewService.getReviewSession(sessionId);
      if (session) {
        setState(prev => ({
          ...prev,
          currentReviewSession: session,
        }));
      }
    }, 1000); // 每秒更新一次
  }, []);

  // 停止会话计时器
  const stopSessionTimer = useCallback(() => {
    if (sessionTimer.current) {
      clearInterval(sessionTimer.current);
      sessionTimer.current = null;
    }
  }, []);

  // 提交复习答案
  const submitReviewAnswer = useCallback(async (
    selectedImageUrl: string,
    selfAssessment: SelfAssessmentResult,
    responseTime: number
  ) => {
    if (!state.currentReviewSession || !state.currentReviewItem) return;

    try {
      const session = state.currentReviewSession;
      const currentIndex = session.currentItemIndex;

      await fastReviewService.submitReviewAnswer(
        session.sessionId,
        currentIndex,
        selectedImageUrl,
        selfAssessment,
        responseTime
      );

      // 移动到下一个项目
      const hasNext = fastReviewService.moveToNextItem(session.sessionId);
      
      if (hasNext) {
        const nextItem = fastReviewService.getCurrentReviewItem(session.sessionId);
        const updatedSession = fastReviewService.getReviewSession(session.sessionId);
        
        setState(prev => ({
          ...prev,
          currentReviewSession: updatedSession,
          currentReviewItem: nextItem,
        }));
      } else {
        // 完成会话
        await completeReviewSession();
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || '提交答案失败',
      }));
    }
  }, [state.currentReviewSession, state.currentReviewItem]);

  // 完成复习会话
  const completeReviewSession = useCallback(async () => {
    if (!state.currentReviewSession) return;

    try {
      const completedSession = await fastReviewService.completeReviewSession(
        state.currentReviewSession.sessionId
      );

      setState(prev => ({
        ...prev,
        currentReviewSession: completedSession,
        currentReviewItem: null,
      }));

      stopSessionTimer();

      return completedSession;

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || '完成复习会话失败',
      }));
      return null;
    }
  }, [state.currentReviewSession, stopSessionTimer]);

  // 取消复习会话
  const cancelReviewSession = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentReviewSession: null,
      currentReviewItem: null,
    }));

    stopSessionTimer();
  }, [stopSessionTimer]);

  // 清理资源
  useEffect(() => {
    return () => {
      stopSessionTimer();
    };
  }, [stopSessionTimer]);

  return {
    // 状态
    ...state,
    
    // 通知管理
    requestNotificationPermission,
    updateNotificationSettings,
    scheduleReviewReminder,
    
    // 复习会话
    startReviewSession,
    submitReviewAnswer,
    completeReviewSession,
    cancelReviewSession,
    
    // 便捷属性
    canStartReview: hasReviewKeywords && !state.currentReviewSession,
    isReviewing: !!state.currentReviewSession && !state.currentReviewSession.isCompleted,
    reviewProgress: state.currentReviewSession ? 
      (state.currentReviewSession.completedItems / state.currentReviewSession.totalItems) * 100 : 0,
    shouldRequestPermission: userProgress?.userId ? 
      srsNotificationService.shouldRequestPermission(userProgress.userId) : false,
  };
};

/**
 * 通知设置Hook
 */
export const useNotificationSettings = () => {
  const { userProgress } = useUserState();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(false);

  const srsNotificationService = SRSNotificationService.getInstance();

  const loadSettings = useCallback(() => {
    if (!userProgress?.userId) return;

    setLoading(true);
    const userSettings = srsNotificationService.getNotificationSettings(userProgress.userId);
    setSettings(userSettings);
    setLoading(false);
  }, [userProgress?.userId]);

  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    if (!userProgress?.userId) return;

    try {
      setLoading(true);
      await srsNotificationService.updateNotificationSettings(userProgress.userId, newSettings);
      
      const updatedSettings = srsNotificationService.getNotificationSettings(userProgress.userId);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
    } finally {
      setLoading(false);
    }
  }, [userProgress?.userId]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    updateSettings,
    reload: loadSettings,
  };
};

/**
 * 复习会话Hook
 */
export const useReviewSession = (sessionId?: string) => {
  const [session, setSession] = useState<ReviewSession | null>(null);
  const [currentItem, setCurrentItem] = useState<ReviewItem | null>(null);
  const [loading, setLoading] = useState(false);

  const fastReviewService = FastReviewSessionService.getInstance();

  const loadSession = useCallback(() => {
    if (!sessionId) return;

    setLoading(true);
    const sessionData = fastReviewService.getReviewSession(sessionId);
    const itemData = fastReviewService.getCurrentReviewItem(sessionId);
    
    setSession(sessionData);
    setCurrentItem(itemData);
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  return {
    session,
    currentItem,
    loading,
    reload: loadSession,
    
    // 便捷属性
    isCompleted: session?.isCompleted || false,
    progress: session ? (session.completedItems / session.totalItems) * 100 : 0,
    remainingTime: session ? Math.max(0, session.targetDuration - 
      Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000)) : 0,
  };
};

export default useSRSReview;
