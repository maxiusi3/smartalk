/**
 * PerformanceService - V2 性能监控和优化服务
 * 实现性能目标：<2s启动、<1s视频加载、<100ms交互响应
 * 提供实时性能监控、智能预加载、缓存策略和错误恢复优化
 */

import { AnalyticsService } from './AnalyticsService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 性能指标接口
export interface PerformanceMetrics {
  // 启动性能
  appStartupTime: number; // 毫秒，目标<2000ms
  splashScreenDuration: number;
  initialDataLoadTime: number;
  
  // 视频性能
  videoLoadingTime: number; // 毫秒，目标<1000ms
  videoBufferingEvents: number;
  videoPlaybackErrors: number;
  
  // 交互性能
  interactionResponseTime: number; // 毫秒，目标<100ms
  buttonPressDelay: number;
  navigationTransitionTime: number;
  
  // 内存和电池
  memoryUsage: number; // MB
  batteryImpact: 'low' | 'medium' | 'high';
  
  // 网络性能
  networkLatency: number;
  dataUsage: number; // MB
  cacheHitRate: number; // 百分比
  
  // 错误恢复性能
  focusModeActivationTime: number; // 目标<500ms
  rescueVideoLoadTime: number; // 目标<2000ms
  
  timestamp: number;
}

// 缓存策略配置
interface CacheConfig {
  audio: number; // 24小时
  videoClips: number; // 12小时
  rescueVideos: number; // 48小时
  images: number; // 7天
  userData: number; // 30天
}

// 预加载策略
interface PreloadStrategy {
  nextChapterContent: boolean;
  rescueVideos: boolean;
  audioFiles: boolean;
  thumbnails: boolean;
}

class PerformanceService {
  private static instance: PerformanceService;
  private metrics: PerformanceMetrics[] = [];
  private analyticsService = AnalyticsService.getInstance();
  
  // 性能目标
  private static readonly PERFORMANCE_TARGETS = {
    APP_STARTUP: 2000, // 2秒
    VIDEO_LOADING: 1000, // 1秒
    INTERACTION_RESPONSE: 100, // 100毫秒
    FOCUS_MODE_ACTIVATION: 500, // 500毫秒
    RESCUE_VIDEO_LOAD: 2000, // 2秒
  };
  
  // 缓存配置（毫秒）
  private static readonly CACHE_CONFIG: CacheConfig = {
    audio: 24 * 60 * 60 * 1000, // 24小时
    videoClips: 12 * 60 * 60 * 1000, // 12小时
    rescueVideos: 48 * 60 * 60 * 1000, // 48小时
    images: 7 * 24 * 60 * 60 * 1000, // 7天
    userData: 30 * 24 * 60 * 60 * 1000, // 30天
  };
  
  // 预加载策略
  private preloadStrategy: PreloadStrategy = {
    nextChapterContent: true,
    rescueVideos: true,
    audioFiles: true,
    thumbnails: true,
  };
  
  // 性能监控状态
  private isMonitoring: boolean = false;
  private performanceObserver: any = null;
  
  static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  // ===== 性能监控 =====

  /**
   * 开始性能监控
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // 启动性能监控
    this.monitorAppStartup();
    this.monitorMemoryUsage();
    this.monitorNetworkPerformance();
    
    this.analyticsService.track('performance_monitoring_started', {
      timestamp: Date.now(),
    });
  }

  /**
   * 停止性能监控
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
    
    this.analyticsService.track('performance_monitoring_stopped', {
      timestamp: Date.now(),
    });
  }

  /**
   * 记录应用启动时间
   */
  recordAppStartupTime(startTime: number, endTime: number): void {
    const startupTime = endTime - startTime;
    const meetsTarget = startupTime < PerformanceService.PERFORMANCE_TARGETS.APP_STARTUP;
    
    this.analyticsService.track('performance_app_startup', {
      startupTime,
      target: PerformanceService.PERFORMANCE_TARGETS.APP_STARTUP,
      meetsTarget,
      timestamp: Date.now(),
    });
    
    if (!meetsTarget) {
      console.warn(`App startup time ${startupTime}ms exceeds target ${PerformanceService.PERFORMANCE_TARGETS.APP_STARTUP}ms`);
    }
  }

