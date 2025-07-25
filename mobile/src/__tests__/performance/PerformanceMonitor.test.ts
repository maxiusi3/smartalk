import { PerformanceMonitor } from '@/services/PerformanceMonitor';
import { AnalyticsService } from '@/services/AnalyticsService';

// Mock AnalyticsService
jest.mock('@/services/AnalyticsService', () => ({
  AnalyticsService: {
    getInstance: jest.fn(() => ({
      track: jest.fn(),
    })),
  },
}));

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    PerformanceMonitor.clearMetrics();
    jest.clearAllMocks();
  });

  describe('Metric Tracking', () => {
    it('should track basic performance metrics', () => {
      const metricName = 'test_metric';
      
      PerformanceMonitor.startMetric(metricName);
      
      // Simulate some work
      const startTime = Date.now();
      while (Date.now() - startTime < 10) {
        // Wait 10ms
      }
      
      const duration = PerformanceMonitor.endMetric(metricName);
      
      expect(duration).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100); // Should be reasonable
    });

    it('should handle non-existent metrics gracefully', () => {
      const duration = PerformanceMonitor.endMetric('non_existent_metric');
      expect(duration).toBeNull();
    });

    it('should track metrics with metadata', () => {
      const metricName = 'test_metric_with_metadata';
      const metadata = { testKey: 'testValue' };
      
      PerformanceMonitor.startMetric(metricName, metadata);
      const duration = PerformanceMonitor.endMetric(metricName, { additionalKey: 'additionalValue' });
      
      expect(duration).toBeGreaterThan(0);
    });
  });

  describe('Network Performance Tracking', () => {
    it('should track network requests', () => {
      const url = 'https://api.example.com/test';
      const method = 'GET';
      const startTime = Date.now();
      const endTime = startTime + 500;
      const status = 200;
      const size = 1024;

      PerformanceMonitor.trackNetworkRequest(url, method, startTime, endTime, status, size);

      const summary = PerformanceMonitor.getPerformanceSummary();
      expect(summary.avgNetworkTime).toBe(500);
    });

    it('should identify slow network requests', () => {
      const url = 'https://api.example.com/slow';
      const method = 'GET';
      const startTime = Date.now();
      const endTime = startTime + 4000; // 4 seconds - slow request
      const status = 200;

      PerformanceMonitor.trackNetworkRequest(url, method, startTime, endTime, status);

      const summary = PerformanceMonitor.getPerformanceSummary();
      expect(summary.slowRequests).toBe(1);
    });
  });

  describe('Video Performance Tracking', () => {
    it('should track video loading performance', () => {
      const videoUrl = 'https://example.com/video.mp4';
      const quality = 'HD';

      const metricId = PerformanceMonitor.trackVideoLoading(videoUrl, quality);
      expect(metricId).toBeDefined();

      // Simulate successful loading
      PerformanceMonitor.completeVideoLoading(videoUrl, true);

      const summary = PerformanceMonitor.getPerformanceSummary();
      expect(summary.avgVideoLoadTime).toBeGreaterThan(0);
    });

    it('should track video buffer events', () => {
      const videoUrl = 'https://example.com/video.mp4';

      PerformanceMonitor.trackVideoLoading(videoUrl);
      PerformanceMonitor.recordVideoBuffer(videoUrl);
      PerformanceMonitor.recordVideoBuffer(videoUrl);

      const summary = PerformanceMonitor.getPerformanceSummary();
      expect(summary.totalBufferEvents).toBe(2);
    });

    it('should track video errors', () => {
      const videoUrl = 'https://example.com/video.mp4';

      PerformanceMonitor.trackVideoLoading(videoUrl);
      PerformanceMonitor.recordVideoError(videoUrl);

      const summary = PerformanceMonitor.getPerformanceSummary();
      expect(summary.videoErrors).toBe(1);
    });
  });

  describe('Performance Thresholds', () => {
    it('should warn about slow app startup', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      PerformanceMonitor.startMetric('app_startup');
      
      // Simulate slow startup (over 2 seconds)
      setTimeout(() => {
        PerformanceMonitor.endMetric('app_startup');
      }, 10);

      // Fast forward time
      jest.advanceTimersByTime(2500);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Performance warning: app_startup')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Memory Management', () => {
    it('should clear metrics to prevent memory leaks', () => {
      // Add some metrics
      PerformanceMonitor.startMetric('test1');
      PerformanceMonitor.startMetric('test2');
      PerformanceMonitor.trackVideoLoading('video1');

      let detailedMetrics = PerformanceMonitor.getDetailedMetrics();
      expect(detailedMetrics.activeMetrics.length).toBeGreaterThan(0);

      PerformanceMonitor.clearMetrics();

      detailedMetrics = PerformanceMonitor.getDetailedMetrics();
      expect(detailedMetrics.activeMetrics.length).toBe(0);
      expect(detailedMetrics.networkMetrics.length).toBe(0);
      expect(detailedMetrics.videoMetrics.length).toBe(0);
    });
  });

  describe('Analytics Integration', () => {
    it('should track performance metrics in analytics', () => {
      const mockTrack = jest.fn();
      (AnalyticsService.getInstance as jest.Mock).mockReturnValue({
        track: mockTrack,
      });

      PerformanceMonitor.startMetric('test_metric');
      
      // Simulate work that takes more than 100ms to trigger analytics
      setTimeout(() => {
        PerformanceMonitor.endMetric('test_metric');
      }, 150);

      jest.advanceTimersByTime(150);

      expect(mockTrack).toHaveBeenCalledWith('performance_metric', expect.objectContaining({
        metricName: 'test_metric',
        duration: expect.any(Number),
      }));
    });
  });
});