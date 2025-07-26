/**
 * API 工具函数
 * 简化的 API 响应和错误处理
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 成功响应
export const createSuccessResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString(),
});

// 错误响应
export const createErrorResponse = (error: string, code?: string): ApiResponse => ({
  success: false,
  error,
  timestamp: new Date().toISOString(),
});

// 分页响应
export const createPaginatedResponse = <T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): PaginatedResponse<T> => ({
  success: true,
  data,
  message,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
  timestamp: new Date().toISOString(),
});

// 错误处理函数
export const handleApiError = (error: Error): ApiResponse => {
  console.error('API Error:', error);
  
  if (error.message.includes('validation')) {
    return createErrorResponse(`Validation error: ${error.message}`);
  }
  
  if (error.message.includes('not found')) {
    return createErrorResponse('Resource not found');
  }
  
  if (error.message.includes('unauthorized') || error.message.includes('Authentication required')) {
    return createErrorResponse('Unauthorized');
  }
  
  return createErrorResponse(error.message || 'An unknown error occurred');
};

// 分页参数标准化
export const normalizePaginationParams = (
  page: string | string[] | undefined,
  limit: string | string[] | undefined,
  maxLimit: number = 100
) => {
  const normalizedPage = Math.max(1, parseInt(Array.isArray(page) ? page[0] : page || '1', 10));
  const normalizedLimit = Math.min(
    maxLimit,
    Math.max(1, parseInt(Array.isArray(limit) ? limit[0] : limit || '10', 10))
  );
  
  return {
    page: normalizedPage,
    limit: normalizedLimit,
  };
};

// 排序参数标准化
export const normalizeSortParams = (
  sort: string | undefined,
  order: string | undefined,
  allowedFields: string[] = []
) => {
  const normalizedSort = allowedFields.includes(sort || '') ? sort : undefined;
  const normalizedOrder = order === 'desc' ? 'desc' : 'asc';
  
  return {
    sort: normalizedSort,
    order: normalizedOrder,
  };
};
