/**
 * 依赖注入容器
 * 管理服务实例的创建和依赖关系
 */

import { PrismaClient } from '@prisma/client';
import prisma from '@/utils/database';

// 服务接口定义
import { IUserService } from '@/services/interfaces/IUserService';
import { IInterestService } from '@/services/interfaces/IInterestService';
import { IDramaService } from '@/services/interfaces/IDramaService';
import { IAnalyticsService } from '@/services/interfaces/IAnalyticsService';
import { IProgressService } from '@/services/interfaces/IProgressService';

// 服务实现
import { UserService } from '@/services/UserService';
import { InterestService } from '@/services/InterestService';
import { DramaService } from '@/services/DramaService';
import { AnalyticsService } from '@/services/AnalyticsService';
import { ProgressService } from '@/services/ProgressService';

// 仓储接口定义
import { IUserRepository } from '@/repositories/interfaces/IUserRepository';
import { IInterestRepository } from '@/repositories/interfaces/IInterestRepository';
import { IDramaRepository } from '@/repositories/interfaces/IDramaRepository';
import { IAnalyticsRepository } from '@/repositories/interfaces/IAnalyticsRepository';
import { IProgressRepository } from '@/repositories/interfaces/IProgressRepository';

// 仓储实现
import { UserRepository } from '@/repositories/UserRepository';
import { InterestRepository } from '@/repositories/InterestRepository';
import { DramaRepository } from '@/repositories/DramaRepository';
import { AnalyticsRepository } from '@/repositories/AnalyticsRepository';
import { ProgressRepository } from '@/repositories/ProgressRepository';

/**
 * 依赖注入容器类
 */
export class DIContainer {
  private static instance: DIContainer;
  private services: Map<string, any> = new Map();
  private repositories: Map<string, any> = new Map();

  private constructor() {
    this.initializeRepositories();
    this.initializeServices();
  }

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  /**
   * 初始化仓储层
   */
  private initializeRepositories(): void {
    // 注册仓储实例
    this.repositories.set('UserRepository', new UserRepository(prisma));
    this.repositories.set('InterestRepository', new InterestRepository(prisma));
    this.repositories.set('DramaRepository', new DramaRepository(prisma));
    this.repositories.set('AnalyticsRepository', new AnalyticsRepository(prisma));
    this.repositories.set('ProgressRepository', new ProgressRepository(prisma));
  }

  /**
   * 初始化服务层
   */
  private initializeServices(): void {
    // 获取仓储实例
    const userRepo = this.repositories.get('UserRepository') as IUserRepository;
    const interestRepo = this.repositories.get('InterestRepository') as IInterestRepository;
    const dramaRepo = this.repositories.get('DramaRepository') as IDramaRepository;
    const analyticsRepo = this.repositories.get('AnalyticsRepository') as IAnalyticsRepository;
    const progressRepo = this.repositories.get('ProgressRepository') as IProgressRepository;

    // 注册服务实例（注入仓储依赖）
    this.services.set('UserService', new UserService(userRepo));
    this.services.set('InterestService', new InterestService(interestRepo));
    this.services.set('DramaService', new DramaService(dramaRepo));
    this.services.set('AnalyticsService', new AnalyticsService(analyticsRepo));
    this.services.set('ProgressService', new ProgressService(progressRepo, userRepo));
  }

  /**
   * 获取服务实例
   */
  public getService<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found in container`);
    }
    return service as T;
  }

  /**
   * 获取仓储实例
   */
  public getRepository<T>(repositoryName: string): T {
    const repository = this.repositories.get(repositoryName);
    if (!repository) {
      throw new Error(`Repository ${repositoryName} not found in container`);
    }
    return repository as T;
  }

  /**
   * 注册新的服务
   */
  public registerService(name: string, service: any): void {
    this.services.set(name, service);
  }

  /**
   * 注册新的仓储
   */
  public registerRepository(name: string, repository: any): void {
    this.repositories.set(name, repository);
  }

  /**
   * 清理容器（主要用于测试）
   */
  public clear(): void {
    this.services.clear();
    this.repositories.clear();
  }

  /**
   * 获取所有已注册的服务名称
   */
  public getRegisteredServices(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * 获取所有已注册的仓储名称
   */
  public getRegisteredRepositories(): string[] {
    return Array.from(this.repositories.keys());
  }
}

// 导出单例实例
export const container = DIContainer.getInstance();

// 便捷的服务获取函数
export function getService<T>(serviceName: string): T {
  return container.getService<T>(serviceName);
}

export function getRepository<T>(repositoryName: string): T {
  return container.getRepository<T>(repositoryName);
}

// 服务名称常量
export const SERVICE_NAMES = {
  USER_SERVICE: 'UserService',
  INTEREST_SERVICE: 'InterestService',
  DRAMA_SERVICE: 'DramaService',
  ANALYTICS_SERVICE: 'AnalyticsService',
  PROGRESS_SERVICE: 'ProgressService',
} as const;

// 仓储名称常量
export const REPOSITORY_NAMES = {
  USER_REPOSITORY: 'UserRepository',
  INTEREST_REPOSITORY: 'InterestRepository',
  DRAMA_REPOSITORY: 'DramaRepository',
  ANALYTICS_REPOSITORY: 'AnalyticsRepository',
  PROGRESS_REPOSITORY: 'ProgressRepository',
} as const;
