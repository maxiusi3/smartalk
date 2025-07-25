/**
 * 优化的数据库服务层
 * 提供高性能的数据库操作和查询优化
 */

import { PrismaClient } from '@prisma/client';
import { optimizedQuery } from '../utils/DatabaseOptimizer';
import { logger } from '../../shared/utils/Logger';

export class OptimizedDatabaseService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * 优化的用户查询
   */
  async findUserById(id: string): Promise<any> {
    return optimizedQuery.execute(
      'findUserById',
      () => this.prisma.user.findUnique({
        where: { id },
        include: {
          profile: true,
          interests: true,
        },
      }),
      `user:${id}`,
      { id }
    );
  }

  async findUserByEmail(email: string): Promise<any> {
    return optimizedQuery.execute(
      'findUserByEmail',
      () => this.prisma.user.findUnique({
        where: { email },
        include: {
          profile: true,
        },
      }),
      `user:email:${email}`,
      { email }
    );
  }

  /**
   * 优化的故事内容查询
   */
  async getStoryContent(storyId: string): Promise<any> {
    return optimizedQuery.execute(
      'getStoryContent',
      () => this.prisma.story.findUnique({
        where: { id: storyId },
        include: {
          keywords: {
            orderBy: { order: 'asc' },
          },
          videos: {
            orderBy: { order: 'asc' },
          },
          chapters: {
            orderBy: { order: 'asc' },
            include: {
              keywords: true,
            },
          },
        },
      }),
      `story:${storyId}`,
      { storyId }
    );
  }

  async getStoriesByInterest(interest: string, limit: number = 10): Promise<any[]> {
    return optimizedQuery.execute(
      'getStoriesByInterest',
      () => this.prisma.story.findMany({
        where: {
          interest: {
            equals: interest,
            mode: 'insensitive',
          },
          published: true,
        },
        include: {
          keywords: {
            select: {
              id: true,
              word: true,
              difficulty: true,
            },
          },
          _count: {
            select: {
              videos: true,
              chapters: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      }),
      `stories:interest:${interest}:${limit}`,
      { interest, limit }
    );
  }

  /**
   * 优化的学习进度查询
   */
  async getUserProgress(userId: string, storyId?: string): Promise<any> {
    const cacheKey = storyId ? `progress:${userId}:${storyId}` : `progress:${userId}`;
    
    return optimizedQuery.execute(
      'getUserProgress',
      () => this.prisma.userProgress.findMany({
        where: {
          userId,
          ...(storyId && { storyId }),
        },
        include: {
          story: {
            select: {
              id: true,
              title: true,
              interest: true,
            },
          },
          completedKeywords: {
            include: {
              keyword: {
                select: {
                  id: true,
                  word: true,
                  difficulty: true,
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      }),
      cacheKey,
      { userId, storyId }
    );
  }

  /**
   * 优化的关键词查询
   */
  async getKeywordsByStory(storyId: string): Promise<any[]> {
    return optimizedQuery.execute(
      'getKeywordsByStory',
      () => this.prisma.keyword.findMany({
        where: { storyId },
        include: {
          videos: {
            select: {
              id: true,
              url: true,
              type: true,
            },
          },
        },
        orderBy: {
          order: 'asc',
        },
      }),
      `keywords:story:${storyId}`,
      { storyId }
    );
  }

  /**
   * 优化的视频查询
   */
  async getVideosByKeyword(keywordId: string): Promise<any[]> {
    return optimizedQuery.execute(
      'getVideosByKeyword',
      () => this.prisma.video.findMany({
        where: { keywordId },
        orderBy: {
          order: 'asc',
        },
      }),
      `videos:keyword:${keywordId}`,
      { keywordId }
    );
  }

  /**
   * 批量查询优化
   */
  async batchGetUsers(userIds: string[]): Promise<any[]> {
    if (userIds.length === 0) return [];

    return optimizedQuery.execute(
      'batchGetUsers',
      () => this.prisma.user.findMany({
        where: {
          id: {
            in: userIds,
          },
        },
        include: {
          profile: true,
        },
      }),
      `users:batch:${userIds.sort().join(',')}`,
      { userIds }
    );
  }

  async batchGetStories(storyIds: string[]): Promise<any[]> {
    if (storyIds.length === 0) return [];

    return optimizedQuery.execute(
      'batchGetStories',
      () => this.prisma.story.findMany({
        where: {
          id: {
            in: storyIds,
          },
        },
        include: {
          keywords: {
            select: {
              id: true,
              word: true,
              difficulty: true,
            },
          },
        },
      }),
      `stories:batch:${storyIds.sort().join(',')}`,
      { storyIds }
    );
  }

  /**
   * 聚合查询优化
   */
  async getStoryStatistics(storyId: string): Promise<any> {
    return optimizedQuery.execute(
      'getStoryStatistics',
      async () => {
        const [story, keywordCount, videoCount, userCount] = await Promise.all([
          this.prisma.story.findUnique({
            where: { id: storyId },
            select: {
              id: true,
              title: true,
              interest: true,
              difficulty: true,
              createdAt: true,
            },
          }),
          this.prisma.keyword.count({
            where: { storyId },
          }),
          this.prisma.video.count({
            where: {
              keyword: {
                storyId,
              },
            },
          }),
          this.prisma.userProgress.count({
            where: { storyId },
          }),
        ]);

        return {
          ...story,
          statistics: {
            keywordCount,
            videoCount,
            userCount,
          },
        };
      },
      `story:stats:${storyId}`,
      { storyId }
    );
  }

  async getUserStatistics(userId: string): Promise<any> {
    return optimizedQuery.execute(
      'getUserStatistics',
      async () => {
        const [user, progressCount, completedStories, totalKeywords] = await Promise.all([
          this.prisma.user.findUnique({
            where: { id: userId },
            select: {
              id: true,
              email: true,
              createdAt: true,
            },
          }),
          this.prisma.userProgress.count({
            where: { userId },
          }),
          this.prisma.userProgress.count({
            where: {
              userId,
              completed: true,
            },
          }),
          this.prisma.userKeywordProgress.count({
            where: { userId },
          }),
        ]);

        return {
          ...user,
          statistics: {
            progressCount,
            completedStories,
            totalKeywords,
            completionRate: progressCount > 0 ? Math.round((completedStories / progressCount) * 100) : 0,
          },
        };
      },
      `user:stats:${userId}`,
      { userId }
    );
  }

  /**
   * 缓存失效处理
   */
  async invalidateUserCache(userId: string): Promise<void> {
    optimizedQuery.clearCache(`user:${userId}`);
    optimizedQuery.clearCache(`progress:${userId}`);
    optimizedQuery.clearCache(`user:stats:${userId}`);
    
    logger.info('User cache invalidated', { userId });
  }

  async invalidateStoryCache(storyId: string): Promise<void> {
    optimizedQuery.clearCache(`story:${storyId}`);
    optimizedQuery.clearCache(`keywords:story:${storyId}`);
    optimizedQuery.clearCache(`story:stats:${storyId}`);
    
    logger.info('Story cache invalidated', { storyId });
  }

  /**
   * 预热常用查询缓存
   */
  async warmupCache(): Promise<void> {
    logger.info('Starting database cache warmup');

    try {
      // 预热热门故事
      const popularStories = await this.prisma.story.findMany({
        where: { published: true },
        select: { id: true, interest: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      const warmupQueries = [];

      // 为每个热门故事预热缓存
      for (const story of popularStories) {
        warmupQueries.push({
          name: 'getStoryContent',
          fn: () => this.getStoryContent(story.id),
          cacheKey: `story:${story.id}`,
        });

        warmupQueries.push({
          name: 'getKeywordsByStory',
          fn: () => this.getKeywordsByStory(story.id),
          cacheKey: `keywords:story:${story.id}`,
        });
      }

      // 预热兴趣分类查询
      const interests = ['travel', 'movie', 'workplace'];
      for (const interest of interests) {
        warmupQueries.push({
          name: 'getStoriesByInterest',
          fn: () => this.getStoriesByInterest(interest),
          cacheKey: `stories:interest:${interest}:10`,
        });
      }

      await optimizedQuery.warmup(warmupQueries);
      
      logger.info('Database cache warmup completed', { 
        queriesWarmed: warmupQueries.length 
      });
    } catch (error) {
      logger.error('Database cache warmup failed', {}, error as Error);
    }
  }
}

export default OptimizedDatabaseService;
