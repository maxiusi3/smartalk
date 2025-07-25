import { Request, Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { validateAnalyticsEvent, validateBatchEvents } from '../utils/validation';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  /**
   * 记录单个分析事件
   * POST /api/v1/analytics/events
   */
  public recordEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const validation = validateAnalyticsEvent(req.body);
      
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            message: validation.errors?.[0] || 'Validation failed',
            statusCode: 400,
          },
        });
        return;
      }

      const event = await this.analyticsService.recordEvent(req.body);

      res.status(201).json({
        success: true,
        data: event,
      });
    } catch (error) {
      console.error('Error recording analytics event:', error);
      
      if (error instanceof Error && error.message.includes('User not found')) {
        res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
            statusCode: 404,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          statusCode: 500,
        },
      });
    }
  };

  /**
   * 批量记录分析事件
   * POST /api/v1/analytics/events/batch
   */
  public recordBatchEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const validation = validateBatchEvents(req.body);
      
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            message: validation.errors?.[0] || 'Validation failed',
            statusCode: 400,
          },
        });
        return;
      }

      const result = await this.analyticsService.recordBatchEvents(req.body.events);

      res.status(201).json({
        success: true,
        data: {
          processed: result.length,
          events: result,
        },
      });
    } catch (error) {
      console.error('Error recording batch analytics events:', error);
      
      res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          statusCode: 500,
        },
      });
    }
  };

  /**
   * 获取用户的分析事件
   * GET /api/v1/analytics/events/:userId
   */
  public getUserEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { 
        eventType, 
        limit = '50', 
        offset = '0',
        startDate,
        endDate 
      } = req.query;

      const filters = {
        eventType: eventType as string,
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10),
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      };

      const result = await this.analyticsService.getUserEvents(userId, filters);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error fetching user events:', error);
      
      if (error instanceof Error && error.message.includes('User not found')) {
        res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
            statusCode: 404,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          statusCode: 500,
        },
      });
    }
  };

  /**
   * 获取用户学习统计
   * GET /api/v1/analytics/stats/:userId
   */
  public getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { timeRange = '30d' } = req.query;

      const stats = await this.analyticsService.getUserStats(userId, timeRange as string);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      
      if (error instanceof Error && error.message.includes('User not found')) {
        res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
            statusCode: 404,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          statusCode: 500,
        },
      });
    }
  };

  /**
   * 获取系统级分析数据
   * GET /api/v1/analytics/system
   */
  public getSystemAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        timeRange = '7d',
        groupBy = 'day',
        metrics = 'all'
      } = req.query;

      const analytics = await this.analyticsService.getSystemAnalytics({
        timeRange: timeRange as string,
        groupBy: groupBy as 'hour' | 'day' | 'week',
        metrics: metrics as string,
      });

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      console.error('Error fetching system analytics:', error);
      
      res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          statusCode: 500,
        },
      });
    }
  };

  /**
   * 获取转化漏斗数据
   * GET /api/v1/analytics/funnel
   */
  public getFunnelAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        timeRange = '7d',
        cohort 
      } = req.query;

      const funnel = await this.analyticsService.getFunnelAnalytics({
        timeRange: timeRange as string,
        cohort: cohort as string,
      });

      res.status(200).json({
        success: true,
        data: funnel,
      });
    } catch (error) {
      console.error('Error fetching funnel analytics:', error);
      
      res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          statusCode: 500,
        },
      });
    }
  };

  /**
   * 健康检查
   * GET /api/v1/analytics/health
   */
  public healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const health = await this.analyticsService.getHealthStatus();
      
      res.status(200).json({
        success: true,
        data: health,
      });
    } catch (error) {
      console.error('Analytics health check failed:', error);
      
      res.status(503).json({
        success: false,
        error: {
          message: 'Service unavailable',
          statusCode: 503,
        },
      });
    }
  };
}

export default new AnalyticsController();