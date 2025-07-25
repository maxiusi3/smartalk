import { Image } from 'react-native';
import { PerformanceMonitor } from './PerformanceMonitor';
import { ErrorHandler } from '@/utils/ErrorHandler';

interface AssetPreloadItem {
  uri: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: 'image' | 'video' | 'audio';
  preloaded: boolean;
  retryCount: number;
  size?: number;
}

interface PreloadStats {
  totalAssets: number;
  preloadedAssets: number;
  failedAssets: number;
  totalSize: number;
  preloadTime: number;
}

/**
 * Asset Preloading Service
 * Intelligently preloads images, videos, and audio for optimal performance
 */
class AssetPreloadServiceClass {
  private preloadQueue: AssetPreloadItem[] = [];
  private isPreloading = false;
  private preloadStats: PreloadStats = {
    totalAssets: 0,
    preloadedAssets: 0,
    failedAssets: 0,
    totalSize: 0,
    preloadTime: 0,
  };

  /**
   * Add assets to preload queue
   */
  addToPreloadQueue(
    assets: Array<{ uri: string; type: 'image' | 'video' | 'audio'; priority?: 'critical' | 'high' | 'medium' | 'low' }>
  ): void {
    assets.forEach(asset => {
      const existing = this.preloadQueue.find(item => item.uri === asset.uri);
      if (!existing) {
        this.preloadQueue.push({
          uri: asset.uri,
          type: asset.type,
          priority: asset.priority || 'medium',
          preloaded: false,
          retryCount: 0,
        });
      }
    });

    // Sort by priority
    this.sortPreloadQueue();
    this.preloadStats.totalAssets = this.preloadQueue.length;
  }

  /**
   * Start preloading assets
   */
  async startPreloading(): Promise<void> {
    if (this.isPreloading || this.preloadQueue.length === 0) return;

    this.isPreloading = true;
    const startTime = Date.now();
    
    PerformanceMonitor.startMetric('asset_preload');
    console.log(`🎨 Starting asset preloading (${this.preloadQueue.length} assets)`);

    try {
      // Process critical assets first
      await this.preloadCriticalAssets();
      
      // Process remaining assets in batches
      await this.preloadRemainingAssets();
      
      this.preloadStats.preloadTime = Date.now() - startTime;
      PerformanceMonitor.endMetric('asset_preload', {
        totalAssets: this.preloadStats.totalAssets,
        preloadedAssets: this.preloadStats.preloadedAssets,
        failedAssets: this.preloadStats.failedAssets,
        preloadTime: this.preloadStats.preloadTime,
      });

      console.log(`✅ Asset preloading completed: ${this.preloadStats.preloadedAssets}/${this.preloadStats.totalAssets} assets in ${this.preloadStats.preloadTime}ms`);
    } catch (error) {
      console.error('❌ Asset preloading failed:', error);
      PerformanceMonitor.endMetric('asset_preload', { error: true });
    } finally {
      this.isPreloading = false;
    }
  }

  /**
   * Preload critical assets first
   */
  private async preloadCriticalAssets(): Promise<void> {
    const criticalAssets = this.preloadQueue.filter(asset => 
      asset.priority === 'critical' && !asset.preloaded
    );

    if (criticalAssets.length === 0) return;

    console.log(`🚨 Preloading ${criticalAssets.length} critical assets`);
    
    // Preload critical assets in parallel
    const promises = criticalAssets.map(asset => this.preloadAsset(asset));
    await Promise.allSettled(promises);
  }

