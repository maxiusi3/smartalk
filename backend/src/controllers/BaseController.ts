/**
 * 基础控制器类
 * 提供统一的响应格式和错误处理
 */

import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  total?: number;
}

export abstract class BaseController {
  /**
   * 发送成功响应
   */
  protected sendSuccess<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = 200,
    pagination?: PaginationOptions
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: res.locals.requestId,
      },
    };

    // 添加分页信息
    if (pagination) {
      response.meta!.pagination = {
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        total: pagination.total || 0,
        totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 10)),
      };
    }

    res.status(statusCode).json(response);
  }

  /**
   * 发送创建成功响应
   */
  protected sendCreated<T>(
    res: Response,
    data?: T,
    message: string = 'Resource created successfully'
  ): void {
    this.sendSuccess(res, data, message, 201);
  }

  /**
   * 发送无内容响应
   */
  protected sendNoContent(res: Response): void {
    res.status(204).send();
  }

  /**
   * 发送错误响应
   */
  protected sendError(
    res: Response,
    error: {
      code: string;
      message: string;
      details?: any;
    },
    statusCode: number = 500
  ): void {
    const response: ApiResponse = {
      success: false,
      error,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: res.locals.requestId,
      },
    };

    res.status(statusCode).json(response);
  }

  /**
   * 发送验证错误响应
   */
  protected sendValidationError(
    res: Response,
    message: string,
    details?: any
  ): void {
    this.sendError(
      res,
      {
        code: 'VALIDATION_ERROR',
        message,
        details,
      },
      400
    );
  }

  /**
   * 发送未找到错误响应
   */
  protected sendNotFound(
    res: Response,
    message: string = 'Resource not found'
  ): void {
    this.sendError(
      res,
      {
        code: 'NOT_FOUND',
        message,
      },
      404
    );
  }

  /**
   * 发送未授权错误响应
   */
  protected sendUnauthorized(
    res: Response,
    message: string = 'Unauthorized access'
  ): void {
    this.sendError(
      res,
      {
        code: 'UNAUTHORIZED',
        message,
      },
      401
    );
  }

  /**
   * 发送禁止访问错误响应
   */
  protected sendForbidden(
    res: Response,
    message: string = 'Access forbidden'
  ): void {
    this.sendError(
      res,
      {
        code: 'FORBIDDEN',
        message,
      },
      403
    );
  }

  /**
   * 发送冲突错误响应
   */
  protected sendConflict(
    res: Response,
    message: string = 'Resource conflict'
  ): void {
    this.sendError(
      res,
      {
        code: 'CONFLICT',
        message,
      },
      409
    );
  }

  /**
   * 发送内部服务器错误响应
   */
  protected sendInternalError(
    res: Response,
    message: string = 'Internal server error',
    details?: any
  ): void {
    this.sendError(
      res,
      {
        code: 'INTERNAL_ERROR',
        message,
        details,
      },
      500
    );
  }

  /**
   * 解析分页参数
   */
  protected parsePaginationParams(query: any): {
    page: number;
    limit: number;
    skip: number;
  } {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  /**
   * 解析排序参数
   */
  protected parseSortParams(query: any, allowedFields: string[] = []): any {
    const { sortBy, sortOrder } = query;

    if (!sortBy || !allowedFields.includes(sortBy)) {
      return undefined;
    }

    return {
      [sortBy]: sortOrder === 'desc' ? 'desc' : 'asc',
    };
  }

  /**
   * 解析过滤参数
   */
  protected parseFilterParams(query: any, allowedFilters: string[] = []): any {
    const filters: any = {};

    allowedFilters.forEach(field => {
      if (query[field] !== undefined) {
        filters[field] = query[field];
      }
    });

    return Object.keys(filters).length > 0 ? filters : undefined;
  }
}
