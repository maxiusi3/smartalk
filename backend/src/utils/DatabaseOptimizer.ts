/**
 * 数据库查询优化工具
 * 提供查询性能监控、缓存策略和查询优化建议
 */

import { PrismaClient } from '@prisma/client';
import { performance } from 'perf_hooks';
import { logger } from '../../shared/utils/Logger';
import { monitorDatabaseQuery } from '../middleware/performanceMonitoring';

export interface QueryOptimizationConfig {
  enableQueryLogging: boolean;
  slowQueryThreshold: number; // ms
  enableQueryCache: boolean;
  cacheExpiration: number; // ms
  maxCacheSize: number; // number of entries
}

export interface QueryMetrics {
  queryName: string;
  executionTime: number;
  timestamp: Date;
  parameters?: any;
  resultCount?: number;
}

/**
 * 数据库优化器类
 */
export class DatabaseOptimizer {
  private static instance: DatabaseOptimizer;
  private queryCache: Map<string, { data: any; timestamp: number }> = new Map();
  private queryMetrics: QueryMetrics[] = [];
  private config: QueryOptimizationConfig;

  private constructor(config: Partial<QueryOptimizationConfig> = {}) {
    this.config = {
      enableQueryLogging: true,
      slowQueryThreshold: 500, // 500ms
      enableQueryCache: true,
      cacheExpiration: 5 * 60 * 1000, // 5分钟
      maxCacheSize: 1000,
      ...config,
    };
  }

