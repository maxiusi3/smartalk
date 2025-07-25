import { DramaService } from '@/services/DramaService';
import prisma from '@/utils/database';

// Mock the database
jest.mock('@/utils/database');
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('DramaService', () => {
  let dramaService: DramaService;

  beforeEach(() => {
    dramaService = new DramaService();
    jest.clearAllMocks();
  });

  describe('getDramasByInterest', () => {
    it('should return dramas for valid interest ID', async () => {
      // Arrange
      const interestId = 'interest-1';
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
          difficulty: 'beginner',
          sortOrder: 1,
          interest: {
            name: 'travel',
            displayName: '像当地人一样旅行'
          }
        }
      ];

      mockPrisma.drama.findMany.mockResolvedValue(mockDramas);

      // Act
      const result = await dramaService.getDramasByInterest(interestId);

      // Assert
      expect(mockPrisma.drama.findMany).toHaveBeenCalledWith({
        where: {
          interestId,
          isActive: true
        },
        orderBy: {
          sortOrder: 'asc'
        },
        select: {
          id: true,
          title: true,
          description: true,
          duration: true,
          videoUrl: true,
          videoUrlNoSubs: true,
          subtitleUrl: true,
          thumbnailUrl: true,
          difficulty: true,
          sortOrder: true,
          interest: {
            select: {
              name: true,
              displayName: true
            }
          }
        }
      });
      expect(result).toEqual(mockDramas);
    });

    it('should return empty array when no dramas exist for interest', async () => {
      // Arrange
      const interestId = 'interest-1';
      mockPrisma.drama.findMany.mockResolvedValue([]);

      // Act
      const result = await dramaService.getDramasByInterest(interestId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      // Arrange
      const interestId = 'interest-1';
      const mockError = new Error('Database connection failed');
      mockPrisma.drama.findMany.mockRejectedValue(mockError);

      // Act & Assert
      await expect(dramaService.getDramasByInterest(interestId)).rejects.toThrow('Failed to get dramas');
    });
  });

  describe('getDramaKeywords', () => {
    it('should return keywords with video clips for valid drama ID', async () => {
      // Arrange
      const dramaId = 'drama-1';
      const mockKeywords = [
        {
          id: 'keyword-1',
          word: 'excuse',
          translation: '打扰',
          audioUrl: '/audio/travel/excuse.mp3',
          subtitleStart: 2.5,
          subtitleEnd: 3.2,
          sortOrder: 1,
          dramaId: dramaId,
          createdAt: new Date(),
          updatedAt: new Date(),
          videoClips: [
            {
              id: 'clip-1',
              videoUrl: '/clips/travel/excuse_correct.mp4',
              startTime: 0,
              endTime: 3,
              isCorrect: true,
              sortOrder: 1,
              keywordId: 'keyword-1',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ]
        }
      ];

      mockPrisma.keyword.findMany.mockResolvedValue(mockKeywords);

      // Act
      const result = await dramaService.getDramaKeywords(dramaId);

      // Assert
      expect(mockPrisma.keyword.findMany).toHaveBeenCalledWith({
        where: {
          dramaId
        },
        orderBy: {
          sortOrder: 'asc'
        },
        include: {
          videoClips: {
            orderBy: {
              sortOrder: 'asc'
            },
            select: {
              id: true,
              videoUrl: true,
              startTime: true,
              endTime: true,
              isCorrect: true,
              sortOrder: true
            }
          }
        }
      });
      expect(result).toEqual(mockKeywords);
    });

    it('should return empty array when no keywords exist for drama', async () => {
      // Arrange
      const dramaId = 'drama-1';
      mockPrisma.keyword.findMany.mockResolvedValue([]);

      // Act
      const result = await dramaService.getDramaKeywords(dramaId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      // Arrange
      const dramaId = 'drama-1';
      const mockError = new Error('Database connection failed');
      mockPrisma.keyword.findMany.mockRejectedValue(mockError);

      // Act & Assert
      await expect(dramaService.getDramaKeywords(dramaId)).rejects.toThrow('Failed to get keywords');
    });
  });

  describe('getDramaById', () => {
    it('should return drama with keywords when found', async () => {
      // Arrange
      const dramaId = 'drama-1';
      const mockDrama = {
        id: dramaId,
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
        interestId: 'interest-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        interest: {
          id: 'interest-1',
          name: 'travel',
          displayName: '像当地人一样旅行',
          description: '学会在旅行中自信地与当地人交流',
          iconUrl: '/images/interests/travel.png',
          isActive: true,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        keywords: []
      };

      mockPrisma.drama.findUnique.mockResolvedValue(mockDrama);

      // Act
      const result = await dramaService.getDramaById(dramaId);

      // Assert
      expect(mockPrisma.drama.findUnique).toHaveBeenCalledWith({
        where: { id: dramaId },
        include: {
          interest: true,
          keywords: {
            orderBy: {
              sortOrder: 'asc'
            },
            include: {
              videoClips: {
                orderBy: {
                  sortOrder: 'asc'
                }
              }
            }
          }
        }
      });
      expect(result).toEqual(mockDrama);
    });

    it('should throw error when drama not found', async () => {
      // Arrange
      const dramaId = 'non-existent-id';
      mockPrisma.drama.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(dramaService.getDramaById(dramaId)).rejects.toThrow('Drama not found');
    });
  });
});
