/**
 * 用户服务接口
 * 定义用户相关的业务逻辑接口
 */

import { User } from '@prisma/client';

export interface CreateUserData {
  deviceId: string;
}

export interface UserWithProgress extends User {
  progressCount?: number;
  lastActiveAt?: Date;
}

export interface IUserService {
  /**
   * 创建匿名用户
   */
  createAnonymousUser(deviceId: string): Promise<User>;

  /**
   * 根据设备ID获取用户
   */
  getUserByDeviceId(deviceId: string): Promise<User>;

  /**
   * 根据用户ID获取用户
   */
  getUserById(userId: string): Promise<User>;

  /**
   * 获取用户进度统计
   */
  getUserProgress(userId: string, dramaId?: string): Promise<any>;

  /**
   * 更新用户最后活跃时间
   */
  updateLastActive(userId: string): Promise<User>;

  /**
   * 获取用户统计信息
   */
  getUserStats(userId: string): Promise<{
    totalDramas: number;
    completedDramas: number;
    totalKeywords: number;
    masteredKeywords: number;
    totalTimeSpent: number;
    streakDays: number;
  }>;

  /**
   * 检查用户是否存在
   */
  userExists(deviceId: string): Promise<boolean>;

  /**
   * 删除用户（软删除）
   */
  deleteUser(userId: string): Promise<void>;

  /**
   * 获取活跃用户列表
   */
  getActiveUsers(limit?: number): Promise<UserWithProgress[]>;
}
