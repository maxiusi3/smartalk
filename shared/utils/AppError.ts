/**
 * 统一的应用错误类
 * 提供标准化的错误处理和日志记录
 */

import { ERROR_CODES, ErrorCode, getErrorByCode, getUserMessage } from '../constants/errorCodes';

export interface ErrorContext {
  userId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  url?: string;
  method?: string;
  timestamp?: Date;
  stack?: string;
  additionalData?: Record<string, any>;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly httpStatus: number;
  public readonly category: string;
  public readonly userMessage: string;
  public readonly retryable: boolean;
  public readonly context: ErrorContext;
  public readonly originalError?: Error;

  constructor(
    codeOrMessage: string,
    context: ErrorContext = {},
    originalError?: Error
  ) {
    // 如果传入的是错误码，使用预定义的错误信息
    const errorInfo = getErrorByCode(codeOrMessage);
    
    if (errorInfo) {
      super(errorInfo.message);
      this.code = errorInfo.code;
      this.httpStatus = errorInfo.httpStatus;
      this.category = errorInfo.category;
      this.userMessage = errorInfo.userMessage || errorInfo.message;
      this.retryable = errorInfo.retryable || false;
    } else {
      // 如果传入的是自定义消息，使用默认的内部错误
      super(codeOrMessage);
      const defaultError = ERROR_CODES.INTERNAL_SERVER_ERROR;
      this.code = defaultError.code;
      this.httpStatus = defaultError.httpStatus;
      this.category = defaultError.category;
      this.userMessage = defaultError.userMessage || codeOrMessage;
      this.retryable = defaultError.retryable || false;
    }

    this.name = 'AppError';
    this.context = {
      ...context,
      timestamp: context.timestamp || new Date(),
    };
    this.originalError = originalError;

    // 保持堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * 创建验证错误
   */
  static validation(message: string, context: ErrorContext = {}): AppError {
    return new AppError('VAL_2000', {
      ...context,
      additionalData: { validationMessage: message },
    });
  }

  /**
   * 创建资源未找到错误
   */
  static notFound(resource: string, id?: string, context: ErrorContext = {}): AppError {
    return new AppError('BIZ_4000', {
      ...context,
      additionalData: { resource, id },
    });
  }

  /**
   * 创建用户未找到错误
   */
  static userNotFound(userId: string, context: ErrorContext = {}): AppError {
    return new AppError('BIZ_4100', {
      ...context,
      additionalData: { userId },
    });
  }

  /**
   * 创建剧集未找到错误
   */
  static dramaNotFound(dramaId: string, context: ErrorContext = {}): AppError {
    return new AppError('BIZ_4200', {
      ...context,
      additionalData: { dramaId },
    });
  }

  /**
   * 创建词汇未找到错误
   */
  static keywordNotFound(keywordId: string, context: ErrorContext = {}): AppError {
    return new AppError('BIZ_4300', {
      ...context,
      additionalData: { keywordId },
    });
  }

  /**
   * 创建数据库错误
   */
  static database(originalError: Error, context: ErrorContext = {}): AppError {
    return new AppError('DB_6001', context, originalError);
  }

  /**
   * 创建外部服务错误
   */
  static externalService(service: string, originalError: Error, context: ErrorContext = {}): AppError {
    return new AppError('EXT_5000', {
      ...context,
      additionalData: { service },
    }, originalError);
  }

  /**
   * 创建网络错误
   */
  static network(originalError: Error, context: ErrorContext = {}): AppError {
    return new AppError('NET_7001', context, originalError);
  }

  /**
   * 创建速率限制错误
   */
  static rateLimit(context: ErrorContext = {}): AppError {
    return new AppError('SYS_1002', context);
  }

  /**
   * 转换为JSON格式
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      httpStatus: this.httpStatus,
      category: this.category,
      retryable: this.retryable,
      context: this.context,
      stack: this.stack,
      originalError: this.originalError ? {
        name: this.originalError.name,
        message: this.originalError.message,
        stack: this.originalError.stack,
      } : undefined,
    };
  }

  /**
   * 转换为API响应格式
   */
  toApiResponse(): {
    success: false;
    error: {
      code: string;
      message: string;
      details?: any;
    };
  } {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.userMessage,
        details: this.context.additionalData,
      },
    };
  }

  /**
   * 检查是否为特定类型的错误
   */
  isType(code: string): boolean {
    return this.code === code;
  }

  /**
   * 检查是否为特定类别的错误
   */
  isCategory(category: string): boolean {
    return this.category === category;
  }

  /**
   * 检查是否可重试
   */
  isRetryable(): boolean {
    return this.retryable;
  }

  /**
   * 获取用户友好的错误消息
   */
  getUserMessage(): string {
    return this.userMessage;
  }

  /**
   * 获取错误上下文
   */
  getContext(): ErrorContext {
    return this.context;
  }

  /**
   * 添加上下文信息
   */
  addContext(additionalContext: Partial<ErrorContext>): AppError {
    Object.assign(this.context, additionalContext);
    return this;
  }
}

/**
 * 错误工厂函数
 */
export class ErrorFactory {
  /**
   * 从原生错误创建AppError
   */
  static fromError(error: Error, context: ErrorContext = {}): AppError {
    if (error instanceof AppError) {
      return error.addContext(context);
    }

    // 根据错误类型判断错误码
    if (error.name === 'ValidationError') {
      return AppError.validation(error.message, context);
    }

    if (error.message.includes('not found')) {
      return AppError.notFound('resource', undefined, context);
    }

    if (error.message.includes('timeout')) {
      return AppError.network(error, context);
    }

    // 默认为内部服务器错误
    return new AppError('SYS_1000', context, error);
  }

  /**
   * 从HTTP状态码创建错误
   */
  static fromHttpStatus(status: number, message?: string, context: ErrorContext = {}): AppError {
    switch (status) {
      case 400:
        return AppError.validation(message || 'Bad request', context);
      case 401:
        return new AppError('AUTH_3000', context);
      case 403:
        return new AppError('AUTH_3001', context);
      case 404:
        return AppError.notFound('resource', undefined, context);
      case 409:
        return new AppError('BIZ_4001', context);
      case 429:
        return AppError.rateLimit(context);
      case 500:
      default:
        return new AppError('SYS_1000', context);
    }
  }
}
