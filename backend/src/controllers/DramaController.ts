import { Request, Response, NextFunction } from 'express';
import { DramaService } from '@/services/DramaService';
import { createError } from '@/middleware/errorHandler';

export class DramaController {
  private dramaService: DramaService;

  constructor() {
    this.dramaService = new DramaService();
  }

  // 根据兴趣获取剧集
  getDramasByInterest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { interestId } = req.params;
      
      if (!interestId) {
        throw createError('Interest ID is required', 400);
      }

      const dramas = await this.dramaService.getDramasByInterest(interestId);

      res.json({
        success: true,
        data: {
          dramas
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // 获取剧集的词汇数据
  getDramaKeywords = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { dramaId } = req.params;
      
      if (!dramaId) {
        throw createError('Drama ID is required', 400);
      }

      const keywords = await this.dramaService.getDramaKeywords(dramaId);

      res.json({
        success: true,
        data: {
          keywords
        }
      });
    } catch (error) {
      next(error);
    }
  };
}
