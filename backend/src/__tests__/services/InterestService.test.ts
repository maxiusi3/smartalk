import { InterestService } from '@/services/InterestService';
import prisma from '@/utils/database';

// Mock the database
jest.mock('@/utils/database');
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('InterestService', () => {
  let interestService: InterestService;

  beforeEach(() => {
    interestService = new InterestService();
    jest.clearAllMocks();
  });

  describe('getAllInterests', () => {
    it('should return all active interests ordered by sortOrder', async () => {
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

      mockPrisma.interest.findMany.mockResolvedValue(mockInterests);

      // Act
      const result = await interestService.getAllInterests();

      // Assert
      expect(mockPrisma.interest.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true
        },
        orderBy: {
          sortOrder: 'asc'
        },
        select: {
          id: true,
          name: true,
          displayName: true,
          description: true,
          iconUrl: true,
          sortOrder: true
        }
      });
      expect(result).toEqual(mockInterests);
    });

    it('should handle database errors', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      mockPrisma.interest.findMany.mockRejectedValue(mockError);

      // Act & Assert
      await expect(interestService.getAllInterests()).rejects.toThrow('Failed to get interests');
    });

    it('should return empty array when no interests exist', async () => {
      // Arrange
      mockPrisma.interest.findMany.mockResolvedValue([]);

      // Act
      const result = await interestService.getAllInterests();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getInterestById', () => {
    it('should return interest with dramas when found', async () => {
      // Arrange
      const interestId = 'interest-1';
      const mockInterest = {
        id: interestId,
        name: 'travel',
        displayName: '像当地人一样旅行',
        description: '学会在旅行中自信地与当地人交流',
        iconUrl: '/images/interests/travel.png',
        sortOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        dramas: [
          {
            id: 'drama-1',
            title: '咖啡馆初遇',
            description: '在巴黎的一家咖啡馆，学会如何自然地与陌生人开始对话',
            duration: 60,
            videoUrl: '/videos/travel/coffee-shop-encounter.mp4',
            videoUrlNoSubs: '/videos/travel/coffee-shop-encounter-no-subs.mp4',
            subtitleUrl: '/videos/travel/coffee-shop-encounter.srt',
            thumbnailUrl: '/images/dramas/coffee-shop-thumb.jpg',
            difficulty: 'beginner',
            isActive: true,
            sortOrder: 1,
            interestId: interestId,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      };

      mockPrisma.interest.findUnique.mockResolvedValue(mockInterest);

      // Act
      const result = await interestService.getInterestById(interestId);

      // Assert
      expect(mockPrisma.interest.findUnique).toHaveBeenCalledWith({
        where: { id: interestId },
        include: {
          dramas: {
            where: {
              isActive: true
            },
            orderBy: {
              sortOrder: 'asc'
            }
          }
        }
      });
      expect(result).toEqual(mockInterest);
    });

    it('should throw error when interest not found', async () => {
      // Arrange
      const interestId = 'non-existent-id';
      mockPrisma.interest.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(interestService.getInterestById(interestId)).rejects.toThrow('Interest not found');
    });

    it('should handle database errors', async () => {
      // Arrange
      const interestId = 'interest-1';
      const mockError = new Error('Database connection failed');
      mockPrisma.interest.findUnique.mockRejectedValue(mockError);

      // Act & Assert
      await expect(interestService.getInterestById(interestId)).rejects.toThrow('Failed to get interest');
    });
  });
});
