/**
 * 学习进度管理 Hook
 * 提供进度跟踪、保存和恢复功能
 */

import { useState, useEffect, useCallback } from 'react';
import { userSession, LearningProgress } from '../lib/userSession';

export interface KeywordProgress {
  id: string;
  word: string;
  translation: string;
  pronunciation: string;
  isUnlocked: boolean;
  attempts: number;
  correctAttempts: number;
  completedAt?: string;
}

export interface StoryProgress {
  storyId: string;
  title: string;
  totalKeywords: number;
  unlockedKeywords: number;
  completionRate: number;
  keywords: KeywordProgress[];
}

export interface LearningStats {
  totalKeywords: number;
  unlockedKeywords: number;
  completedStories: number;
  totalAttempts: number;
  accuracy: number;
  currentStreak: number;
  bestStreak: number;
}

export function useProgress() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<LearningProgress[]>([]);
  const [stats, setStats] = useState<LearningStats>({
    totalKeywords: 0,
    unlockedKeywords: 0,
    completedStories: 0,
    totalAttempts: 0,
    accuracy: 0,
    currentStreak: 0,
    bestStreak: 0
  });

  /**
   * 初始化进度数据
   */
  const initializeProgress = useCallback(async () => {
    setIsLoading(true);
    try {
      // 确保用户会话已初始化
      await userSession.initializeSession();
      
      // 获取用户进度
      const userProgress = await userSession.getProgress();
      setProgress(userProgress);

      // 获取学习统计
      const learningStats = await userSession.getLearningStats();
      setStats(prev => ({
        ...prev,
        ...learningStats
      }));

    } catch (error) {
      console.error('Failed to initialize progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 保存关键词进度
   */
  const saveKeywordProgress = useCallback(async (
    storyId: string,
    keywordId: string,
    isUnlocked: boolean,
    isCorrect?: boolean
  ) => {
    try {
      await userSession.saveProgress(storyId, keywordId, isUnlocked, isCorrect);
      
      // 重新获取进度数据
      const updatedProgress = await userSession.getProgress();
      setProgress(updatedProgress);

      // 更新统计数据
      const updatedStats = await userSession.getLearningStats();
      setStats(prev => ({
        ...prev,
        ...updatedStats
      }));

      // 记录学习事件
      await userSession.trackEvent('keyword_progress', {
        storyId,
        keywordId,
        isUnlocked,
        isCorrect,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Failed to save keyword progress:', error);
    }
  }, []);

  /**
   * 获取特定故事的进度
   */
  const getStoryProgress = useCallback((storyId: string, keywords: any[]): StoryProgress => {
    const storyProgress = progress.filter(p => p.storyId === storyId);
    const progressMap = new Map(storyProgress.map(p => [p.keywordId, p]));

    const keywordProgress: KeywordProgress[] = keywords.map(keyword => {
      const prog = progressMap.get(keyword.id);
      return {
        id: keyword.id,
        word: keyword.word,
        translation: keyword.translation,
        pronunciation: keyword.pronunciation,
        isUnlocked: prog?.isUnlocked || false,
        attempts: prog?.attempts || 0,
        correctAttempts: prog?.correctAttempts || 0,
        completedAt: prog?.completedAt
      };
    });

    const unlockedKeywords = keywordProgress.filter(k => k.isUnlocked).length;
    const completionRate = keywords.length > 0 ? (unlockedKeywords / keywords.length) * 100 : 0;

    return {
      storyId,
      title: '', // 这里可以从故事数据中获取
      totalKeywords: keywords.length,
      unlockedKeywords,
      completionRate: Math.round(completionRate),
      keywords: keywordProgress
    };
  }, [progress]);

  /**
   * 检查关键词是否已解锁
   */
  const isKeywordUnlocked = useCallback((storyId: string, keywordId: string): boolean => {
    return progress.some(p => 
      p.storyId === storyId && 
      p.keywordId === keywordId && 
      p.isUnlocked
    );
  }, [progress]);

  /**
   * 获取关键词尝试次数
   */
  const getKeywordAttempts = useCallback((storyId: string, keywordId: string): number => {
    const keywordProgress = progress.find(p => 
      p.storyId === storyId && p.keywordId === keywordId
    );
    return keywordProgress?.attempts || 0;
  }, [progress]);

  /**
   * 计算学习连击数
   */
  const calculateStreak = useCallback(() => {
    // 按时间排序获取最近的学习记录
    const sortedProgress = [...progress]
      .filter(p => p.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // 计算当前连击（从最近开始连续的正确答案）
    for (const prog of sortedProgress) {
      if (prog.correctAttempts > 0 && prog.correctAttempts === prog.attempts) {
        if (currentStreak === 0) currentStreak++;
        tempStreak++;
      } else {
        if (currentStreak === 0) break;
        tempStreak = 0;
      }
      bestStreak = Math.max(bestStreak, tempStreak);
    }

    setStats(prev => ({
      ...prev,
      currentStreak,
      bestStreak
    }));
  }, [progress]);

  /**
   * 重置特定故事的进度
   */
  const resetStoryProgress = useCallback(async (storyId: string) => {
    try {
      const session = userSession.getCurrentSession();
      if (!session?.userId) return;

      // 这里需要实现重置逻辑，可能需要添加到 userSession 中
      console.log('Reset story progress for:', storyId);
      
      // 重新获取进度
      await initializeProgress();
    } catch (error) {
      console.error('Failed to reset story progress:', error);
    }
  }, [initializeProgress]);

  /**
   * 导出学习数据
   */
  const exportLearningData = useCallback(async () => {
    try {
      const session = userSession.getCurrentSession();
      const exportData = {
        session,
        progress,
        stats,
        exportedAt: new Date().toISOString()
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `smartalk-progress-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // 记录导出事件
      await userSession.trackEvent('data_export', {
        recordCount: progress.length,
        exportedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Failed to export learning data:', error);
    }
  }, [progress, stats]);

  // 初始化时加载进度数据
  useEffect(() => {
    initializeProgress();
  }, [initializeProgress]);

  // 计算连击数
  useEffect(() => {
    if (progress.length > 0) {
      calculateStreak();
    }
  }, [progress, calculateStreak]);

  return {
    // 状态
    isLoading,
    progress,
    stats,
    
    // 方法
    initializeProgress,
    saveKeywordProgress,
    getStoryProgress,
    isKeywordUnlocked,
    getKeywordAttempts,
    resetStoryProgress,
    exportLearningData,
    
    // 工具方法
    refreshProgress: initializeProgress
  };
}

/**
 * 简化版进度 Hook，用于只需要基本进度信息的组件
 */
export function useSimpleProgress(storyId?: string) {
  const [progress, setProgress] = useState<LearningProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      setIsLoading(true);
      try {
        await userSession.initializeSession();
        const userProgress = await userSession.getProgress(storyId);
        setProgress(userProgress);
      } catch (error) {
        console.error('Failed to load simple progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [storyId]);

  const isUnlocked = useCallback((keywordId: string) => {
    return progress.some(p => p.keywordId === keywordId && p.isUnlocked);
  }, [progress]);

  return {
    progress,
    isLoading,
    isUnlocked
  };
}
