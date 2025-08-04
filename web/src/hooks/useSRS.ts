/**
 * useSRS Hook
 * 为React组件提供SRS功能的便捷接口
 */

import { useState, useEffect, useCallback } from 'react';
import { srsService, SRSCard, SRSReviewSession, SRSAssessment, SRSStatistics } from '../lib/services/SRSService';
import { userSession } from '../lib/userSession';

export interface UseSRSReturn {
  // 卡片数据
  dueCards: SRSCard[];
  newCards: SRSCard[];
  allCards: SRSCard[];
  
  // 当前会话
  currentSession: SRSReviewSession | null;
  isSessionActive: boolean;
  
  // 统计数据
  statistics: SRSStatistics | null;
  
  // 方法
  addCard: (keywordId: string, word: string, translation: string, audioUrl: string, context?: any) => Promise<SRSCard>;
  reviewCard: (cardId: string, assessment: SRSAssessment, responseTime: number, userFeedback?: any) => Promise<SRSCard>;
  startSession: (sessionType?: SRSReviewSession['sessionType'], config?: any) => Promise<string>;
  endSession: () => Promise<SRSReviewSession | null>;
  
  // 数据获取
  getDueCards: (limit?: number) => SRSCard[];
  getNewCards: (limit?: number) => SRSCard[];
  refreshData: () => Promise<void>;
  
  // 加载状态
  isLoading: boolean;
  error: string | null;
}

export function useSRS(): UseSRSReturn {
  const [dueCards, setDueCards] = useState<SRSCard[]>([]);
  const [newCards, setNewCards] = useState<SRSCard[]>([]);
  const [allCards, setAllCards] = useState<SRSCard[]>([]);
  const [currentSession, setCurrentSession] = useState<SRSReviewSession | null>(null);
  const [statistics, setStatistics] = useState<SRSStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');

  // 初始化用户ID
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const session = await userSession.initializeSession();
        setUserId(session.userId || session.deviceId);
      } catch (err) {
        console.error('Failed to initialize user session:', err);
        setError('Failed to initialize user session');
      }
    };

    initializeUser();
  }, []);

  // 刷新数据
  const refreshData = useCallback(async () => {
    try {
      setError(null);
      
      // 获取到期卡片
      const due = srsService.getDueCards(20);
      setDueCards(due);
      
      // 获取新卡片
      const newCardsData = srsService.getNewCards(10);
      setNewCards(newCardsData);
      
      // 获取所有卡片
      const all = srsService.getAllCards();
      setAllCards(all);
      
      // 获取当前会话
      const session = srsService.getCurrentSession();
      setCurrentSession(session);
      
      // 获取统计数据
      const stats = srsService.getSRSStatistics();
      setStatistics(stats);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh SRS data';
      setError(errorMessage);
      console.error('SRS data refresh failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初始化数据
  useEffect(() => {
    if (userId) {
      refreshData();
      
      // 设置定时器定期刷新数据
      const interval = setInterval(refreshData, 30000); // 每30秒刷新一次
      
      return () => clearInterval(interval);
    }
  }, [userId, refreshData]);

  // 添加卡片
  const addCard = useCallback(async (
    keywordId: string, 
    word: string, 
    translation: string, 
    audioUrl: string, 
    context?: {
      storyId?: string;
      interest?: string;
      difficulty?: number;
      imageUrl?: string;
    }
  ): Promise<SRSCard> => {
    try {
      setError(null);
      const card = await srsService.addCard(keywordId, word, translation, audioUrl, context);
      
      // 刷新数据
      await refreshData();
      
      return card;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add card';
      setError(errorMessage);
      console.error('SRS add card failed:', err);
      throw err;
    }
  }, [refreshData]);

  // 复习卡片
  const reviewCard = useCallback(async (
    cardId: string, 
    assessment: SRSAssessment, 
    responseTime: number,
    userFeedback?: {
      difficulty?: number;
      confidence?: number;
      notes?: string;
    }
  ): Promise<SRSCard> => {
    try {
      setError(null);
      const card = await srsService.reviewCard(cardId, assessment, responseTime, userFeedback);
      
      // 刷新数据
      await refreshData();
      
      return card;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to review card';
      setError(errorMessage);
      console.error('SRS review card failed:', err);
      throw err;
    }
  }, [refreshData]);

  // 开始会话
  const startSession = useCallback(async (
    sessionType: SRSReviewSession['sessionType'] = 'daily',
    config?: {
      targetCards?: number;
      maxDuration?: number;
    }
  ): Promise<string> => {
    if (!userId) {
      throw new Error('User ID not available');
    }

    try {
      setError(null);
      const sessionId = await srsService.startReviewSession(userId, sessionType, config);
      
      // 刷新数据以获取当前会话
      await refreshData();
      
      return sessionId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start session';
      setError(errorMessage);
      console.error('SRS start session failed:', err);
      throw err;
    }
  }, [userId, refreshData]);

  // 结束会话
  const endSession = useCallback(async (): Promise<SRSReviewSession | null> => {
    try {
      setError(null);
      const session = await srsService.endReviewSession();
      
      // 刷新数据
      await refreshData();
      
      return session;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end session';
      setError(errorMessage);
      console.error('SRS end session failed:', err);
      throw err;
    }
  }, [refreshData]);

  // 获取到期卡片
  const getDueCards = useCallback((limit: number = 20): SRSCard[] => {
    return srsService.getDueCards(limit);
  }, []);

  // 获取新卡片
  const getNewCards = useCallback((limit: number = 10): SRSCard[] => {
    return srsService.getNewCards(limit);
  }, []);

  return {
    // 卡片数据
    dueCards,
    newCards,
    allCards,
    
    // 当前会话
    currentSession,
    isSessionActive: currentSession !== null,
    
    // 统计数据
    statistics,
    
    // 方法
    addCard,
    reviewCard,
    startSession,
    endSession,
    
    // 数据获取
    getDueCards,
    getNewCards,
    refreshData,
    
    // 加载状态
    isLoading,
    error
  };
}

// 辅助Hook：仅获取SRS统计数据
export function useSRSStatistics(): {
  statistics: SRSStatistics | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
} {
  const [statistics, setStatistics] = useState<SRSStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    try {
      setError(null);
      setIsLoading(true);
      const stats = srsService.getSRSStatistics();
      setStatistics(stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get statistics';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    
    // 定期刷新统计数据
    const interval = setInterval(refresh, 60000); // 每分钟刷新一次
    
    return () => clearInterval(interval);
  }, [refresh]);

  return { statistics, isLoading, error, refresh };
}

// 辅助Hook：获取今日复习任务
export function useTodayReviews(): {
  dueCards: SRSCard[];
  newCards: SRSCard[];
  totalReviews: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
} {
  const [dueCards, setDueCards] = useState<SRSCard[]>([]);
  const [newCards, setNewCards] = useState<SRSCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    try {
      setError(null);
      setIsLoading(true);
      
      const due = srsService.getDueCards(50); // 获取更多到期卡片
      const newCardsData = srsService.getNewCards(20); // 获取更多新卡片
      
      setDueCards(due);
      setNewCards(newCardsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get today reviews';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    
    // 定期刷新今日任务
    const interval = setInterval(refresh, 300000); // 每5分钟刷新一次
    
    return () => clearInterval(interval);
  }, [refresh]);

  return {
    dueCards,
    newCards,
    totalReviews: dueCards.length + newCards.length,
    isLoading,
    error,
    refresh
  };
}
