/**
 * SmarTalk API 响应格式化工具
 * 统一的 API 响应格式化和错误处理
 */

import { v4 as uuidv4 } from 'uuid';
import {
  ApiResponse,
  ApiError,
  ApiMeta,
  ApiErrorCode,
  HttpStatus,
  SuccessResponse,
  ErrorResponse,
  PaginationMeta,
} from '@shared/types/api.types';

/**
 * 创建成功响应
 */
export function createSuccessResponse<T>(
  data: T,
  meta?: Partial<ApiMeta>,
  requestId?: string
): SuccessResponse<T> {
  return {
    success: true,
    data,
    meta: meta ? { ...meta } : undefined,
    timestamp: new Date().toISOString(),
    requestId: requestId || uuidv4(),
  };
}

/**
 * 创建错误响应
 */
export function createErrorResponse(
  error: ApiError,
  meta?: Partial<ApiMeta>,
  requestId?: string
): ErrorResponse {
  return {
    success: false,
    error,
    meta: meta ? { ...meta } : undefined,
    timestamp: new Date().toISOString(),
    requestId: requestId || uuidv4(),
  };
}

/**
 * 创建分页响应
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  requestId?: string
): SuccessResponse<T[]> {
  return createSuccessResponse(
    data,
    { pagination },
    requestId
  );
}

/**
 * 创建 API 错误对象
 */
export function createApiError(
  code: ApiErrorCode,
  message: string,
  details?: Record<string, any>,
  field?: string,
  stack?: string
): ApiError {
  return {
    code,
    message,
    details,
    field,
    stack: process.env.NODE_ENV === 'development' ? stack : undefined,
  };
}

/**
 * 常用错误创建函数
 */