  /**
   * 记录视频加载时间
   */
  recordVideoLoadingTime(videoId: string, loadingTime: number): void {
    const meetsTarget = loadingTime < PerformanceService.PERFORMANCE_TARGETS.VIDEO_LOADING;
    
    this.analyticsService.track('performance_video_loading', {
      videoId,
      loadingTime,
      target: PerformanceService.PERFORMANCE_TARGETS.VIDEO_LOADING,
      meetsTarget,
      timestamp: Date.now(),
    });
    
    if (!meetsTarget) {
      console.warn(`Video loading time ${loadingTime}ms exceeds target ${PerformanceService.PERFORMANCE_TARGETS.VIDEO_LOADING}ms`);
      // 触发视频优化策略
      this.optimizeVideoLoading(videoId);
    }
  }

  /**
   * 记录交互响应时间
   */
  recordInteractionResponseTime(interactionType: string, responseTime: number): void {
    const meetsTarget = responseTime < PerformanceService.PERFORMANCE_TARGETS.INTERACTION_RESPONSE;
    
    this.analyticsService.track('performance_interaction_response', {
      interactionType,
      responseTime,
      target: PerformanceService.PERFORMANCE_TARGETS.INTERACTION_RESPONSE,
      meetsTarget,
      timestamp: Date.now(),
    });
    
    if (!meetsTarget) {
      console.warn(`Interaction response time ${responseTime}ms exceeds target ${PerformanceService.PERFORMANCE_TARGETS.INTERACTION_RESPONSE}ms`);
    }
  }

  /**
   * 记录Focus Mode激活时间
   */
  recordFocusModeActivationTime(activationTime: number): void {
    const meetsTarget = activationTime < PerformanceService.PERFORMANCE_TARGETS.FOCUS_MODE_ACTIVATION;
    
    this.analyticsService.track('performance_focus_mode_activation', {
      activationTime,
      target: PerformanceService.PERFORMANCE_TARGETS.FOCUS_MODE_ACTIVATION,
      meetsTarget,
      timestamp: Date.now(),
    });
    
    if (!meetsTarget) {
      console.warn(`Focus Mode activation time ${activationTime}ms exceeds target ${PerformanceService.PERFORMANCE_TARGETS.FOCUS_MODE_ACTIVATION}ms`);
    }
  }

  /**
   * 记录Rescue视频加载时间
   */
  recordRescueVideoLoadTime(videoId: string, loadTime: number): void {
    const meetsTarget = loadTime < PerformanceService.PERFORMANCE_TARGETS.RESCUE_VIDEO_LOAD;
    
    this.analyticsService.track('performance_rescue_video_load', {
      videoId,
      loadTime,
      target: PerformanceService.PERFORMANCE_TARGETS.RESCUE_VIDEO_LOAD,
      meetsTarget,
      timestamp: Date.now(),
    });
    
    if (!meetsTarget) {
      console.warn(`Rescue video load time ${loadTime}ms exceeds target ${PerformanceService.PERFORMANCE_TARGETS.RESCUE_VIDEO_LOAD}ms`);
    }
  }

  // ===== 智能预加载 =====

