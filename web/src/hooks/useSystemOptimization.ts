/**
 * useSystemOptimization - 系统优化Hook
 * 提供性能监控、用户体验优化和系统健康状态的React集成
 */

'use client'

import { useState, useEffect, useCallback } from 'react';
import { 
  performanceOptimizer, 
  PerformanceMetrics, 
  PerformanceReport, 
  OptimizationSuggestion 
} from '../lib/performance/PerformanceOptimizer';
import { 
  userExperienceOptimizer, 
  UXMetrics, 
  UXReport, 
  UXOptimizationSuggestion,
  UserInteraction 
} from '../lib/ux/UserExperienceOptimizer';

export interface SystemHealth {
  overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  performance: number; // 0-100
  userExperience: number; // 0-100
  stability: number; // 0-100
  lastUpdated: string;
}

export interface OptimizationAlert {
  id: string;
  type: 'performance' | 'ux' | 'system';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionRequired: boolean;
  autoFixAvailable: boolean;
  createdAt: string;
}

export interface UseSystemOptimizationReturn {
  // 系统健康状态
  systemHealth: SystemHealth | null;
  isHealthLoading: boolean;
  
  // 性能监控
  performanceMetrics: PerformanceMetrics | null;
  performanceReport: PerformanceReport | null;
  performanceSuggestions: OptimizationSuggestion[];
  isPerformanceMonitoring: boolean;
  
  // 用户体验监控
  uxMetrics: UXMetrics | null;
  uxReport: UXReport | null;
  uxSuggestions: UXOptimizationSuggestion[];
  isUXTracking: boolean;
  
  // 优化警报
  optimizationAlerts: OptimizationAlert[];
  
  // 操作方法
  startMonitoring: () => void;
  stopMonitoring: () => void;
  generatePerformanceReport: () => Promise<void>;
  generateUXReport: () => Promise<void>;
  recordUserInteraction: (interaction: Partial<UserInteraction>) => void;
  recordVideoLoadTime: (loadTime: number) => void;
  recordPronunciationApiTime: (responseTime: number) => void;
  dismissAlert: (alertId: string) => void;
  applyAutoFix: (suggestionId: string) => Promise<boolean>;
  
  // 统计信息
  optimizationStats: {
    totalSuggestions: number;
    criticalIssues: number;
    performanceScore: number;
    uxScore: number;
    monitoringUptime: number; // 小时
  } | null;
}

