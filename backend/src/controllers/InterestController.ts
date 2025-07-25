import { Request, Response, NextFunction } from 'express';
import { InterestService } from '@/services/InterestService';

export class InterestController {
  private interestService: InterestService;

  constructor() {
    this.interestService = new InterestService();
  }

  // 获取所有兴趣主题
  getAllInterests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const interests = await this.interestService.getAllInterests();

      res.json({
        success: true,
        data: {
          interests
        }
      });
    } catch (error) {
      next(error);
    }
  };
}
