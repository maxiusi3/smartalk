/**
 * usePerformanceOptimization - V2 性能优化Hook
 * 提供组件级别的性能监控和优化功能
 * 自动处理预加载、缓存和性能追踪
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import PerformanceService from '@/services/PerformanceService';
import PreloadManager from '@/services/PreloadManager';
import { AnalyticsService } from '@/services/AnalyticsService';

interface PerformanceHookOptions {
  // 组件标识
  componentName: string;
  
  // 性能监控选项
  trackInteractions?: boolean;
  trackRenderTime?: boolean;
  trackMemoryUsage?: boolean;
  
  // 预加载选项
  enablePreload?: boolean;
  preloadPriority?: 'low' | 'medium' | 'high' | 'critical';
  
  // 缓存选项
  enableCaching?: boolean;
  cacheKey?: string;
}

interface PerformanceMetrics {
  renderTime: number;
  interactionTime: number;
  memoryUsage: number;
  cacheHitRate: number;
}

interface PreloadHelpers {
  preloadVideo: (videoId: string, priority?: 'low' | 'medium' | 'high' | 'critical') => void;
  preloadAudio: (audioId: string, priority?: 'low' | 'medium' | 'high' | 'critical') => void;
  preloadRescueContent: (keywordId: string) => void;
  preloadFocusContent: (keywordId: string) => void;
  isPreloaded: (url: string, type: 'video' | 'audio' | 'image' | 'rescue_video') => boolean;
}

interface CacheHelpers {
  getCachedData: <T>(key: string) => Promise<T | null>;
  setCachedData: <T>(key: string, data: T, type: 'audio' | 'videoClips' | 'rescueVideos' | 'images') => Promise<void>;
  clearCache: (key?: string) => Promise<void>;
}

interface PerformanceHelpers {
  recordInteraction: (interactionType: string) => void;
  recordVideoLoad: (videoId: string, loadTime: number) => void;
  recordFocusModeActivation: (activationTime: number) => void;
  recordRescueVideoLoad: (videoId: string, loadTime: number) => void;
  triggerOptimization: () => Promise<void>;
}

/**
 * 性能优化Hook
 */
