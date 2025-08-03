/**
 * usePronunciationAssessment - V2 发音评估Hook
 * 提供组件级别的发音评估功能
 * 自动处理录音、评估、结果分析和改进建议
 */

import { useEffect, useCallback, useState, useRef } from 'react';
import PronunciationAssessmentService, { 
  PronunciationAssessment, 
  PronunciationStats 
} from '@/services/PronunciationAssessmentService';
import { useUserState } from '@/contexts/UserStateContext';
import { useAccessibility } from './useAccessibility';
import { usePerformanceOptimization } from './usePerformanceOptimization';

interface PronunciationState {
  // 录音状态
  isRecording: boolean;
  recordingDuration: number;
  recordingQuality: 'excellent' | 'good' | 'fair' | 'poor' | null;
  
  // 评估状态
  isAssessing: boolean;
  assessmentProgress: number;
  
  // 结果状态
  currentAssessment: PronunciationAssessment | null;
  assessmentHistory: PronunciationAssessment[];
  
  // 统计数据
  userStats: PronunciationStats | null;
  
  // 错误状态
  error: string | null;
  loading: boolean;
}

interface RecordingOptions {
  maxDuration?: number; // 最大录音时长（毫秒）
  autoStop?: boolean; // 自动停止录音
  silenceThreshold?: number; // 静音阈值
}

interface AssessmentOptions {
  includePhonemeAnalysis?: boolean;
  includeWordAnalysis?: boolean;
  includeSyllableAnalysis?: boolean;
  generateRecommendations?: boolean;
}

/**
 * 发音评估Hook
 */