export const ApiErrors = {
  // 通用错误
  unknownError: (message = 'An unknown error occurred', details?: Record<string, any>) =>
    createApiError(ApiErrorCode.UNKNOWN_ERROR, message, details),

  validationError: (message = 'Validation failed', field?: string, details?: Record<string, any>) =>
    createApiError(ApiErrorCode.VALIDATION_ERROR, message, details, field),

  authenticationError: (message = 'Authentication required') =>
    createApiError(ApiErrorCode.AUTHENTICATION_ERROR, message),

  authorizationError: (message = 'Insufficient permissions') =>
    createApiError(ApiErrorCode.AUTHORIZATION_ERROR, message),

  notFoundError: (resource = 'Resource', id?: string) =>
    createApiError(
      ApiErrorCode.NOT_FOUND_ERROR,
      `${resource} not found${id ? ` with id: ${id}` : ''}`,
      id ? { id } : undefined
    ),

  conflictError: (message = 'Resource already exists', details?: Record<string, any>) =>
    createApiError(ApiErrorCode.CONFLICT_ERROR, message, details),

  rateLimitError: (message = 'Rate limit exceeded', retryAfter?: number) =>
    createApiError(
      ApiErrorCode.RATE_LIMIT_ERROR,
      message,
      retryAfter ? { retryAfter } : undefined
    ),

  // 用户相关错误
  userNotFound: (userId?: string) =>
    createApiError(
      ApiErrorCode.USER_NOT_FOUND,
      'User not found',
      userId ? { userId } : undefined
    ),

  userAlreadyExists: (email?: string) =>
    createApiError(
      ApiErrorCode.USER_ALREADY_EXISTS,
      'User already exists',
      email ? { email } : undefined
    ),

  invalidCredentials: () =>
    createApiError(ApiErrorCode.INVALID_CREDENTIALS, 'Invalid email or password'),

  emailNotVerified: () =>
    createApiError(ApiErrorCode.EMAIL_NOT_VERIFIED, 'Email address not verified'),

  // 内容相关错误
  storyNotFound: (storyId?: string) =>
    createApiError(
      ApiErrorCode.STORY_NOT_FOUND,
      'Story not found',
      storyId ? { storyId } : undefined
    ),

  videoNotFound: (videoId?: string) =>
    createApiError(
      ApiErrorCode.VIDEO_NOT_FOUND,
      'Video not found',
      videoId ? { videoId } : undefined
    ),

  keywordNotFound: (keywordId?: string) =>
    createApiError(
      ApiErrorCode.KEYWORD_NOT_FOUND,
      'Keyword not found',
      keywordId ? { keywordId } : undefined
    ),

  // 学习相关错误
  progressNotFound: (progressId?: string) =>
    createApiError(
      ApiErrorCode.PROGRESS_NOT_FOUND,
      'Progress record not found',
      progressId ? { progressId } : undefined
    ),

  achievementNotFound: (achievementId?: string) =>
    createApiError(
      ApiErrorCode.ACHIEVEMENT_NOT_FOUND,
      'Achievement not found',
      achievementId ? { achievementId } : undefined
    ),

  // 文件相关错误
  fileTooLarge: (maxSize: string) =>
    createApiError(
      ApiErrorCode.FILE_TOO_LARGE,
      `File size exceeds maximum allowed size of ${maxSize}`,
      { maxSize }
    ),

  invalidFileType: (allowedTypes: string[]) =>
    createApiError(
      ApiErrorCode.INVALID_FILE_TYPE,
      `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      { allowedTypes }
    ),

  uploadFailed: (reason?: string) =>
    createApiError(
      ApiErrorCode.UPLOAD_FAILED,
      `File upload failed${reason ? `: ${reason}` : ''}`,
      reason ? { reason } : undefined
    ),
};

/**
 * 常用成功响应创建函数
 */
export const ApiResponses = {
  // 通用成功响应
  ok: <T>(data: T, requestId?: string) =>
    createSuccessResponse(data, undefined, requestId),

  created: <T>(data: T, requestId?: string) =>
    createSuccessResponse(data, undefined, requestId),

  noContent: (requestId?: string) =>
    createSuccessResponse(null, undefined, requestId),

  // 分页响应
  paginated: <T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    requestId?: string
  ) => {
    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
    return createPaginatedResponse(data, pagination, requestId);
  },
};

/**
 * HTTP 状态码映射
 */
export const getHttpStatusFromError = (error: ApiError): HttpStatus => {
  switch (error.code) {
    case ApiErrorCode.VALIDATION_ERROR:
      return HttpStatus.BAD_REQUEST;
    case ApiErrorCode.AUTHENTICATION_ERROR:
      return HttpStatus.UNAUTHORIZED;
    case ApiErrorCode.AUTHORIZATION_ERROR:
      return HttpStatus.FORBIDDEN;
    case ApiErrorCode.NOT_FOUND_ERROR:
    case ApiErrorCode.USER_NOT_FOUND:
    case ApiErrorCode.STORY_NOT_FOUND:
    case ApiErrorCode.VIDEO_NOT_FOUND:
    case ApiErrorCode.KEYWORD_NOT_FOUND:
    case ApiErrorCode.PROGRESS_NOT_FOUND:
    case ApiErrorCode.ACHIEVEMENT_NOT_FOUND:
      return HttpStatus.NOT_FOUND;
    case ApiErrorCode.CONFLICT_ERROR:
    case ApiErrorCode.USER_ALREADY_EXISTS:
      return HttpStatus.CONFLICT;
    case ApiErrorCode.FILE_TOO_LARGE:
    case ApiErrorCode.INVALID_FILE_TYPE:
    case ApiErrorCode.INVALID_CREDENTIALS:
    case ApiErrorCode.EMAIL_NOT_VERIFIED:
      return HttpStatus.UNPROCESSABLE_ENTITY;
    case ApiErrorCode.RATE_LIMIT_ERROR:
      return 429; // Too Many Requests
    case ApiErrorCode.UPLOAD_FAILED:
    case ApiErrorCode.UNKNOWN_ERROR:
    default:
      return HttpStatus.INTERNAL_SERVER_ERROR;
  }
};

/**
 * 错误响应中间件辅助函数
 */
export function handleApiError(error: Error, requestId?: string): ErrorResponse {
  // 如果是已知的 API 错误
  if (error.name === 'ApiError' && 'code' in error) {
    return createErrorResponse(error as ApiError, undefined, requestId);
  }

  // 处理常见的错误类型
  if (error.name === 'ValidationError') {
    return createErrorResponse(
      ApiErrors.validationError(error.message),
      undefined,
      requestId
    );
  }

  if (error.name === 'UnauthorizedError') {
    return createErrorResponse(
      ApiErrors.authenticationError(error.message),
      undefined,
      requestId
    );
  }

  if (error.name === 'ForbiddenError') {
    return createErrorResponse(
      ApiErrors.authorizationError(error.message),
      undefined,
      requestId
    );
  }

  if (error.name === 'NotFoundError') {
    return createErrorResponse(
      ApiErrors.notFoundError('Resource'),
      undefined,
      requestId
    );
  }

  // 默认未知错误
  return createErrorResponse(
    ApiErrors.unknownError(error.message, { stack: error.stack }),
    undefined,
    requestId
  );
}

/**
 * 分页参数验证和标准化
 */
export function normalizePaginationParams(
  page?: number | string,
  limit?: number | string,
  maxLimit = 100
): { page: number; limit: number } {
  const normalizedPage = Math.max(1, parseInt(String(page || 1), 10) || 1);
  const normalizedLimit = Math.min(
    maxLimit,
    Math.max(1, parseInt(String(limit || 10), 10) || 10)
  );

  return {
    page: normalizedPage,
    limit: normalizedLimit,
  };
}

/**
 * 排序参数验证和标准化
 */
export function normalizeSortParams(
  sort?: string,
  order?: string,
  allowedFields: string[] = []
): { sort?: string; order: 'asc' | 'desc' } {
  const normalizedOrder = order?.toLowerCase() === 'desc' ? 'desc' : 'asc';
  
  let normalizedSort: string | undefined;
  if (sort && allowedFields.length > 0) {
    normalizedSort = allowedFields.includes(sort) ? sort : undefined;
  } else if (sort) {
    normalizedSort = sort;
  }

  return {
    sort: normalizedSort,
    order: normalizedOrder,
  };
}

/**
 * API 响应类型守卫
 */
export function isSuccessResponse<T>(response: ApiResponse<T>): response is SuccessResponse<T> {
  return response.success === true;
}

export function isErrorResponse(response: ApiResponse): response is ErrorResponse {
  return response.success === false;
}

/**
 * 自定义 API 错误类
 */
export class ApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly details?: Record<string, any>;
  public readonly field?: string;

  constructor(
    code: ApiErrorCode,
    message: string,
    details?: Record<string, any>,
    field?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.field = field;
  }

  toJSON(): ApiError {
    return createApiError(this.code, this.message, this.details, this.field, this.stack);
  }
}

export default {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  createApiError,
  ApiErrors,
  ApiResponses,
  getHttpStatusFromError,
  handleApiError,
  normalizePaginationParams,
  normalizeSortParams,
  isSuccessResponse,
  isErrorResponse,
  ApiError,
};
