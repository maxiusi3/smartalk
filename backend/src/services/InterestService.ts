import prisma from '@/utils/database';
import { createError } from '@/middleware/errorHandler';

export class InterestService {
  // 获取所有活跃的兴趣主题
  async getAllInterests() {
    try {
      const interests = await prisma.interest.findMany({
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

      return interests;
    } catch (error) {
      console.error('Error getting interests:', error);
      throw createError('Failed to get interests', 500);
    }
  }

  // 根据ID获取兴趣主题
  async getInterestById(id: string) {
    try {
      const interest = await prisma.interest.findUnique({
        where: { id },
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

      if (!interest) {
        throw createError('Interest not found', 404);
      }

      return interest;
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }
      console.error('Error getting interest by ID:', error);
      throw createError('Failed to get interest', 500);
    }
  }
}
