import { Request, Response, NextFunction } from 'express';
import { BaseController } from './BaseController';
import { IUserService } from '@/services/interfaces/IUserService';
import { getService, SERVICE_NAMES } from '@/container/DIContainer';
import Joi from 'joi';

export class UserController extends BaseController {
  private userService: IUserService;

  constructor() {
    super();
    this.userService = getService<IUserService>(SERVICE_NAMES.USER_SERVICE);
  }

  /**
   * 创建匿名用户
   */
  createAnonymousUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = Joi.object({
        deviceId: Joi.string().required().min(1).max(255)
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return this.sendValidationError(res, 'Invalid device ID', error.details);
      }

      const { deviceId } = value;
      const user = await this.userService.createAnonymousUser(deviceId);

      this.sendCreated(res, {
        user: {
          id: user.id,
          deviceId: user.deviceId,
          createdAt: user.createdAt
        }
      }, 'Anonymous user created successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * 获取用户进度
   */
  getUserProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, dramaId } = req.params;

      if (!userId || !dramaId) {
        return this.sendValidationError(res, 'User ID and Drama ID are required');
      }

      const progress = await this.userService.getUserProgress(userId, dramaId);

      this.sendSuccess(res, { progress }, 'User progress retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * 获取用户统计信息
   */
  getUserStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return this.sendValidationError(res, 'User ID is required');
      }

      const stats = await this.userService.getUserStats(userId);

      this.sendSuccess(res, stats, 'User statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * 获取活跃用户列表
   */
  getActiveUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = req.pagination || { page: 1, limit: 10 };
      const users = await this.userService.getActiveUsers(limit);

      this.sendSuccess(res, users, 'Active users retrieved successfully', 200, {
        page,
        limit,
        total: users.length,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * 更新用户最后活跃时间
   */
  updateLastActive = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return this.sendValidationError(res, 'User ID is required');
      }

      const user = await this.userService.updateLastActive(userId);

      this.sendSuccess(res, { user }, 'User last active time updated successfully');
    } catch (error) {
      next(error);
    }
  };
}
