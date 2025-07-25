import { Request, Response } from 'express';
import { DramaController } from '@/controllers/DramaController';
import { DramaService } from '@/services/DramaService';

// Mock the DramaService
jest.mock('@/services/DramaService');
const MockedDramaService = DramaService as jest.MockedClass<typeof DramaService>;

describe('DramaController', () => {
  let dramaController: DramaController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    dramaController = new DramaController();
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('getDramasByInterest', () => {
    it('should return dramas for valid interest ID', async () => {
      // Arrange
      const interestId = 'interest-1';
      mockRequest.params = { interestId };

      const mockDramas = [
        {
          id: 'drama-1',
          title: '咖啡馆初遇',
          description: '在巴黎的一家咖啡馆，学会如何自然地与陌生人开始对话',
          duration: 60,
          videoUrl: '/videos/travel/coffee-shop-encounter.mp4',
          videoUrlNoSubs: '/videos/travel/coffee-shop-encounter-no-subs.mp4',
          subtitleUrl: '/videos/travel/coffee-shop-encounter.srt',
          thumbnailUrl: '/images/dramas/coffee-shop-thumb.jpg',
          difficulty: 'beginner' as const,
          sortOrder: 1,
          interest: {
            name: 'travel',
            displayName: '像当地人一样旅行'
          }
        }
      ];

      const mockServiceInstance = {
        getDramasByInterest: jest.fn().mockResolvedValue(mockDramas)
      };
      MockedDramaService.mockImplementation(() => mockServiceInstance as any);

      // Act
      await dramaController.getDramasByInterest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockServiceInstance.getDramasByInterest).toHaveBeenCalledWith(interestId);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          dramas: mockDramas
        }
      });
    });

    it('should handle missing interest ID', async () => {
      // Arrange
      mockRequest.params = {};

      // Act
      await dramaController.getDramasByInterest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Interest ID is required'
        })
      );
    });
  });

  describe('getDramaKeywords', () => {
    it('should return keywords for valid drama ID', async () => {
      // Arrange
      const dramaId = 'drama-1';
      mockRequest.params = { dramaId };

      const mockKeywords = [
        {
          id: 'keyword-1',
          word: 'excuse',
          translation: '打扰',
          audioUrl: '/audio/travel/excuse.mp3',
          subtitleStart: 2.5,
          subtitleEnd: 3.2,
          sortOrder: 1,
          videoClips: [
            {
              id: 'clip-1',
              videoUrl: '/clips/travel/excuse_correct.mp4',
              startTime: 0,
              endTime: 3,
              isCorrect: true,
              sortOrder: 1
            }
          ]
        }
      ];

      const mockServiceInstance = {
        getDramaKeywords: jest.fn().mockResolvedValue(mockKeywords)
      };
      MockedDramaService.mockImplementation(() => mockServiceInstance as any);

      // Act
      await dramaController.getDramaKeywords(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockServiceInstance.getDramaKeywords).toHaveBeenCalledWith(dramaId);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          keywords: mockKeywords
        }
      });
    });

    it('should handle missing drama ID', async () => {
      // Arrange
      mockRequest.params = {};

      // Act
      await dramaController.getDramaKeywords(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Drama ID is required'
        })
      );
    });

    it('should handle service errors', async () => {
      // Arrange
      const dramaId = 'drama-1';
      mockRequest.params = { dramaId };

      const mockError = new Error('Drama not found');
      const mockServiceInstance = {
        getDramaKeywords: jest.fn().mockRejectedValue(mockError)
      };
      MockedDramaService.mockImplementation(() => mockServiceInstance as any);

      // Act
      await dramaController.getDramaKeywords(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });
});
