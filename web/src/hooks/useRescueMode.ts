/**
 * useRescueMode Hook
 * 为React组件提供Rescue Mode功能的便捷接口
 */

import { useState, useEffect, useCallback } from 'react';
import { rescueModeService, RescueModeState } from '../lib/services/RescueModeService';
import { userSession } from '../lib/userSession';

export interface UseRescueModeReturn {
  // 状态
  isActive: boolean;
  state: RescueModeState | null;
  supportiveMessage: string;
  phoneticTips: string[];
  rescueVideoUrl: string | null;
  
  // 阈值和评分
  currentPassThreshold: number;
  shouldUseLoweredThreshold: boolean;
  
  // 方法
  recordFailure: (keywordId: string, sessionId: string, pronunciationScore: number, phoneticTips?: string[]) => Promise<boolean>;
  recordImprovement: (newScore: number, passedWithRescue: boolean) => Promise<void>;
  calculateRescueScore: (originalScore: number) => number;
  exitRescueMode: () => Promise<void>;
  
  // 加载状态
  isLoading: boolean;
  error: string | null;
  
  // 统计数据
  stats: {
    totalTriggers: number;
    successRate: number;
    averageTimeToImprovement: number;
    effectivenessRate: number;
  } | null;
}

export function useRescueMode(): UseRescueModeReturn {
  const [state, setState] = useState<RescueModeState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [stats, setStats] = useState<{
    totalTriggers: number;
    successRate: number;
    averageTimeToImprovement: number;
    effectivenessRate: number;
  } | null>(null);

  // 初始化用户ID
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const session = await userSession.initializeSession();
        setUserId(session.userId || session.deviceId);
      } catch (err) {
        console.error('Failed to initialize user session:', err);
        setError('Failed to initialize user session');
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  // 更新状态
  const updateState = useCallback(() => {
    if (userId) {
      const currentState = rescueModeService.getRescueModeState(userId);
      setState(currentState);
    }
  }, [userId]);

  // 加载统计数据
  const loadStats = useCallback(() => {
    if (userId) {
      const userStats = rescueModeService.getRescueModeStatistics(userId);
      setStats(userStats);
    }
  }, [userId]);

  // 监听状态变化
  useEffect(() => {
    if (userId) {
      updateState();
      loadStats();
      
      // 设置定时器定期更新状态（用于实时同步）
      const interval = setInterval(() => {
        updateState();
        loadStats();
      }, 2000); // 每2秒更新一次
      
      return () => clearInterval(interval);
    }
  }, [userId, updateState, loadStats]);

  // 记录发音失败
  const recordFailure = useCallback(async (
    keywordId: string, 
    sessionId: string, 
    pronunciationScore: number,
    phoneticTips?: string[]
  ): Promise<boolean> => {
    if (!userId) {
      console.warn('User ID not available for rescue mode');
      return false;
    }

    try {
      setError(null);
      const triggered = await rescueModeService.recordPronunciationFailure(
        userId, 
        keywordId, 
        sessionId, 
        pronunciationScore, 
        phoneticTips || []
      );
      
      // 更新本地状态
      updateState();
      loadStats();
      
      return triggered;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record failure';
      setError(errorMessage);
      console.error('Rescue mode failure recording failed:', err);
      return false;
    }
  }, [userId, updateState, loadStats]);

  // 记录发音改善
  const recordImprovement = useCallback(async (
    newScore: number, 
    passedWithRescue: boolean
  ): Promise<void> => {
    if (!userId) {
      console.warn('User ID not available for rescue mode');
      return;
    }

    try {
      setError(null);
      await rescueModeService.recordPronunciationImprovement(userId, newScore, passedWithRescue);
      
      // 更新本地状态
      updateState();
      loadStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record improvement';
      setError(errorMessage);
      console.error('Rescue mode improvement recording failed:', err);
    }
  }, [userId, updateState, loadStats]);

  // 计算救援模式分数
  const calculateRescueScore = useCallback((originalScore: number): number => {
    if (!userId) return originalScore;
    return rescueModeService.calculateRescueScore(userId, originalScore);
  }, [userId]);

  // 退出救援模式
  const exitRescueMode = useCallback(async (): Promise<void> => {
    if (!userId) {
      console.warn('User ID not available for rescue mode');
      return;
    }

    try {
      setError(null);
      await rescueModeService.exitRescueMode(userId);
      
      // 更新本地状态
      updateState();
      loadStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to exit rescue mode';
      setError(errorMessage);
      console.error('Rescue mode exit failed:', err);
    }
  }, [userId, updateState, loadStats]);

  // 获取当前通过阈值
  const currentPassThreshold = userId ? rescueModeService.getCurrentPassThreshold(userId) : 70;
  const shouldUseLoweredThreshold = userId ? rescueModeService.shouldUseLoweredThreshold(userId) : false;

  return {
    // 状态
    isActive: state?.isActive || false,
    state,
    supportiveMessage: state?.supportiveMessage || '',
    phoneticTips: state?.phoneticTips || [],
    rescueVideoUrl: userId ? rescueModeService.getRescueVideoUrl(userId) : null,
    
    // 阈值和评分
    currentPassThreshold,
    shouldUseLoweredThreshold,
    
    // 方法
    recordFailure,
    recordImprovement,
    calculateRescueScore,
    exitRescueMode,
    
    // 加载状态
    isLoading,
    error,
    
    // 统计数据
    stats
  };
}

// 辅助Hook：仅检查Rescue Mode是否激活
export function useRescueModeStatus(): {
  isActive: boolean;
  currentPassThreshold: number;
  shouldUseLoweredThreshold: boolean;
  isLoading: boolean;
} {
  const { 
    isActive, 
    currentPassThreshold, 
    shouldUseLoweredThreshold, 
    isLoading 
  } = useRescueMode();
  
  return { 
    isActive, 
    currentPassThreshold, 
    shouldUseLoweredThreshold, 
    isLoading 
  };
}

// 辅助Hook：Rescue Mode统计数据
export function useRescueModeStats(): {
  stats: {
    totalTriggers: number;
    successRate: number;
    averageTimeToImprovement: number;
    effectivenessRate: number;
  } | null;
  isLoading: boolean;
  error: string | null;
} {
  const { stats, isLoading, error } = useRescueMode();
  return { stats, isLoading, error };
}