export const usePronunciationAssessment = () => {
  const { userProgress } = useUserState();
  const accessibility = useAccessibility();
  const performanceHook = usePerformanceOptimization({
    componentName: 'PronunciationAssessment',
    trackInteractions: true,
    enablePreload: true,
  });

  const [state, setState] = useState<PronunciationState>({
    isRecording: false,
    recordingDuration: 0,
    recordingQuality: null,
    isAssessing: false,
    assessmentProgress: 0,
    currentAssessment: null,
    assessmentHistory: [],
    userStats: null,
    error: null,
    loading: false,
  });

  const pronunciationService = PronunciationAssessmentService.getInstance();
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const assessmentTimer = useRef<NodeJS.Timeout | null>(null);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      if (assessmentTimer.current) {
        clearInterval(assessmentTimer.current);
      }
    };
  }, []);

  // 加载用户统计数据
  useEffect(() => {
    if (userProgress?.userId) {
      loadUserStats();
    }
  }, [userProgress?.userId]);

  const loadUserStats = useCallback(async () => {
    if (!userProgress?.userId) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const stats = await pronunciationService.getUserPronunciationStats(userProgress.userId);
      
      setState(prev => ({
        ...prev,
        userStats: stats,
        loading: false,
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || '加载统计数据失败',
      }));
    }
  }, [userProgress?.userId]);

  // 开始录音
  const startRecording = useCallback(async (
    keywordId: string,
    targetText: string,
    options: RecordingOptions = {}
  ) => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      await pronunciationService.startRecording(keywordId, targetText, options);
      
      setState(prev => ({
        ...prev,
        isRecording: true,
        recordingDuration: 0,
        recordingQuality: null,
      }));
      
      // 开始计时
      recordingTimer.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          recordingDuration: prev.recordingDuration + 100,
        }));
      }, 100);
      
      // 无障碍反馈
      accessibility.announceForScreenReader('录音开始', 'assertive');
      
      // 性能记录
      performanceHook.performance.recordInteraction('start_recording');
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || '录音启动失败',
      }));
      accessibility.announceForScreenReader('录音启动失败', 'assertive');
      throw error;
    }
  }, [accessibility, performanceHook]);

  // 停止录音
  const stopRecording = useCallback(async () => {
    try {
      // 停止计时
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
      
      const audioUrl = await pronunciationService.stopRecording();
      
      setState(prev => ({
        ...prev,
        isRecording: false,
        recordingQuality: 'good', // 简化处理
      }));
      
      accessibility.announceForScreenReader('录音完成', 'assertive');
      
      return audioUrl;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        isRecording: false,
        error: error.message || '录音停止失败',
      }));
      accessibility.announceForScreenReader('录音停止失败', 'assertive');
      throw error;
    }
  }, [accessibility]);

  // 取消录音
  const cancelRecording = useCallback(async () => {
    try {
      // 停止计时
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
      
      await pronunciationService.cancelRecording();
      
      setState(prev => ({
        ...prev,
        isRecording: false,
        recordingDuration: 0,
        recordingQuality: null,
      }));
      
      accessibility.announceForScreenReader('录音已取消', 'polite');
      
    } catch (error) {
      console.error('Error canceling recording:', error);
    }
  }, [accessibility]);

  // 评估发音
  const assessPronunciation = useCallback(async (
    keywordId: string,
    audioUrl: string,
    targetText: string,
    options: AssessmentOptions = {}
  ): Promise<PronunciationAssessment | null> => {
    if (!userProgress?.userId) {
      throw new Error('用户未登录');
    }

    try {
      setState(prev => ({
        ...prev,
        isAssessing: true,
        assessmentProgress: 0,
        error: null,
      }));
      
      // 模拟评估进度
      assessmentTimer.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          assessmentProgress: Math.min(prev.assessmentProgress + 10, 90),
        }));
      }, 200);
      
      const assessment = await pronunciationService.assessPronunciation(
        keywordId,
        audioUrl,
        targetText,
        userProgress.userId
      );
      
      // 清除进度定时器
      if (assessmentTimer.current) {
        clearInterval(assessmentTimer.current);
        assessmentTimer.current = null;
      }
      
      setState(prev => ({
        ...prev,
        isAssessing: false,
        assessmentProgress: 100,
        currentAssessment: assessment,
        assessmentHistory: [assessment, ...prev.assessmentHistory.slice(0, 9)], // 保留最近10次
      }));
      
      // 无障碍反馈
      accessibility.announceForScreenReader(
        `发音评估完成，总分${assessment.overallScore}分`,
        'assertive'
      );
      
      // 性能记录
      performanceHook.performance.recordInteraction('pronunciation_assessment');
      
      // 更新统计数据
      await loadUserStats();
      
      return assessment;
      
    } catch (error) {
      // 清除进度定时器
      if (assessmentTimer.current) {
        clearInterval(assessmentTimer.current);
        assessmentTimer.current = null;
      }
      
      setState(prev => ({
        ...prev,
        isAssessing: false,
        assessmentProgress: 0,
        error: error.message || '发音评估失败',
      }));
      
      accessibility.announceForScreenReader('发音评估失败', 'assertive');
      throw error;
    }
  }, [userProgress?.userId, accessibility, performanceHook, loadUserStats]);

  // 完整的录音和评估流程
  const recordAndAssess = useCallback(async (
    keywordId: string,
    targetText: string,
    recordingOptions: RecordingOptions = {},
    assessmentOptions: AssessmentOptions = {}
  ): Promise<PronunciationAssessment | null> => {
    try {
      // 开始录音
      await startRecording(keywordId, targetText, recordingOptions);
      
      // 等待用户停止录音（这里需要外部控制）
      // 实际使用中，用户会调用 stopRecording
      
      return null; // 返回null，等待用户手动停止录音
      
    } catch (error) {
      console.error('Error in record and assess flow:', error);
      throw error;
    }
  }, [startRecording]);

  // 获取推荐练习
  const getRecommendedExercises = useCallback(async () => {
    if (!userProgress?.userId) return [];

    try {
      return await pronunciationService.getRecommendedExercises(userProgress.userId);
    } catch (error) {
      console.error('Error getting recommended exercises:', error);
      return [];
    }
  }, [userProgress?.userId]);

  // 重置状态
  const resetState = useCallback(() => {
    // 清理定时器
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
      recordingTimer.current = null;
    }
    if (assessmentTimer.current) {
      clearInterval(assessmentTimer.current);
      assessmentTimer.current = null;
    }
    
    setState({
      isRecording: false,
      recordingDuration: 0,
      recordingQuality: null,
      isAssessing: false,
      assessmentProgress: 0,
      currentAssessment: null,
      assessmentHistory: [],
      userStats: null,
      error: null,
      loading: false,
    });
  }, []);

  return {
    // 状态
    ...state,
    
    // 录音功能
    startRecording,
    stopRecording,
    cancelRecording,
    
    // 评估功能
    assessPronunciation,
    recordAndAssess,
    
    // 辅助功能
    getRecommendedExercises,
    loadUserStats,
    resetState,
    
    // 便捷方法
    canStartRecording: !state.isRecording && !state.isAssessing,
    canStopRecording: state.isRecording,
    hasAssessment: !!state.currentAssessment,
    
    // 统计信息
    totalAssessments: state.userStats?.totalAssessments || 0,
    averageScore: state.userStats?.averageScore || 0,
    improvement: state.userStats?.improvement || 0,
  };
};

/**
 * 发音统计Hook
 */
export const usePronunciationStats = () => {
  const { userProgress } = useUserState();
  const [stats, setStats] = useState<PronunciationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pronunciationService = PronunciationAssessmentService.getInstance();

  const loadStats = useCallback(async () => {
    if (!userProgress?.userId) return;

    try {
      setLoading(true);
      setError(null);
      
      const userStats = await pronunciationService.getUserPronunciationStats(userProgress.userId);
      setStats(userStats);
      
    } catch (err) {
      setError(err.message || '加载统计数据失败');
    } finally {
      setLoading(false);
    }
  }, [userProgress?.userId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    reload: loadStats,
  };
};

/**
 * 录音状态Hook
 */
export const useRecordingState = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [quality, setQuality] = useState<'excellent' | 'good' | 'fair' | 'poor' | null>(null);
  
  const pronunciationService = PronunciationAssessmentService.getInstance();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    setDuration(0);
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 100);
    }, 100);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const updateFromService = useCallback(() => {
    const status = pronunciationService.getRecordingStatus();
    setIsRecording(status.isRecording);
    if (!status.isRecording) {
      stopTimer();
    }
  }, [stopTimer]);

  useEffect(() => {
    const interval = setInterval(updateFromService, 500);
    return () => {
      clearInterval(interval);
      stopTimer();
    };
  }, [updateFromService, stopTimer]);

  return {
    isRecording,
    duration,
    quality,
    startTimer,
    stopTimer,
  };
};

export default usePronunciationAssessment;
