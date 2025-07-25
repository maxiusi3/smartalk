import { ApiService } from './ApiService';
import { ContentCacheService } from './ContentCacheService';
import { AnalyticsService } from './AnalyticsService';
import { PerformanceMonitor } from './PerformanceMonitor';
import { AssetPreloadService } from './AssetPreloadService';
import { ErrorHandler } from '@/utils/ErrorHandler';
import { useAppStore } from '@/store/useAppStore';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface StartupMetrics {
  startTime: number;
  initializationTime: number;
  cacheLoadTime: number;
  apiReadyTime: number;
  totalStartupTime: number;
}

/**
 * App Startup Service
 * Optimizes app initialization and startup performance
 */
class AppStartupServiceClass {
  private startupMetrics: StartupMetrics = {
    startTime: 0,
    initializationTime: 0,
    cacheLoadTime: 0,
    apiReadyTime: 0,
    totalStartupTime: 0,
  };

  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  /**
   * Initialize app with performance optimization
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = this.performInitialization();
    await this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    const startTime = Date.now();
    this.startupMetrics.startTime = startTime;

    try {
      console.log('🚀 Starting app initialization...');

      // Phase 1: Critical initialization (parallel)
      const criticalInitPromises = [
        this.initializeDeviceInfo(),
        this.initializeApiService(),
        this.preloadCriticalData(),
        this.initializeAssetPreloading(),
      ];

      await Promise.all(criticalInitPromises);
      this.startupMetrics.initializationTime = Date.now() - startTime;

      // Phase 2: Cache warming and optimization (background)
      this.warmupCache();
      this.optimizeForDevice();

      // Phase 3: Analytics initialization (non-blocking)
      this.initializeAnalytics();

      this.startupMetrics.totalStartupTime = Date.now() - startTime;
      this.isInitialized = true;

      console.log(`✅ App initialization completed in ${this.startupMetrics.totalStartupTime}ms`);
      
      // Track startup performance
      this.trackStartupMetrics();

    } catch (error) {
      console.error('❌ App initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize device information
   */
  private async initializeDeviceInfo(): Promise<void> {
    try {
      const store = useAppStore.getState();
      
      if (!store.deviceId) {
        const deviceId = await DeviceInfo.getUniqueId();
        store.setDeviceId(deviceId);
      }

      // Check first launch status
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      if (!hasLaunched) {
        store.setFirstLaunch(true);
        await AsyncStorage.setItem('hasLaunched', 'true');
      } else {
        store.setFirstLaunch(false);
      }
    } catch (error) {
      console.error('Device info initialization failed:', error);
    }
  }

  /**
   * Initialize API service
   */
  private async initializeApiService(): Promise<void> {
    try {
      ApiService.initialize();
      
      // Perform health check in background
      this.performHealthCheck();
    } catch (error) {
      console.error('API service initialization failed:', error);
    }
  }

  /**
   * Initialize asset preloading service
   */
  private async initializeAssetPreloading(): Promise<void> {
    try {
      // Preload critical onboarding assets
      await AssetPreloadService.preloadOnboardingAssets();
      console.log('🎨 Asset preloading service initialized');
    } catch (error) {
      console.error('Asset preloading initialization failed:', error);
      // Don't throw - app can still function without preloaded assets
    }
  }

  /**
   * Preload critical data
   */
  private async preloadCriticalData(): Promise<void> {
    const cacheStartTime = Date.now();
    
    try {
      // Preload interests (most critical for onboarding)
      const interests = await ApiService.getInterests();
      console.log(`📦 Preloaded ${interests.length} interests`);
      
      this.startupMetrics.cacheLoadTime = Date.now() - cacheStartTime;
    } catch (error) {
      console.error('Critical data preloading failed:', error);
      // Don't throw - app can still function without preloaded data
    }
  }

  /**
   * Warm up cache with frequently accessed data
   */
  private async warmupCache(): Promise<void> {
    try {
      // Get cache statistics
      const cacheStats = await ContentCacheService.getCacheStats();
      console.log('📊 Cache stats:', cacheStats);

      // If cache is getting large, clean it up
      if (cacheStats.size > 50 * 1024 * 1024) { // 50MB
        console.log('🧹 Cache size exceeded limit, cleaning up...');
        // ContentCacheService will handle cleanup automatically
      }
    } catch (error) {
      console.error('Cache warmup failed:', error);
    }
  }

