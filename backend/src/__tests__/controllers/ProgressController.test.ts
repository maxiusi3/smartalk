import { Request, Response } from 'express';
import { ProgressController } from '@/controllers/ProgressController';
import { ProgressService } from '@/services/ProgressService';

// Mock the ProgressService
jest.mock('@/services/ProgressService');
const MockedProgressService = ProgressService as jest.MockedClass<typeof ProgressService>;

describe('ProgressController', () => {
  let progressController: ProgressController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    progressController = new ProgressController();
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('unlockProgress', () => {
    it('should unlock progress successfully', async () => {
      // Arrange
      const requestData = {
        userId: 'user-1',
        keywordId: 'keyword-1',
        status: 'unlocked',
        isCorrect: true
      };
      mockRequest.body = requestData;

      const mockProgress = {
        id: 'progress-1',
        userId: 'user-1',
        keywordId: 'keyword-1',
        dramaId: 'drama-1',
        status: 'unlocked',
        attempts: 1,
        correctAttempts: 1,
        completedAt: null,
        keyword: {
          id: 'keyword-1',
          word: 'excuse',
          translation: '打扰',
          sortOrder: 1
        }
      };

      const mockServiceInstance = {
        unlockProgress: jest.fn().mockResolvedValue(mockProgress)
      };
      MockedProgressService.mockImplementation(() => mockServiceInstance as any);

      // Act
      await progressController.unlockProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockServiceInstance.unlockProgress).toHaveBeenCalledWith(requestData);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          progress: mockProgress
        }
      });
    });

    it('should handle missing required fields', async () => {
      // Arrange
      mockRequest.body = { userId: 'user-1' }; // Missing keywordId

      // Act
      await progressController.unlockProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User ID and Keyword ID are required'
        })
      );
    });

    it('should handle service errors', async () => {
      // Arrange
      const requestData = {
        userId: 'user-1',
        keywordId: 'keyword-1'
      };
      mockRequest.body = requestData;

      const mockError = new Error('User not found');
      const mockServiceInstance = {
        unlockProgress: jest.fn().mockRejectedValue(mockError)
      };
      MockedProgressService.mockImplementation(() => mockServiceInstance as any);

      // Act
      await progressController.unlockProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getUserProgress', () => {
    it('should get user progress successfully', async () => {
      // Arrange
      const userId = 'user-1';
      const dramaId = 'drama-1';
      mockRequest.params = { userId, dramaId };

      const mockProgressData = {
        progress: [
          {
            id: 'progress-1',
            userId: 'user-1',
            keywordId: 'keyword-1',
            dramaId: 'drama-1',
            status: 'completed',
            attempts: 2,
            correctAttempts: 2,
            completedAt: new Date(),
            keyword: {
              id: 'keyword-1',
              word: 'excuse',
              translation: '打扰',
              sortOrder: 1
            }
          }
        ],
        stats: {
          totalKeywords: 15,
          unlockedKeywords: 5,
          completedKeywords: 3,
          totalAttempts: 8,
          correctAttempts: 7,
          accuracy: 87.5
        }
      };

      const mockServiceInstance = {
        getUserProgress: jest.fn().mockResolvedValue(mockProgressData)
      };
      MockedProgressService.mockImplementation(() => mockServiceInstance as any);

      // Act
      await progressController.getUserProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockServiceInstance.getUserProgress).toHaveBeenCalledWith(userId, dramaId);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockProgressData
      });
    });

    it('should handle missing parameters', async () => {
      // Arrange
      mockRequest.params = { userId: 'user-1' }; // Missing dramaId

      // Act
      await progressController.getUserProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User ID and Drama ID are required'
        })
      );
    });

    it('should handle user not found', async () => {
      // Arrange
      const userId = 'non-existent-user';
      const dramaId = 'drama-1';
      mockRequest.params = { userId, dramaId };

      const mockError = new Error('User not found');
      mockError.statusCode = 404;
      const mockServiceInstance = {
        getUserProgress: jest.fn().mockRejectedValue(mockError)
      };
      MockedProgressService.mockImplementation(() => mockServiceInstance as any);

      // Act
      await progressController.getUserProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getUserOverallStats', () => {
    it('should get user overall statistics successfully', async () => {
      // Arrange
      const userId = 'user-1';
      mockRequest.params = { userId };

      const mockStats = {
        totalDramas: 3,
        totalKeywords: 45,
        completedKeywords: 25,
        totalAttempts: 60,
        correctAttempts: 52,
        accuracy: 86.67,
        streakDays: 5
      };

      const mockServiceInstance = {
        getUserOverallStats: jest.fn().mockResolvedValue(mockStats)
      };
      MockedProgressService.mockImplementation(() => mockServiceInstance as any);

      // Act
      await progressController.getUserOverallStats(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockServiceInstance.getUserOverallStats).toHaveBeenCalledWith(userId);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          stats: mockStats
        }
      });
    });

    it('should handle missing userId parameter', async () => {
      // Arrange
      mockRequest.params = {};

      // Act
      await progressController.getUserOverallStats(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User ID is required'
        })
      );
    });
  });
});
