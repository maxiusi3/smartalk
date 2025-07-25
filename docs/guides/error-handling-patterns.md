# SmarTalk 错误处理模式指南

## 📋 概述

本文档定义了 SmarTalk 项目中统一的错误处理模式和最佳实践，确保前后端错误处理的一致性和可维护性。

## 🎯 设计原则

### 核心原则
1. **统一性**: 前后端使用一致的错误处理模式
2. **可追踪性**: 所有错误都应该可以追踪和调试
3. **用户友好**: 向用户展示清晰、可操作的错误信息
4. **可恢复性**: 提供错误恢复机制和重试策略
5. **可监控性**: 支持错误监控和告警

### 错误分类
- **系统错误**: 服务器内部错误、网络错误等
- **业务错误**: 业务逻辑验证失败、权限不足等
- **用户错误**: 输入验证失败、操作不当等
- **外部错误**: 第三方服务错误、依赖服务不可用等

## 🏗️ 错误处理架构

### 整体架构
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端/移动端   │    │     API 网关    │    │     后端服务    │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ 错误边界    │ │    │ │ 错误中间件  │ │    │ │ 错误处理器  │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ 错误管理器  │ │    │ │ 响应格式化  │ │    │ │ 日志记录    │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   错误监控系统  │
                    │   (Sentry等)    │
                    └─────────────────┘
```

## 🚨 后端错误处理

### 错误处理中间件
```typescript
// Express 错误处理中间件
import { globalErrorManager } from '@shared/utils/errorHandler';
import { handleApiError, getHttpStatusFromError } from '@shared/utils/apiResponse';

export const errorMiddleware = (error: any, req: any, res: any, next: any) => {
  // 记录错误
  globalErrorManager.handleError(error, {
    requestId: req.id,
    userId: req.user?.id,
    url: req.originalUrl,
    method: req.method,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  });
  
  // 格式化错误响应
  const errorResponse = handleApiError(error, req.id);
  const statusCode = getHttpStatusFromError(errorResponse.error);
  
  res.status(statusCode).json(errorResponse);
};
```

### 业务逻辑错误处理
```typescript
import { ApiError, ApiErrorCode } from '@shared/utils/apiResponse';

// 服务层错误处理
export class UserService {
  async getUserById(id: string) {
    try {
      const user = await this.userRepository.findById(id);
      
      if (!user) {
        throw new ApiError(
          ApiErrorCode.USER_NOT_FOUND,
          `User not found with id: ${id}`,
          { userId: id }
        );
      }
      
      return user;
    } catch (error) {
      // 重新抛出 API 错误
      if (error instanceof ApiError) {
        throw error;
      }
      
      // 包装未知错误
      throw new ApiError(
        ApiErrorCode.UNKNOWN_ERROR,
        'Failed to get user',
        { originalError: error.message }
      );
    }
  }
}
```

### 控制器错误处理
```typescript
import { Request, Response, NextFunction } from 'express';
import { ApiResponses } from '@shared/utils/apiResponse';

export class UserController {
  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.getUserById(req.params.id);
      res.json(ApiResponses.ok(user, req.id));
    } catch (error) {
      // 传递给错误中间件处理
      next(error);
    }
  }
}
```

## 💻 前端错误处理

### React 错误边界
```typescript
import React from 'react';
import { handleClientError } from '@shared/utils/clientErrorHandler';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    handleClientError(error, {
      component: 'ErrorBoundary',
      action: 'component_error',
      additionalData: errorInfo,
    });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### API 调用错误处理
```typescript
import { handleClientError } from '@shared/utils/clientErrorHandler';
import { isErrorResponse } from '@shared/utils/apiResponse';

export class ApiClient {
  async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      const data = await response.json();
      
      if (isErrorResponse(data)) {
        await handleClientError(data, {
          component: 'ApiClient',
          action: 'api_request',
          url,
        });
        throw new Error(data.error.message);
      }
      
      return data.data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        await handleClientError(error, {
          component: 'ApiClient',
          action: 'network_error',
          url,
        });
      }
      throw error;
    }
  }
}
```

### 组件级错误处理
```typescript
import React, { useState, useEffect } from 'react';
import { handleClientError } from '@shared/utils/clientErrorHandler';

export const UserProfile: React.FC = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userData = await apiClient.getUser();
        setUser(userData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load user';
        setError(errorMessage);
        
        await handleClientError(err as Error, {
          component: 'UserProfile',
          action: 'load_user',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  
  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }
  
  return <div>{/* 用户信息 */}</div>;
};
```

