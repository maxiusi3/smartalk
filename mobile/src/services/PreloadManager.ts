/**
 * PreloadManager - V2 智能预加载管理器
 * 基于用户行为、网络条件和设备性能的智能内容预加载
 * 优化Focus Mode和Rescue Mode的响应速度
 */

import PerformanceService, { NetworkCondition } from './PerformanceService';
import { AnalyticsService } from './AnalyticsService';
import UserStateService from './UserStateService';

// 预加载项目接口
interface PreloadItem {
  id: string;
  type: 'video' | 'audio' | 'image' | 'rescue_video' | 'chapter_content';
  url: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  size: number; // 字节
  chapterId?: string;
  keywordId?: string;
  estimatedLoadTime: number; // 毫秒
  preloadedAt?: number;
  lastAccessedAt?: number;
}

// 预加载策略配置
interface PreloadConfig {
  maxConcurrentDownloads: number;
  maxCacheSize: number; // MB
  networkConditionThresholds: {
    slow: { maxItems: number; maxSize: number };
    medium: { maxItems: number; maxSize: number };
    fast: { maxItems: number; maxSize: number };
  };
  priorityWeights: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

// 预加载统计
interface PreloadStats {
  totalItems: number;
  preloadedItems: number;
  cacheSize: number; // MB
  hitRate: number; // 百分比
  averageLoadTime: number; // 毫秒
  networkSavings: number; // MB
}

class PreloadManager {
  private static instance: PreloadManager;
  private preloadQueue: PreloadItem[] = [];
  private preloadedItems: Map<string, PreloadItem> = new Map();
  private activeDownloads: Set<string> = new Set();
  
  private performanceService = PerformanceService.getInstance();
  private analyticsService = AnalyticsService.getInstance();
  private userStateService = UserStateService.getInstance();
  
  // 默认配置
  private config: PreloadConfig = {
    maxConcurrentDownloads: 3,
    maxCacheSize: 100, // 100MB
    networkConditionThresholds: {
      slow: { maxItems: 5, maxSize: 10 }, // 10MB
      medium: { maxItems: 15, maxSize: 50 }, // 50MB
      fast: { maxItems: 30, maxSize: 100 }, // 100MB
    },
    priorityWeights: {
      critical: 1000,
      high: 100,
      medium: 10,
      low: 1,
    },
  };

  static getInstance(): PreloadManager {
    if (!PreloadManager.instance) {
      PreloadManager.instance = new PreloadManager();
    }
    return PreloadManager.instance;
  }

  // ===== 预加载队列管理 =====

  /**
   * 添加预加载项目
   */
  addPreloadItem(item: Omit<PreloadItem, 'id' | 'estimatedLoadTime'>): void {
    const preloadItem: PreloadItem = {
      ...item,
      id: `preload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      estimatedLoadTime: this.estimateLoadTime(item.size, item.type),
    };

    // 检查是否已存在
    const existingIndex = this.preloadQueue.findIndex(
      existing => existing.url === item.url && existing.type === item.type
    );

    if (existingIndex !== -1) {
      // 更新优先级
      this.preloadQueue[existingIndex].priority = item.priority;
      return;
    }

    this.preloadQueue.push(preloadItem);
    this.sortPreloadQueue();
    
    this.analyticsService.track('preload_item_added', {
      type: item.type,
      priority: item.priority,
      size: item.size,
      queueLength: this.preloadQueue.length,
      timestamp: Date.now(),
    });

    // 立即尝试处理队列
    this.processPreloadQueue();
  }

  /**
   * 批量添加预加载项目
   */
  addPreloadItems(items: Omit<PreloadItem, 'id' | 'estimatedLoadTime'>[]): void {
    items.forEach(item => this.addPreloadItem(item));
  }

  /**
   * 移除预加载项目
   */
  removePreloadItem(itemId: string): void {
    this.preloadQueue = this.preloadQueue.filter(item => item.id !== itemId);
    this.activeDownloads.delete(itemId);
  }

  /**
   * 清空预加载队列
   */
  clearPreloadQueue(): void {
    this.preloadQueue = [];
    this.activeDownloads.clear();
    
    this.analyticsService.track('preload_queue_cleared', {
      timestamp: Date.now(),
    });
  }

  // ===== 智能预加载策略 =====

  /**
   * 基于用户当前学习状态预加载内容
   */
  async preloadForCurrentLearningState(): Promise<void> {
    const sessionState = this.userStateService.getSessionState();
    if (!sessionState) return;

    const { currentChapterId, currentKeywordId, currentPhase } = sessionState;

    // 预加载当前关键词的救援视频（高优先级）
    if (currentKeywordId) {
      this.addPreloadItem({
        type: 'rescue_video',
        url: `https://api.smartalk.app/rescue-videos/${currentKeywordId}`,
        priority: 'high',
        size: 2 * 1024 * 1024, // 2MB
        keywordId: currentKeywordId,
      });
    }

