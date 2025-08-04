/**
 * usePronunciation Hook
 * 为React组件提供发音评估功能的便捷接口
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { basicPronunciationService, PronunciationAssessment } from '../lib/services/BasicPronunciationService';
import { userSession } from '../lib/userSession';

export interface UsePronunciationReturn {
  // 录音状态
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioLevel: number;
  recordingQuality: 'excellent' | 'good' | 'fair' | 'poor';
  
  // 评估状态
  isAssessing: boolean;
  assessment: PronunciationAssessment | null;
  
  // 权限和支持
  hasPermission: boolean;
  isSupported: boolean;
  
  // 方法
  startRecording: (keywordId: string, targetText: string) => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => void;
  
  // 加载状态
  isLoading: boolean;
  error: string | null;
  
  // 统计数据
  stats: {
    totalAssessments: number;
    averageScore: number;
    improvement: number;
    recentScores: number[];
  } | null;
}

export function usePronunciation(): UsePronunciationReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingQuality, setRecordingQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessment, setAssessment] = useState<PronunciationAssessment | null>(null);
  
  const [hasPermission, setHasPermission] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  
  const [stats, setStats] = useState<{
    totalAssessments: number;
    averageScore: number;
    improvement: number;
    recentScores: number[];
  } | null>(null);

  // 当前录音的关键词和目标文本
  const currentKeywordRef = useRef<string>('');
  const currentTargetTextRef = useRef<string>('');
  
  // 状态更新定时器
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        
        // 初始化用户会话
        const session = await userSession.initializeSession();
        setUserId(session.userId || session.deviceId);
        
        // 检查浏览器支持
        const audioSupport = basicPronunciationService.checkAudioSupport();
        setIsSupported(audioSupport.mediaRecorder && audioSupport.webAudio && audioSupport.getUserMedia);
        
        if (!audioSupport.mediaRecorder) {
          setError('浏览器不支持录音功能');
          return;
        }
        
        // 检查麦克风权限
        const permission = await basicPronunciationService.checkMicrophonePermission();
        setHasPermission(permission);
        
        if (!permission) {
          setError('需要麦克风权限才能进行发音评估');
          return;
        }
        
        // 加载用户统计数据
        await loadUserStats(session.userId || session.deviceId);
        
      } catch (err) {
        console.error('发音功能初始化失败:', err);
        setError(err instanceof Error ? err.message : '初始化失败');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // 加载用户统计数据
  const loadUserStats = useCallback(async (uid: string) => {
    try {
      const userStats = await basicPronunciationService.getUserPronunciationStats(uid);
      setStats(userStats);
    } catch (err) {
      console.error('加载用户统计失败:', err);
    }
  }, []);

  // 开始录音状态监控
  const startStatusMonitoring = useCallback(() => {
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
    }

    statusIntervalRef.current = setInterval(() => {
      const state = basicPronunciationService.getRecordingState();
      setIsRecording(state.isRecording);
      setIsPaused(state.isPaused);
      setDuration(state.duration);
      setAudioLevel(state.audioLevel);
      setRecordingQuality(state.quality);
      
      // 如果录音停止，清除监控
      if (!state.isRecording) {
        if (statusIntervalRef.current) {
          clearInterval(statusIntervalRef.current);
          statusIntervalRef.current = null;
        }
      }
    }, 100); // 每100ms更新一次状态
  }, []);

  // 停止状态监控
  const stopStatusMonitoring = useCallback(() => {
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
      statusIntervalRef.current = null;
    }
  }, []);

  // 开始录音
  const startRecording = useCallback(async (keywordId: string, targetText: string) => {
    if (!hasPermission) {
      setError('需要麦克风权限才能录音');
      return;
    }

    if (!isSupported) {
      setError('浏览器不支持录音功能');
      return;
    }

    try {
      setError(null);
      setAssessment(null);
      
      // 保存当前录音信息
      currentKeywordRef.current = keywordId;
      currentTargetTextRef.current = targetText;
      
      await basicPronunciationService.startRecording(keywordId, targetText);
      
      // 开始状态监控
      startStatusMonitoring();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '录音启动失败';
      setError(errorMessage);
      console.error('录音启动失败:', err);
    }
  }, [hasPermission, isSupported, startStatusMonitoring]);

  // 停止录音并评估
  const stopRecording = useCallback(async () => {
    if (!isRecording) {
      setError('没有正在进行的录音');
      return;
    }

    try {
      setError(null);
      setIsAssessing(true);
      
      // 停止状态监控
      stopStatusMonitoring();
      
      const result = await basicPronunciationService.stopRecordingAndAssess(
        currentKeywordRef.current,
        currentTargetTextRef.current,
        userId
      );
      
      setAssessment(result);
      
      // 重新加载统计数据
      await loadUserStats(userId);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '发音评估失败';
      setError(errorMessage);
      console.error('发音评估失败:', err);
    } finally {
      setIsAssessing(false);
      setIsRecording(false);
      setDuration(0);
      setAudioLevel(0);
    }
  }, [isRecording, userId, stopStatusMonitoring, loadUserStats]);

  // 取消录音
  const cancelRecording = useCallback(() => {
    try {
      basicPronunciationService.cancelRecording();
      stopStatusMonitoring();
      
      setIsRecording(false);
      setIsPaused(false);
      setDuration(0);
      setAudioLevel(0);
      setError(null);
      
    } catch (err) {
      console.error('取消录音失败:', err);
    }
  }, [stopStatusMonitoring]);

  // 清理资源
  useEffect(() => {
    return () => {
      stopStatusMonitoring();
    };
  }, [stopStatusMonitoring]);

  return {
    // 录音状态
    isRecording,
    isPaused,
    duration,
    audioLevel,
    recordingQuality,
    
    // 评估状态
    isAssessing,
    assessment,
    
    // 权限和支持
    hasPermission,
    isSupported,
    
    // 方法
    startRecording,
    stopRecording,
    cancelRecording,
    
    // 加载状态
    isLoading,
    error,
    
    // 统计数据
    stats
  };
}

// 辅助Hook：仅获取发音统计
export function usePronunciationStats(): {
  stats: {
    totalAssessments: number;
    averageScore: number;
    improvement: number;
    recentScores: number[];
  } | null;
  isLoading: boolean;
  error: string | null;
} {
  const { stats, isLoading, error } = usePronunciation();
  return { stats, isLoading, error };
}

// 辅助Hook：检查发音功能可用性
export function usePronunciationSupport(): {
  isSupported: boolean;
  hasPermission: boolean;
  supportDetails: {
    mediaRecorder: boolean;
    webAudio: boolean;
    getUserMedia: boolean;
    supportedFormats: string[];
  };
} {
  const [supportDetails, setSupportDetails] = useState({
    mediaRecorder: false,
    webAudio: false,
    getUserMedia: false,
    supportedFormats: [] as string[]
  });

  const { isSupported, hasPermission } = usePronunciation();

  useEffect(() => {
    const details = basicPronunciationService.checkAudioSupport();
    setSupportDetails(details);
  }, []);

  return {
    isSupported,
    hasPermission,
    supportDetails
  };
}
