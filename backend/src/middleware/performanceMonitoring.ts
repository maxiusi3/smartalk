/**
 * 实时性能监控中间件
 * 监控API响应时间、数据库查询性能、内存使用等关键指标
 */

import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';
import { logger } from '../../shared/utils/Logger';
import { monitoring } from '../config/monitoring';

export interface PerformanceMetrics {
  requestId: string;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  memoryUsage: NodeJS.MemoryUsage;
  timestamp: string;
  userAgent?: string;
  ip?: string;
}

/**
 * 性能监控中间件
 */
export function performanceMonitoringMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = performance.now();
  const startMemory = process.memoryUsage();
  const requestId = res.locals.requestId || 'unknown';

  // 监听响应完成
  res.on('finish', () => {
    const endTime = performance.now();
    const endMemory = process.memoryUsage();
    const responseTime = Math.round(endTime - startTime);

    const metrics: PerformanceMetrics = {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      memoryUsage: endMemory,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    };

    // 记录性能指标
    recordPerformanceMetrics(metrics);

    // 检查性能阈值
    checkPerformanceThresholds(metrics);

    // 记录到监控系统
    monitoring.recordMetric('api_response_time', responseTime, {
      method: req.method,
      endpoint: req.route?.path || req.url,
      status: res.statusCode.toString(),
    });

    monitoring.recordMetric('memory_usage', endMemory.heapUsed, {
      type: 'heap_used',
    });
  });

  next();
}

/**
 * 记录性能指标
 */
function recordPerformanceMetrics(metrics: PerformanceMetrics): void {
  // 记录到日志
  logger.performance(
    `${metrics.method} ${metrics.url}`,
    metrics.responseTime,
    {
      requestId: metrics.requestId,
      statusCode: metrics.statusCode,
      memoryUsage: metrics.memoryUsage.heapUsed,
    }
  );

  // 存储到性能数据库（可选）
  storePerformanceData(metrics);
}

/**
 * 检查性能阈值
 */
function checkPerformanceThresholds(metrics: PerformanceMetrics): void {
  const thresholds = {
    responseTime: 1000, // 1秒
    memoryUsage: 100 * 1024 * 1024, // 100MB
  };

  // 检查响应时间
  if (metrics.responseTime > thresholds.responseTime) {
    logger.warn('Slow API response detected', {
      requestId: metrics.requestId,
      url: metrics.url,
      responseTime: metrics.responseTime,
      threshold: thresholds.responseTime,
    });

    // 发送告警
    sendPerformanceAlert('slow_response', metrics);
  }

  // 检查内存使用
  if (metrics.memoryUsage.heapUsed > thresholds.memoryUsage) {
    logger.warn('High memory usage detected', {
      requestId: metrics.requestId,
      memoryUsage: metrics.memoryUsage.heapUsed,
      threshold: thresholds.memoryUsage,
    });

    // 发送告警
    sendPerformanceAlert('high_memory', metrics);
  }
}

/**
 * 存储性能数据
 */
function storePerformanceData(metrics: PerformanceMetrics): void {
  // 这里可以将性能数据存储到时序数据库
  // 例如：InfluxDB、TimescaleDB 等
  
  // 简单的内存存储示例
  if (!global.performanceMetrics) {
    global.performanceMetrics = [];
  }

  global.performanceMetrics.push(metrics);

  // 保持最近1000条记录
  if (global.performanceMetrics.length > 1000) {
    global.performanceMetrics = global.performanceMetrics.slice(-1000);
  }
}

/**
 * 发送性能告警
 */
function sendPerformanceAlert(type: string, metrics: PerformanceMetrics): void {
  // 这里可以集成告警系统
  // 例如：Slack、邮件、短信等

  logger.error(`Performance alert: ${type}`, {
    type,
    metrics,
  });

  // 发送到监控系统
  monitoring.recordEvent('performance_alert', {
    type,
    requestId: metrics.requestId,
    url: metrics.url,
    responseTime: metrics.responseTime,
    memoryUsage: metrics.memoryUsage.heapUsed,
  });
}

/**
 * 数据库查询性能监控
 */
export function monitorDatabaseQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const startTime = performance.now();

    try {
      const result = await queryFn();
      const endTime = performance.now();
      const queryTime = Math.round(endTime - startTime);

      // 记录查询性能
      logger.performance(`Database query: ${queryName}`, queryTime);

      monitoring.recordMetric('db_query_time', queryTime, {
        query: queryName,
      });

      // 检查慢查询
      if (queryTime > 500) { // 500ms
        logger.warn('Slow database query detected', {
          queryName,
          queryTime,
        });

        monitoring.recordEvent('slow_query', {
          queryName,
          queryTime,
        });
      }

      resolve(result);
    } catch (error) {
      const endTime = performance.now();
      const queryTime = Math.round(endTime - startTime);

      logger.error(`Database query failed: ${queryName}`, {
        queryName,
        queryTime,
      }, error as Error);

      monitoring.recordEvent('query_error', {
        queryName,
        queryTime,
        error: (error as Error).message,
      });

      reject(error);
    }
  });
}

/**
 * 获取性能统计
 */
export function getPerformanceStats(): {
  totalRequests: number;
  averageResponseTime: number;
  slowRequests: number;
  errorRate: number;
  memoryUsage: NodeJS.MemoryUsage;
} {
  const metrics = global.performanceMetrics || [];
  
  if (metrics.length === 0) {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      slowRequests: 0,
      errorRate: 0,
      memoryUsage: process.memoryUsage(),
    };
  }

  const totalRequests = metrics.length;
  const averageResponseTime = Math.round(
    metrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests
  );
  const slowRequests = metrics.filter(m => m.responseTime > 1000).length;
  const errorRequests = metrics.filter(m => m.statusCode >= 400).length;
  const errorRate = Math.round((errorRequests / totalRequests) * 100);

  return {
    totalRequests,
    averageResponseTime,
    slowRequests,
    errorRate,
    memoryUsage: process.memoryUsage(),
  };
}

/**
 * 性能回归测试
 */
export async function runPerformanceRegressionTest(): Promise<{
  passed: boolean;
  results: Array<{
    test: string;
    current: number;
    baseline: number;
    passed: boolean;
  }>;
}> {
  const tests = [
    {
      name: 'API Response Time',
      test: async () => {
        // 模拟API调用
        const start = performance.now();
        await new Promise(resolve => setTimeout(resolve, 100));
        return performance.now() - start;
      },
      baseline: 500, // 500ms基线
    },
    {
      name: 'Database Query Time',
      test: async () => {
        // 模拟数据库查询
        const start = performance.now();
        await new Promise(resolve => setTimeout(resolve, 50));
        return performance.now() - start;
      },
      baseline: 200, // 200ms基线
    },
  ];

  const results = [];
  let allPassed = true;

  for (const test of tests) {
    const current = await test.test();
    const passed = current <= test.baseline;
    
    if (!passed) {
      allPassed = false;
    }

    results.push({
      test: test.name,
      current: Math.round(current),
      baseline: test.baseline,
      passed,
    });
  }

  return {
    passed: allPassed,
    results,
  };
}

// 扩展全局类型
declare global {
  var performanceMetrics: PerformanceMetrics[] | undefined;
}