## 📱 移动端错误处理

### React Native 错误边界
```typescript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { handleClientError } from '@shared/utils/clientErrorHandler';

export class MobileErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    handleClientError(error, {
      component: 'MobileErrorBoundary',
      action: 'component_error',
      platform: 'mobile',
      additionalData: errorInfo,
    });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => this.setState({ hasError: false })}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return this.props.children;
  }
}
```

### 网络错误处理
```typescript
import NetInfo from '@react-native-async-storage/async-storage';
import { handleClientError } from '@shared/utils/clientErrorHandler';

export class MobileApiClient {
  async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    // 检查网络连接
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      const error = new Error('No internet connection');
      await handleClientError(error, {
        component: 'MobileApiClient',
        action: 'network_check',
        additionalData: { netInfo },
      });
      throw error;
    }
    
    try {
      const response = await fetch(url, {
        ...options,
        timeout: 30000, // 30秒超时
      });
      
      return await response.json();
    } catch (error) {
      await handleClientError(error, {
        component: 'MobileApiClient',
        action: 'api_request',
        url,
        platform: 'mobile',
      });
      throw error;
    }
  }
}
```

## 📊 错误监控和分析

### 错误指标
- **错误率**: 错误请求数 / 总请求数
- **错误分布**: 按错误类型、组件、用户分组
- **错误趋势**: 错误数量随时间的变化
- **恢复时间**: 从错误发生到解决的时间

### 监控配置
```typescript
import { setupErrorHandling } from '@shared/utils/errorHandler';
import { setupClientErrorHandling } from '@shared/utils/clientErrorHandler';

// 后端错误监控
setupErrorHandling({
  enableSentry: true,
  sentryDsn: process.env.SENTRY_DSN,
  logFilePath: './logs/errors.log',
  enableGlobalHandlers: true,
});

// 前端错误监控
setupClientErrorHandling({
  enableStorage: true,
  enableRemoteReporting: true,
  remoteEndpoint: '/api/v1/errors/report',
  userId: getCurrentUserId(),
  sessionId: getSessionId(),
});
```

## 🔧 错误恢复策略

### 重试机制
```typescript
export class RetryableApiClient {
  async requestWithRetry<T>(
    url: string,
    options: RequestInit = {},
    maxRetries = 3
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.request<T>(url, options);
      } catch (error) {
        lastError = error;
        
        // 不重试的错误类型
        if (this.isNonRetryableError(error)) {
          throw error;
        }
        
        // 最后一次尝试
        if (attempt === maxRetries) {
          throw error;
        }
        
        // 指数退避
        const delay = Math.pow(2, attempt - 1) * 1000;
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }
  
  private isNonRetryableError(error: any): boolean {
    // 4xx 错误通常不应该重试
    return error.status >= 400 && error.status < 500;
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 降级策略
```typescript
export class FallbackService {
  async getStoriesWithFallback(): Promise<Story[]> {
    try {
      // 尝试从 API 获取
      return await this.apiClient.getStories();
    } catch (error) {
      await handleClientError(error, {
        component: 'FallbackService',
        action: 'api_fallback',
      });
      
      // 降级到缓存数据
      const cachedStories = await this.getCachedStories();
      if (cachedStories.length > 0) {
        return cachedStories;
      }
      
      // 最后降级到默认数据
      return this.getDefaultStories();
    }
  }
}
```

## ✅ 最佳实践

### 错误处理检查清单
- [ ] 所有 API 调用都有错误处理
- [ ] 错误信息对用户友好
- [ ] 提供错误恢复机制
- [ ] 记录足够的错误上下文
- [ ] 实现适当的重试策略
- [ ] 配置错误监控和告警
- [ ] 定期审查错误日志
- [ ] 测试错误场景

### 代码规范
1. **统一错误类型**: 使用项目定义的错误类型
2. **完整错误信息**: 包含错误码、消息、上下文
3. **适当的错误级别**: 根据错误严重程度分类
4. **避免错误吞噬**: 不要忽略或隐藏错误
5. **用户友好消息**: 向用户展示可理解的错误信息

### 性能考虑
- 避免在错误处理中进行重操作
- 使用异步错误报告避免阻塞
- 限制错误日志的大小和数量
- 实现错误去重避免重复报告

---

**注意**: 错误处理是系统稳定性的重要保障，应该在开发过程中持续完善和优化。
