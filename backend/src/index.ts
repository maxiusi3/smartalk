import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';
import { requestLogger } from '@/middleware/requestLogger';
import {
  responseFormatterMiddleware,
  requestLoggingMiddleware,
  securityHeadersMiddleware,
  corsConfigMiddleware
} from '@/middleware/responseFormatter';
import { performanceMonitoringMiddleware } from '@/middleware/performanceMonitoring';
import { connectDatabase } from '@/utils/database';

// 路由导入
import { apiVersionManager } from '@/routes/ApiVersionManager';
import healthRoutes from '@/routes/health';
import userRoutes from '@/routes/users';
import interestRoutes from '@/routes/interests';
import dramaRoutes from '@/routes/dramas';
import progressRoutes from '@/routes/progress';
import analyticsRoutes from '@/routes/analytics';
import monitoringRoutes from '@/routes/monitoring';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec, swaggerUiOptions } from '@/config/swagger';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 基础中间件
app.use(helmet());
app.use(compression());
app.use(corsConfigMiddleware);
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 自定义中间件
app.use(securityHeadersMiddleware);
app.use(responseFormatterMiddleware);
app.use(performanceMonitoringMiddleware);
app.use(requestLoggingMiddleware);
app.use(requestLogger);

// API路由 - 使用版本管理器
app.use('/api', apiVersionManager.getRouter());

// 向后兼容的路由（保留原有路由）
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/interests', interestRoutes);
app.use('/api/v1/dramas', dramaRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/monitoring', monitoringRoutes);

// API 文档
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API文档端点
app.get('/api/docs', (req, res) => {
  const docs = apiVersionManager.generateApiDocs();
  res.json(docs);
});

// 错误处理中间件
app.use(notFoundHandler);
app.use(errorHandler);

// 启动服务器
const startServer = async () => {
  try {
    // 连接数据库
    await connectDatabase();

    // 启动HTTP服务器
    app.listen(PORT, () => {
      console.log(`🚀 SmarTalk Backend Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/v1/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// 启动应用
startServer();

export default app;
