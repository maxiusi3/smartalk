import prisma from '@/utils/database';
import { createError } from '@/middleware/errorHandler';

export class ProgressService {
  // 更新词汇学习进度
  async updateKeywordProgress(userId: string, dramaId: string, keywordId: string, isCorrect: boolean) {
    try {
      // 查找或创建进度记录
      let progress = await prisma.userProgress.findUnique({
        where: {
          userId_dramaId_keywordId: {
            userId,
            dramaId,
            keywordId
          }
        }
      });

      if (!progress) {
        // 创建新的进度记录
        progress = await prisma.userProgress.create({
          data: {
            userId,
            dramaId,
            keywordId,
            status: 'unlocked',
            attempts: 1,
            correctAttempts: isCorrect ? 1 : 0
          }
        });
      } else {
        // 更新现有进度
        progress = await prisma.userProgress.update({
          where: {
            id: progress.id
          },
          data: {
            attempts: progress.attempts + 1,
            correctAttempts: isCorrect ? progress.correctAttempts + 1 : progress.correctAttempts,
            status: isCorrect ? 'completed' : progress.status,
            completedAt: isCorrect ? new Date() : progress.completedAt
          }
        });
      }

      // 检查是否完成了所有词汇（达成里程碑）
      const totalKeywords = await prisma.keyword.count({
        where: { dramaId }
      });

      const completedKeywords = await prisma.userProgress.count({
        where: {
          userId,
          dramaId,
          status: 'completed'
        }
      });

      const isMilestoneReached = completedKeywords >= totalKeywords;

      return {
        progress,
        milestone: {
          totalKeywords,
          completedKeywords,
          isReached: isMilestoneReached
        }
      };
    } catch (error) {
      console.error('Error updating keyword progress:', error);
      throw createError('Failed to update progress', 500);
    }
  }

  // 获取用户在特定剧集的整体进度
  async getDramaProgress(userId: string, dramaId: string) {
    try {
      const progress = await prisma.userProgress.findMany({
        where: {
          userId,
          dramaId
        },
        include: {
          keyword: {
            select: {
              id: true,
              word: true,
              translation: true,
              sortOrder: true
            }
          }
        },
        orderBy: {
          keyword: {
            sortOrder: 'asc'
          }
        }
      });

      const totalKeywords = await prisma.keyword.count({
        where: { dramaId }
      });

      const completedKeywords = progress.filter((p: any) => p.status === 'completed').length;
      const unlockedKeywords = progress.filter((p: any) => p.status === 'unlocked').length;

      return {
        progress,
        summary: {
          totalKeywords,
          completedKeywords,
          unlockedKeywords,
          lockedKeywords: totalKeywords - completedKeywords - unlockedKeywords,
          completionRate: totalKeywords > 0 ? (completedKeywords / totalKeywords) * 100 : 0
        }
      };
    } catch (error) {
      console.error('Error getting drama progress:', error);
      throw createError('Failed to get drama progress', 500);
    }
  }
}
