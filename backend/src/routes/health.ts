import { Router, Request, Response } from 'express';
import prisma from '@/utils/database';

const router = Router();

// 健康检查端点
router.get('/', async (req: Request, res: Response) => {
  try {
    // 检查数据库连接
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: 'connected'
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        message: 'Database connection failed'
      }
    });
  }
});

export default router;
