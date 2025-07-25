/**
 * SmarTalk 统一错误处理工具
 * 提供前后端通用的错误处理和日志记录功能
 */

import { ApiError, ApiErrorCode, createApiError } from './apiResponse';

// 错误级别枚举
export enum ErrorLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// 错误上下文接口
export interface ErrorContext {
  userId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  url?: string;
  method?: string;
  timestamp?: string;
  environment?: string;
  version?: string;
  additionalData?: Record<string, any>;
}

// 错误报告接口
export interface ErrorReport {
  error: Error | ApiError;
  level: ErrorLevel;
  context: ErrorContext;
  stack?: string;
  fingerprint?: string;
}

// 错误处理器接口
export interface ErrorHandler {
  handle(report: ErrorReport): Promise<void>;
}

/**
 * 错误分类器
 */
export class ErrorClassifier {
  /**
   * 根据错误类型确定错误级别
   */
  static classifyError(error: Error | ApiError): ErrorLevel {
    // API 错误分类
    if (error instanceof ApiError || 'code' in error) {
      const apiError = error as ApiError;
      
      switch (apiError.code) {
        case ApiErrorCode.UNKNOWN_ERROR:
        case ApiErrorCode.UPLOAD_FAILED:
          return ErrorLevel.HIGH;
          
        case ApiErrorCode.AUTHENTICATION_ERROR:
        case ApiErrorCode.AUTHORIZATION_ERROR:
          return ErrorLevel.MEDIUM;
          
        case ApiErrorCode.VALIDATION_ERROR:
        case ApiErrorCode.NOT_FOUND_ERROR:
        case ApiErrorCode.USER_NOT_FOUND:
        case ApiErrorCode.STORY_NOT_FOUND:
        case ApiErrorCode.VIDEO_NOT_FOUND:
        case ApiErrorCode.KEYWORD_NOT_FOUND:
        case ApiErrorCode.PROGRESS_NOT_FOUND:
        case ApiErrorCode.ACHIEVEMENT_NOT_FOUND:
          return ErrorLevel.LOW;
          
        case ApiErrorCode.CONFLICT_ERROR:
        case ApiErrorCode.USER_ALREADY_EXISTS:
          return ErrorLevel.MEDIUM;
          
        case ApiErrorCode.RATE_LIMIT_ERROR:
          return ErrorLevel.MEDIUM;
          
        case ApiErrorCode.FILE_TOO_LARGE:
        case ApiErrorCode.INVALID_FILE_TYPE:
          return ErrorLevel.LOW;
          
        default:
          return ErrorLevel.MEDIUM;
      }
    }
    
    // 系统错误分类
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      return ErrorLevel.HIGH;
    }
    
    if (error.name === 'ValidationError') {
      return ErrorLevel.LOW;
    }
    
    if (error.name === 'DatabaseError' || error.name === 'ConnectionError') {
      return ErrorLevel.CRITICAL;
    }
    
    // 默认中等级别
    return ErrorLevel.MEDIUM;
  }
  
  /**
   * 生成错误指纹用于去重
   */
  static generateFingerprint(error: Error | ApiError, context: ErrorContext): string {
    const errorType = error.constructor.name;
    const errorMessage = error.message;
    const errorCode = 'code' in error ? error.code : 'UNKNOWN';
    const url = context.url || 'unknown';
    
    // 简化错误消息，移除动态部分
    const simplifiedMessage = errorMessage
      .replace(/\d+/g, 'N')  // 替换数字
      .replace(/[a-f0-9-]{36}/g, 'UUID')  // 替换 UUID
      .replace(/[a-f0-9]{24}/g, 'ID');  // 替换 MongoDB ID
    
    return `${errorType}:${errorCode}:${simplifiedMessage}:${url}`;
  }
}

/**
 * 控制台错误处理器
 */
