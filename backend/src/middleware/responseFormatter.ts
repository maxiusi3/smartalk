/**
 * API响应格式标准化中间件
 * 确保所有API响应都遵循统一的格式
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface StandardApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta: {
    timestamp: string;
    requestId: string;
    version?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * 响应格式化中间件
 * 为每个请求添加标准的响应格式化方法
 */
export function responseFormatterMiddleware(req: Request, res: Response, next: NextFunction) {
  // 生成请求ID
  const requestId = uuidv4();
  res.locals.requestId = requestId;

  // 添加标准成功响应方法
  res.sendSuccess = function<T>(
    data?: T,
    message?: string,
    statusCode: number = 200,
    pagination?: {
      page: number;
      limit: number;
      total: number;
    }
  ) {
    const response: StandardApiResponse<T> = {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
        version: req.headers['api-version'] as string || 'v1',
      },
    };

    // 添加分页信息
    if (pagination) {
      response.meta.pagination = {
        ...pagination,
        totalPages: Math.ceil(pagination.total / pagination.limit),
      };
    }

    return this.status(statusCode).json(response);
  };

  // 添加标准错误响应方法
  res.sendError = function(
    error: {
      code: string;
      message: string;
      details?: any;
    },
    statusCode: number = 500
  ) {
    const response: StandardApiResponse = {
      success: false,
      error,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
        version: req.headers['api-version'] as string || 'v1',
      },
    };

    return this.status(statusCode).json(response);
  };

  // 添加便捷的错误响应方法
  res.sendValidationError = function(message: string, details?: any) {
    return this.sendError({
      code: 'VALIDATION_ERROR',
      message,
      details,
    }, 400);
  };

  res.sendNotFound = function(message: string = 'Resource not found') {
    return this.sendError({
      code: 'NOT_FOUND',
      message,
    }, 404);
  };

  res.sendUnauthorized = function(message: string = 'Unauthorized access') {
    return this.sendError({
      code: 'UNAUTHORIZED',
      message,
    }, 401);
  };

  res.sendForbidden = function(message: string = 'Access forbidden') {
    return this.sendError({
      code: 'FORBIDDEN',
      message,
    }, 403);
  };

  res.sendConflict = function(message: string = 'Resource conflict') {
    return this.sendError({
      code: 'CONFLICT',
      message,
    }, 409);
  };

  res.sendInternalError = function(message: string = 'Internal server error', details?: any) {
    return this.sendError({
      code: 'INTERNAL_ERROR',
      message,
      details,
    }, 500);
  };

  next();
}

/**
 * 请求日志中间件
 * 记录请求和响应信息
 */
export function requestLoggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const requestId = res.locals.requestId;

  // 记录请求信息
  console.log(`[${requestId}] ${req.method} ${req.path} - Started`);

  // 监听响应完成
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const statusClass = Math.floor(statusCode / 100);

    let logLevel = 'info';
    if (statusClass === 4) logLevel = 'warn';
    if (statusClass === 5) logLevel = 'error';

    console.log(
      `[${requestId}] ${req.method} ${req.path} - ${statusCode} - ${duration}ms`
    );
  });

  next();
}

/**
 * 安全头中间件
 * 添加安全相关的响应头
 */
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  // 添加安全头
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 添加API版本头
  res.setHeader('API-Version', req.headers['api-version'] || 'v1');

  next();
}

/**
 * CORS配置中间件
 * 配置跨域资源共享
 */
export function corsConfigMiddleware(req: Request, res: Response, next: NextFunction) {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:19006',
    'exp://localhost:19000',
    process.env.FRONTEND_URL,
    process.env.MOBILE_URL,
  ].filter(Boolean);

  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, API-Version');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
}

// 扩展Express Response类型
declare global {
  namespace Express {
    interface Response {
      sendSuccess<T>(
        data?: T,
        message?: string,
        statusCode?: number,
        pagination?: {
          page: number;
          limit: number;
          total: number;
        }
      ): Response;
      
      sendError(
        error: {
          code: string;
          message: string;
          details?: any;
        },
        statusCode?: number
      ): Response;
      
      sendValidationError(message: string, details?: any): Response;
      sendNotFound(message?: string): Response;
      sendUnauthorized(message?: string): Response;
      sendForbidden(message?: string): Response;
      sendConflict(message?: string): Response;
      sendInternalError(message?: string, details?: any): Response;
    }
  }
}
