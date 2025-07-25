import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Drama, Keyword } from '@/types/api';
import { PerformanceMonitor } from './PerformanceMonitor';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

interface VideoPreloadInfo {
  url: string;
  priority: 'high' | 'medium' | 'low';
  preloaded: boolean;
  size?: number;
  retryCount: number;
  lastAttempt?: number;
}

interface CacheStrategy {
  maxSize: number;
  ttl: number;
  preloadOnWifi: boolean;
  aggressiveCleanup: boolean;
}

/**
 * Enhanced Content Cache Service
 * Handles intelligent caching and preloading of content for optimal performance
 */
class ContentCacheServiceClass {
  private readonly CACHE_PREFIX = 'smartalk_cache_';
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
  private readonly WIFI_CACHE_SIZE = 200 * 1024 * 1024; // 200MB on WiFi
  private preloadQueue: VideoPreloadInfo[] = [];
  private isPreloading = false;
  private networkState: any = null;
  private cacheStrategy: CacheStrategy;

  constructor() {
    this.cacheStrategy = {
      maxSize: this.MAX_CACHE_SIZE,
      ttl: this.DEFAULT_TTL,
      preloadOnWifi: true,
      aggressiveCleanup: false,
    };
    
    this.setupNetworkMonitoring();
  }

  /**
   * Setup network monitoring for intelligent caching
   */
  private setupNetworkMonitoring(): void {
    NetInfo.addEventListener(state => {
      this.networkState = state;
      this.updateCacheStrategy(state);
      
      // Start aggressive preloading on WiFi
      if (state.type === 'wifi' && state.isConnected) {
        this.startAggressivePreloading();
      }
    });
  }

  /**
   * Update cache strategy based on network conditions
   */
  private updateCacheStrategy(networkState: any): void {
    if (networkState.type === 'wifi') {
      this.cacheStrategy.maxSize = this.WIFI_CACHE_SIZE;
      this.cacheStrategy.preloadOnWifi = true;
      this.cacheStrategy.aggressiveCleanup = false;
    } else if (networkState.type === 'cellular') {
      this.cacheStrategy.maxSize = this.MAX_CACHE_SIZE / 2; // Reduce on cellular
      this.cacheStrategy.preloadOnWifi = false;
      this.cacheStrategy.aggressiveCleanup = true;
    } else {
      // No connection - be conservative
      this.cacheStrategy.aggressiveCleanup = true;
    }
  }

