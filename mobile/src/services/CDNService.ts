/**
 * CDN服务 - 处理内容分发和URL优化
 * 提供视频、音频、图片等媒体资源的CDN加速访问
 */

interface CDNConfig {
  baseUrl: string;
  regions: string[];
  cacheTTL: number;
  fallbackUrls: string[];
}

interface MediaOptimization {
  quality: 'auto' | 'high' | 'medium' | 'low';
  format: 'auto' | 'mp4' | 'webm' | 'hls';
  bandwidth?: number;
}

export class CDNService {
  private static instance: CDNService;
  private config: CDNConfig;
  private currentRegion: string;
  private networkQuality: 'high' | 'medium' | 'low' = 'high';

  private constructor() {
    this.config = {
      baseUrl: process.env.CDN_BASE_URL || 'https://cdn.smartalk.app',
      regions: ['asia-east1', 'asia-southeast1', 'us-west1'],
      cacheTTL: 86400, // 24 hours
      fallbackUrls: [
        'https://backup-cdn.smartalk.app',
        'https://static.smartalk.app'
      ]
    };
    this.currentRegion = this.detectOptimalRegion();
  }

  static getInstance(): CDNService {
    if (!CDNService.instance) {
      CDNService.instance = new CDNService();
    }
    return CDNService.instance;
  }

  /**
   * 获取优化后的视频URL
   */
  getVideoUrl(originalUrl: string, optimization?: MediaOptimization): string {
    if (!originalUrl || originalUrl.startsWith('http')) {
      return originalUrl; // Already a full URL
    }

    const opts = {
      quality: 'auto',
      format: 'auto',
      ...optimization
    };

    // 构建CDN URL
    const baseUrl = `${this.config.baseUrl}/${this.currentRegion}`;
    const params = new URLSearchParams();
    
    if (opts.quality !== 'auto') {
      params.append('q', opts.quality);
    }
    
    if (opts.format !== 'auto') {
      params.append('f', opts.format);
    }

    // 根据网络质量自动调整
    if (opts.quality === 'auto') {
      params.append('q', this.getAutoQuality());
    }

    const queryString = params.toString();
    const separator = queryString ? '?' : '';
    
    return `${baseUrl}/videos/${originalUrl}${separator}${queryString}`;
  }

  /**
   * 获取优化后的音频URL
   */
  getAudioUrl(originalUrl: string, bitrate?: number): string {
    if (!originalUrl || originalUrl.startsWith('http')) {
      return originalUrl;
    }

    const baseUrl = `${this.config.baseUrl}/${this.currentRegion}`;
    const params = new URLSearchParams();
    
    if (bitrate) {
      params.append('br', bitrate.toString());
    } else {
      // 根据网络质量自动选择比特率
      params.append('br', this.getAutoBitrate().toString());
    }

    const queryString = params.toString();
    const separator = queryString ? '?' : '';
    
    return `${baseUrl}/audio/${originalUrl}${separator}${queryString}`;
  }

  /**
   * 获取优化后的字幕URL
   */
  getSubtitleUrl(originalUrl: string): string {
    if (!originalUrl || originalUrl.startsWith('http')) {
      return originalUrl;
    }

    const baseUrl = `${this.config.baseUrl}/${this.currentRegion}`;
    return `${baseUrl}/subtitles/${originalUrl}`;
  }

  /**
   * 预热CDN缓存
   */
  async warmupCache(urls: string[]): Promise<void> {
    try {
      const warmupPromises = urls.map(url => this.warmupSingleUrl(url));
      await Promise.allSettled(warmupPromises);
      console.log(`🔥 CDN cache warmed up for ${urls.length} URLs`);
    } catch (error) {
      console.error('CDN warmup failed:', error);
    }
  }

  /**
   * 检测网络质量并更新配置
   */
  async detectNetworkQuality(): Promise<void> {
    try {
      const startTime = Date.now();
      const testUrl = `${this.config.baseUrl}/ping`;
      
      await fetch(testUrl, { method: 'HEAD' });
      const latency = Date.now() - startTime;

      if (latency < 100) {
        this.networkQuality = 'high';
      } else if (latency < 300) {
        this.networkQuality = 'medium';
      } else {
        this.networkQuality = 'low';
      }

      console.log(`📶 Network quality detected: ${this.networkQuality} (${latency}ms)`);
    } catch (error) {
      console.warn('Network quality detection failed:', error);
      this.networkQuality = 'medium'; // Fallback
    }
  }

  /**
   * 获取带回退的URL列表
   */
  getUrlsWithFallback(originalUrl: string, type: 'video' | 'audio' | 'subtitle'): string[] {
    const urls: string[] = [];
    
    // 主CDN URL
    switch (type) {
      case 'video':
        urls.push(this.getVideoUrl(originalUrl));
        break;
      case 'audio':
        urls.push(this.getAudioUrl(originalUrl));
        break;
      case 'subtitle':
        urls.push(this.getSubtitleUrl(originalUrl));
        break;
    }

    // 回退URL
    this.config.fallbackUrls.forEach(fallbackBase => {
      urls.push(`${fallbackBase}/${type}s/${originalUrl}`);
    });

    return urls;
  }

  private detectOptimalRegion(): string {
    // 简单的地理位置检测逻辑
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    if (timezone.includes('Asia')) {
      return 'asia-east1';
    } else if (timezone.includes('America')) {
      return 'us-west1';
    } else {
      return 'asia-southeast1'; // Default
    }
  }

  private getAutoQuality(): string {
    switch (this.networkQuality) {
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
        return 'low';
      default:
        return 'medium';
    }
  }

  private getAutoBitrate(): number {
    switch (this.networkQuality) {
      case 'high':
        return 128;
      case 'medium':
        return 96;
      case 'low':
        return 64;
      default:
        return 96;
    }
  }

  private async warmupSingleUrl(url: string): Promise<void> {
    try {
      await fetch(url, { method: 'HEAD' });
    } catch (error) {
      console.warn(`Failed to warmup ${url}:`, error);
    }
  }
}

export default CDNService.getInstance();