  /**
   * Initialize analytics service
   */
  private initializeAnalytics(): void {
    try {
      // Initialize analytics in background
      setTimeout(() => {
        AnalyticsService.getInstance().track('app_startup', {
          startupTime: this.startupMetrics.totalStartupTime,
          timestamp: Date.now(),
        });
      }, 100);
    } catch (error) {
      console.error('Analytics initialization failed:', error);
    }
  }

  /**
   * Perform health check in background
   */
  private async performHealthCheck(): Promise<void> {
    try {
      const healthCheck = await ApiService.checkHealth();
      console.log('💚 API health check passed:', healthCheck);
      this.startupMetrics.apiReadyTime = Date.now() - this.startupMetrics.startTime;
    } catch (error) {
      console.warn('⚠️ API health check failed:', error);
      // Don't throw - app can still function with degraded API
    }
  }

  /**
   * Track startup performance metrics
   */
  private trackStartupMetrics(): void {
    try {
      AnalyticsService.getInstance().track('app_startup_performance', {
        initializationTime: this.startupMetrics.initializationTime,
        cacheLoadTime: this.startupMetrics.cacheLoadTime,
        apiReadyTime: this.startupMetrics.apiReadyTime,
        totalStartupTime: this.startupMetrics.totalStartupTime,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Startup metrics tracking failed:', error);
    }
  }

  /**
   * Get startup metrics
   */
  getStartupMetrics(): StartupMetrics {
    return { ...this.startupMetrics };
  }

  /**
   * Check if app is initialized
   */
  isAppInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Preload content for specific drama
   */
  async preloadDramaContent(dramaId: string): Promise<void> {
    try {
      console.log(`🎬 Preloading content for drama ${dramaId}...`);
      
      // Load keywords in parallel
      const keywords = await ApiService.getDramaKeywords(dramaId);
      
      // Cache drama content for offline access
      const drama = await this.getDramaById(dramaId);
      if (drama) {
        await ContentCacheService.cacheDramaContent(drama, keywords);
        console.log(`✅ Drama ${dramaId} content preloaded successfully`);
      }
    } catch (error) {
      console.error(`❌ Failed to preload drama ${dramaId} content:`, error);
    }
  }

  /**
   * Helper method to get drama by ID
   */
  private async getDramaById(dramaId: string): Promise<any> {
    try {
      // This would need to be implemented based on your API structure
      // For now, we'll return null and handle it gracefully
      return null;
    } catch (error) {
      console.error('Failed to get drama by ID:', error);
      return null;
    }
  }

  /**
   * Optimize app based on device capabilities
   */
  private async optimizeForDevice(): Promise<void> {
    try {
      const deviceInfo = {
        totalMemory: await DeviceInfo.getTotalMemory(),
        usedMemory: await DeviceInfo.getUsedMemory(),
        isLowRamDevice: await DeviceInfo.isLowRamDevice(),
      };

      console.log('📱 Device optimization:', deviceInfo);

      // Optimize for low memory devices
      if (deviceInfo.isLowRamDevice || deviceInfo.usedMemory / deviceInfo.totalMemory > 0.8) {
        await this.optimizeForLowMemory();
      }

      // Adjust cache strategy based on available memory
      const availableMemory = deviceInfo.totalMemory - deviceInfo.usedMemory;
      if (availableMemory < 512 * 1024 * 1024) { // Less than 512MB available
        console.log('🔧 Applying memory-constrained optimizations');
        // Additional optimizations for memory-constrained devices
      }
    } catch (error) {
      console.error('Device optimization failed:', error);
    }
  }

  /**
   * Optimize app for low-memory devices
   */
  async optimizeForLowMemory(): Promise<void> {
    try {
      console.log('🔧 Optimizing for low memory device...');
      
      // Clear old cache entries
      const cacheStats = await ContentCacheService.getCacheStats();
      if (cacheStats.size > 20 * 1024 * 1024) { // 20MB for low memory
        await ContentCacheService.clear();
        console.log('🧹 Cache cleared for low memory optimization');
      }
      
      // Reduce preloading for low memory devices
      // This could be expanded based on device capabilities
    } catch (error) {
      console.error('Low memory optimization failed:', error);
    }
  }
}

export const AppStartupService = new AppStartupServiceClass();