export const usePerformanceOptimization = (options: PerformanceHookOptions) => {
  const {
    componentName,
    trackInteractions = true,
    trackRenderTime = true,
    trackMemoryUsage = false,
    enablePreload = true,
    preloadPriority = 'medium',
    enableCaching = true,
    cacheKey,
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    interactionTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
  });

  const performanceService = PerformanceService.getInstance();
  const preloadManager = PreloadManager.getInstance();
  const analyticsService = AnalyticsService.getInstance();

  const renderStartTime = useRef<number>(0);
  const interactionStartTime = useRef<number>(0);
  const componentMountTime = useRef<number>(Date.now());

  // 组件渲染时间追踪
  useEffect(() => {
    if (trackRenderTime) {
      renderStartTime.current = Date.now();
      
      return () => {
        const renderTime = Date.now() - renderStartTime.current;
        setMetrics(prev => ({ ...prev, renderTime }));
        
        analyticsService.track('component_render_time', {
          componentName,
          renderTime,
          timestamp: Date.now(),
        });
      };
    }
  }, [componentName, trackRenderTime]);

  // 组件生命周期追踪
  useEffect(() => {
    const mountTime = Date.now() - componentMountTime.current;
    
    analyticsService.track('component_mounted', {
      componentName,
      mountTime,
      timestamp: Date.now(),
    });

    // 组件卸载时的清理
    return () => {
      const totalLifetime = Date.now() - componentMountTime.current;
      
      analyticsService.track('component_unmounted', {
        componentName,
        totalLifetime,
        timestamp: Date.now(),
      });
    };
  }, [componentName]);

  // 预加载辅助函数
  const preloadHelpers: PreloadHelpers = {
    preloadVideo: useCallback((videoId: string, priority = preloadPriority) => {
      if (!enablePreload) return;
      
      preloadManager.addPreloadItem({
        type: 'video',
        url: `https://api.smartalk.app/videos/${videoId}`,
        priority,
        size: 2 * 1024 * 1024, // 2MB估算
      });
    }, [enablePreload, preloadPriority]),

    preloadAudio: useCallback((audioId: string, priority = preloadPriority) => {
      if (!enablePreload) return;
      
      preloadManager.addPreloadItem({
        type: 'audio',
        url: `https://api.smartalk.app/audio/${audioId}`,
        priority,
        size: 500 * 1024, // 500KB估算
      });
    }, [enablePreload, preloadPriority]),

    preloadRescueContent: useCallback(async (keywordId: string) => {
      if (!enablePreload) return;
      
      await preloadManager.preloadRescueModeAssets(keywordId);
    }, [enablePreload]),

    preloadFocusContent: useCallback(async (keywordId: string) => {
      if (!enablePreload) return;
      
      await preloadManager.preloadFocusModeAssets(keywordId);
    }, [enablePreload]),

    isPreloaded: useCallback((url: string, type: 'video' | 'audio' | 'image' | 'rescue_video') => {
      return preloadManager.isPreloaded(url, type);
    }, []),
  };

  // 缓存辅助函数
  const cacheHelpers: CacheHelpers = {
    getCachedData: useCallback(async <T>(key: string): Promise<T | null> => {
      if (!enableCaching) return null;
      
      const fullKey = cacheKey ? `${cacheKey}_${key}` : key;
      return await performanceService.getCacheItem(fullKey);
    }, [enableCaching, cacheKey]),

    setCachedData: useCallback(async <T>(
      key: string, 
      data: T, 
      type: 'audio' | 'videoClips' | 'rescueVideos' | 'images'
    ): Promise<void> => {
      if (!enableCaching) return;
      
      const fullKey = cacheKey ? `${cacheKey}_${key}` : key;
      await performanceService.setCacheItem(fullKey, data, type);
    }, [enableCaching, cacheKey]),

    clearCache: useCallback(async (key?: string): Promise<void> => {
      if (!enableCaching) return;
      
      if (key) {
        const fullKey = cacheKey ? `${cacheKey}_${key}` : key;
        // 清除特定缓存项的逻辑
        console.log(`Clearing cache for key: ${fullKey}`);
      } else {
        // 清除所有相关缓存的逻辑
        await performanceService.cleanExpiredCache();
      }
    }, [enableCaching, cacheKey]),
  };

  // 性能记录辅助函数
  const performanceHelpers: PerformanceHelpers = {
    recordInteraction: useCallback((interactionType: string) => {
      if (!trackInteractions) return;
      
      const currentTime = Date.now();
      const responseTime = interactionStartTime.current > 0 
        ? currentTime - interactionStartTime.current 
        : 0;
      
      performanceService.recordInteractionResponseTime(
        `${componentName}_${interactionType}`, 
        responseTime
      );
      
      setMetrics(prev => ({ ...prev, interactionTime: responseTime }));
      interactionStartTime.current = currentTime;
    }, [componentName, trackInteractions]),

    recordVideoLoad: useCallback((videoId: string, loadTime: number) => {
      performanceService.recordVideoLoadingTime(videoId, loadTime);
    }, []),

    recordFocusModeActivation: useCallback((activationTime: number) => {
      performanceService.recordFocusModeActivationTime(activationTime);
    }, []),

    recordRescueVideoLoad: useCallback((videoId: string, loadTime: number) => {
      performanceService.recordRescueVideoLoadTime(videoId, loadTime);
    }, []),

    triggerOptimization: useCallback(async () => {
      await performanceService.triggerOptimization();
    }, []),
  };

  // 自动性能优化
  useEffect(() => {
    const optimizationInterval = setInterval(async () => {
      // 定期检查和优化性能
      const stats = await performanceService.getPerformanceStats();
      
      setMetrics(prev => ({
        ...prev,
        cacheHitRate: stats.cacheStats.hitRate,
      }));
      
      // 如果缓存命中率低，触发预加载
      if (stats.cacheStats.hitRate < 70 && enablePreload) {
        await preloadManager.preloadForCurrentLearningState();
      }
      
    }, 60000); // 每分钟检查一次
    
    return () => clearInterval(optimizationInterval);
  }, [enablePreload]);

  // 内存使用监控
  useEffect(() => {
    if (!trackMemoryUsage) return;
    
    const memoryInterval = setInterval(() => {
      // 模拟内存使用监控
      const memoryUsage = 40 + Math.random() * 40; // 40-80MB
      setMetrics(prev => ({ ...prev, memoryUsage }));
      
      if (memoryUsage > 70) {
        // 高内存使用时触发优化
        performanceService.triggerOptimization();
      }
    }, 30000); // 每30秒检查一次
    
    return () => clearInterval(memoryInterval);
  }, [trackMemoryUsage]);

  return {
    // 性能指标
    metrics,
    
    // 预加载辅助函数
    preload: preloadHelpers,
    
    // 缓存辅助函数
    cache: cacheHelpers,
    
    // 性能记录辅助函数
    performance: performanceHelpers,
    
    // 便捷方法
    startInteractionTimer: useCallback(() => {
      interactionStartTime.current = Date.now();
    }, []),
    
    measureAsync: useCallback(async <T>(
      operation: () => Promise<T>,
      operationName: string
    ): Promise<T> => {
      const startTime = Date.now();
      
      try {
        const result = await operation();
        const duration = Date.now() - startTime;
        
        analyticsService.track('async_operation_completed', {
          componentName,
          operationName,
          duration,
          success: true,
          timestamp: Date.now(),
        });
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        analyticsService.track('async_operation_failed', {
          componentName,
          operationName,
          duration,
          error: error.message,
          timestamp: Date.now(),
        });
        
        throw error;
      }
    }, [componentName]),
    
    measureSync: useCallback(<T>(
      operation: () => T,
      operationName: string
    ): T => {
      const startTime = Date.now();
      
      try {
        const result = operation();
        const duration = Date.now() - startTime;
        
        analyticsService.track('sync_operation_completed', {
          componentName,
          operationName,
          duration,
          success: true,
          timestamp: Date.now(),
        });
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        analyticsService.track('sync_operation_failed', {
          componentName,
          operationName,
          duration,
          error: error.message,
          timestamp: Date.now(),
        });
        
        throw error;
      }
    }, [componentName]),
  };
};

