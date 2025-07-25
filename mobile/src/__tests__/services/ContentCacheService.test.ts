import { ContentCacheService } from '@/services/ContentCacheService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
}));

// Mock PerformanceMonitor
jest.mock('@/services/PerformanceMonitor', () => ({
  PerformanceMonitor: {
    startMetric: jest.fn(),
    endMetric: jest.fn(),
  },
}));

describe('ContentCacheService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Cache Operations', () => {
    it('should cache and retrieve data successfully', async () => {
      const testData = { id: 1, name: 'Test Data' };
      const cacheKey = 'test_key';

      // Mock successful storage
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({
        data: testData,
        timestamp: Date.now(),
        expiresAt: Date.now() + 60000,
        accessCount: 0,
        lastAccessed: Date.now(),
      }));

      await ContentCacheService.set(cacheKey, testData);
      const retrievedData = await ContentCacheService.get(cacheKey);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
      expect(retrievedData).toEqual(testData);
    });

    it('should return null for non-existent cache keys', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await ContentCacheService.get('non_existent_key');
      expect(result).toBeNull();
    });

    it('should handle expired cache entries', async () => {
      const expiredCacheItem = {
        data: { test: 'data' },
        timestamp: Date.now() - 120000,
        expiresAt: Date.now() - 60000, // Expired 1 minute ago
        accessCount: 1,
        lastAccessed: Date.now() - 120000,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(expiredCacheItem));
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      const result = await ContentCacheService.get('expired_key');
      
      expect(result).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('smartalk_cache_expired_key');
    });
  });

  describe('Cache Size Management', () => {
    it('should calculate cache size correctly', async () => {
      const mockKeys = ['smartalk_cache_key1', 'smartalk_cache_key2', 'other_key'];
      const mockData1 = JSON.stringify({ data: 'test1' });
      const mockData2 = JSON.stringify({ data: 'test2' });

      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue(mockKeys);
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(mockData1)
        .mockResolvedValueOnce(mockData2)
        .mockResolvedValueOnce(null);

      const cacheSize = await ContentCacheService.getCacheSize();
      
      expect(cacheSize).toBeGreaterThan(0);
      expect(AsyncStorage.getAllKeys).toHaveBeenCalled();
    });

    it('should clear all cache when requested', async () => {
      const mockKeys = ['smartalk_cache_key1', 'smartalk_cache_key2', 'other_key'];
      const cacheKeys = ['smartalk_cache_key1', 'smartalk_cache_key2'];

      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue(mockKeys);
      (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);

      await ContentCacheService.clear();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(cacheKeys);
    });
  });

  describe('Drama Content Caching', () => {
    it('should cache drama content with keywords', async () => {
      const mockDrama = {
        id: '1',
        title: 'Test Drama',
        videoUrl: 'https://example.com/video.mp4',
        thumbnailUrl: 'https://example.com/thumb.jpg',
      };

      const mockKeywords = [
        {
          id: '1',
          word: 'hello',
          audioUrl: 'https://example.com/hello.mp3',
        },
        {
          id: '2',
          word: 'world',
          audioUrl: 'https://example.com/world.mp3',
        },
      ];

      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await ContentCacheService.cacheDramaContent(mockDrama, mockKeywords);

      // Should cache drama and keywords separately
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'smartalk_cache_drama_1',
        expect.stringContaining(mockDrama.title)
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'smartalk_cache_keywords_1',
        expect.stringContaining('hello')
      );
    });
  });

  describe('Video Preloading', () => {
    it('should check if video is preloaded', async () => {
      const videoUrl = 'https://example.com/video.mp4';
      const preloadData = {
        url: videoUrl,
        priority: 'high',
        preloadedAt: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({
        data: preloadData,
        timestamp: Date.now(),
        expiresAt: Date.now() + 60000,
        accessCount: 1,
        lastAccessed: Date.now(),
      }));

      const isPreloaded = await ContentCacheService.isVideoPreloaded(videoUrl);
      expect(isPreloaded).toBe(true);
    });

    it('should return false for non-preloaded videos', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const isPreloaded = await ContentCacheService.isVideoPreloaded('https://example.com/not-preloaded.mp4');
      expect(isPreloaded).toBe(false);
    });
  });

  describe('Cache Statistics', () => {
    it('should provide accurate cache statistics', async () => {
      const mockKeys = ['smartalk_cache_key1', 'smartalk_cache_key2'];
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue(mockKeys);
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce('{"data": "test1"}')
        .mockResolvedValueOnce('{"data": "test2"}');

      const stats = await ContentCacheService.getCacheStats();

      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('itemCount');
      expect(stats).toHaveProperty('preloadQueueSize');
      expect(stats.itemCount).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle AsyncStorage errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await ContentCacheService.set('test_key', { data: 'test' });

      expect(consoleSpy).toHaveBeenCalledWith('Cache set error:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should handle cache retrieval errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Retrieval error'));

      const result = await ContentCacheService.get('test_key');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Cache get error:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('Performance Optimization', () => {
    it('should track cache performance metrics', async () => {
      const { PerformanceMonitor } = require('@/services/PerformanceMonitor');
      
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await ContentCacheService.set('perf_test', { data: 'test' });

      expect(PerformanceMonitor.startMetric).toHaveBeenCalledWith('cache_set');
      expect(PerformanceMonitor.endMetric).toHaveBeenCalledWith('cache_set', expect.any(Object));
    });
  });
});