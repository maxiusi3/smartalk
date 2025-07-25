/**
 * SmarTalk 统一错误码体系
 * 定义所有可能的错误类型和对应的错误码
 */

export enum ErrorCategory {
  // 系统级错误 (1000-1999)
  SYSTEM = 'SYSTEM',
  
  // 验证错误 (2000-2999)
  VALIDATION = 'VALIDATION',
  
  // 认证授权错误 (3000-3999)
  AUTH = 'AUTH',
  
  // 业务逻辑错误 (4000-4999)
  BUSINESS = 'BUSINESS',
  
  // 外部服务错误 (5000-5999)
  EXTERNAL = 'EXTERNAL',
  
  // 数据库错误 (6000-6999)
  DATABASE = 'DATABASE',
  
  // 网络错误 (7000-7999)
  NETWORK = 'NETWORK',
  
  // 文件处理错误 (8000-8999)
  FILE = 'FILE',
}

export interface ErrorCode {
  code: string;
  message: string;
  category: ErrorCategory;
  httpStatus: number;
  userMessage?: string;
  retryable?: boolean;
}

/**
 * 错误码定义
 */
export const ERROR_CODES: Record<string, ErrorCode> = {
  // 系统级错误 (1000-1999)
  INTERNAL_SERVER_ERROR: {
    code: 'SYS_1000',
    message: 'Internal server error',
    category: ErrorCategory.SYSTEM,
    httpStatus: 500,
    userMessage: '服务器内部错误，请稍后重试',
    retryable: true,
  },
  
  SERVICE_UNAVAILABLE: {
    code: 'SYS_1001',
    message: 'Service temporarily unavailable',
    category: ErrorCategory.SYSTEM,
    httpStatus: 503,
    userMessage: '服务暂时不可用，请稍后重试',
    retryable: true,
  },
  
  RATE_LIMIT_EXCEEDED: {
    code: 'SYS_1002',
    message: 'Rate limit exceeded',
    category: ErrorCategory.SYSTEM,
    httpStatus: 429,
    userMessage: '请求过于频繁，请稍后再试',
    retryable: true,
  },

  // 验证错误 (2000-2999)
  VALIDATION_ERROR: {
    code: 'VAL_2000',
    message: 'Request validation failed',
    category: ErrorCategory.VALIDATION,
    httpStatus: 400,
    userMessage: '请求参数有误，请检查后重试',
    retryable: false,
  },
  
  MISSING_REQUIRED_FIELD: {
    code: 'VAL_2001',
    message: 'Required field is missing',
    category: ErrorCategory.VALIDATION,
    httpStatus: 400,
    userMessage: '缺少必填字段',
    retryable: false,
  },
  
  INVALID_FORMAT: {
    code: 'VAL_2002',
    message: 'Invalid data format',
    category: ErrorCategory.VALIDATION,
    httpStatus: 400,
    userMessage: '数据格式不正确',
    retryable: false,
  },
  
  INVALID_UUID: {
    code: 'VAL_2003',
    message: 'Invalid UUID format',
    category: ErrorCategory.VALIDATION,
    httpStatus: 400,
    userMessage: 'ID格式不正确',
    retryable: false,
  },

  // 认证授权错误 (3000-3999)
  UNAUTHORIZED: {
    code: 'AUTH_3000',
    message: 'Authentication required',
    category: ErrorCategory.AUTH,
    httpStatus: 401,
    userMessage: '需要登录才能访问',
    retryable: false,
  },
  
  FORBIDDEN: {
    code: 'AUTH_3001',
    message: 'Access forbidden',
    category: ErrorCategory.AUTH,
    httpStatus: 403,
    userMessage: '没有权限访问此资源',
    retryable: false,
  },
  
  TOKEN_EXPIRED: {
    code: 'AUTH_3002',
    message: 'Authentication token expired',
    category: ErrorCategory.AUTH,
    httpStatus: 401,
    userMessage: '登录已过期，请重新登录',
    retryable: false,
  },

  // 业务逻辑错误 (4000-4999)
  RESOURCE_NOT_FOUND: {
    code: 'BIZ_4000',
    message: 'Resource not found',
    category: ErrorCategory.BUSINESS,
    httpStatus: 404,
    userMessage: '请求的资源不存在',
    retryable: false,
  },
  
  RESOURCE_CONFLICT: {
    code: 'BIZ_4001',
    message: 'Resource conflict',
    category: ErrorCategory.BUSINESS,
    httpStatus: 409,
    userMessage: '资源冲突，请刷新后重试',
    retryable: false,
  },
  
  USER_NOT_FOUND: {
    code: 'BIZ_4100',
    message: 'User not found',
    category: ErrorCategory.BUSINESS,
    httpStatus: 404,
    userMessage: '用户不存在',
    retryable: false,
  },
  
  DRAMA_NOT_FOUND: {
    code: 'BIZ_4200',
    message: 'Drama not found',
    category: ErrorCategory.BUSINESS,
    httpStatus: 404,
    userMessage: '剧集不存在',
    retryable: false,
  },
  
  KEYWORD_NOT_FOUND: {
    code: 'BIZ_4300',
    message: 'Keyword not found',
    category: ErrorCategory.BUSINESS,
    httpStatus: 404,
    userMessage: '词汇不存在',
    retryable: false,
  },
  
  PROGRESS_ALREADY_EXISTS: {
    code: 'BIZ_4400',
    message: 'Progress already exists',
    category: ErrorCategory.BUSINESS,
    httpStatus: 409,
    userMessage: '进度记录已存在',
    retryable: false,
  },

  // 外部服务错误 (5000-5999)
  EXTERNAL_SERVICE_ERROR: {
    code: 'EXT_5000',
    message: 'External service error',
    category: ErrorCategory.EXTERNAL,
    httpStatus: 502,
    userMessage: '外部服务异常，请稍后重试',
    retryable: true,
  },
  
  CDN_SERVICE_ERROR: {
    code: 'EXT_5100',
    message: 'CDN service error',
    category: ErrorCategory.EXTERNAL,
    httpStatus: 502,
    userMessage: '内容加载失败，请稍后重试',
    retryable: true,
  },
  
  VIDEO_SERVICE_ERROR: {
    code: 'EXT_5200',
    message: 'Video service error',
    category: ErrorCategory.EXTERNAL,
    httpStatus: 502,
    userMessage: '视频服务异常，请稍后重试',
    retryable: true,
  },

  // 数据库错误 (6000-6999)
  DATABASE_CONNECTION_ERROR: {
    code: 'DB_6000',
    message: 'Database connection failed',
    category: ErrorCategory.DATABASE,
    httpStatus: 503,
    userMessage: '数据库连接失败，请稍后重试',
    retryable: true,
  },
  
  DATABASE_QUERY_ERROR: {
    code: 'DB_6001',
    message: 'Database query failed',
    category: ErrorCategory.DATABASE,
    httpStatus: 500,
    userMessage: '数据查询失败，请稍后重试',
    retryable: true,
  },
  
  DATABASE_CONSTRAINT_ERROR: {
    code: 'DB_6002',
    message: 'Database constraint violation',
    category: ErrorCategory.DATABASE,
    httpStatus: 400,
    userMessage: '数据约束冲突',
    retryable: false,
  },

  // 网络错误 (7000-7999)
  NETWORK_TIMEOUT: {
    code: 'NET_7000',
    message: 'Network request timeout',
    category: ErrorCategory.NETWORK,
    httpStatus: 408,
    userMessage: '网络请求超时，请检查网络连接',
    retryable: true,
  },
  
  NETWORK_CONNECTION_ERROR: {
    code: 'NET_7001',
    message: 'Network connection failed',
    category: ErrorCategory.NETWORK,
    httpStatus: 503,
    userMessage: '网络连接失败，请检查网络设置',
    retryable: true,
  },

  // 文件处理错误 (8000-8999)
  FILE_NOT_FOUND: {
    code: 'FILE_8000',
    message: 'File not found',
    category: ErrorCategory.FILE,
    httpStatus: 404,
    userMessage: '文件不存在',
    retryable: false,
  },
  
  FILE_TOO_LARGE: {
    code: 'FILE_8001',
    message: 'File size exceeds limit',
    category: ErrorCategory.FILE,
    httpStatus: 413,
    userMessage: '文件大小超出限制',
    retryable: false,
  },
  
  INVALID_FILE_TYPE: {
    code: 'FILE_8002',
    message: 'Invalid file type',
    category: ErrorCategory.FILE,
    httpStatus: 400,
    userMessage: '不支持的文件类型',
    retryable: false,
  },
};

/**
 * 根据错误码获取错误信息
 */
export function getErrorByCode(code: string): ErrorCode | undefined {
  return Object.values(ERROR_CODES).find(error => error.code === code);
}

/**
 * 根据类别获取错误列表
 */
export function getErrorsByCategory(category: ErrorCategory): ErrorCode[] {
  return Object.values(ERROR_CODES).filter(error => error.category === category);
}

/**
 * 检查错误是否可重试
 */
export function isRetryableError(code: string): boolean {
  const error = getErrorByCode(code);
  return error?.retryable || false;
}

/**
 * 获取用户友好的错误消息
 */
export function getUserMessage(code: string, fallback?: string): string {
  const error = getErrorByCode(code);
  return error?.userMessage || fallback || '发生未知错误';
}
