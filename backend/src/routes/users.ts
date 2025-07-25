import { Router } from 'express';
import { UserController } from '@/controllers/UserController';
import {
  createValidationMiddleware,
  paginationMiddleware,
  sortingMiddleware,
  filteringMiddleware
} from './ApiRouter';
import Joi from 'joi';

const router = Router();
const userController = new UserController();

// 验证模式
const createAnonymousUserSchema = Joi.object({
  deviceId: Joi.string().required().min(1).max(255),
});

const getUserProgressSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  dramaId: Joi.string().uuid().required(),
});

// POST /api/v1/users/anonymous - 创建匿名用户
router.post(
  '/anonymous',
  createValidationMiddleware(createAnonymousUserSchema),
  userController.createAnonymousUser
);

// GET /api/v1/users/:userId/progress/:dramaId - 获取用户进度
router.get(
  '/:userId/progress/:dramaId',
  userController.getUserProgress
);

// GET /api/v1/users/:userId/stats - 获取用户统计信息
router.get(
  '/:userId/stats',
  userController.getUserStats
);

// GET /api/v1/users/active - 获取活跃用户列表
router.get(
  '/active',
  paginationMiddleware,
  sortingMiddleware(['updatedAt', 'createdAt']),
  userController.getActiveUsers
);

// PUT /api/v1/users/:userId/last-active - 更新用户最后活跃时间
router.put(
  '/:userId/last-active',
  userController.updateLastActive
);

export default router;