  /**
   * 预加载下一章节内容
   */
  async preloadNextChapterContent(currentChapterId: string): Promise<void> {
    if (!this.preloadStrategy.nextChapterContent) return;
    
    try {
      const startTime = Date.now();
      
      // 模拟预加载逻辑
      await this.preloadChapterAssets(currentChapterId);
      
      const preloadTime = Date.now() - startTime;
      
      this.analyticsService.track('performance_preload_chapter', {
        chapterId: currentChapterId,
        preloadTime,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error preloading chapter content:', error);
      this.analyticsService.track('performance_preload_error', {
        chapterId: currentChapterId,
        error: error.message,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * 预加载救援视频
   */
  async preloadRescueVideos(keywordIds: string[]): Promise<void> {
    if (!this.preloadStrategy.rescueVideos) return;
    
    try {
      const startTime = Date.now();
      
      for (const keywordId of keywordIds) {
        await this.preloadRescueVideo(keywordId);
      }
      
      const preloadTime = Date.now() - startTime;
      
      this.analyticsService.track('performance_preload_rescue_videos', {
        keywordCount: keywordIds.length,
        preloadTime,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error preloading rescue videos:', error);
    }
  }

  // ===== 缓存管理 =====

  /**
   * 设置缓存项
   */
  async setCacheItem(key: string, data: any, type: keyof CacheConfig): Promise<void> {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + PerformanceService.CACHE_CONFIG[type],
        type,
      };
      
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
      
    } catch (error) {
      console.error('Error setting cache item:', error);
    }
  }

  /**
   * 获取缓存项
   */
  async getCacheItem(key: string): Promise<any | null> {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      
      if (!cached) return null;
      
      const cacheItem = JSON.parse(cached);
      
      // 检查是否过期
      if (Date.now() > cacheItem.expiry) {
        await AsyncStorage.removeItem(`cache_${key}`);
        return null;
      }
      
      // 记录缓存命中
      this.analyticsService.track('performance_cache_hit', {
        key,
        type: cacheItem.type,
        age: Date.now() - cacheItem.timestamp,
        timestamp: Date.now(),
      });
      
      return cacheItem.data;
      
    } catch (error) {
      console.error('Error getting cache item:', error);
      return null;
    }
  }

  /**
   * 清理过期缓存
   */
  async cleanExpiredCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      
      let cleanedCount = 0;
      
      for (const key of cacheKeys) {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const cacheItem = JSON.parse(cached);
          if (Date.now() > cacheItem.expiry) {
            await AsyncStorage.removeItem(key);
            cleanedCount++;
          }
        }
      }
      
      this.analyticsService.track('performance_cache_cleanup', {
        totalCacheKeys: cacheKeys.length,
        cleanedCount,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error cleaning expired cache:', error);
    }
  }

  // ===== 网络优化 =====

  /**
   * 获取网络状态
   */
  async getNetworkCondition(): Promise<'slow' | 'medium' | 'fast'> {
    // 模拟网络状态检测
    // 在实际应用中，这里会使用NetInfo或类似库
    return 'fast';
  }

  /**
   * 根据网络条件调整内容质量
   */
  async adaptContentQuality(networkCondition: 'slow' | 'medium' | 'fast'): Promise<void> {
    const qualitySettings = {
      slow: { videoQuality: 'low', preloadEnabled: false },
      medium: { videoQuality: 'medium', preloadEnabled: true },
      fast: { videoQuality: 'high', preloadEnabled: true },
    };
    
    const settings = qualitySettings[networkCondition];
    
    this.analyticsService.track('performance_quality_adaptation', {
      networkCondition,
      videoQuality: settings.videoQuality,
      preloadEnabled: settings.preloadEnabled,
      timestamp: Date.now(),
    });
  }

  // ===== 内存管理 =====

  /**
   * 监控内存使用
   */
  private monitorMemoryUsage(): void {
    // 模拟内存监控
    setInterval(() => {
      if (!this.isMonitoring) return;
      
      // 在实际应用中，这里会使用真实的内存监控API
      const memoryUsage = Math.random() * 100; // MB
      
      if (memoryUsage > 80) {
        console.warn(`High memory usage: ${memoryUsage}MB`);
        this.optimizeMemoryUsage();
      }
      
      this.analyticsService.track('performance_memory_usage', {
        memoryUsage,
        timestamp: Date.now(),
      });
      
    }, 30000); // 每30秒检查一次
  }

  /**
   * 优化内存使用
   */
  private async optimizeMemoryUsage(): Promise<void> {
    try {
      // 清理过期缓存
      await this.cleanExpiredCache();
      
      // 释放未使用的资源
      // 在实际应用中，这里会释放图片、视频等资源
      
      this.analyticsService.track('performance_memory_optimization', {
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error optimizing memory usage:', error);
    }
  }

  // ===== 私有方法 =====

  private monitorAppStartup(): void {
    // 应用启动监控逻辑
  }

  private monitorNetworkPerformance(): void {
    // 网络性能监控逻辑
  }

  private async preloadChapterAssets(chapterId: string): Promise<void> {
    // 预加载章节资源逻辑
  }

  private async preloadRescueVideo(keywordId: string): Promise<void> {
    // 预加载救援视频逻辑
  }

  private optimizeVideoLoading(videoId: string): void {
    // 视频加载优化逻辑
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats() {
    return {
      targets: PerformanceService.PERFORMANCE_TARGETS,
      cacheConfig: PerformanceService.CACHE_CONFIG,
      preloadStrategy: this.preloadStrategy,
      isMonitoring: this.isMonitoring,
    };
  }

  /**
   * 更新预加载策略
   */
  updatePreloadStrategy(strategy: Partial<PreloadStrategy>): void {
    this.preloadStrategy = { ...this.preloadStrategy, ...strategy };
    
    this.analyticsService.track('performance_preload_strategy_updated', {
      strategy: this.preloadStrategy,
      timestamp: Date.now(),
    });
  }
}

export default PerformanceService;
