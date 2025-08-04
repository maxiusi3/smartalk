/**
 * useLearningPathOptimizer - AI学习路径优化Hook
 * 提供学习路径优化、个性化推荐和学习洞察的React集成
 */

'use client'

import { useState, useEffect, useCallback } from 'react';
import { 
  learningPathOptimizer, 
  LearningProfile, 
  OptimizedLearningPath, 
  LearningRecommendation,
  LearningInsight 
} from '../lib/ai/LearningPathOptimizer';

export interface UseLearningPathOptimizerReturn {
  // 学习档案
  learningProfile: LearningProfile | null;
  isProfileLoading: boolean;
  profileError: string | null;
  
  // 优化路径
  optimizedPath: OptimizedLearningPath | null;
  isPathLoading: boolean;
  pathError: string | null;
  
  // 推荐和洞察
  recommendations: LearningRecommendation[];
  insights: LearningInsight[];
  
  // 操作方法
  refreshProfile: () => Promise<void>;
  refreshPath: () => Promise<void>;
  clearCache: () => void;
  
  // 推荐操作
  markRecommendationAsRead: (recommendationId: string) => void;
  markRecommendationAsCompleted: (recommendationId: string) => void;
  dismissRecommendation: (recommendationId: string) => void;
  
  // 统计信息
  profileStats: {
    overallScore: number;
    strongestArea: string;
    weakestArea: string;
    learningPhase: string;
  } | null;
}

export function useLearningPathOptimizer(userId: string = 'default_user'): UseLearningPathOptimizerReturn {
  // 状态管理
  const [learningProfile, setLearningProfile] = useState<LearningProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  
  const [optimizedPath, setOptimizedPath] = useState<OptimizedLearningPath | null>(null);
  const [isPathLoading, setIsPathLoading] = useState(false);
  const [pathError, setPathError] = useState<string | null>(null);
  
  const [readRecommendations, setReadRecommendations] = useState<Set<string>>(new Set());
  const [completedRecommendations, setCompletedRecommendations] = useState<Set<string>>(new Set());
  const [dismissedRecommendations, setDismissedRecommendations] = useState<Set<string>>(new Set());

  // 加载学习档案
  const refreshProfile = useCallback(async () => {
    if (!userId) return;
    
    setIsProfileLoading(true);
    setProfileError(null);
    
    try {
      // 先尝试获取缓存的档案
      let profile = learningPathOptimizer.getLearningProfile(userId);
      
      // 如果没有缓存或缓存过期，重新分析
      if (!profile || new Date(profile.lastUpdated) < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
        profile = await learningPathOptimizer.analyzeLearningProfile(userId);
      }
      
      setLearningProfile(profile);
    } catch (error) {
      console.error('Failed to load learning profile:', error);
      setProfileError(error instanceof Error ? error.message : '加载学习档案失败');
    } finally {
      setIsProfileLoading(false);
    }
  }, [userId]);

  // 加载优化路径
  const refreshPath = useCallback(async () => {
    if (!userId) return;
    
    setIsPathLoading(true);
    setPathError(null);
    
    try {
      // 先尝试获取缓存的路径
      let path = learningPathOptimizer.getCachedPath(userId);
      
      // 如果没有缓存，生成新路径
      if (!path) {
        path = await learningPathOptimizer.generateOptimizedPath(userId);
      }
      
      setOptimizedPath(path);
    } catch (error) {
      console.error('Failed to load optimized path:', error);
      setPathError(error instanceof Error ? error.message : '加载学习路径失败');
    } finally {
      setIsPathLoading(false);
    }
  }, [userId]);

  // 清除缓存
  const clearCache = useCallback(() => {
    learningPathOptimizer.clearUserCache(userId);
    setLearningProfile(null);
    setOptimizedPath(null);
    setReadRecommendations(new Set());
    setCompletedRecommendations(new Set());
    setDismissedRecommendations(new Set());
  }, [userId]);

  // 推荐操作
  const markRecommendationAsRead = useCallback((recommendationId: string) => {
    setReadRecommendations(prev => new Set([...prev, recommendationId]));
  }, []);

  const markRecommendationAsCompleted = useCallback((recommendationId: string) => {
    setCompletedRecommendations(prev => new Set([...prev, recommendationId]));
    setReadRecommendations(prev => new Set([...prev, recommendationId]));
  }, []);

  const dismissRecommendation = useCallback((recommendationId: string) => {
    setDismissedRecommendations(prev => new Set([...prev, recommendationId]));
  }, []);

  // 初始化加载
  useEffect(() => {
    if (userId) {
      refreshProfile();
      refreshPath();
    }
  }, [userId, refreshProfile, refreshPath]);

  // 计算档案统计
  const profileStats = learningProfile ? {
    overallScore: Math.round(
      (learningProfile.focusStrength + 
       learningProfile.memoryRetention + 
       learningProfile.pronunciationSkill + 
       learningProfile.consistencyScore + 
       learningProfile.motivationLevel) / 5
    ),
    strongestArea: getStrongestArea(learningProfile),
    weakestArea: getWeakestArea(learningProfile),
    learningPhase: optimizedPath?.currentPhase || 'unknown'
  } : null;

  // 过滤推荐（排除已读、已完成、已忽略的）
  const recommendations = optimizedPath?.recommendations.filter(
    rec => !dismissedRecommendations.has(rec.id)
  ) || [];

  const insights = optimizedPath?.insights || [];

  return {
    // 学习档案
    learningProfile,
    isProfileLoading,
    profileError,
    
    // 优化路径
    optimizedPath,
    isPathLoading,
    pathError,
    
    // 推荐和洞察
    recommendations,
    insights,
    
    // 操作方法
    refreshProfile,
    refreshPath,
    clearCache,
    
    // 推荐操作
    markRecommendationAsRead,
    markRecommendationAsCompleted,
    dismissRecommendation,
    
    // 统计信息
    profileStats
  };
}