  /**
   * Preload remaining assets in batches
   */
  private async preloadRemainingAssets(): Promise<void> {
    const remainingAssets = this.preloadQueue.filter(asset => 
      asset.priority !== 'critical' && !asset.preloaded
    );

    if (remainingAssets.length === 0) return;

    console.log(`📦 Preloading ${remainingAssets.length} remaining assets`);

    // Process in batches of 5 to avoid overwhelming the system
    const batchSize = 5;
    for (let i = 0; i < remainingAssets.length; i += batchSize) {
      const batch = remainingAssets.slice(i, i + batchSize);
      const promises = batch.map(asset => this.preloadAsset(asset));
      await Promise.allSettled(promises);
      
      // Small delay between batches to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Preload individual asset
   */
  private async preloadAsset(asset: AssetPreloadItem): Promise<void> {
    const startTime = Date.now();
    
    try {
      switch (asset.type) {
        case 'image':
          await this.preloadImage(asset.uri);
          break;
        case 'video':
          // For videos, we just validate the URL exists
          await this.validateVideoUrl(asset.uri);
          break;
        case 'audio':
          // For audio, we just validate the URL exists
          await this.validateAudioUrl(asset.uri);
          break;
      }

      asset.preloaded = true;
      this.preloadStats.preloadedAssets++;
      
      const loadTime = Date.now() - startTime;
      console.log(`✅ Preloaded ${asset.type}: ${asset.uri} (${loadTime}ms)`);
      
    } catch (error) {
      asset.retryCount++;
      this.preloadStats.failedAssets++;
      
      console.warn(`⚠️ Failed to preload ${asset.type}: ${asset.uri}`, error);
      
      // Retry critical assets once
      if (asset.priority === 'critical' && asset.retryCount === 1) {
        setTimeout(() => this.preloadAsset(asset), 2000);
      }
    }
  }

  /**
   * Preload image using React Native Image.prefetch
   */
  private async preloadImage(uri: string): Promise<void> {
    return new Promise((resolve, reject) => {
      Image.prefetch(uri)
        .then(() => resolve())
        .catch(error => reject(error));
    });
  }

  /**
   * Validate video URL exists
   */
  private async validateVideoUrl(uri: string): Promise<void> {
    try {
      const response = await fetch(uri, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Video URL validation failed: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Video URL not accessible: ${uri}`);
    }
  }

  /**
   * Validate audio URL exists
   */
  private async validateAudioUrl(uri: string): Promise<void> {
    try {
      const response = await fetch(uri, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Audio URL validation failed: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Audio URL not accessible: ${uri}`);
    }
  }

  /**
   * Sort preload queue by priority
   */
  private sortPreloadQueue(): void {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    
    this.preloadQueue.sort((a, b) => {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Check if asset is preloaded
   */
  isAssetPreloaded(uri: string): boolean {
    const asset = this.preloadQueue.find(item => item.uri === uri);
    return asset?.preloaded || false;
  }

  /**
   * Get preload statistics
   */
  getPreloadStats(): PreloadStats {
    return { ...this.preloadStats };
  }

  /**
   * Clear preload queue
   */
  clearPreloadQueue(): void {
    this.preloadQueue = [];
    this.preloadStats = {
      totalAssets: 0,
      preloadedAssets: 0,
      failedAssets: 0,
      totalSize: 0,
      preloadTime: 0,
    };
  }

  /**
   * Preload onboarding assets
   */
  async preloadOnboardingAssets(): Promise<void> {
    const onboardingAssets = [
      { uri: require('@/assets/images/interest-placeholder.png'), type: 'image' as const, priority: 'critical' as const },
      // Add more onboarding assets here
    ];

    this.addToPreloadQueue(onboardingAssets);
    await this.startPreloading();
  }

  /**
   * Preload drama-specific assets
   */
  async preloadDramaAssets(dramaId: string, videoUrl: string, thumbnailUrl?: string): Promise<void> {
    const dramaAssets = [
      { uri: videoUrl, type: 'video' as const, priority: 'high' as const },
    ];

    if (thumbnailUrl) {
      dramaAssets.push({ uri: thumbnailUrl, type: 'image' as const, priority: 'high' as const });
    }

    this.addToPreloadQueue(dramaAssets);
    await this.startPreloading();
  }

  /**
   * Preload keyword assets
   */
  async preloadKeywordAssets(keywords: Array<{ audioUrl: string; imageUrl?: string }>): Promise<void> {
    const keywordAssets: Array<{ uri: string; type: 'image' | 'video' | 'audio'; priority: 'critical' | 'high' | 'medium' | 'low' }> = [];

    keywords.forEach(keyword => {
      keywordAssets.push({ uri: keyword.audioUrl, type: 'audio', priority: 'medium' });
      if (keyword.imageUrl) {
        keywordAssets.push({ uri: keyword.imageUrl, type: 'image', priority: 'medium' });
      }
    });

    this.addToPreloadQueue(keywordAssets);
    await this.startPreloading();
  }
}

export const AssetPreloadService = new AssetPreloadServiceClass();