export function useSystemOptimization(): UseSystemOptimizationReturn {
  // 状态管理
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isHealthLoading, setIsHealthLoading] = useState(false);
  
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [performanceReport, setPerformanceReport] = useState<PerformanceReport | null>(null);
  const [performanceSuggestions, setPerformanceSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [isPerformanceMonitoring, setIsPerformanceMonitoring] = useState(false);
  
  const [uxMetrics, setUXMetrics] = useState<UXMetrics | null>(null);
  const [uxReport, setUXReport] = useState<UXReport | null>(null);
  const [uxSuggestions, setUXSuggestions] = useState<UXOptimizationSuggestion[]>([]);
  const [isUXTracking, setIsUXTracking] = useState(false);
  
  const [optimizationAlerts, setOptimizationAlerts] = useState<OptimizationAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [monitoringStartTime, setMonitoringStartTime] = useState<Date | null>(null);

  // 开始监控
  const startMonitoring = useCallback(() => {
    performanceOptimizer.startMonitoring();
    userExperienceOptimizer.startTracking();
    setIsPerformanceMonitoring(true);
    setIsUXTracking(true);
    setMonitoringStartTime(new Date());
  }, []);

  // 停止监控
  const stopMonitoring = useCallback(() => {
    performanceOptimizer.stopMonitoring();
    userExperienceOptimizer.stopTracking();
    setIsPerformanceMonitoring(false);
    setIsUXTracking(false);
    setMonitoringStartTime(null);
  }, []);

  // 生成性能报告
  const generatePerformanceReport = useCallback(async () => {
    try {
      const report = performanceOptimizer.generatePerformanceReport();
      setPerformanceReport(report);
      setPerformanceMetrics(report.metrics);
      setPerformanceSuggestions(report.suggestions);
      
      // 生成性能相关的警报
      const performanceAlerts = report.suggestions
        .filter(s => s.priority === 'critical' || s.priority === 'high')
        .map(suggestion => ({
          id: `perf_${suggestion.id}`,
          type: 'performance' as const,
          severity: suggestion.priority,
          title: suggestion.title,
          description: suggestion.description,
          actionRequired: suggestion.priority === 'critical',
          autoFixAvailable: suggestion.autoFixAvailable,
          createdAt: new Date().toISOString()
        }));
      
      setOptimizationAlerts(prev => {
        const existingIds = new Set(prev.map(a => a.id));
        const newAlerts = performanceAlerts.filter(a => !existingIds.has(a.id));
        return [...prev, ...newAlerts];
      });
      
    } catch (error) {
      console.error('Failed to generate performance report:', error);
    }
  }, []);

  // 生成UX报告
  const generateUXReport = useCallback(async () => {
    try {
      const report = userExperienceOptimizer.generateUXReport();
      setUXReport(report);
      setUXMetrics(report.metrics);
      setUXSuggestions(report.suggestions);
      
      // 生成UX相关的警报
      const uxAlerts = report.suggestions
        .filter(s => s.priority === 'critical' || s.priority === 'high')
        .map(suggestion => ({
          id: `ux_${suggestion.id}`,
          type: 'ux' as const,
          severity: suggestion.priority,
          title: suggestion.title,
          description: suggestion.description,
          actionRequired: suggestion.priority === 'critical',
          autoFixAvailable: false, // UX建议通常需要人工处理
          createdAt: new Date().toISOString()
        }));
      
      // 基于UX问题生成系统警报
      const systemAlerts = report.issues
        .filter(issue => issue.severity === 'critical' || issue.severity === 'high')
        .map(issue => ({
          id: `sys_${issue.id}`,
          type: 'system' as const,
          severity: issue.severity,
          title: issue.title,
          description: issue.description,
          actionRequired: issue.severity === 'critical',
          autoFixAvailable: false,
          createdAt: new Date().toISOString()
        }));
      
      setOptimizationAlerts(prev => {
        const existingIds = new Set(prev.map(a => a.id));
        const newAlerts = [...uxAlerts, ...systemAlerts].filter(a => !existingIds.has(a.id));
        return [...prev, ...newAlerts];
      });
      
    } catch (error) {
      console.error('Failed to generate UX report:', error);
    }
  }, []);

  // 更新系统健康状态
  const updateSystemHealth = useCallback(() => {
    if (!performanceReport && !uxReport) return;
    
    setIsHealthLoading(true);
    
    try {
      const performanceScore = performanceReport?.overallScore || 75;
      const uxScore = uxReport?.overallUXScore || 75;
      const stabilityScore = performanceReport ? 
        performanceReport.categoryScores.stability : 80;
      
      const overallScore = (performanceScore + uxScore + stabilityScore) / 3;
      
      let overall: SystemHealth['overall'];
      if (overallScore >= 90) overall = 'excellent';
      else if (overallScore >= 80) overall = 'good';
      else if (overallScore >= 70) overall = 'fair';
      else if (overallScore >= 60) overall = 'poor';
      else overall = 'critical';
      
      setSystemHealth({
        overall,
        performance: performanceScore,
        userExperience: uxScore,
        stability: stabilityScore,
        lastUpdated: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Failed to update system health:', error);
    } finally {
      setIsHealthLoading(false);
    }
  }, [performanceReport, uxReport]);

  // 记录用户交互
  const recordUserInteraction = useCallback((interaction: Partial<UserInteraction>) => {
    userExperienceOptimizer.recordInteraction(interaction);
  }, []);

  // 记录视频加载时间
  const recordVideoLoadTime = useCallback((loadTime: number) => {
    performanceOptimizer.recordVideoLoadTime(loadTime);
  }, []);

  // 记录发音API响应时间
  const recordPronunciationApiTime = useCallback((responseTime: number) => {
    performanceOptimizer.recordPronunciationApiTime(responseTime);
  }, []);

  // 忽略警报
  const dismissAlert = useCallback((alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  }, []);

  // 应用自动修复
  const applyAutoFix = useCallback(async (suggestionId: string): Promise<boolean> => {
    try {
      // 根据建议ID应用相应的自动修复
      if (suggestionId === 'optimize_video_loading') {
        // 启用视频预加载
        localStorage.setItem('videoPreloadEnabled', 'true');
        return true;
      } else if (suggestionId === 'optimize_memory_usage') {
        // 清理缓存
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to apply auto fix:', error);
      return false;
    }
  }, []);

  // 初始化监控
  useEffect(() => {
    startMonitoring();
    
    return () => {
      stopMonitoring();
    };
  }, [startMonitoring, stopMonitoring]);

  // 定期生成报告
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPerformanceMonitoring || isUXTracking) {
        generatePerformanceReport();
        generateUXReport();
      }
    }, 5 * 60 * 1000); // 每5分钟生成一次报告
    
    return () => clearInterval(interval);
  }, [isPerformanceMonitoring, isUXTracking, generatePerformanceReport, generateUXReport]);

  // 更新系统健康状态
  useEffect(() => {
    updateSystemHealth();
  }, [updateSystemHealth]);

  // 定期更新当前指标
  useEffect(() => {
    if (!isPerformanceMonitoring && !isUXTracking) return;
    
    const interval = setInterval(() => {
      // 更新当前性能指标
      if (isPerformanceMonitoring) {
        const currentMetrics = performanceOptimizer.getCurrentMetrics();
        setPerformanceMetrics(currentMetrics);
      }
      
      // 更新当前UX指标（如果有的话）
      if (isUXTracking) {
        const uxHistory = userExperienceOptimizer.getUXMetricsHistory();
        if (uxHistory.length > 0) {
          setUXMetrics(uxHistory[uxHistory.length - 1]);
        }
      }
    }, 30000); // 每30秒更新一次
    
    return () => clearInterval(interval);
  }, [isPerformanceMonitoring, isUXTracking]);

  // 计算统计信息
  const optimizationStats = {
    totalSuggestions: performanceSuggestions.length + uxSuggestions.length,
    criticalIssues: optimizationAlerts.filter(a => a.severity === 'critical').length,
    performanceScore: performanceReport?.overallScore || 0,
    uxScore: uxReport?.overallUXScore || 0,
    monitoringUptime: monitoringStartTime ? 
      Math.floor((Date.now() - monitoringStartTime.getTime()) / (1000 * 60 * 60)) : 0
  };

  // 过滤已忽略的警报
  const filteredAlerts = optimizationAlerts.filter(alert => !dismissedAlerts.has(alert.id));

  return {
    // 系统健康状态
    systemHealth,
    isHealthLoading,
    
    // 性能监控
    performanceMetrics,
    performanceReport,
    performanceSuggestions,
    isPerformanceMonitoring,
    
    // 用户体验监控
    uxMetrics,
    uxReport,
    uxSuggestions,
    isUXTracking,
    
    // 优化警报
    optimizationAlerts: filteredAlerts,
    
    // 操作方法
    startMonitoring,
    stopMonitoring,
    generatePerformanceReport,
    generateUXReport,
    recordUserInteraction,
    recordVideoLoadTime,
    recordPronunciationApiTime,
    dismissAlert,
    applyAutoFix,
    
    // 统计信息
    optimizationStats
  };
}

