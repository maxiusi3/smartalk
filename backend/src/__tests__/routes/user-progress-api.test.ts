import request from 'supertest';
import express from 'express';
import userRoutes from '@/routes/users';
import progressRoutes from '@/routes/progress';
import { errorHandler } from '@/middleware/errorHandler';

// Mock the services
jest.mock('@/services/UserService');
jest.mock('@/services/ProgressService');

const app = express();
app.use(express.json());
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use(errorHandler);

describe('User and Progress APIs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/users/anonymous', () => {
    it('should create anonymous user with correct structure', async () => {
      const deviceId = 'test-device-123';
      
      const response = await request(app)
        .post('/api/v1/users/anonymous')
        .send({ deviceId })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('deviceId');
      expect(response.body.data.user).toHaveProperty('createdAt');
      expect(response.body.data.user).toHaveProperty('updatedAt');
    });

    it('should return 400 for missing deviceId', async () => {
      const response = await request(app)
        .post('/api/v1/users/anonymous')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('message');
    });

    it('should return 400 for empty deviceId', async () => {
      const response = await request(app)
        .post('/api/v1/users/anonymous')
        .send({ deviceId: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle duplicate deviceId gracefully', async () => {
      const deviceId = 'duplicate-device-123';
      
      // First request
      const response1 = await request(app)
        .post('/api/v1/users/anonymous')
        .send({ deviceId })
        .expect(200);

      // Second request with same deviceId
      const response2 = await request(app)
        .post('/api/v1/users/anonymous')
        .send({ deviceId })
        .expect(200);

      expect(response1.body.success).toBe(true);
      expect(response2.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/progress/unlock', () => {
    it('should unlock progress with correct structure', async () => {
      const progressData = {
        userId: 'user-123',
        keywordId: 'keyword-456',
        status: 'unlocked',
        isCorrect: true
      };

      const response = await request(app)
        .post('/api/v1/progress/unlock')
        .send(progressData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('progress');
      expect(response.body.data.progress).toHaveProperty('id');
      expect(response.body.data.progress).toHaveProperty('userId');
      expect(response.body.data.progress).toHaveProperty('keywordId');
      expect(response.body.data.progress).toHaveProperty('status');
      expect(response.body.data.progress).toHaveProperty('attempts');
      expect(response.body.data.progress).toHaveProperty('correctAttempts');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/progress/unlock')
        .send({ userId: 'user-123' }) // Missing keywordId
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle different progress statuses', async () => {
      const statuses = ['unlocked', 'completed'];
      
      for (const status of statuses) {
        const response = await request(app)
          .post('/api/v1/progress/unlock')
          .send({
            userId: 'user-123',
            keywordId: 'keyword-456',
            status,
            isCorrect: true
          })
          .expect(200);

        expect(response.body.success).toBe(true);
      }
    });
  });

  describe('GET /api/v1/users/:userId/progress/:dramaId', () => {
    it('should get user progress with correct structure', async () => {
      const userId = 'user-123';
      const dramaId = 'drama-456';

      const response = await request(app)
        .get(`/api/v1/users/${userId}/progress/${dramaId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('progress');
      expect(response.body.data).toHaveProperty('stats');
      expect(Array.isArray(response.body.data.progress)).toBe(true);
      
      // Validate stats structure
      expect(response.body.data.stats).toHaveProperty('totalKeywords');
      expect(response.body.data.stats).toHaveProperty('unlockedKeywords');
      expect(response.body.data.stats).toHaveProperty('completedKeywords');
      expect(response.body.data.stats).toHaveProperty('totalAttempts');
      expect(response.body.data.stats).toHaveProperty('correctAttempts');
      expect(response.body.data.stats).toHaveProperty('accuracy');
    });

    it('should return 400 for invalid userId format', async () => {
      const response = await request(app)
        .get('/api/v1/users//progress/drama-456')
        .expect(404); // Route not found
    });

    it('should return 400 for invalid dramaId format', async () => {
      const response = await request(app)
        .get('/api/v1/users/user-123/progress/')
        .expect(404); // Route not found
    });
  });

  describe('API Response Format Validation', () => {
    it('should return consistent response format for user creation', async () => {
      const response = await request(app)
        .post('/api/v1/users/anonymous')
        .send({ deviceId: 'test-device' })
        .expect(200);

      // Validate response structure
      expect(response.body).toMatchObject({
        success: true,
        data: {
          user: expect.objectContaining({
            id: expect.any(String),
            deviceId: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          })
        }
      });

      // Validate headers
      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return consistent response format for progress unlock', async () => {
      const response = await request(app)
        .post('/api/v1/progress/unlock')
        .send({
          userId: 'user-123',
          keywordId: 'keyword-456',
          isCorrect: true
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          progress: expect.objectContaining({
            id: expect.any(String),
            userId: expect.any(String),
            keywordId: expect.any(String),
            status: expect.any(String),
            attempts: expect.any(Number),
            correctAttempts: expect.any(Number)
          })
        }
      });
    });

    it('should return consistent response format for progress retrieval', async () => {
      const response = await request(app)
        .get('/api/v1/users/user-123/progress/drama-456')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          progress: expect.any(Array),
          stats: expect.objectContaining({
            totalKeywords: expect.any(Number),
            unlockedKeywords: expect.any(Number),
            completedKeywords: expect.any(Number),
            accuracy: expect.any(Number)
          })
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/users/anonymous')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return proper error format for validation failures', async () => {
      const response = await request(app)
        .post('/api/v1/progress/unlock')
        .send({}) // Empty body
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          message: expect.any(String)
        }
      });
    });
  });
});
