import { AnalyticsService } from './AnalyticsService';
import { ErrorHandler } from '@/utils/ErrorHandler';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface NetworkMetric {
  url: string;
  method: string;
  startTime: number;
  endTime: number;
  duration: number;
  status: number;
  size?: number;
  cached?: boolean;
}

interface VideoMetric {
  videoUrl: string;
  loadStartTime: number;
  loadEndTime?: number;
  loadDuration?: number;
  bufferEvents: number;
  playbackErrors: number;
  quality: string;
}

/**
 * Performance monitoring service for tracking app performance metrics
 * Helps identify bottlenecks and optimize user experience
 */
class PerformanceMonitorClass {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private networkMetrics: NetworkMetric[] = [];
  private videoMetrics: VideoMetric[] = [];
  private readonly MAX_METRICS = 100;

  /**
   * Start tracking a performance metric
   */
  startMetric(name: string, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      startTime: Date.now(),
      metadata,
    };
    
    this.metrics.set(name, metric);
  }

  /**
   * End tracking a performance metric
   */
  endMetric(name: string, additionalMetadata?: Record<string, any>): number | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric '${name}' not found`);
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;
    
    if (additionalMetadata) {
      metric.metadata = { ...metric.metadata, ...additionalMetadata };
    }

    // Track in analytics if duration is significant
    if (duration > 100) { // Only track metrics > 100ms
      this.trackPerformanceMetric(metric);
    }

    // Log performance warnings
    this.checkPerformanceThresholds(metric);

    return duration;
  }

  /**
   * Track network request performance
   */
  trackNetworkRequest(
    url: string,
    method: string,
    startTime: number,
    endTime: number,
    status: number,
    size?: number,
    cached?: boolean
  ): void {
    const metric: NetworkMetric = {
      url,
      method,
      startTime,
      endTime,
      duration: endTime - startTime,
      status,
      size,
      cached,
    };

    this.networkMetrics.push(metric);
    
    // Keep only recent metrics
    if (this.networkMetrics.length > this.MAX_METRICS) {
      this.networkMetrics.shift();
    }

    // Track slow requests
    if (metric.duration > 3000) { // > 3 seconds
      this.trackSlowNetworkRequest(metric);
    }
  }

  /**
   * Track video loading performance
   */
  trackVideoLoading(videoUrl: string, quality: string = 'auto'): string {
    const metricId = `video_${Date.now()}`;
    const metric: VideoMetric = {
      videoUrl,
      loadStartTime: Date.now(),
      bufferEvents: 0,
      playbackErrors: 0,
      quality,
    };

    this.videoMetrics.push(metric);
    
    // Keep only recent metrics
    if (this.videoMetrics.length > this.MAX_METRICS) {
      this.videoMetrics.shift();
    }

    return metricId;
  }

  /**
   * Complete video loading tracking
   */
  completeVideoLoading(videoUrl: string, success: boolean = true): void {
    const metric = this.videoMetrics.find(m => 
      m.videoUrl === videoUrl && !m.loadEndTime
    );
    
    if (metric) {
      metric.loadEndTime = Date.now();
      metric.loadDuration = metric.loadEndTime - metric.loadStartTime;

      // Track video loading performance
      this.trackVideoPerformance(metric, success);
    }
  }

  /**
   * Record video buffer event
   */
  recordVideoBuffer(videoUrl: string): void {
    const metric = this.videoMetrics.find(m => m.videoUrl === videoUrl);
    if (metric) {
      metric.bufferEvents++;
    }
  }

  /**
   * Record video playback error
   */
  recordVideoError(videoUrl: string): void {
    const metric = this.videoMetrics.find(m => m.videoUrl === videoUrl);
    if (metric) {
      metric.playbackErrors++;
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    avgNetworkTime: number;
    avgVideoLoadTime: number;
    slowRequests: number;
    videoErrors: number;
    totalBufferEvents: number;
  } {
    const networkTimes = this.networkMetrics.map(m => m.duration);
    const videoLoadTimes = this.videoMetrics
      .filter(m => m.loadDuration)
      .map(m => m.loadDuration!);

    return {
      avgNetworkTime: networkTimes.length > 0 
        ? networkTimes.reduce((a, b) => a + b, 0) / networkTimes.length 
        : 0,
      avgVideoLoadTime: videoLoadTimes.length > 0
        ? videoLoadTimes.reduce((a, b) => a + b, 0) / videoLoadTimes.length
        : 0,
      slowRequests: this.networkMetrics.filter(m => m.duration > 3000).length,
      videoErrors: this.videoMetrics.reduce((sum, m) => sum + m.playbackErrors, 0),
      totalBufferEvents: this.videoMetrics.reduce((sum, m) => sum + m.bufferEvents, 0),
    };
  }

  /**
   * Track performance metric in analytics
   */
  private trackPerformanceMetric(metric: PerformanceMetric): void {
    try {
      AnalyticsService.getInstance().track('performance_metric', {
        metricName: metric.name,
        duration: metric.duration,
        timestamp: metric.startTime,
        ...metric.metadata,
      });
    } catch (error) {
      console.error('Failed to track performance metric:', error);
    }
  }

  /**
   * Check performance thresholds and log warnings
   */
  private checkPerformanceThresholds(metric: PerformanceMetric): void {
    if (!metric.duration) return;

    const thresholds: Record<string, number> = {
      'app_startup': 2000,
      'screen_transition': 300,
      'video_load': 3000,
      'api_request': 5000,
      'cache_operation': 100,
    };

    const threshold = thresholds[metric.name] || 1000;
    
    if (metric.duration > threshold) {
      console.warn(
        `⚠️ Performance warning: ${metric.name} took ${metric.duration}ms (threshold: ${threshold}ms)`
      );
      
      // Track performance issue
      ErrorHandler.handleError(
        new Error(`Performance threshold exceeded: ${metric.name}`),
        {
          showAlert: false,
          trackError: true,
          context: 'performance',
        }
      );
    }
  }

  /**
   * Track slow network requests
   */
  private trackSlowNetworkRequest(metric: NetworkMetric): void {
    try {
      AnalyticsService.getInstance().track('slow_network_request', {
        url: metric.url,
        method: metric.method,
        duration: metric.duration,
        status: metric.status,
        cached: metric.cached,
        timestamp: metric.startTime,
      });
    } catch (error) {
      console.error('Failed to track slow network request:', error);
    }
  }

  /**
   * Track video performance
   */
  private trackVideoPerformance(metric: VideoMetric, success: boolean): void {
    try {
      AnalyticsService.getInstance().track('video_performance', {
        videoUrl: metric.videoUrl,
        loadDuration: metric.loadDuration,
        bufferEvents: metric.bufferEvents,
        playbackErrors: metric.playbackErrors,
        quality: metric.quality,
        success,
        timestamp: metric.loadStartTime,
      });
    } catch (error) {
      console.error('Failed to track video performance:', error);
    }
  }

  /**
   * Clear all metrics (for memory management)
   */
  clearMetrics(): void {
    this.metrics.clear();
    this.networkMetrics = [];
    this.videoMetrics = [];
  }

  /**
   * Get detailed metrics for debugging
   */
  getDetailedMetrics(): {
    activeMetrics: PerformanceMetric[];
    networkMetrics: NetworkMetric[];
    videoMetrics: VideoMetric[];
  } {
    return {
      activeMetrics: Array.from(this.metrics.values()),
      networkMetrics: [...this.networkMetrics],
      videoMetrics: [...this.videoMetrics],
    };
  }
}

export const PerformanceMonitor = new PerformanceMonitorClass();