// 扩展Hook：用于性能监控
export function usePerformanceMonitoring() {
  const { 
    performanceMetrics, 
    performanceReport, 
    performanceSuggestions,
    isPerformanceMonitoring,
    generatePerformanceReport,
    recordVideoLoadTime,
    recordPronunciationApiTime
  } = useSystemOptimization();
  
  return {
    performanceMetrics,
    performanceReport,
    performanceSuggestions,
    isPerformanceMonitoring,
    generatePerformanceReport,
    recordVideoLoadTime,
    recordPronunciationApiTime
  };
}

// 扩展Hook：用于用户体验监控
export function useUXMonitoring() {
  const {
    uxMetrics,
    uxReport,
    uxSuggestions,
    isUXTracking,
    generateUXReport,
    recordUserInteraction
  } = useSystemOptimization();
  
  return {
    uxMetrics,
    uxReport,
    uxSuggestions,
    isUXTracking,
    generateUXReport,
    recordUserInteraction
  };
}

// 扩展Hook：用于系统健康监控
export function useSystemHealth() {
  const {
    systemHealth,
    isHealthLoading,
    optimizationAlerts,
    optimizationStats
  } = useSystemOptimization();
  
  return {
    systemHealth,
    isHealthLoading,
    optimizationAlerts,
    optimizationStats
  };
}
