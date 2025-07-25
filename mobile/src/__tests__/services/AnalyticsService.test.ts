import { AnalyticsService, analytics, trackEvent } from '@/services/AnalyticsService';

// Mock ApiService
jest.mock('@/services/ApiService', () => ({
  ApiService: {
    post: jest.fn(),
  },
}));

// Mock store
jest.mock('@/store/useAppStore', () => ({
  useAppStore: {
    getState: jest.fn(() => ({
      user: { id: 'test-user-id' },
    })),
  },
}));

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    analyticsService = AnalyticsService.getInstance();
    analyticsService.configure({ enabled: true, batchSize: 2, flushInterval: 1000 });
    jest.clearAllMocks();
  });

  afterEach(() => {
    analyticsService.destroy();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = AnalyticsService.getInstance();
      const instance2 = AnalyticsService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('track', () => {
    it('should track event with user ID', () => {
      const eventType = 'test_event';
      const eventData = { key: 'value' };
      const userId = 'test-user';

      analyticsService.track(eventType, eventData, userId);

      // Event should be queued
      expect(analyticsService['eventQueue']).toHaveLength(1);
      expect(analyticsService['eventQueue'][0]).toMatchObject({
        userId,
        eventType,
        eventData,
      });
    });

    it('should not track when disabled', () => {
      analyticsService.configure({ enabled: false });
      
      analyticsService.track('test_event', {}, 'user-id');
      
      expect(analyticsService['eventQueue']).toHaveLength(0);
    });

    it('should sanitize event data', () => {
      const eventData = {
        validString: 'test',
        validNumber: 123,
        validBoolean: true,
        validNull: null,
        invalidFunction: () => {},
        validArray: [1, 2, 3],
        longArray: Array(20).fill(1),
        nestedObject: { nested: 'value' },
      };

      analyticsService.track('test_event', eventData, 'user-id');

      const trackedEvent = analyticsService['eventQueue'][0];
      expect(trackedEvent.eventData).toEqual({
        validString: 'test',
        validNumber: 123,
        validBoolean: true,
        validNull: null,
        validArray: [1, 2, 3],
        longArray: Array(10).fill(1), // Should be truncated to 10 items
        nestedObject: { nested: 'value' },
      });
      expect(trackedEvent.eventData.invalidFunction).toBeUndefined();
    });
  });

  describe('flush', () => {
    it('should send events when flushed', async () => {
      const { ApiService } = require('@/services/ApiService');
      ApiService.post.mockResolvedValue({});

      analyticsService.track('event1', {}, 'user1');
      analyticsService.track('event2', {}, 'user2');

      await analyticsService.flush();

      expect(ApiService.post).toHaveBeenCalledWith('/analytics/events/batch', {
        events: expect.arrayContaining([
          expect.objectContaining({ eventType: 'event1', userId: 'user1' }),
          expect.objectContaining({ eventType: 'event2', userId: 'user2' }),
        ]),
      });
    });

    it('should handle API errors gracefully', async () => {
      const { ApiService } = require('@/services/ApiService');
      ApiService.post.mockRejectedValue(new Error('Network error'));

      analyticsService.track('test_event', {}, 'user-id');
      
      await expect(analyticsService.flush()).resolves.not.toThrow();
      
      // Events should be re-queued on error
      expect(analyticsService['eventQueue']).toHaveLength(1);
    });
  });

  describe('convenience functions', () => {
    it('should track app launch', () => {
      const userId = 'test-user';
      
      const { trackAppLaunch } = require('@/services/AnalyticsService');
      trackAppLaunch(userId);

      expect(analyticsService['eventQueue']).toHaveLength(1);
      expect(analyticsService['eventQueue'][0]).toMatchObject({
        userId,
        eventType: 'app_launch',
      });
    });

    it('should track vTPR events', () => {
      const userId = 'test-user';
      const keywordId = 'keyword-123';
      
      const { trackVTPRStart, trackVTPRAnswerCorrect } = require('@/services/AnalyticsService');
      
      trackVTPRStart(userId, keywordId);
      trackVTPRAnswerCorrect(userId, keywordId, 2, 5000);

      expect(analyticsService['eventQueue']).toHaveLength(2);
      expect(analyticsService['eventQueue'][0]).toMatchObject({
        userId,
        eventType: 'vtpr_start',
        eventData: { keywordId },
      });
      expect(analyticsService['eventQueue'][1]).toMatchObject({
        userId,
        eventType: 'vtpr_answer_correct',
        eventData: { keywordId, attempts: 2, timeSpent: 5000 },
      });
    });
  });
});