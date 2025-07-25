import { Request, Response } from 'express';
import { InterestController } from '@/controllers/InterestController';
import { InterestService } from '@/services/InterestService';

// Mock the InterestService
jest.mock('@/services/InterestService');
const MockedInterestService = InterestService as jest.MockedClass<typeof InterestService>;

describe('InterestController', () => {
  let interestController: InterestController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    interestController = new InterestController();
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('getAllInterests', () => {
    it('should return all interests successfully', async () => {
      // Arrange
      const mockInterests = [
        {
          id: 'interest-1',
          name: 'travel',
          displayName: '像当地人一样旅行',
          description: '学会在旅行中自信地与当地人交流',
          iconUrl: '/images/interests/travel.png',
          sortOrder: 1
        },
        {
          id: 'interest-2',
          name: 'movies',
          displayName: '无字幕刷原声大片',
          description: '享受不依赖字幕观看英文电影的乐趣',
          iconUrl: '/images/interests/movies.png',
          sortOrder: 2
        }
      ];

      const mockServiceInstance = {
        getAllInterests: jest.fn().mockResolvedValue(mockInterests)
      };
      MockedInterestService.mockImplementation(() => mockServiceInstance as any);

      // Act
      await interestController.getAllInterests(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockServiceInstance.getAllInterests).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          interests: mockInterests
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      const mockServiceInstance = {
        getAllInterests: jest.fn().mockRejectedValue(mockError)
      };
      MockedInterestService.mockImplementation(() => mockServiceInstance as any);

      // Act
      await interestController.getAllInterests(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockServiceInstance.getAllInterests).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return empty array when no interests exist', async () => {
      // Arrange
      const mockServiceInstance = {
        getAllInterests: jest.fn().mockResolvedValue([])
      };
      MockedInterestService.mockImplementation(() => mockServiceInstance as any);

      // Act
      await interestController.getAllInterests(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          interests: []
        }
      });
    });
  });
});