// 辅助函数：获取最强领域
function getStrongestArea(profile: LearningProfile): string {
  const areas = {
    focusStrength: profile.focusStrength,
    memoryRetention: profile.memoryRetention,
    pronunciationSkill: profile.pronunciationSkill,
    consistencyScore: profile.consistencyScore,
    motivationLevel: profile.motivationLevel
  };

  const strongest = Object.entries(areas).reduce((a, b) => 
    areas[a[0] as keyof typeof areas] > areas[b[0] as keyof typeof areas] ? a : b
  );

  const areaNames = {
    focusStrength: '专注力',
    memoryRetention: '记忆力',
    pronunciationSkill: '发音技能',
    consistencyScore: '学习一致性',
    motivationLevel: '学习动机'
  };

  return areaNames[strongest[0] as keyof typeof areaNames];
}

// 辅助函数：获取最弱领域
function getWeakestArea(profile: LearningProfile): string {
  const areas = {
    focusStrength: profile.focusStrength,
    memoryRetention: profile.memoryRetention,
    pronunciationSkill: profile.pronunciationSkill,
    consistencyScore: profile.consistencyScore,
    motivationLevel: profile.motivationLevel
  };

  const weakest = Object.entries(areas).reduce((a, b) => 
    areas[a[0] as keyof typeof areas] < areas[b[0] as keyof typeof areas] ? a : b
  );

  const areaNames = {
    focusStrength: '专注力',
    memoryRetention: '记忆力',
    pronunciationSkill: '发音技能',
    consistencyScore: '学习一致性',
    motivationLevel: '学习动机'
  };

  return areaNames[weakest[0] as keyof typeof areaNames];
}

// 扩展Hook：用于特定推荐类型
export function useRecommendationsByType(type: LearningRecommendation['type']) {
  const { recommendations } = useLearningPathOptimizer();
  
  return recommendations.filter(rec => rec.type === type);
}

// 扩展Hook：用于高优先级推荐
export function useHighPriorityRecommendations() {
  const { recommendations } = useLearningPathOptimizer();
  
  return recommendations.filter(rec => rec.priority === 'high');
}

// 扩展Hook：用于特定功能相关的推荐
export function useFeatureRecommendations(feature: 'focus_mode' | 'pronunciation' | 'rescue_mode' | 'srs') {
  const { recommendations } = useLearningPathOptimizer();
  
  return recommendations.filter(rec => rec.relatedFeatures.includes(feature));
}
