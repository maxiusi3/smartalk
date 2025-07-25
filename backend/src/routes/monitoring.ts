/**
 * 性能监控API路由
 * 提供性能指标查询和监控数据访问接口
 */

import { Router } from 'express';
import { 
  getPerformanceStats, 
  runPerformanceRegressionTest 
} from '../middleware/performanceMonitoring';
import { monitoring } from '../config/monitoring';

const router = Router();

/**
 * GET /api/v1/monitoring/health
 * 健康检查端点
 */
router.get('/health', async (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      monitoring: monitoring.getHealthStatus(),
    };

    res.json({
      success: true,
      data: healthStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
});

/**
 * GET /api/v1/monitoring/performance
 * 获取性能统计信息
 */
router.get('/performance', async (req, res) => {
  try {
    const stats = getPerformanceStats();
    
    res.json({
      success: true,
      data: {
        ...stats,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get performance stats',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
});

/**
 * GET /api/v1/monitoring/metrics
 * 获取详细的性能指标
 */
router.get('/metrics', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const metrics = global.performanceMetrics || [];
    
    const paginatedMetrics = metrics
      .slice(Number(offset), Number(offset) + Number(limit))
      .map(metric => ({
        ...metric,
        // 隐藏敏感信息
        userAgent: metric.userAgent ? 'hidden' : undefined,
        ip: metric.ip ? 'hidden' : undefined,
      }));

    res.json({
      success: true,
      data: {
        metrics: paginatedMetrics,
        total: metrics.length,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
});

/**
 * POST /api/v1/monitoring/regression-test
 * 运行性能回归测试
 */
router.post('/regression-test', async (req, res) => {
  try {
    const testResults = await runPerformanceRegressionTest();
    
    res.json({
      success: true,
      data: testResults,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Performance regression test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
});

/**
 * GET /api/v1/monitoring/alerts
 * 获取性能告警信息
 */
router.get('/alerts', async (req, res) => {
  try {
    // 这里可以从告警系统获取告警信息
    // 目前返回模拟数据
    const alerts = [
      {
        id: '1',
        type: 'slow_response',
        message: 'API response time exceeded threshold',
        threshold: 1000,
        actual: 1500,
        timestamp: new Date().toISOString(),
        resolved: false,
      },
    ];

    res.json({
      success: true,
      data: {
        alerts,
        total: alerts.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get alerts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
});

/**
 * GET /api/v1/monitoring/dashboard
 * 获取监控仪表板数据
 */
router.get('/dashboard', async (req, res) => {
  try {
    const stats = getPerformanceStats();
    const healthStatus = monitoring.getHealthStatus();
    
    const dashboardData = {
      overview: {
        status: 'healthy',
        uptime: process.uptime(),
        totalRequests: stats.totalRequests,
        averageResponseTime: stats.averageResponseTime,
        errorRate: stats.errorRate,
      },
      performance: {
        responseTime: {
          current: stats.averageResponseTime,
          target: 500,
          status: stats.averageResponseTime <= 500 ? 'good' : 'warning',
        },
        memoryUsage: {
          current: Math.round(stats.memoryUsage.heapUsed / 1024 / 1024),
          target: 100,
          status: stats.memoryUsage.heapUsed <= 100 * 1024 * 1024 ? 'good' : 'warning',
        },
        slowRequests: {
          current: stats.slowRequests,
          total: stats.totalRequests,
          percentage: stats.totalRequests > 0 ? Math.round((stats.slowRequests / stats.totalRequests) * 100) : 0,
        },
      },
      monitoring: healthStatus,
      timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
});

/**
 * DELETE /api/v1/monitoring/metrics
 * 清理性能指标数据
 */
router.delete('/metrics', async (req, res) => {
  try {
    // 只在开发环境允许清理数据
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Metrics cleanup not allowed in production',
        },
      });
    }

    global.performanceMetrics = [];
    
    res.json({
      success: true,
      message: 'Performance metrics cleared',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to clear metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
});

export default router;
