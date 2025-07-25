/**
 * 用户仓储接口
 * 定义用户数据访问层接口
 */

import { User, Prisma } from '@prisma/client';

export interface IUserRepository {
  /**
   * 创建用户
   */
  create(data: Prisma.UserCreateInput): Promise<User>;

  /**
   * 根据ID查找用户
   */
  findById(id: string): Promise<User | null>;

  /**
   * 根据设备ID查找用户
   */
  findByDeviceId(deviceId: string): Promise<User | null>;

  /**
   * 更新用户
   */
  update(id: string, data: Prisma.UserUpdateInput): Promise<User>;

  /**
   * 删除用户
   */
  delete(id: string): Promise<User>;

  /**
   * 查找多个用户
   */
  findMany(where?: Prisma.UserWhereInput, options?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.UserOrderByWithRelationInput;
    include?: Prisma.UserInclude;
  }): Promise<User[]>;

  /**
   * 统计用户数量
   */
  count(where?: Prisma.UserWhereInput): Promise<number>;

  /**
   * 检查用户是否存在
   */
  exists(where: Prisma.UserWhereInput): Promise<boolean>;

  /**
   * 获取用户进度统计
   */
  getUserProgressStats(userId: string): Promise<{
    totalProgress: number;
    completedProgress: number;
    totalTimeSpent: number;
  }>;

  /**
   * 获取活跃用户
   */
  getActiveUsers(days: number, limit?: number): Promise<User[]>;
}
