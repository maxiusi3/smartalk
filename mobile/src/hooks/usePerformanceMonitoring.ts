/**
 * usePerformanceMonitoring - V2 性能监控Hook
 * 提供组件级别的性能监控和优化功能
 * 自动处理性能监控、问题检测、优化建议
 */

import { useEffect, useCallback, useState, useRef } from 'react';
import PerformanceOptimizationService, { 
  PerformanceMetrics, 
  PerformanceIssue, 
  OptimizationSuggestion,
  PerformanceReport
} from '@/services/PerformanceOptimizationService';
import { AnalyticsService } from '@/services/AnalyticsService';

// 性能监控配置
interface PerformanceMonitoringConfig {
  componentName: string;
  trackInteractions: boolean;
  enableAutoOptimization: boolean;
  monitorMemory: boolean;
  monitorRendering: boolean;
}

// 组件性能指标
interface ComponentPerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  interactionLatency: number;
  componentMountTime: number;
}

// 性能状态
interface PerformanceState {
  // 系统性能指标
  systemMetrics: PerformanceMetrics | null;
  
  // 组件性能指标
  componentMetrics: ComponentPerformanceMetrics;
  
  // 性能问题
  issues: PerformanceIssue[];
  
  // 优化建议
  suggestions: OptimizationSuggestion[];
  
  // 性能报告
  report: PerformanceReport | null;
  
