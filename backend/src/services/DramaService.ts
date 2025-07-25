import prisma from '@/utils/database';
import { createError } from '@/middleware/errorHandler';

export class DramaService {
  // 根据兴趣获取剧集
  async getDramasByInterest(interestId: string) {
    try {
      const dramas = await prisma.drama.findMany({
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

      return dramas;
    } catch (error) {
      console.error('Error getting dramas by interest:', error);
      throw createError('Failed to get dramas', 500);
    }
  }

  // 获取剧集的词汇数据
  async getDramaKeywords(dramaId: string) {
    try {
      const keywords = await prisma.keyword.findMany({
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

      return keywords;
    } catch (error) {
      console.error('Error getting drama keywords:', error);
      throw createError('Failed to get keywords', 500);
    }
  }

  // 根据ID获取剧集详情
  async getDramaById(id: string) {
    try {
      const drama = await prisma.drama.findUnique({
        where: { id },
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

      if (!drama) {
        throw createError('Drama not found', 404);
      }

      return drama;
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }
      console.error('Error getting drama by ID:', error);
      throw createError('Failed to get drama', 500);
    }
  }
}