    // 预加载下一个关键词内容（中优先级）
    if (currentChapterId) {
      await this.preloadNextKeywordContent(currentChapterId, currentKeywordId);
    }

    // 根据学习阶段预加载特定内容
    if (currentPhase === 'context_guessing') {
      await this.preloadContextGuessingAssets(currentKeywordId);
    } else if (currentPhase === 'pronunciation_training') {
      await this.preloadPronunciationAssets(currentKeywordId);
    }
  }

  /**
   * 预加载Focus Mode相关资源
   */
  async preloadFocusModeAssets(keywordId: string): Promise<void> {
    // Focus Mode需要的高亮动画和提示内容
    this.addPreloadItem({
      type: 'image',
      url: `https://api.smartalk.app/focus-mode/highlight/${keywordId}`,
      priority: 'critical',
      size: 100 * 1024, // 100KB
      keywordId,
    });

    // 预加载正确答案的视频片段
    this.addPreloadItem({
      type: 'video',
      url: `https://api.smartalk.app/correct-answer-video/${keywordId}`,
      priority: 'high',
      size: 1.5 * 1024 * 1024, // 1.5MB
      keywordId,
    });
  }

  /**
   * 预加载Rescue Mode相关资源
   */
  async preloadRescueModeAssets(keywordId: string): Promise<void> {
    // 口型特写视频（关键资源）
    this.addPreloadItem({
      type: 'rescue_video',
      url: `https://api.smartalk.app/mouth-closeup/${keywordId}`,
      priority: 'critical',
      size: 3 * 1024 * 1024, // 3MB
      keywordId,
    });

    // 发音技巧图片
    this.addPreloadItem({
      type: 'image',
      url: `https://api.smartalk.app/pronunciation-tips/${keywordId}`,
      priority: 'high',
      size: 200 * 1024, // 200KB
      keywordId,
    });

    // 音标解析音频
    this.addPreloadItem({
      type: 'audio',
      url: `https://api.smartalk.app/phonetic-breakdown/${keywordId}`,
      priority: 'high',
      size: 500 * 1024, // 500KB
      keywordId,
    });
  }

  /**
   * 基于网络条件调整预加载策略
   */
  async adaptToNetworkCondition(condition: NetworkCondition): Promise<void> {
    const thresholds = this.config.networkConditionThresholds[condition];
    
    // 调整并发下载数
    this.config.maxConcurrentDownloads = condition === 'fast' ? 4 : condition === 'medium' ? 2 : 1;
    
    // 清理低优先级项目
    if (this.preloadQueue.length > thresholds.maxItems) {
      this.preloadQueue = this.preloadQueue
        .sort((a, b) => this.config.priorityWeights[b.priority] - this.config.priorityWeights[a.priority])
        .slice(0, thresholds.maxItems);
    }
    
    // 检查缓存大小
    await this.enforceMaxCacheSize(thresholds.maxSize);
    
    this.analyticsService.track('preload_strategy_adapted', {
      networkCondition: condition,
      maxItems: thresholds.maxItems,
      maxSize: thresholds.maxSize,
      queueLength: this.preloadQueue.length,
      timestamp: Date.now(),
    });
  }

  // ===== 预加载处理 =====

  /**
   * 处理预加载队列
   */
  private async processPreloadQueue(): Promise<void> {
    if (this.activeDownloads.size >= this.config.maxConcurrentDownloads) {
      return; // 已达到最大并发数
    }

    const availableSlots = this.config.maxConcurrentDownloads - this.activeDownloads.size;
    const itemsToProcess = this.preloadQueue
      .filter(item => !this.activeDownloads.has(item.id) && !this.preloadedItems.has(item.id))
      .slice(0, availableSlots);

    for (const item of itemsToProcess) {
      this.processPreloadItem(item);
    }
  }

  /**
   * 处理单个预加载项目
   */
  private async processPreloadItem(item: PreloadItem): Promise<void> {
    this.activeDownloads.add(item.id);
    
    try {
      const startTime = Date.now();
      
      // 模拟下载过程
      await this.downloadItem(item);
      
      const actualLoadTime = Date.now() - startTime;
      
      // 更新项目信息
      item.preloadedAt = Date.now();
      item.estimatedLoadTime = actualLoadTime;
      
      // 添加到已预加载列表
      this.preloadedItems.set(item.id, item);
      
      // 从队列中移除
      this.preloadQueue = this.preloadQueue.filter(queueItem => queueItem.id !== item.id);
      
      // 缓存到PerformanceService
      await this.performanceService.setCacheItem(
        `preload_${item.type}_${item.url}`,
        { item, data: 'preloaded_content' },
        this.mapTypeToCache(item.type)
      );
      
      this.analyticsService.track('preload_item_completed', {
        itemId: item.id,
        type: item.type,
        priority: item.priority,
        size: item.size,
        estimatedTime: item.estimatedLoadTime,
        actualTime: actualLoadTime,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error(`Error preloading item ${item.id}:`, error);
      
      this.analyticsService.track('preload_item_failed', {
        itemId: item.id,
        type: item.type,
        error: error.message,
        timestamp: Date.now(),
      });
      
    } finally {
      this.activeDownloads.delete(item.id);
      
      // 继续处理队列
      setTimeout(() => this.processPreloadQueue(), 100);
    }
  }

  /**
   * 模拟下载项目
   */
  private async downloadItem(item: PreloadItem): Promise<void> {
    // 模拟网络延迟和下载时间
    const baseDelay = 100;
    const sizeDelay = item.size / (1024 * 1024) * 200; // 每MB 200ms
    const totalDelay = baseDelay + sizeDelay;
    
    await new Promise(resolve => setTimeout(resolve, totalDelay));
  }

  /**
   * 检查项目是否已预加载
   */
  isPreloaded(url: string, type: PreloadItem['type']): boolean {
    return Array.from(this.preloadedItems.values()).some(
      item => item.url === url && item.type === type
    );
  }

  /**
   * 获取预加载项目
   */
  getPreloadedItem(url: string, type: PreloadItem['type']): PreloadItem | null {
    const item = Array.from(this.preloadedItems.values()).find(
      item => item.url === url && item.type === type
    );
    
    if (item) {
      // 更新最后访问时间
      item.lastAccessedAt = Date.now();
      
      this.analyticsService.track('preload_item_accessed', {
        itemId: item.id,
        type: item.type,
        timeSincePreload: Date.now() - (item.preloadedAt || 0),
        timestamp: Date.now(),
      });
    }
    
    return item || null;
  }

  // ===== 缓存管理 =====

  /**
   * 强制执行最大缓存大小
   */
  private async enforceMaxCacheSize(maxSizeMB: number): Promise<void> {
    const currentSizeMB = this.getCurrentCacheSize();
    
    if (currentSizeMB <= maxSizeMB) return;
    
    // 按最后访问时间排序，移除最旧的项目
    const sortedItems = Array.from(this.preloadedItems.values())
      .sort((a, b) => (a.lastAccessedAt || 0) - (b.lastAccessedAt || 0));
    
    let removedSize = 0;
    let removedCount = 0;
    
    for (const item of sortedItems) {
      if (currentSizeMB - removedSize <= maxSizeMB) break;
      
      this.preloadedItems.delete(item.id);
      removedSize += item.size / (1024 * 1024); // 转换为MB
      removedCount++;
      
      // 从PerformanceService缓存中移除
      await this.performanceService.getCacheItem(`preload_${item.type}_${item.url}`);
    }
    
    this.analyticsService.track('preload_cache_cleanup', {
      removedCount,
      removedSizeMB: removedSize,
      remainingItems: this.preloadedItems.size,
      timestamp: Date.now(),
    });
  }

  /**
   * 获取当前缓存大小
   */
  private getCurrentCacheSize(): number {
    return Array.from(this.preloadedItems.values())
      .reduce((total, item) => total + item.size, 0) / (1024 * 1024); // MB
  }

  // ===== 辅助方法 =====

  /**
   * 排序预加载队列
   */
  private sortPreloadQueue(): void {
    this.preloadQueue.sort((a, b) => {
      const priorityDiff = this.config.priorityWeights[b.priority] - this.config.priorityWeights[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // 相同优先级按大小排序（小文件优先）
      return a.size - b.size;
    });
  }

  /**
   * 估算加载时间
   */
  private estimateLoadTime(size: number, type: PreloadItem['type']): number {
    const baseTime = 100; // 基础延迟100ms
    const sizeTime = size / (1024 * 1024) * 500; // 每MB 500ms
    const typeMultiplier = type === 'video' ? 1.5 : type === 'audio' ? 1.2 : 1.0;
    
    return Math.round((baseTime + sizeTime) * typeMultiplier);
  }

  /**
   * 映射类型到缓存类型
   */
  private mapTypeToCache(type: PreloadItem['type']): 'audio' | 'videoClips' | 'rescueVideos' | 'images' {
    switch (type) {
      case 'audio': return 'audio';
      case 'video': return 'videoClips';
      case 'rescue_video': return 'rescueVideos';
      case 'image': return 'images';
      default: return 'images';
    }
  }

  /**
   * 预加载下一个关键词内容
   */
  private async preloadNextKeywordContent(chapterId: string, currentKeywordId?: string): Promise<void> {
    // 模拟获取下一个关键词
    const nextKeywordId = `next_${currentKeywordId || 'keyword'}`;
    
    // 预加载下一个关键词的基础内容
    this.addPreloadItems([
      {
        type: 'audio',
        url: `https://api.smartalk.app/audio/${nextKeywordId}`,
        priority: 'medium',
        size: 300 * 1024, // 300KB
        keywordId: nextKeywordId,
      },
      {
        type: 'video',
        url: `https://api.smartalk.app/video-clips/${nextKeywordId}`,
        priority: 'medium',
        size: 1 * 1024 * 1024, // 1MB
        keywordId: nextKeywordId,
      },
    ]);
  }

  /**
   * 预加载情景猜义资源
   */
  private async preloadContextGuessingAssets(keywordId?: string): Promise<void> {
    if (!keywordId) return;
    
    // 预加载Focus Mode资源
    await this.preloadFocusModeAssets(keywordId);
  }

  /**
   * 预加载发音训练资源
   */
  private async preloadPronunciationAssets(keywordId?: string): Promise<void> {
    if (!keywordId) return;
    
    // 预加载Rescue Mode资源
    await this.preloadRescueModeAssets(keywordId);
  }

  // ===== 公共API =====

  /**
   * 获取预加载统计
   */
  getPreloadStats(): PreloadStats {
    const totalItems = this.preloadQueue.length + this.preloadedItems.size;
    const preloadedItems = this.preloadedItems.size;
    const cacheSize = this.getCurrentCacheSize();
    
    // 计算命中率
    const hitRate = totalItems > 0 ? (preloadedItems / totalItems) * 100 : 0;
    
    // 计算平均加载时间
    const loadTimes = Array.from(this.preloadedItems.values())
      .map(item => item.estimatedLoadTime)
      .filter(time => time > 0);
    const averageLoadTime = loadTimes.length > 0 
      ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length 
      : 0;
    
    // 估算网络节省
    const networkSavings = cacheSize * 0.8; // 假设80%的缓存避免了网络请求
    
    return {
      totalItems,
      preloadedItems,
      cacheSize: Math.round(cacheSize * 100) / 100, // 保留2位小数
      hitRate: Math.round(hitRate),
      averageLoadTime: Math.round(averageLoadTime),
      networkSavings: Math.round(networkSavings * 100) / 100,
    };
  }

  /**
   * 获取队列状态
   */
  getQueueStatus() {
    return {
      queueLength: this.preloadQueue.length,
      activeDownloads: this.activeDownloads.size,
      preloadedItems: this.preloadedItems.size,
      maxConcurrentDownloads: this.config.maxConcurrentDownloads,
    };
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<PreloadConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    this.analyticsService.track('preload_config_updated', {
      config: this.config,
      timestamp: Date.now(),
    });
  }

  /**
   * 清理所有预加载内容
   */
  async clearAllPreloadedContent(): Promise<void> {
    this.preloadQueue = [];
    this.preloadedItems.clear();
    this.activeDownloads.clear();
    
    this.analyticsService.track('preload_content_cleared', {
      timestamp: Date.now(),
    });
  }
}

export default PreloadManager;
