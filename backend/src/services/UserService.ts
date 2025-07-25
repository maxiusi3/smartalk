import { User } from '@prisma/client';
import { createError } from '@/middleware/errorHandler';
import { IUserService } from './interfaces/IUserService';
import { IUserRepository } from '@/repositories/interfaces/IUserRepository';

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  /**
   * 创建匿名用户
   */
  async createAnonymousUser(deviceId: string): Promise<User> {
    try {
      // 检查是否已存在该设备ID的用户
      const existingUser = await this.userRepository.findByDeviceId(deviceId);

      if (existingUser) {
        return existingUser;
      }

      // 创建新用户
      const user = await this.userRepository.create({
        deviceId,
      });

      return user;
    } catch (error) {
      console.error('Error creating anonymous user:', error);
      throw createError('Failed to create user', 500);
    }
  }

  /**
   * 根据设备ID获取用户
   */
  async getUserByDeviceId(deviceId: string): Promise<User> {
    try {
      const user = await this.userRepository.findByDeviceId(deviceId);

      if (!user) {
        throw createError('User not found', 404);
      }

      return user;
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }
      console.error('Error getting user by device ID:', error);
      throw createError('Failed to get user', 500);
    }
  }

  /**
   * 根据用户ID获取用户
   */
  async getUserById(userId: string): Promise<User> {
    try {
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw createError('User not found', 404);
      }

      return user;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw createError('Failed to get user', 500);
    }
  }

  /**
   * 获取用户进度
   */
  async getUserProgress(userId: string, dramaId?: string): Promise<any> {
    try {
      const stats = await this.userRepository.getUserProgressStats(userId);
      return stats;
    } catch (error) {
      console.error('Error getting user progress:', error);
      throw createError('Failed to get user progress', 500);
    }
  }

  /**
   * 更新用户最后活跃时间
   */
  async updateLastActive(userId: string): Promise<User> {
    try {
      return await this.userRepository.update(userId, {
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating last active:', error);
      throw createError('Failed to update user', 500);
    }
  }

  /**
   * 获取用户统计信息
   */
  async getUserStats(userId: string): Promise<{
    totalDramas: number;
    completedDramas: number;
    totalKeywords: number;
    masteredKeywords: number;
    totalTimeSpent: number;
    streakDays: number;
  }> {
    try {
      const stats = await this.userRepository.getUserProgressStats(userId);

      // 这里可以添加更复杂的统计逻辑
      return {
        totalDramas: 0,
        completedDramas: 0,
        totalKeywords: stats.totalProgress,
        masteredKeywords: stats.completedProgress,
        totalTimeSpent: stats.totalTimeSpent,
        streakDays: 0,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw createError('Failed to get user stats', 500);
    }
  }

  /**
   * 检查用户是否存在
   */
  async userExists(deviceId: string): Promise<boolean> {
    try {
      return await this.userRepository.exists({ deviceId });
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }

  /**
   * 删除用户（软删除）
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      await this.userRepository.delete(userId);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw createError('Failed to delete user', 500);
    }
  }

  /**
   * 获取活跃用户列表
   */
  async getActiveUsers(limit: number = 10): Promise<any[]> {
    try {
      return await this.userRepository.getActiveUsers(7, limit);
    } catch (error) {
      console.error('Error getting active users:', error);
      throw createError('Failed to get active users', 500);
    }
  }
}
