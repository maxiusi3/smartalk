import { Request, Response, NextFunction } from 'express';
import { ProgressService } from '@/services/ProgressService';
import { createError } from '@/middleware/errorHandler';
import Joi from 'joi';

export class ProgressController {
  private progressService: ProgressService;

  constructor() {
    this.progressService = new ProgressService();
  }

  // 解锁词汇进度
  unlockKeyword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = Joi.object({
        userId: Joi.string().required(),
        dramaId: Joi.string().required(),
        keywordId: Joi.string().required(),
        isCorrect: Joi.boolean().required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        throw createError(error.details[0].message, 400);
      }

      const { userId, dramaId, keywordId, isCorrect } = value;
      const progress = await this.progressService.updateKeywordProgress(
        userId, 
        dramaId, 
        keywordId, 
        isCorrect
      );

      res.json({
        success: true,
        data: {
          progress
        }
      });
    } catch (error) {
      next(error);
    }
  };
}
