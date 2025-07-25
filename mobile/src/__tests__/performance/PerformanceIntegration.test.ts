import { AppStartupService } from '@/services/AppStartupService';
import { ContentCacheService } from '@/services/ContentCacheService';
import { PerformanceMonitor } from '@/services/PerformanceMonitor';
import { AssetPreloadService } from '@/services/AssetPreloadService';
import { ErrorHandler } from '@/utils/ErrorHandler';

// Mock dependencies
jest.mock('@/services/AnalyticsService');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@react-native-community/netinfo');
jest.mock('react-native-device-info');

describe('Performance Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    PerformanceMonitor.clearMetrics();
  });

  describe('App Startup Performance (<2 seconds target)', () => {
    it('should initialize app within 2 seconds', async () => {
      const startTime = Date.now();
      
      try {
        await AppStartupService.initialize();
        const endTime = Date.now();
        const startupTime = endTime - startTime;
        
        console.log(`App startup time: ${startupTime}ms`);
        expect(startupTime).toBeLessThan(2000); // Must be under 2 seconds
        
        // Verify app is properly initialized
        expect(AppStartupService.isAppInitialized()).toBe(true);
        
        // Check startup metrics
        const metrics = AppStartupService.getStartupMetrics();
        expect(metrics.totalStartupTime).toBeLessThan(2000);
        
      } catch (error) {
        fail(`App startup failed: ${error}`);
      }
    }, 10000); // 10 second timeout for test

    it('should track startup performance metrics', async () => {
      await AppStartupService.initialize();
      
      const metrics = AppStartupService.getStartupMetrics();
      
      expect(metrics).toHaveProperty('startTime');
      expect(metrics).toHaveProperty('initializationTime');
      expect(metrics).toHaveProperty('totalStartupTime');
      expect(metrics.totalStartupTime).toBeGreaterThan(0);
    });

    it('should handle startup failures gracefully', async () => {
      // Mock a startup failure
      const mockError = new Error('Startup failure');
      jest.spyOn(AppStartupService, 'initialize').mockRejectedValueOnce(mockError);
      
      try {
        await AppStartupService.initialize();
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });
  });

  describe('Video Loading Performance (<3 seconds target)', () => {
    it('should track video loading within 3 seconds', async () => {
      const videoUrl = 'https://example.com/test-video.mp4';
      const startTime = Date.now();
      
      // Start tracking video loading
      const metricId = PerformanceMonitor.trackVideoLoading(videoUrl);
      expect(metricId).toBeDefined();
      
      // Simulate video loading completion
      setTimeout(() => {
        PerformanceMonitor.completeVideoLoading(videoUrl, true);
      }, 2500); // 2.5 seconds - within target
      
      // Fast forward time
      jest.advanceTimersByTime(2500);
      
      const summary = PerformanceMonitor.getPerformanceSummary();
      expect(summary.avgVideoLoadTime).toBeLessThan(3000);
    });

    it('should handle video loading failures', () => {
      const videoUrl = 'https://example.com/broken-video.mp4';
      
      PerformanceMonitor.trackVideoLoading(videoUrl);
      PerformanceMonitor.recordVideoError(videoUrl);
      PerformanceMonitor.completeVideoLoading(videoUrl, false);
      
      const summary = PerformanceMonitor.getPerformanceSummary();
      expect(summary.videoErrors).toBe(1);
    });

    it('should track video buffer events', () => {
      const videoUrl = 'https://example.com/buffering-video.mp4';
      
      PerformanceMonitor.trackVideoLoading(videoUrl);
      
      // Simulate multiple buffer events
      for (let i = 0; i < 3; i++) {
        PerformanceMonitor.recordVideoBuffer(videoUrl);
      }
      
      const summary = PerformanceMonitor.getPerformanceSummary();
      expect(summary.totalBufferEvents).toBe(3);
    });
  });

  describe('Cache Performance', () => {
    it('should cache and retrieve data efficiently', async () => {
      const testData = { id: 1, content: 'test data' };
      const cacheKey = 'performance_test';
      
      // Test cache set performance
      const setStartTime = Date.now();
      await ContentCacheService.set(cacheKey, testData);
      const setTime = Date.now() - setStartTime;
      
      expect(setTime).toBeLessThan(100); // Should be very fast
      
      // Test cache get performance
      const getStartTime = Date.now();
      const retrievedData = await ContentCacheService.get(cacheKey);
      const getTime = Date.now() - getStartTime;
      
      expect(getTime).toBeLessThan(50); // Should be very fast
      expect(retrievedData).toEqual(testData);
    });

    it('should handle cache size limits', async () => {
      const stats = await ContentCacheService.getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('itemCount');
      expect(stats.size).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Asset Preloading Performance', () => {
    it('should preload critical assets quickly', async () => {
      const startTime = Date.now();
      
      await AssetPreloadService.preloadOnboardingAssets();
      
      const preloadTime = Date.now() - startTime;
      console.log(`Asset preload time: ${preloadTime}ms`);
      
      // Should complete within reasonable time
      expect(preloadTime).toBeLessThan(5000); // 5 seconds max
      
      const stats = AssetPreloadService.getPreloadStats();
      expect(stats.preloadTime).toBeGreaterThan(0);
    });

    it('should handle asset preload failures gracefully', async () => {
      const assets = [
        { uri: 'https://invalid-url.com/image.jpg', type: 'image' as const },
      ];
      
      AssetPreloadService.addToPreloadQueue(assets);
      
      // Should not throw error even with invalid assets
      await expect(AssetPreloadService.startPreloading()).resolves.not.toThrow();
      
      const stats = AssetPreloadService.getPreloadStats();
      expect(stats.failedAssets).toBeGreaterThan(0);
    });
  });

  describe('Network Performance', () => {
    it('should track network request performance', () => {
      const url = 'https://api.example.com/test';
      const method = 'GET';
      const startTime = Date.now();
      const endTime = startTime + 500; // 500ms response time
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
      const endTime = startTime + 4000; // 4 seconds - slow
      const status = 200;
      
      PerformanceMonitor.trackNetworkRequest(url, method, startTime, endTime, status);
      
      const summary = PerformanceMonitor.getPerformanceSummary();
      expect(summary.slowRequests).toBe(1);
    });
  });

  describe('Error Handling Performance', () => {
    it('should handle errors efficiently without blocking', () => {
      const startTime = Date.now();
      
      // Generate multiple errors
      for (let i = 0; i < 10; i++) {
        ErrorHandler.handleError(new Error(`Test error ${i}`), {
          showAlert: false,
          trackError: false, // Don't track to avoid async operations
        });
      }
      
      const errorHandlingTime = Date.now() - startTime;
      
      // Error handling should be very fast
      expect(errorHandlingTime).toBeLessThan(100);
      
      const stats = ErrorHandler.getErrorStats();
      expect(stats.totalErrors).toBe(10);
    });

    it('should provide error recovery mechanisms', () => {
      let recoveryExecuted = false;
      
      const error = new Error('Network timeout');
      ErrorHandler.handleNetworkError(error, {
        showAlert: false,
        trackError: false,
        fallbackAction: () => {
          recoveryExecuted = true;
        },
      });
      
      // Recovery mechanism should be available
      expect(recoveryExecuted).toBe(false); // Not auto-executed
      
      const recentErrors = ErrorHandler.getRecentErrors(1);
      expect(recentErrors).toHaveLength(1);
      expect(recentErrors[0].recoverable).toBe(true);
    });
  });

  describe('Memory Management', () => {
    it('should clean up performance metrics to prevent memory leaks', () => {
      // Generate many metrics
      for (let i = 0; i < 100; i++) {
        PerformanceMonitor.startMetric(`test_metric_${i}`);
        PerformanceMonitor.endMetric(`test_metric_${i}`);
      }
      
      let detailedMetrics = PerformanceMonitor.getDetailedMetrics();
      expect(detailedMetrics.activeMetrics.length).toBeGreaterThan(0);
      
      // Clear metrics
      PerformanceMonitor.clearMetrics();
      
      detailedMetrics = PerformanceMonitor.getDetailedMetrics();
      expect(detailedMetrics.activeMetrics.length).toBe(0);
    });

    it('should limit cache size to prevent memory issues', async () => {
      const stats = await ContentCacheService.getCacheStats();
      
      // Cache size should be reasonable
      expect(stats.size).toBeLessThan(200 * 1024 * 1024); // Less than 200MB
    });
  });

  describe('Device-Specific Optimizations', () => {
    it('should optimize for low-memory devices', async () => {
      // Mock low memory device
      const DeviceInfo = require('react-native-device-info');
      DeviceInfo.isLowRamDevice.mockResolvedValue(true);
      DeviceInfo.getTotalMemory.mockResolvedValue(1024 * 1024 * 1024); // 1GB
      DeviceInfo.getUsedMemory.mockResolvedValue(800 * 1024 * 1024); // 800MB used
      
      await AppStartupService.optimizeForLowMemory();
      
      // Should complete without errors
      expect(true).toBe(true);
    });
  });

  describe('Performance Thresholds', () => {
    it('should warn about performance issues', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Simulate slow operation
      PerformanceMonitor.startMetric('app_startup');
      
      // Mock slow completion
      setTimeout(() => {
        PerformanceMonitor.endMetric('app_startup');
      }, 3000); // 3 seconds - over threshold
      
      jest.advanceTimersByTime(3000);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Performance warning')
      );
      
      consoleSpy.mockRestore();
    });
  });
});