export class ConsoleErrorHandler implements ErrorHandler {
  async handle(report: ErrorReport): Promise<void> {
    const { error, level, context } = report;
    
    const logLevel = this.getLogLevel(level);
    const timestamp = new Date().toISOString();
    
    const logData = {
      timestamp,
      level: level.toUpperCase(),
      error: {
        name: error.name,
        message: error.message,
        code: 'code' in error ? error.code : undefined,
        stack: error.stack,
      },
      context: {
        requestId: context.requestId,
        userId: context.userId,
        url: context.url,
        method: context.method,
        userAgent: context.userAgent,
        ip: context.ip,
      },
      fingerprint: report.fingerprint,
    };
    
    console[logLevel]('Error Report:', JSON.stringify(logData, null, 2));
  }
  
  private getLogLevel(level: ErrorLevel): 'error' | 'warn' | 'info' {
    switch (level) {
      case ErrorLevel.CRITICAL:
      case ErrorLevel.HIGH:
        return 'error';
      case ErrorLevel.MEDIUM:
        return 'warn';
      case ErrorLevel.LOW:
        return 'info';
      default:
        return 'error';
    }
  }
}

/**
 * 文件错误处理器
 */
export class FileErrorHandler implements ErrorHandler {
  constructor(private logFilePath: string) {}
  
  async handle(report: ErrorReport): Promise<void> {
    const fs = await import('fs');
    const path = await import('path');
    
    const { error, level, context } = report;
    const timestamp = new Date().toISOString();
    
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      error: {
        name: error.name,
        message: error.message,
        code: 'code' in error ? error.code : undefined,
        stack: error.stack,
      },
      context,
      fingerprint: report.fingerprint,
    };
    
    const logLine = JSON.stringify(logEntry) + '\n';
    
    try {
      // 确保日志目录存在
      const logDir = path.dirname(this.logFilePath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      // 追加日志
      fs.appendFileSync(this.logFilePath, logLine);
    } catch (writeError) {
      console.error('Failed to write error log:', writeError);
    }
  }
}

/**
 * Sentry 错误处理器
 */
export class SentryErrorHandler implements ErrorHandler {
  private sentry: any;
  
  constructor() {
    try {
      this.sentry = require('@sentry/node');
    } catch (error) {
      console.warn('Sentry not available, skipping Sentry error handler');
    }
  }
  
  async handle(report: ErrorReport): Promise<void> {
    if (!this.sentry) return;
    
    const { error, level, context } = report;
    
    this.sentry.withScope((scope: any) => {
      // 设置错误级别
      scope.setLevel(this.mapErrorLevel(level));
      
      // 设置用户信息
      if (context.userId) {
        scope.setUser({ id: context.userId });
      }
      
      // 设置请求信息
      if (context.requestId) {
        scope.setTag('requestId', context.requestId);
      }
      
      if (context.url) {
        scope.setTag('url', context.url);
      }
      
      if (context.method) {
        scope.setTag('method', context.method);
      }
      
      // 设置环境信息
      if (context.environment) {
        scope.setTag('environment', context.environment);
      }
      
      if (context.version) {
        scope.setTag('version', context.version);
      }
      
      // 设置指纹用于去重
      if (report.fingerprint) {
        scope.setFingerprint([report.fingerprint]);
      }
      
      // 设置额外数据
      if (context.additionalData) {
        scope.setContext('additional', context.additionalData);
      }
      
      // 发送错误
      this.sentry.captureException(error);
    });
  }
  
  private mapErrorLevel(level: ErrorLevel): string {
    switch (level) {
      case ErrorLevel.CRITICAL:
        return 'fatal';
      case ErrorLevel.HIGH:
        return 'error';
      case ErrorLevel.MEDIUM:
        return 'warning';
      case ErrorLevel.LOW:
        return 'info';
      default:
        return 'error';
    }
  }
}

/**
 * 统一错误管理器
 */
export class ErrorManager {
  private handlers: ErrorHandler[] = [];
  private isEnabled = true;
  