  public static getInstance(config?: Partial<QueryOptimizationConfig>): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer(config);
    }
    return DatabaseOptimizer.instance;
  }

  /**
   * 优化的查询执行器
   */
  public async executeQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>,
    cacheKey?: string,
    parameters?: any
  ): Promise<T> {
    // 检查缓存
    if (this.config.enableQueryCache && cacheKey) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for query: ${queryName}`, { cacheKey });
        return cached;
      }
    }

    // 执行查询并监控性能
    const result = await monitorDatabaseQuery(queryName, async () => {
      const startTime = performance.now();
      
      try {
        const data = await queryFn();
        const endTime = performance.now();
        const executionTime = endTime - startTime;

        // 记录查询指标
        this.recordQueryMetrics({
          queryName,
          executionTime,
          timestamp: new Date(),
          parameters,
          resultCount: Array.isArray(data) ? data.length : 1,
        });

        // 缓存结果
        if (this.config.enableQueryCache && cacheKey) {
          this.setCache(cacheKey, data);
        }

        return data;
      } catch (error) {
        logger.error(`Query failed: ${queryName}`, { parameters }, error as Error);
        throw error;
      }
    });

    return result;
  }

  /**
   * 记录查询指标
   */
  private recordQueryMetrics(metrics: QueryMetrics): void {
    this.queryMetrics.push(metrics);

    // 保持最近1000条记录
    if (this.queryMetrics.length > 1000) {
      this.queryMetrics = this.queryMetrics.slice(-1000);
    }

    // 检查慢查询
    if (metrics.executionTime > this.config.slowQueryThreshold) {
      logger.warn('Slow query detected', {
        queryName: metrics.queryName,
        executionTime: metrics.executionTime,
        threshold: this.config.slowQueryThreshold,
        parameters: metrics.parameters,
      });
    }

    // 记录查询日志
    if (this.config.enableQueryLogging) {
      logger.debug(`Query executed: ${metrics.queryName}`, {
        executionTime: metrics.executionTime,
        resultCount: metrics.resultCount,
      });
    }
  }

  /**
   * 缓存操作
   */
  private getFromCache(key: string): any | null {
    const cached = this.queryCache.get(key);
    if (!cached) return null;

    // 检查是否过期
    if (Date.now() - cached.timestamp > this.config.cacheExpiration) {
      this.queryCache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any): void {
    // 检查缓存大小限制
    if (this.queryCache.size >= this.config.maxCacheSize) {
      // 删除最旧的缓存项
      const oldestKey = this.queryCache.keys().next().value;
      this.queryCache.delete(oldestKey);
    }

    this.queryCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * 清理缓存
   */
  public clearCache(pattern?: string): void {
    if (pattern) {
      // 清理匹配模式的缓存
      for (const key of this.queryCache.keys()) {
        if (key.includes(pattern)) {
          this.queryCache.delete(key);
        }
      }
    } else {
      // 清理所有缓存
      this.queryCache.clear();
    }

    logger.info('Query cache cleared', { pattern });
  }

  /**
   * 获取查询统计
   */
  public getQueryStats(): {
    totalQueries: number;
    averageExecutionTime: number;
    slowQueries: number;
    cacheHitRate: number;
    topSlowQueries: Array<{ queryName: string; averageTime: number; count: number }>;
  } {
    if (this.queryMetrics.length === 0) {
      return {
        totalQueries: 0,
        averageExecutionTime: 0,
        slowQueries: 0,
        cacheHitRate: 0,
        topSlowQueries: [],
      };
    }

    const totalQueries = this.queryMetrics.length;
    const averageExecutionTime = Math.round(
      this.queryMetrics.reduce((sum, m) => sum + m.executionTime, 0) / totalQueries
    );
    const slowQueries = this.queryMetrics.filter(
      m => m.executionTime > this.config.slowQueryThreshold
    ).length;

    // 计算缓存命中率（简化计算）
    const cacheHitRate = this.queryCache.size > 0 ? 
      Math.round((this.queryCache.size / totalQueries) * 100) : 0;

    // 统计最慢的查询
    const queryGroups = new Map<string, { totalTime: number; count: number }>();
    this.queryMetrics.forEach(metric => {
      const existing = queryGroups.get(metric.queryName) || { totalTime: 0, count: 0 };
      queryGroups.set(metric.queryName, {
        totalTime: existing.totalTime + metric.executionTime,
        count: existing.count + 1,
      });
    });

    const topSlowQueries = Array.from(queryGroups.entries())
      .map(([queryName, stats]) => ({
        queryName,
        averageTime: Math.round(stats.totalTime / stats.count),
        count: stats.count,
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 10);

    return {
      totalQueries,
      averageExecutionTime,
      slowQueries,
      cacheHitRate,
      topSlowQueries,
    };
  }

  /**
   * 生成查询优化建议
   */
  public generateOptimizationSuggestions(): string[] {
    const stats = this.getQueryStats();
    const suggestions: string[] = [];

    // 慢查询建议
    if (stats.slowQueries > stats.totalQueries * 0.1) {
      suggestions.push('检测到较多慢查询，建议添加数据库索引或优化查询逻辑');
    }

    // 缓存建议
    if (stats.cacheHitRate < 30) {
      suggestions.push('缓存命中率较低，建议优化缓存策略或增加缓存时间');
    }

    // 频繁查询建议
    stats.topSlowQueries.forEach(query => {
      if (query.count > 100 && query.averageTime > 200) {
        suggestions.push(`查询 "${query.queryName}" 执行频繁且较慢，建议优化或增加缓存`);
      }
    });

    // 内存使用建议
    if (this.queryCache.size > this.config.maxCacheSize * 0.8) {
      suggestions.push('查询缓存使用率较高，建议增加缓存大小或调整过期时间');
    }

    return suggestions;
  }

  /**
   * 预热缓存
   */
  public async warmupCache(queries: Array<{ name: string; fn: () => Promise<any>; cacheKey: string }>): Promise<void> {
    logger.info('Starting cache warmup', { queryCount: queries.length });

    for (const query of queries) {
      try {
        await this.executeQuery(query.name, query.fn, query.cacheKey);
        logger.debug(`Cache warmed up for: ${query.name}`);
      } catch (error) {
        logger.error(`Cache warmup failed for: ${query.name}`, {}, error as Error);
      }
    }

    logger.info('Cache warmup completed');
  }

  /**
   * 获取缓存状态
   */
  public getCacheStatus(): {
    size: number;
    maxSize: number;
    hitRate: number;
    oldestEntry: Date | null;
  } {
    let oldestTimestamp = Date.now();
    for (const entry of this.queryCache.values()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
      }
    }

    return {
      size: this.queryCache.size,
      maxSize: this.config.maxCacheSize,
      hitRate: this.getQueryStats().cacheHitRate,
      oldestEntry: this.queryCache.size > 0 ? new Date(oldestTimestamp) : null,
    };
  }
}

// 导出单例实例
export const dbOptimizer = DatabaseOptimizer.getInstance();

// 便捷的查询优化函数
export const optimizedQuery = {
  execute: <T>(name: string, fn: () => Promise<T>, cacheKey?: string, params?: any) =>
    dbOptimizer.executeQuery(name, fn, cacheKey, params),
  clearCache: (pattern?: string) => dbOptimizer.clearCache(pattern),
  getStats: () => dbOptimizer.getQueryStats(),
  getSuggestions: () => dbOptimizer.generateOptimizationSuggestions(),
  warmup: (queries: Array<{ name: string; fn: () => Promise<any>; cacheKey: string }>) =>
    dbOptimizer.warmupCache(queries),
  getCacheStatus: () => dbOptimizer.getCacheStatus(),
};
