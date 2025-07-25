/**
 * 用户仓储实现
 * 处理用户相关的数据库操作
 */

import { PrismaClient, User, Prisma } from '@prisma/client';
import { IUserRepository } from './interfaces/IUserRepository';

export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * 创建用户
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return await this.prisma.user.create({
      data,
    });
  }

  /**
   * 根据ID查找用户
   */
  async findById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * 根据设备ID查找用户
   */
  async findByDeviceId(deviceId: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { deviceId },
    });
  }

  /**
   * 更新用户
   */
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return await this.prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * 删除用户
   */
  async delete(id: string): Promise<User> {
    return await this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * 查找多个用户
   */
  async findMany(
    where?: Prisma.UserWhereInput,
    options?: {
      skip?: number;
      take?: number;
      orderBy?: Prisma.UserOrderByWithRelationInput;
      include?: Prisma.UserInclude;
    }
  ): Promise<User[]> {
    return await this.prisma.user.findMany({
      where,
      ...options,
    });
  }

  /**
   * 统计用户数量
   */
  async count(where?: Prisma.UserWhereInput): Promise<number> {
    return await this.prisma.user.count({
      where,
    });
  }

  /**
   * 检查用户是否存在
   */
  async exists(where: Prisma.UserWhereInput): Promise<boolean> {
    const count = await this.prisma.user.count({
      where,
    });
    return count > 0;
  }

  /**
   * 获取用户进度统计
   */
  async getUserProgressStats(userId: string): Promise<{
    totalProgress: number;
    completedProgress: number;
    totalTimeSpent: number;
  }> {
    const progressStats = await this.prisma.userProgress.aggregate({
      where: { userId },
      _count: {
        id: true,
      },
      _sum: {
        timeSpent: true,
      },
    });

    const completedProgress = await this.prisma.userProgress.count({
      where: {
        userId,
        isCompleted: true,
      },
    });

    return {
      totalProgress: progressStats._count.id || 0,
      completedProgress,
      totalTimeSpent: progressStats._sum.timeSpent || 0,
    };
  }

  /**
   * 获取活跃用户
   */
  async getActiveUsers(days: number, limit?: number): Promise<User[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return await this.prisma.user.findMany({
      where: {
        updatedAt: {
          gte: cutoffDate,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
    });
  }
}