  constructor() {
    // 默认添加控制台处理器
    this.addHandler(new ConsoleErrorHandler());
  }
  
  /**
   * 添加错误处理器
   */
  addHandler(handler: ErrorHandler): void {
    this.handlers.push(handler);
  }
  
  /**
   * 移除错误处理器
   */
  removeHandler(handler: ErrorHandler): void {
    const index = this.handlers.indexOf(handler);
    if (index > -1) {
      this.handlers.splice(index, 1);
    }
  }
  
  /**
   * 启用/禁用错误处理
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
  
  /**
   * 处理错误
   */
  async handleError(
    error: Error | ApiError,
    context: Partial<ErrorContext> = {}
  ): Promise<void> {
    if (!this.isEnabled) return;
    
    try {
      const level = ErrorClassifier.classifyError(error);
      const fullContext: ErrorContext = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.APP_VERSION || '1.0.0',
        ...context,
      };
      
      const fingerprint = ErrorClassifier.generateFingerprint(error, fullContext);
      
      const report: ErrorReport = {
        error,
        level,
        context: fullContext,
        stack: error.stack,
        fingerprint,
      };
      
      // 并行处理所有处理器
      await Promise.allSettled(
        this.handlers.map(handler => handler.handle(report))
      );
    } catch (handlerError) {
      console.error('Error in error handler:', handlerError);
    }
  }
  
  /**
   * 创建错误处理中间件（Express）
   */
  createExpressMiddleware() {
    return async (error: any, req: any, res: any, next: any) => {
      const context: ErrorContext = {
        requestId: req.id || req.headers['x-request-id'],
        userId: req.user?.id,
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection.remoteAddress,
        url: req.originalUrl || req.url,
        method: req.method,
        additionalData: {
          body: req.body,
          params: req.params,
          query: req.query,
        },
      };
      
      await this.handleError(error, context);
      
      // 继续错误处理流程
      next(error);
    };
  }
  
  /**
   * 创建全局异常处理器
   */
  setupGlobalHandlers(): void {
    // 处理未捕获的异常
    process.on('uncaughtException', async (error) => {
      await this.handleError(error, {
        additionalData: { type: 'uncaughtException' },
      });
      
      // 在生产环境中退出进程
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    });
    
    // 处理未处理的 Promise 拒绝
    process.on('unhandledRejection', async (reason, promise) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      
      await this.handleError(error, {
        additionalData: {
          type: 'unhandledRejection',
          promise: promise.toString(),
        },
      });
    });
  }
}

// 创建全局错误管理器实例
export const globalErrorManager = new ErrorManager();

// 便捷函数
export const handleError = (error: Error | ApiError, context?: Partial<ErrorContext>) =>
  globalErrorManager.handleError(error, context);

export const setupErrorHandling = (options: {
  enableSentry?: boolean;
  sentryDsn?: string;
  logFilePath?: string;
  enableGlobalHandlers?: boolean;
} = {}) => {
  // 设置 Sentry
  if (options.enableSentry && options.sentryDsn) {
    try {
      const Sentry = require('@sentry/node');
      Sentry.init({ dsn: options.sentryDsn });
      globalErrorManager.addHandler(new SentryErrorHandler());
    } catch (error) {
      console.warn('Failed to setup Sentry:', error);
    }
  }
  
  // 设置文件日志
  if (options.logFilePath) {
    globalErrorManager.addHandler(new FileErrorHandler(options.logFilePath));
  }
  
  // 设置全局处理器
  if (options.enableGlobalHandlers !== false) {
    globalErrorManager.setupGlobalHandlers();
  }
  
  return globalErrorManager;
};

export default {
  ErrorClassifier,
  ConsoleErrorHandler,
  FileErrorHandler,
  SentryErrorHandler,
  ErrorManager,
  globalErrorManager,
  handleError,
  setupErrorHandling,
};