  /**
   * Cache data with TTL and access tracking
   */
  async set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): Promise<void> {
    const startTime = Date.now();
    PerformanceMonitor.startMetric('cache_set');
    
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
        accessCount: 0,
        lastAccessed: Date.now(),
      };

      await AsyncStorage.setItem(
        `${this.CACHE_PREFIX}${key}`,
        JSON.stringify(cacheItem)
      );
      
      PerformanceMonitor.endMetric('cache_set', { key, dataSize: JSON.stringify(data).length });
    } catch (error) {
      console.error('Cache set error:', error);
      PerformanceMonitor.endMetric('cache_set', { error: true });
    }
  }

  /**
   * Get cached data with access tracking
   */
  async get<T>(key: string): Promise<T | null> {
    PerformanceMonitor.startMetric('cache_get');
    
    try {
      const cached = await AsyncStorage.getItem(`${this.CACHE_PREFIX}${key}`);
      if (!cached) {
        PerformanceMonitor.endMetric('cache_get', { hit: false });
        return null;
      }

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      
      // Check if expired
      if (Date.now() > cacheItem.expiresAt) {
        await this.remove(key);
        PerformanceMonitor.endMetric('cache_get', { hit: false, expired: true });
        return null;
      }

      // Update access tracking
      cacheItem.accessCount++;
      cacheItem.lastAccessed = Date.now();
      
      // Update cache item with new access info (async, don't wait)
      this.updateAccessInfo(key, cacheItem);

      PerformanceMonitor.endMetric('cache_get', { hit: true });
      return cacheItem.data;
    } catch (error) {
      console.error('Cache get error:', error);
      PerformanceMonitor.endMetric('cache_get', { error: true });
      return null;
    }
  }

  /**
   * Update access information for cache item
   */
  private async updateAccessInfo<T>(key: string, cacheItem: CacheItem<T>): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${this.CACHE_PREFIX}${key}`,
        JSON.stringify(cacheItem)
      );
    } catch (error) {
      // Don't log this error as it's not critical
    }
  }

  /**
   * Remove cached item
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${this.CACHE_PREFIX}${key}`);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Get cache size
   */
  async getCacheSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      let totalSize = 0;
      for (const key of cacheKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Cache size calculation error:', error);
      return 0;
    }
  }

  /**
   * Cache drama content with intelligent preloading
   */
  async cacheDramaContent(drama: Drama, keywords: Keyword[]): Promise<void> {
    try {
      // Cache drama metadata
      await this.set(`drama_${drama.id}`, drama);
      await this.set(`keywords_${drama.id}`, keywords);

      // Add videos to preload queue
      this.addToPreloadQueue(drama.videoUrl, 'high');
      
      // Add keyword audio files to preload queue
      keywords.forEach(keyword => {
        if (keyword.audioUrl) {
          this.addToPreloadQueue(keyword.audioUrl, 'medium');
        }
      });

      // Start preloading if not already running
      this.startPreloading();
    } catch (error) {
      console.error('Drama content caching error:', error);
    }
  }

  /**
   * Add video to preload queue with retry logic
   */
  private addToPreloadQueue(url: string, priority: 'high' | 'medium' | 'low'): void {
    const existing = this.preloadQueue.find(item => item.url === url);
    if (!existing) {
      this.preloadQueue.push({
        url,
        priority,
        preloaded: false,
        retryCount: 0,
      });

      // Sort by priority
      this.preloadQueue.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    }
  }

  /**
   * Start aggressive preloading on WiFi
   */
  private async startAggressivePreloading(): Promise<void> {
    if (!this.cacheStrategy.preloadOnWifi || this.isPreloading) return;
    
    console.log('📶 WiFi detected - starting aggressive preloading');
    
    // Preload next chapter content
    try {
      // This would be called with next chapter data
      // For now, just ensure current queue is processed
      await this.startPreloading();
    } catch (error) {
      console.error('Aggressive preloading failed:', error);
    }
  }

  /**
   * Start preloading videos
   */
  private async startPreloading(): Promise<void> {
    if (this.isPreloading) return;
    
    this.isPreloading = true;
    
    try {
      for (const item of this.preloadQueue) {
        if (!item.preloaded) {
          await this.preloadVideo(item);
          item.preloaded = true;
          
          // Check cache size limit
          const cacheSize = await this.getCacheSize();
          if (cacheSize > this.MAX_CACHE_SIZE) {
            await this.cleanupOldCache();
          }
        }
      }
    } catch (error) {
      console.error('Preloading error:', error);
    } finally {
      this.isPreloading = false;
    }
  }

  /**
   * Preload individual video
   */
  private async preloadVideo(item: VideoPreloadInfo): Promise<void> {
    try {
      // For React Native, we can't actually preload video files
      // But we can cache metadata and prepare for faster loading
      const cacheKey = `preload_${this.hashUrl(item.url)}`;
      await this.set(cacheKey, {
        url: item.url,
        priority: item.priority,
        preloadedAt: Date.now(),
      }, this.DEFAULT_TTL);
      
      console.log(`📹 Preloaded video metadata: ${item.url}`);
    } catch (error) {
      console.error('Video preload error:', error);
    }
  }

  /**
   * Check if video is preloaded
   */
  async isVideoPreloaded(url: string): Promise<boolean> {
    const cacheKey = `preload_${this.hashUrl(url)}`;
    const cached = await this.get(cacheKey);
    return cached !== null;
  }

  /**
   * Cleanup old cache entries
   */
  private async cleanupOldCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      // Get all cache items with timestamps
      const cacheItems: Array<{ key: string; timestamp: number }> = [];
      
      for (const key of cacheKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          try {
            const parsed = JSON.parse(value);
            if (parsed.timestamp) {
              cacheItems.push({ key, timestamp: parsed.timestamp });
            }
          } catch (e) {
            // Invalid cache item, mark for deletion
            cacheItems.push({ key, timestamp: 0 });
          }
        }
      }

      // Sort by timestamp (oldest first)
      cacheItems.sort((a, b) => a.timestamp - b.timestamp);

      // Remove oldest 25% of cache items
      const itemsToRemove = Math.ceil(cacheItems.length * 0.25);
      const keysToRemove = cacheItems.slice(0, itemsToRemove).map(item => item.key);
      
      await AsyncStorage.multiRemove(keysToRemove);
      console.log(`🧹 Cleaned up ${keysToRemove.length} old cache items`);
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }

  /**
   * Hash URL for cache key
   */
  private hashUrl(url: string): string {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    size: number;
    itemCount: number;
    preloadQueueSize: number;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      const size = await this.getCacheSize();

      return {
        size,
        itemCount: cacheKeys.length,
        preloadQueueSize: this.preloadQueue.length,
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return { size: 0, itemCount: 0, preloadQueueSize: 0 };
    }
  }
}

export const ContentCacheService = new ContentCacheServiceClass();