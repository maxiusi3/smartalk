import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError, ErrorFactory } from '../../shared/utils/AppError';
import { logger } from '../../shared/utils/Logger';

// 保持向后兼容的错误接口
export interface LegacyAppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

// 保持向后兼容的错误创建函数
export const createError = (message: string, statusCode: number = 500): LegacyAppError => {
  const error = new Error(message) as LegacyAppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

// 全局错误处理中间件
export const errorHandler = (
  err: Error | AppError | LegacyAppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 转换为统一的AppError格式
  let appError: AppError;

  if (err instanceof AppError) {
    appError = err;
  } else {
    // 处理Prisma错误
    if (err.name === 'PrismaClientKnownRequestError') {
      const prismaError = err as Prisma.PrismaClientKnownRequestError;
      switch (prismaError.code) {
        case 'P2002':
          appError = new AppError('BIZ_4001', {
            requestId: res.locals.requestId,
            userId: req.headers['user-id'] as string,
            userAgent: req.headers['user-agent'],
            ip: req.ip,
            url: req.url,
            method: req.method,
            additionalData: { prismaCode: prismaError.code },
          }, err);
          break;
        case 'P2025':
          appError = new AppError('BIZ_4000', {
            requestId: res.locals.requestId,
            userId: req.headers['user-id'] as string,
            userAgent: req.headers['user-agent'],
            ip: req.ip,
            url: req.url,
            method: req.method,
            additionalData: { prismaCode: prismaError.code },
          }, err);
          break;
        default:
          appError = new AppError('DB_6001', {
            requestId: res.locals.requestId,
            userId: req.headers['user-id'] as string,
            userAgent: req.headers['user-agent'],
            ip: req.ip,
            url: req.url,
            method: req.method,
            additionalData: { prismaCode: prismaError.code },
          }, err);
      }
    } else {
      // 处理其他错误
      appError = ErrorFactory.fromError(err, {
        requestId: res.locals.requestId,
        userId: req.headers['user-id'] as string,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
        url: req.url,
        method: req.method,
      });
    }
  }

  // 记录错误日志
  logger.error(appError.message, appError.getContext(), appError.originalError || appError);

  // 构建响应
  const response = appError.toApiResponse();

  // 在开发环境中添加调试信息
  if (process.env.NODE_ENV === 'development') {
    response.error.details = {
      ...response.error.details,
      stack: appError.stack,
      originalError: appError.originalError ? {
        name: appError.originalError.name,
        message: appError.originalError.message,
        stack: appError.originalError.stack,
      } : undefined,
    };
  }

  // 添加响应元数据
  const responseWithMeta = {
    ...response,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId,
      version: req.headers['api-version'] || 'v1',
    },
  };

  res.status(appError.httpStatus).json(responseWithMeta);
};
