/**
 * useFocusMode Hook
 * 为React组件提供Focus Mode功能的便捷接口
 */

import { useState, useEffect, useCallback } from 'react';
import { focusModeService, FocusModeState } from '../lib/services/FocusModeService';
import { userSession } from '../lib/userSession';

export interface UseFocusModeReturn {
  // 状态
  isActive: boolean;
  state: FocusModeState | null;
  supportiveMessage: string;
  highlightCorrectOption: boolean;
  showGlowEffect: boolean;
  
  // 方法
  recordError: (keywordId: string, sessionId: string, learningPhase: 'context_guessing' | 'pronunciation_training') => Promise<boolean>;
  recordSuccess: () => Promise<void>;
  getFocusModeState: () => FocusModeState | null;
  
  // 加载状态
  isLoading: boolean;
  error: string | null;
}

export function useFocusMode(): UseFocusModeReturn {
  const [state, setState] = useState<FocusModeState | null>(null);
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
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  // 更新状态
  const updateState = useCallback(() => {
    if (userId) {
      const currentState = focusModeService.getFocusModeState(userId);
      setState(currentState);
    }
  }, [userId]);

  // 监听状态变化
  useEffect(() => {
    if (userId) {
      updateState();
      
      // 设置定时器定期更新状态（用于实时同步）
      const interval = setInterval(updateState, 1000);
      
      return () => clearInterval(interval);
    }
  }, [userId, updateState]);

  // 记录错误
  const recordError = useCallback(async (
    keywordId: string, 
    sessionId: string, 
    learningPhase: 'context_guessing' | 'pronunciation_training'
  ): Promise<boolean> => {
    if (!userId) {
      console.warn('User ID not available for focus mode');
      return false;
    }

    try {
      setError(null);
      const triggered = await focusModeService.recordError(userId, keywordId, sessionId, learningPhase);
      
      // 更新本地状态
      updateState();
      
      return triggered;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record error';
      setError(errorMessage);
      console.error('Focus mode error recording failed:', err);
      return false;
    }
  }, [userId, updateState]);

  // 记录成功
  const recordSuccess = useCallback(async (): Promise<void> => {
    if (!userId) {
      console.warn('User ID not available for focus mode');
      return;
    }

    try {
      setError(null);
      await focusModeService.recordSuccess(userId);
      
      // 更新本地状态
      updateState();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record success';
      setError(errorMessage);
      console.error('Focus mode success recording failed:', err);
    }
  }, [userId, updateState]);

  // 获取当前状态
  const getFocusModeState = useCallback((): FocusModeState | null => {
    if (!userId) return null;
    return focusModeService.getFocusModeState(userId);
  }, [userId]);

  return {
    // 状态
    isActive: state?.isActive || false,
    state,
    supportiveMessage: state?.supportiveMessage || '',
    highlightCorrectOption: state?.highlightCorrectOption || false,
    showGlowEffect: state?.showGlowEffect || false,
    
    // 方法
    recordError,
    recordSuccess,
    getFocusModeState,
    
    // 加载状态
    isLoading,
    error
  };
}

// 辅助Hook：仅检查Focus Mode是否激活
export function useFocusModeStatus(): {
  isActive: boolean;
  isLoading: boolean;
} {
  const { isActive, isLoading } = useFocusMode();
  return { isActive, isLoading };
}

// 辅助Hook：Focus Mode视觉效果
export function useFocusModeEffects(): {
  highlightCorrectOption: boolean;
  showGlowEffect: boolean;
  supportiveMessage: string;
  glowStyle: React.CSSProperties;
} {
  const { highlightCorrectOption, showGlowEffect, supportiveMessage } = useFocusMode();

  const glowStyle: React.CSSProperties = showGlowEffect ? {
    boxShadow: '0 0 20px 5px rgba(251, 191, 36, 0.8)',
    animation: 'pulse 1s infinite',
    border: '2px solid #fbbf24',
    borderRadius: '8px'
  } : {};

  return {
    highlightCorrectOption,
    showGlowEffect,
    supportiveMessage,
    glowStyle
  };
}
