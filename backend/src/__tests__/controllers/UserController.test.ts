import { Request, Response } from 'express';
import { UserController } from '@/controllers/UserController';
import { UserService } from '@/services/UserService';

// Mock the UserService
jest.mock('@/services/UserService');
const MockedUserService = UserService as jest.MockedClass<typeof UserService>;

describe('UserController', () => {
  let userController: UserController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    userController = new UserController();
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('createAnonymousUser', () => {
    it('should create anonymous user successfully', async () => {
      // Arrange
      const deviceId = 'device-123';
      mockRequest.body = { deviceId };

      const mockUser = {
        id: 'user-1',
        deviceId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockServiceInstance = {
        createAnonymousUser: jest.fn().mockResolvedValue(mockUser)
      };
      MockedUserService.mockImplementation(() => mockServiceInstance as any);

      // Act
      await userController.createAnonymousUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockServiceInstance.createAnonymousUser).toHaveBeenCalledWith({ deviceId });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: mockUser
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle missing deviceId', async () => {
      // Arrange
      mockRequest.body = {};

      // Act
      await userController.createAnonymousUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Device ID is required'
        })
      );
    });

    it('should handle invalid deviceId format', async () => {
      // Arrange
      mockRequest.body = { deviceId: '' };

      // Act
      await userController.createAnonymousUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Device ID is required'
        })
      );
    });

    it('should handle service errors', async () => {
      // Arrange
      const deviceId = 'device-123';
      mockRequest.body = { deviceId };

      const mockError = new Error('Database connection failed');
      const mockServiceInstance = {
        createAnonymousUser: jest.fn().mockRejectedValue(mockError)
      };
      MockedUserService.mockImplementation(() => mockServiceInstance as any);

      // Act
      await userController.createAnonymousUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return existing user for duplicate deviceId', async () => {
      // Arrange
      const deviceId = 'device-123';
      mockRequest.body = { deviceId };

      const existingUser = {
        id: 'user-1',
        deviceId,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      };

      const mockServiceInstance = {
        createAnonymousUser: jest.fn().mockResolvedValue(existingUser)
      };
      MockedUserService.mockImplementation(() => mockServiceInstance as any);

      // Act
      await userController.createAnonymousUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: existingUser
        }
      });
    });
  });

  describe('getUserById', () => {
    it('should get user by ID successfully', async () => {
      // Arrange
      const userId = 'user-1';
      mockRequest.params = { userId };

      const mockUser = {
        id: userId,
        deviceId: 'device-123',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockServiceInstance = {
        getUserById: jest.fn().mockResolvedValue(mockUser)
      };
      MockedUserService.mockImplementation(() => mockServiceInstance as any);

      // Act
      await userController.getUserById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockServiceInstance.getUserById).toHaveBeenCalledWith(userId);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: mockUser
        }
      });
    });

    it('should handle user not found', async () => {
      // Arrange
      const userId = 'non-existent-user';
      mockRequest.params = { userId };

      const mockServiceInstance = {
        getUserById: jest.fn().mockResolvedValue(null)
      };
      MockedUserService.mockImplementation(() => mockServiceInstance as any);

      // Act
      await userController.getUserById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User not found'
        })
      );
    });

    it('should handle missing userId parameter', async () => {
      // Arrange
      mockRequest.params = {};

      // Act
      await userController.getUserById(
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

  describe('getUserStats', () => {
    it('should get user statistics successfully', async () => {
      // Arrange
      const userId = 'user-1';
      mockRequest.params = { userId };

      const mockStats = {
        totalProgress: 15,
        completedKeywords: 8,
        totalAttempts: 25,
        correctAttempts: 20
      };

      const mockServiceInstance = {
        getUserStats: jest.fn().mockResolvedValue(mockStats)
      };
      MockedUserService.mockImplementation(() => mockServiceInstance as any);

      // Act
      await userController.getUserStats(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockServiceInstance.getUserStats).toHaveBeenCalledWith(userId);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          stats: mockStats
        }
      });
    });
  });
});
