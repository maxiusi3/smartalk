import { PrismaClient, AnalyticsEvent } from '@prisma/client';

const prisma = new PrismaClient();

export interface AnalyticsEventData {
  userId: string;
  eventType: string;
  eventData?: Record<string, any>;
  timestamp?: Date;
}

export interface EventFilters {
  eventType?: string;
  limit: number;
  offset: number;
  startDate?: Date;
  endDate?: Date;
}

export interface UserStats {
  totalEvents: number;
  onboardingCompleted: boolean;
  vtprSessions: number;
  vtprAccuracy: number;
  magicMomentReached: boolean;
  learningTime: number;
  keywordsLearned: number;
  lastActivity: Date | null;
  streakDays: number;
}

export interface SystemAnalyticsOptions {
  timeRange: string;
  groupBy: 'hour' | 'day' | 'week';
  metrics: string;
}

export interface FunnelAnalyticsOptions {
  timeRange: string;
  cohort?: string;
}

export class AnalyticsService {
  /**
   * 记录单个分析事件
   */
  public async recordEvent(eventData: AnalyticsEventData): Promise<AnalyticsEvent> {
    // 验证用户存在
    const user = await prisma.user.findUnique({
      where: { id: eventData.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // 清理和验证事件数据
    const sanitizedEventData = this.sanitizeEventData(eventData.eventData);

    // 创建事件记录
    const event = await prisma.analyticsEvent.create({
      data: {
        userId: eventData.userId,
        eventType: eventData.eventType,
        eventData: sanitizedEventData,
        timestamp: eventData.timestamp || new Date(),
      },
    });

    // 异步处理事件（不阻塞响应）
    this.processEventAsync(event).catch(error => {
      console.error('Error processing event async:', error);
    });

    return event;
  }

  /**
   * 批量记录分析事件
   */
  public async recordBatchEvents(events: AnalyticsEventData[]): Promise<AnalyticsEvent[]> {
    // 验证所有用户存在
    const userIds = [...new Set(events.map(e => e.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true },
    });

    const existingUserIds = new Set(users.map(u => u.id));
    const validEvents = events.filter(e => existingUserIds.has(e.userId));

    if (validEvents.length === 0) {
      throw new Error('No valid events to process');
    }

    // 批量创建事件
    const createdEvents = await prisma.$transaction(
      validEvents.map(eventData => 
        prisma.analyticsEvent.create({
          data: {
            userId: eventData.userId,
            eventType: eventData.eventType,
            eventData: this.sanitizeEventData(eventData.eventData),
            timestamp: eventData.timestamp || new Date(),
          },
        })
      )
    );

    // 异步处理所有事件
    createdEvents.forEach(event => {
      this.processEventAsync(event).catch(error => {
        console.error('Error processing batch event async:', error);
      });
    });

    return createdEvents;
  }

  /**
   * 获取用户的分析事件
   */
  public async getUserEvents(userId: string, filters: EventFilters) {
    // 验证用户存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const whereClause: any = { userId };

    if (filters.eventType) {
      whereClause.eventType = filters.eventType;
    }

    if (filters.startDate || filters.endDate) {
      whereClause.timestamp = {};
      if (filters.startDate) {
        whereClause.timestamp.gte = filters.startDate;
      }
      if (filters.endDate) {
        whereClause.timestamp.lte = filters.endDate;
      }
    }

    const [events, total] = await Promise.all([
      prisma.analyticsEvent.findMany({
        where: whereClause,
        orderBy: { timestamp: 'desc' },
        take: filters.limit,
        skip: filters.offset,
      }),
      prisma.analyticsEvent.count({
        where: whereClause,
      }),
    ]);

    return {
      events,
      total,
      limit: filters.limit,
      offset: filters.offset,
    };
  }

  /**
   * 获取用户学习统计
   */
  public async getUserStats(userId: string, timeRange: string): Promise<UserStats> {
    // 验证用户存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const timeRangeDate = this.getTimeRangeDate(timeRange);

    // 获取用户所有事件
    const events = await prisma.analyticsEvent.findMany({
      where: {
        userId,
        timestamp: timeRangeDate ? { gte: timeRangeDate } : undefined,
      },
      orderBy: { timestamp: 'asc' },
    });

    // 计算统计数据
    const stats: UserStats = {
      totalEvents: events.length,
      onboardingCompleted: events.some(e => e.eventType === 'onboarding_complete'),
      vtprSessions: events.filter(e => e.eventType === 'vtpr_start').length,
      vtprAccuracy: this.calculateVTPRAccuracy(events),
      magicMomentReached: events.some(e => e.eventType === 'magic_moment_complete'),
      learningTime: this.calculateLearningTime(events),
      keywordsLearned: this.calculateKeywordsLearned(events),
      lastActivity: events.length > 0 ? events[events.length - 1].timestamp : null,
      streakDays: this.calculateStreakDays(events),
    };

    return stats;
  }

  /**
   * 获取系统级分析数据
   */
  public async getSystemAnalytics(options: SystemAnalyticsOptions) {
    const timeRangeDate = this.getTimeRangeDate(options.timeRange);
    
    const whereClause = timeRangeDate ? {
      timestamp: { gte: timeRangeDate },
    } : {};

    // 基础指标
    const [
      totalUsers,
      totalEvents,
      activeUsers,
      newUsers,
      activationRate,
      retentionRate,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.analyticsEvent.count({ where: whereClause }),
      this.getActiveUsersCount(timeRangeDate),
      this.getNewUsersCount(timeRangeDate),
      this.getActivationRate(timeRangeDate),
      this.getRetentionRate(timeRangeDate),
    ]);

    // 事件分布
    const eventDistribution = await prisma.analyticsEvent.groupBy({
      by: ['eventType'],
      where: whereClause,
      _count: { eventType: true },
      orderBy: { _count: { eventType: 'desc' } },
    });

    // 时间序列数据
    const timeSeriesData = await this.getTimeSeriesData(options.groupBy, timeRangeDate);

    return {
      overview: {
        totalUsers,
        totalEvents,
        activeUsers,
        newUsers,
        activationRate,
        retentionRate,
      },
      eventDistribution: eventDistribution.map(item => ({
        eventType: item.eventType,
        count: item._count.eventType,
      })),
      timeSeries: timeSeriesData,
      generatedAt: new Date(),
    };
  }

  /**
   * 获取转化漏斗数据
   */
  public async getFunnelAnalytics(options: FunnelAnalyticsOptions) {
    const timeRangeDate = this.getTimeRangeDate(options.timeRange);
    
    // 定义漏斗步骤
    const funnelSteps = [
      'app_launch',
      'onboarding_start',
      'onboarding_complete',
      'interest_selected',
      'video_preview_start',
      'vtpr_start',
      'vtpr_session_complete',
      'magic_moment_start',
      'magic_moment_complete', // 激活事件
    ];

    const funnelData = await Promise.all(
      funnelSteps.map(async (step, index) => {
        const count = await prisma.analyticsEvent.groupBy({
          by: ['userId'],
          where: {
            eventType: step,
            timestamp: timeRangeDate ? { gte: timeRangeDate } : undefined,
          },
          _count: { userId: true },
        });

        return {
          step: step,
          stepIndex: index,
          userCount: count.length,
          conversionRate: index === 0 ? 1 : 0, // 将在后面计算
        };
      })
    );

    // 计算转化率
    const totalUsers = funnelData[0]?.userCount || 0;
    funnelData.forEach((step, index) => {
      if (index === 0) {
        step.conversionRate = 1;
      } else {
        const previousStep = funnelData[index - 1];
        step.conversionRate = previousStep.userCount > 0 
          ? step.userCount / previousStep.userCount 
          : 0;
      }
    });

    return {
      funnel: funnelData,
      totalUsers,
      activationRate: totalUsers > 0 
        ? (funnelData.find(s => s.step === 'magic_moment_complete')?.userCount || 0) / totalUsers 
        : 0,
      generatedAt: new Date(),
    };
  }

  /**
   * 获取健康状态
   */
  public async getHealthStatus() {
    try {
      // 检查数据库连接
      await prisma.$queryRaw`SELECT 1`;
      
      // 检查最近的事件活动
      const recentEvents = await prisma.analyticsEvent.count({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 最近24小时
          },
        },
      });

      return {
        status: 'healthy',
        database: 'connected',
        recentEvents,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 清理事件数据
   */
  private sanitizeEventData(eventData?: Record<string, any>): Record<string, any> {
    if (!eventData) return {};

    const sanitized: Record<string, any> = {};
    const maxStringLength = 500;
    const maxArrayLength = 10;
    const maxObjectDepth = 3;

    const sanitizeValue = (value: any, depth = 0): any => {
      if (depth > maxObjectDepth) return '[Object too deep]';

      if (typeof value === 'string') {
        return value.length > maxStringLength 
          ? value.substring(0, maxStringLength) + '...' 
          : value;
      }

      if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
        return value;
      }

      if (Array.isArray(value)) {
        return value
          .slice(0, maxArrayLength)
          .map(item => sanitizeValue(item, depth + 1));
      }

      if (typeof value === 'object' && value !== null) {
        const sanitizedObj: Record<string, any> = {};
        Object.entries(value).forEach(([key, val]) => {
          if (typeof key === 'string' && key.length <= 50) {
            sanitizedObj[key] = sanitizeValue(val, depth + 1);
          }
        });
        return sanitizedObj;
      }

      return String(value);
    };

    Object.entries(eventData).forEach(([key, value]) => {
      if (typeof key === 'string' && key.length <= 50) {
        sanitized[key] = sanitizeValue(value);
      }
    });

    return sanitized;
  }

  /**
   * 异步处理事件
   */
  private async processEventAsync(event: AnalyticsEvent): Promise<void> {
    try {
      // 这里可以添加事件处理逻辑，如：
      // - 触发实时通知
      // - 更新用户统计
      // - 检查成就解锁
      // - 发送到外部分析服务

      // 示例：检查里程碑事件
      if (event.eventType === 'magic_moment_complete') {
        await this.handleActivationEvent(event);
      }

      if (event.eventType === 'vtpr_answer_correct') {
        await this.updateLearningStats(event);
      }
    } catch (error) {
      console.error('Error in async event processing:', error);
    }
  }

  /**
   * 处理激活事件
   */
  private async handleActivationEvent(event: AnalyticsEvent): Promise<void> {
    // 记录用户激活
    console.log(`User ${event.userId} activated at ${event.timestamp}`);
    
    // 这里可以添加激活后的处理逻辑
    // 如发送欢迎邮件、解锁内容等
  }

  /**
   * 更新学习统计
   */
  private async updateLearningStats(event: AnalyticsEvent): Promise<void> {
    // 更新用户学习进度统计
    // 这里可以实现实时统计更新
  }

  /**
   * 计算vTPR准确率
   */
  private calculateVTPRAccuracy(events: AnalyticsEvent[]): number {
    const correctAnswers = events.filter(e => e.eventType === 'vtpr_answer_correct').length;
    const incorrectAnswers = events.filter(e => e.eventType === 'vtpr_answer_incorrect').length;
    const totalAnswers = correctAnswers + incorrectAnswers;
    
    return totalAnswers > 0 ? correctAnswers / totalAnswers : 0;
  }

  /**
   * 计算学习时间
   */
  private calculateLearningTime(events: AnalyticsEvent[]): number {
    // 简化计算：基于事件数量估算
    const learningEvents = events.filter(e => 
      e.eventType.startsWith('vtpr_') || 
      e.eventType.includes('video_') ||
      e.eventType.includes('learning_')
    );
    
    return learningEvents.length * 30; // 假设每个学习事件平均30秒
  }

  /**
   * 计算已学词汇数
   */
  private calculateKeywordsLearned(events: AnalyticsEvent[]): number {
    const keywordEvents = events.filter(e => e.eventType === 'vtpr_answer_correct');
    const uniqueKeywords = new Set(
      keywordEvents.map(e => e.eventData?.keywordId).filter(Boolean)
    );
    
    return uniqueKeywords.size;
  }

  /**
   * 计算连续学习天数
   */
  private calculateStreakDays(events: AnalyticsEvent[]): number {
    if (events.length === 0) return 0;

    const learningDays = new Set(
      events
        .filter(e => e.eventType.startsWith('vtpr_') || e.eventType.includes('learning_'))
        .map(e => e.timestamp.toISOString().split('T')[0])
    );

    // 简化计算：返回有学习活动的天数
    return learningDays.size;
  }

  /**
   * 获取时间范围日期
   */
  private getTimeRangeDate(timeRange: string): Date | null {
    const now = new Date();
    
    switch (timeRange) {
      case '1d':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return null;
    }
  }

  /**
   * 获取活跃用户数
   */
  private async getActiveUsersCount(since?: Date): Promise<number> {
    const result = await prisma.analyticsEvent.groupBy({
      by: ['userId'],
      where: since ? { timestamp: { gte: since } } : undefined,
      _count: { userId: true },
    });
    
    return result.length;
  }

  /**
   * 获取新用户数
   */
  private async getNewUsersCount(since?: Date): Promise<number> {
    return prisma.user.count({
      where: since ? { createdAt: { gte: since } } : undefined,
    });
  }

  /**
   * 获取激活率
   */
  private async getActivationRate(since?: Date): Promise<number> {
    const [totalUsers, activatedUsers] = await Promise.all([
      this.getNewUsersCount(since),
      prisma.analyticsEvent.groupBy({
        by: ['userId'],
        where: {
          eventType: 'magic_moment_complete',
          timestamp: since ? { gte: since } : undefined,
        },
        _count: { userId: true },
      }),
    ]);

    return totalUsers > 0 ? activatedUsers.length / totalUsers : 0;
  }

  /**
   * 获取留存率
   */
  private async getRetentionRate(since?: Date): Promise<number> {
    // 简化计算：返回有多次访问的用户比例
    const usersWithMultipleSessions = await prisma.analyticsEvent.groupBy({
      by: ['userId'],
      where: {
        eventType: 'app_launch',
        timestamp: since ? { gte: since } : undefined,
      },
      _count: { userId: true },
      having: {
        userId: {
          _count: {
            gt: 1,
          },
        },
      },
    });

    const totalActiveUsers = await this.getActiveUsersCount(since);
    
    return totalActiveUsers > 0 ? usersWithMultipleSessions.length / totalActiveUsers : 0;
  }

  /**
   * 获取时间序列数据
   */
  private async getTimeSeriesData(groupBy: 'hour' | 'day' | 'week', since?: Date) {
    // 这里应该根据groupBy参数生成相应的时间序列查询
    // 简化实现，返回基础的每日事件计数
    
    const events = await prisma.analyticsEvent.findMany({
      where: since ? { timestamp: { gte: since } } : undefined,
      select: {
        timestamp: true,
        eventType: true,
      },
    });

    // 按日期分组
    const groupedData: Record<string, Record<string, number>> = {};
    
    events.forEach(event => {
      const date = event.timestamp.toISOString().split('T')[0];
      if (!groupedData[date]) {
        groupedData[date] = {};
      }
      if (!groupedData[date][event.eventType]) {
        groupedData[date][event.eventType] = 0;
      }
      groupedData[date][event.eventType]++;
    });

    return Object.entries(groupedData).map(([date, events]) => ({
      date,
      events,
      total: Object.values(events).reduce((sum, count) => sum + count, 0),
    }));
  }
}