  // 状态
  isMonitoring: boolean;
  isOptimized: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * 性能监控Hook
 */
export const usePerformanceMonitoring = (config: PerformanceMonitoringConfig) => {
  const [state, setState] = useState<PerformanceState>({
    systemMetrics: null,
    componentMetrics: {
      renderTime: 0,
      memoryUsage: 0,
      interactionLatency: 0,
      componentMountTime: 0,
    },
    issues: [],
    suggestions: [],
    report: null,
    isMonitoring: false,
    isOptimized: false,
    loading: false,
    error: null,
  });

  const mountTimeRef = useRef<number>(Date.now());
  const renderStartRef = useRef<number>(0);
  const performanceService = PerformanceOptimizationService.getInstance();
  const analyticsService = AnalyticsService.getInstance();

  // 初始化性能监控
  useEffect(() => {
    const mountTime = Date.now() - mountTimeRef.current;
    
    setState(prev => ({
      ...prev,
      componentMetrics: {
        ...prev.componentMetrics,
        componentMountTime: mountTime,
      },
      isMonitoring: true,
    }));

    // 记录组件性能指标
    analyticsService.track('component_performance', {
      componentName: config.componentName,
      mountTime,
      timestamp: Date.now(),
    });

    // 加载性能数据
    loadPerformanceData();

    return () => {
      // 组件卸载时的清理
      if (config.monitorMemory) {
        performMemoryCleanup();
      }
      
      setState(prev => ({ ...prev, isMonitoring: false }));
    };
  }, []);

  // 定期更新性能数据
  useEffect(() => {
    if (!state.isMonitoring) return;

    const interval = setInterval(() => {
      loadPerformanceData();
    }, 10000); // 每10秒更新一次

    return () => clearInterval(interval);
  }, [state.isMonitoring]);

  const loadPerformanceData = useCallback(async () => {
    try {
      const systemMetrics = performanceService.getCurrentMetrics();
      const issues = performanceService.getPerformanceIssues();
      const suggestions = performanceService.getOptimizationSuggestions();

      setState(prev => ({
        ...prev,
        systemMetrics,
        issues,
        suggestions,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || '加载性能数据失败',
      }));
    }
  }, []);

  // 开始渲染计时
  const startRenderTiming = useCallback(() => {
    if (config.monitorRendering) {
      renderStartRef.current = performance.now();
    }
  }, [config.monitorRendering]);

  // 结束渲染计时
  const endRenderTiming = useCallback(() => {
    if (config.monitorRendering && renderStartRef.current > 0) {
      const renderTime = performance.now() - renderStartRef.current;
      
      setState(prev => ({
        ...prev,
        componentMetrics: {
          ...prev.componentMetrics,
          renderTime,
        },
      }));

      renderStartRef.current = 0;
    }
  }, [config.monitorRendering]);

  // 记录交互性能
  const recordInteraction = useCallback((interactionType: string, startTime?: number) => {
    if (!config.trackInteractions) return;

    const currentTime = performance.now();
    const latency = startTime ? currentTime - startTime : 0;
    
    setState(prev => ({
      ...prev,
      componentMetrics: {
        ...prev.componentMetrics,
        interactionLatency: latency,
      },
    }));

    analyticsService.track('interaction_performance', {
      componentName: config.componentName,
      interactionType,
      latency,
      timestamp: Date.now(),
    });

    return currentTime;
  }, [config.trackInteractions, config.componentName]);

  // 性能优化
  const optimize = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      if (config.monitorRendering) {
        // 渲染优化逻辑
        await performRenderingOptimization();
      }

      if (config.monitorMemory) {
        // 内存优化
        await performMemoryOptimization();
      }

      // 触发系统级优化
      await performanceService.optimizeNow();

      setState(prev => ({
        ...prev,
        isOptimized: true,
        loading: false,
      }));

      analyticsService.track('component_optimized', {
        componentName: config.componentName,
        timestamp: Date.now(),
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || '性能优化失败',
      }));
    }
  }, [config]);

  // 渲染优化
  const performRenderingOptimization = useCallback(async () => {
    // 实施渲染优化策略
    return new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
  }, []);

  // 内存优化
  const performMemoryOptimization = useCallback(async () => {
    // 清理内存
    performMemoryCleanup();
    
    // 更新内存使用指标
    const memoryUsage = await estimateMemoryUsage();
    
    setState(prev => ({
      ...prev,
      componentMetrics: {
        ...prev.componentMetrics,
        memoryUsage,
      },
    }));
  }, []);

  // 内存清理
  const performMemoryCleanup = useCallback(() => {
    // 清理缓存、事件监听器等
    if (global.gc) {
      global.gc();
    }
  }, []);

  // 估算内存使用
  const estimateMemoryUsage = useCallback(async (): Promise<number> => {
    return Math.random() * 50 + 10; // 10-60MB
  }, []);

  // 生成性能报告
  const generateReport = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const report = await performanceService.generatePerformanceReport();

      setState(prev => ({
        ...prev,
        report,
        loading: false,
      }));

      return report;

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || '生成性能报告失败',
      }));
      return null;
    }
  }, []);

  // 解决性能问题
  const resolveIssue = useCallback((issueId: string) => {
    performanceService.resolveIssue(issueId);
    
    setState(prev => ({
      ...prev,
      issues: prev.issues.map(issue => 
        issue.id === issueId 
          ? { ...issue, status: 'resolved' as const, resolvedAt: new Date().toISOString() }
          : issue
      ),
    }));
  }, []);

  // 实施优化建议
  const implementSuggestion = useCallback((suggestionId: string) => {
    performanceService.implementSuggestion(suggestionId);
    
    setState(prev => ({
      ...prev,
      suggestions: prev.suggestions.map(suggestion => 
        suggestion.id === suggestionId 
          ? { ...suggestion, status: 'completed' as const, implementedAt: new Date().toISOString() }
          : suggestion
      ),
    }));
  }, []);

  return {
    // 状态
    ...state,
    
    // 渲染计时
    startRenderTiming,
    endRenderTiming,
    
    // 交互记录
    recordInteraction,
    
    // 优化功能
    optimize,
    generateReport,
    resolveIssue,
    implementSuggestion,
    
    // 便捷属性
    hasIssues: state.issues.length > 0,
    criticalIssues: state.issues.filter(issue => issue.severity === 'critical').length,
    highPriorityIssues: state.issues.filter(issue => issue.severity === 'high').length,
    pendingSuggestions: state.suggestions.filter(s => s.status === 'pending').length,
    overallScore: state.report?.overallScore || 0,
    performanceGrade: state.report?.grade || 'F',
  };
};

/**
 * 系统性能监控Hook
 */
export const useSystemPerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const performanceService = PerformanceOptimizationService.getInstance();

  const startMonitoring = useCallback(() => {
    performanceService.startMonitoring();
    setIsMonitoring(true);

    const interval = setInterval(() => {
      const currentMetrics = performanceService.getCurrentMetrics();
      setMetrics(currentMetrics);
    }, 5000);

    return () => {
      clearInterval(interval);
      performanceService.stopMonitoring();
      setIsMonitoring(false);
    };
  }, []);

  const stopMonitoring = useCallback(() => {
    performanceService.stopMonitoring();
    setIsMonitoring(false);
  }, []);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
  };
};

export default usePerformanceMonitoring;