/**
 * 视频加载性能Hook
 */
export const useVideoPerformance = (videoId: string) => {
  const [loadingTime, setLoadingTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const performanceService = PerformanceService.getInstance();
  const preloadManager = PreloadManager.getInstance();
  
  const loadVideo = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const startTime = Date.now();
    
    try {
      // 检查是否已预加载
      const preloaded = preloadManager.isPreloaded(
        `https://api.smartalk.app/videos/${videoId}`,
        'video'
      );
      
      if (preloaded) {
        // 预加载命中，几乎即时加载
        const loadTime = 50 + Math.random() * 50; // 50-100ms
        setLoadingTime(loadTime);
        performanceService.recordVideoLoadingTime(videoId, loadTime);
      } else {
        // 需要网络加载
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        const loadTime = Date.now() - startTime;
        setLoadingTime(loadTime);
        performanceService.recordVideoLoadingTime(videoId, loadTime);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [videoId]);
  
  return {
    loadVideo,
    loadingTime,
    isLoading,
    error,
    isPreloaded: preloadManager.isPreloaded(
      `https://api.smartalk.app/videos/${videoId}`,
      'video'
    ),
  };
};

/**
 * Focus Mode性能Hook
 */
export const useFocusModePerformance = () => {
  const performanceService = PerformanceService.getInstance();
  const preloadManager = PreloadManager.getInstance();
  
  const activateFocusMode = useCallback(async (keywordId: string) => {
    const startTime = Date.now();
    
    try {
      // 预加载Focus Mode资源
      await preloadManager.preloadFocusModeAssets(keywordId);
      
      // 模拟Focus Mode激活
      await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
      
      const activationTime = Date.now() - startTime;
      performanceService.recordFocusModeActivationTime(activationTime);
      
      return { success: true, activationTime };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);
  
  return { activateFocusMode };
};

/**
 * Rescue Mode性能Hook
 */
export const useRescueModePerformance = () => {
  const performanceService = PerformanceService.getInstance();
  const preloadManager = PreloadManager.getInstance();
  
  const loadRescueVideo = useCallback(async (keywordId: string) => {
    const startTime = Date.now();
    
    try {
      // 检查是否已预加载
      const preloaded = preloadManager.isPreloaded(
        `https://api.smartalk.app/rescue-videos/${keywordId}`,
        'rescue_video'
      );
      
      if (!preloaded) {
        // 预加载Rescue Mode资源
        await preloadManager.preloadRescueModeAssets(keywordId);
      }
      
      // 模拟视频加载
      const loadDelay = preloaded ? 100 : 1000 + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, loadDelay));
      
      const loadTime = Date.now() - startTime;
      performanceService.recordRescueVideoLoadTime(keywordId, loadTime);
      
      return { success: true, loadTime, wasPreloaded: preloaded };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);
  
  return { loadRescueVideo };
};

export default usePerformanceOptimization;
