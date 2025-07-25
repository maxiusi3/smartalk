import request from 'supertest';
import app from '../../index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('AnalyticsController', () => {
  let testUserId: string;

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        deviceId: 'test-device-analytics',
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.analyticsEvent.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.user.delete({
      where: { id: testUserId },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/analytics/events', () => {
    it('should record a single analytics event', async () => {
      const eventData = {
        userId: testUserId,
        eventType: 'vtpr_start',
        eventData: {
          keywordId: 'keyword-123',
          timestamp: Date.now(),
        },
      };

      const response = await request(app)
        .post('/api/v1/analytics/events')
        .send(eventData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: expect.any(String),
          userId: testUserId,
          eventType: 'vtpr_start',
          eventData: eventData.eventData,
        },
      });

      // Verify event was stored in database
      const storedEvent = await prisma.analyticsEvent.findFirst({
        where: {
          userId: testUserId,
          eventType: 'vtpr_start',
        },
      });

      expect(storedEvent).toBeTruthy();
      expect(storedEvent?.eventData).toEqual(eventData.eventData);
    });

    it('should handle batch events', async () => {
      const batchData = {
        events: [
          {
            userId: testUserId,
            eventType: 'vtpr_answer_correct',
            eventData: { keywordId: 'keyword-1', attempts: 1 },
          },
          {
            userId: testUserId,
            eventType: 'vtpr_answer_incorrect',
            eventData: { keywordId: 'keyword-2', attempts: 2 },
          },
        ],
      };

      const response = await request(app)
        .post('/api/v1/analytics/events/batch')
        .send(batchData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          processed: 2,
          events: expect.arrayContaining([
            expect.objectContaining({
              eventType: 'vtpr_answer_correct',
            }),
            expect.objectContaining({
              eventType: 'vtpr_answer_incorrect',
            }),
          ]),
        },
      });

      // Verify events were stored
      const storedEvents = await prisma.analyticsEvent.findMany({
        where: {
          userId: testUserId,
          eventType: {
            in: ['vtpr_answer_correct', 'vtpr_answer_incorrect'],
          },
        },
      });

      expect(storedEvents).toHaveLength(2);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        eventType: 'test_event',
        // Missing userId
      };

      const response = await request(app)
        .post('/api/v1/analytics/events')
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.objectContaining({
          message: expect.stringContaining('userId'),
        }),
      });
    });

    it('should handle invalid user ID', async () => {
      const eventData = {
        userId: 'non-existent-user',
        eventType: 'test_event',
        eventData: {},
      };

      const response = await request(app)
        .post('/api/v1/analytics/events')
        .send(eventData)
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.objectContaining({
          message: expect.stringContaining('User not found'),
        }),
      });
    });

    it('should sanitize event data', async () => {
      const eventData = {
        userId: testUserId,
        eventType: 'test_event',
        eventData: {
          validField: 'valid value',
          longString: 'x'.repeat(1000), // Should be truncated
          deepObject: {
            level1: {
              level2: {
                level3: 'too deep', // Should be flattened or limited
              },
            },
          },
        },
      };

      const response = await request(app)
        .post('/api/v1/analytics/events')
        .send(eventData)
        .expect(201);

      expect(response.body.success).toBe(true);
      
      // Verify data was sanitized appropriately
      const storedEvent = await prisma.analyticsEvent.findFirst({
        where: {
          userId: testUserId,
          eventType: 'test_event',
        },
        orderBy: { timestamp: 'desc' },
      });

      expect(storedEvent?.eventData).toHaveProperty('validField', 'valid value');
    });
  });

  describe('GET /api/v1/analytics/events/:userId', () => {
    beforeEach(async () => {
      // Create test events
      await prisma.analyticsEvent.createMany({
        data: [
          {
            userId: testUserId,
            eventType: 'onboarding_start',
            eventData: { timestamp: Date.now() },
          },
          {
            userId: testUserId,
            eventType: 'onboarding_complete',
            eventData: { duration: 30000 },
          },
          {
            userId: testUserId,
            eventType: 'vtpr_start',
            eventData: { keywordId: 'keyword-1' },
          },
        ],
      });
    });

    afterEach(async () => {
      await prisma.analyticsEvent.deleteMany({
        where: { userId: testUserId },
      });
    });

    it('should retrieve user events', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/events/${testUserId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          events: expect.arrayContaining([
            expect.objectContaining({
              eventType: 'onboarding_start',
            }),
            expect.objectContaining({
              eventType: 'onboarding_complete',
            }),
            expect.objectContaining({
              eventType: 'vtpr_start',
            }),
          ]),
          total: 3,
        },
      });
    });

    it('should filter events by type', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/events/${testUserId}?eventType=vtpr_start`)
        .expect(200);

      expect(response.body.data.events).toHaveLength(1);
      expect(response.body.data.events[0]).toMatchObject({
        eventType: 'vtpr_start',
      });
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/events/${testUserId}?limit=2&offset=1`)
        .expect(200);

      expect(response.body.data.events).toHaveLength(2);
      expect(response.body.data.total).toBe(3);
    });

    it('should handle non-existent user', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/events/non-existent-user')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.objectContaining({
          message: expect.stringContaining('User not found'),
        }),
      });
    });
  });

  describe('GET /api/v1/analytics/stats/:userId', () => {
    beforeEach(async () => {
      // Create comprehensive test data for stats
      const events = [
        { eventType: 'onboarding_start', eventData: {} },
        { eventType: 'onboarding_complete', eventData: { duration: 60000 } },
        { eventType: 'vtpr_start', eventData: { keywordId: 'keyword-1' } },
        { eventType: 'vtpr_answer_correct', eventData: { keywordId: 'keyword-1', attempts: 1 } },
        { eventType: 'vtpr_start', eventData: { keywordId: 'keyword-2' } },
        { eventType: 'vtpr_answer_incorrect', eventData: { keywordId: 'keyword-2', attempts: 1 } },
        { eventType: 'vtpr_answer_correct', eventData: { keywordId: 'keyword-2', attempts: 2 } },
        { eventType: 'magic_moment_complete', eventData: { dramaId: 'drama-1' } },
      ];

      await prisma.analyticsEvent.createMany({
        data: events.map(event => ({
          userId: testUserId,
          ...event,
        })),
      });
    });

    afterEach(async () => {
      await prisma.analyticsEvent.deleteMany({
        where: { userId: testUserId },
      });
    });

    it('should calculate user learning statistics', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/stats/${testUserId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          totalEvents: 8,
          onboardingCompleted: true,
          vtprSessions: 2,
          vtprAccuracy: expect.any(Number),
          magicMomentReached: true,
          learningTime: expect.any(Number),
          keywordsLearned: expect.any(Number),
        },
      });

      // Verify accuracy calculation
      expect(response.body.data.vtprAccuracy).toBeCloseTo(0.67, 2); // 2 correct out of 3 attempts
    });

    it('should handle user with no events', async () => {
      // Create a new user with no events
      const newUser = await prisma.user.create({
        data: { deviceId: 'test-device-no-events' },
      });

      const response = await request(app)
        .get(`/api/v1/analytics/stats/${newUser.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          totalEvents: 0,
          onboardingCompleted: false,
          vtprSessions: 0,
          vtprAccuracy: 0,
          magicMomentReached: false,
          learningTime: 0,
          keywordsLearned: 0,
        },
      });

      // Clean up
      await prisma.user.delete({ where: { id: newUser.id } });
    });
  });
});