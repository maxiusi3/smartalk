/**
 * SmarTalk 客户端错误处理工具
 * 提供前端和移动端通用的错误处理功能
 */

import { ApiError, ApiErrorCode, ErrorResponse } from '@shared/types/api.types';

// 客户端错误类型
export enum ClientErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  CAMERA_ERROR = 'CAMERA_ERROR',
  AUDIO_ERROR = 'AUDIO_ERROR',
  LOCATION_ERROR = 'LOCATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// 客户端错误接口
export interface ClientError {
  type: ClientErrorType;
  message: string;
  code?: string;
  details?: Record<string, any>;
  timestamp: string;
  stack?: string;
}

// 错误上下文接口
export interface ClientErrorContext {
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  platform?: 'web' | 'ios' | 'android';
  version?: string;
  url?: string;
  component?: string;
  action?: string;
  additionalData?: Record<string, any>;
}

// 错误处理器接口
export interface ClientErrorHandler {
  handle(error: ClientError, context: ClientErrorContext): Promise<void>;
}

/**
 * 客户端错误分类器
 */
export class ClientErrorClassifier {
  /**
   * 将网络错误转换为客户端错误
   */
  static fromNetworkError(error: any): ClientError {
    if (error.name === 'TimeoutError' || error.code === 'TIMEOUT') {
      return {
        type: ClientErrorType.TIMEOUT_ERROR,
        message: 'Request timeout',
        code: 'TIMEOUT',
        timestamp: new Date().toISOString(),
        details: { originalError: error.message },
      };
    }
    
    if (error.name === 'NetworkError' || !navigator.onLine) {
      return {
        type: ClientErrorType.NETWORK_ERROR,
        message: 'Network connection error',
        code: 'NETWORK_UNAVAILABLE',
        timestamp: new Date().toISOString(),
        details: { online: navigator.onLine },
      };
    }
    
    return {
      type: ClientErrorType.NETWORK_ERROR,
      message: error.message || 'Network error occurred',
      code: error.code || 'NETWORK_ERROR',
      timestamp: new Date().toISOString(),
      details: { originalError: error },
    };
  }
  
  /**
   * 将 API 错误响应转换为客户端错误
   */
  static fromApiError(response: ErrorResponse): ClientError {
    const apiError = response.error;
    
    let type: ClientErrorType;
    switch (apiError.code) {
      case ApiErrorCode.AUTHENTICATION_ERROR:
      case ApiErrorCode.AUTHORIZATION_ERROR:
        type = ClientErrorType.PERMISSION_ERROR;
        break;
      case ApiErrorCode.VALIDATION_ERROR:
        type = ClientErrorType.VALIDATION_ERROR;
        break;
      default:
        type = ClientErrorType.UNKNOWN_ERROR;
    }
    
    return {
      type,
      message: apiError.message,
      code: apiError.code,
      timestamp: response.timestamp,
      details: apiError.details,
    };
  }
  
  /**
   * 将 JavaScript 错误转换为客户端错误
   */
  static fromJavaScriptError(error: Error): ClientError {
    let type: ClientErrorType;
    
    if (error.name === 'SyntaxError') {
      type = ClientErrorType.PARSE_ERROR;
    } else if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      type = ClientErrorType.UNKNOWN_ERROR;
    } else {
      type = ClientErrorType.UNKNOWN_ERROR;
    }
    
    return {
      type,
      message: error.message,
      code: error.name,
      timestamp: new Date().toISOString(),
      stack: error.stack,
    };
  }
}

/**
 * 控制台错误处理器
 */
export class ClientConsoleErrorHandler implements ClientErrorHandler {
  async handle(error: ClientError, context: ClientErrorContext): Promise<void> {
    const logData = {
      error,
      context,
      timestamp: new Date().toISOString(),
    };
    
    switch (error.type) {
      case ClientErrorType.NETWORK_ERROR:
      case ClientErrorType.TIMEOUT_ERROR:
        console.warn('Client Error:', logData);
        break;
      case ClientErrorType.VALIDATION_ERROR:
        console.info('Validation Error:', logData);
        break;
      default:
        console.error('Client Error:', logData);
    }
  }
}

/**
 * 本地存储错误处理器
 */
export class ClientStorageErrorHandler implements ClientErrorHandler {
  private readonly storageKey = 'smartalk_error_logs';
  private readonly maxLogs = 100;
  
  async handle(error: ClientError, context: ClientErrorContext): Promise<void> {
    try {
      const logEntry = {
        error,
        context,
        timestamp: new Date().toISOString(),
      };
      
      const existingLogs = this.getLogs();
      existingLogs.unshift(logEntry);
      
      // 保持最大日志数量
      if (existingLogs.length > this.maxLogs) {
        existingLogs.splice(this.maxLogs);
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(existingLogs));
    } catch (storageError) {
      console.warn('Failed to store error log:', storageError);
    }
  }
  
  /**
   * 获取存储的错误日志
   */
  getLogs(): any[] {
    try {
      const logs = localStorage.getItem(this.storageKey);
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      return [];
    }
  }
  
  /**
   * 清除错误日志
   */
  clearLogs(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Failed to clear error logs:', error);
    }
  }
}

/**
 * 远程错误处理器
 */
export class ClientRemoteErrorHandler implements ClientErrorHandler {
  constructor(
    private endpoint: string,
    private apiKey?: string
  ) {}
  
  async handle(error: ClientError, context: ClientErrorContext): Promise<void> {
    try {
      const payload = {
        error,
        context,
        timestamp: new Date().toISOString(),
      };
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }
      
      await fetch(this.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
    } catch (networkError) {
      console.warn('Failed to send error report:', networkError);
    }
  }
}

/**
 * 客户端错误管理器
 */
export class ClientErrorManager {
  private handlers: ClientErrorHandler[] = [];
  private isEnabled = true;
  private context: Partial<ClientErrorContext> = {};
  
  constructor() {
    // 默认添加控制台处理器
    this.addHandler(new ClientConsoleErrorHandler());
    
    // 设置全局错误处理
    this.setupGlobalHandlers();
  }
  
  /**
   * 添加错误处理器
   */
  addHandler(handler: ClientErrorHandler): void {
    this.handlers.push(handler);
  }
  
  /**
   * 移除错误处理器
   */
  removeHandler(handler: ClientErrorHandler): void {
    const index = this.handlers.indexOf(handler);
    if (index > -1) {
      this.handlers.splice(index, 1);
    }
  }
  
  /**
   * 设置全局上下文
   */
  setContext(context: Partial<ClientErrorContext>): void {
    this.context = { ...this.context, ...context };
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
    error: ClientError | Error | ErrorResponse,
    context: Partial<ClientErrorContext> = {}
  ): Promise<void> {
    if (!this.isEnabled) return;
    
    try {
      let clientError: ClientError;
      
      // 转换不同类型的错误
      if ('success' in error && !error.success) {
        clientError = ClientErrorClassifier.fromApiError(error as ErrorResponse);
      } else if (error instanceof Error) {
        clientError = ClientErrorClassifier.fromJavaScriptError(error);
      } else {
        clientError = error as ClientError;
      }
      
      const fullContext: ClientErrorContext = {
        platform: this.detectPlatform(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...this.context,
        ...context,
      };
      
      // 并行处理所有处理器
      await Promise.allSettled(
        this.handlers.map(handler => handler.handle(clientError, fullContext))
      );
    } catch (handlerError) {
      console.error('Error in client error handler:', handlerError);
    }
  }
  
  /**
   * 检测平台
   */
  private detectPlatform(): 'web' | 'ios' | 'android' {
    if (typeof window === 'undefined') {
      return 'web';
    }
    
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'ios';
    }
    
    if (/android/.test(userAgent)) {
      return 'android';
    }
    
    return 'web';
  }
  
  /**
   * 设置全局错误处理
   */
  private setupGlobalHandlers(): void {
    // 处理未捕获的 JavaScript 错误
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message), {
        component: 'global',
        action: 'uncaught_error',
        additionalData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });
    
    // 处理未处理的 Promise 拒绝
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      this.handleError(error, {
        component: 'global',
        action: 'unhandled_rejection',
      });
    });
    
    // 处理网络状态变化
    window.addEventListener('online', () => {
      console.info('Network connection restored');
    });
    
    window.addEventListener('offline', () => {
      this.handleError({
        type: ClientErrorType.NETWORK_ERROR,
        message: 'Network connection lost',
        code: 'OFFLINE',
        timestamp: new Date().toISOString(),
      }, {
        component: 'global',
        action: 'network_offline',
      });
    });
  }
  
  /**
   * 创建 React 错误边界
   */
  createReactErrorBoundary() {
    const errorManager = this;
    
    return class ErrorBoundary extends (globalThis as any).React?.Component {
      constructor(props: any) {
        super(props);
        this.state = { hasError: false };
      }
      
      static getDerivedStateFromError(error: Error) {
        return { hasError: true };
      }
      
      componentDidCatch(error: Error, errorInfo: any) {
        errorManager.handleError(error, {
          component: 'react_error_boundary',
          action: 'component_error',
          additionalData: errorInfo,
        });
      }
      
      render() {
        if (this.state.hasError) {
          return this.props.fallback || (globalThis as any).React?.createElement('div', {
            children: 'Something went wrong.'
          });
        }
        
        return this.props.children;
      }
    };
  }
}

// 创建全局客户端错误管理器实例
export const globalClientErrorManager = new ClientErrorManager();

// 便捷函数
export const handleClientError = (
  error: ClientError | Error | ErrorResponse,
  context?: Partial<ClientErrorContext>
) => globalClientErrorManager.handleError(error, context);

export const setupClientErrorHandling = (options: {
  enableStorage?: boolean;
  enableRemoteReporting?: boolean;
  remoteEndpoint?: string;
  apiKey?: string;
  userId?: string;
  sessionId?: string;
} = {}) => {
  // 设置本地存储
  if (options.enableStorage) {
    globalClientErrorManager.addHandler(new ClientStorageErrorHandler());
  }
  
  // 设置远程报告
  if (options.enableRemoteReporting && options.remoteEndpoint) {
    globalClientErrorManager.addHandler(
      new ClientRemoteErrorHandler(options.remoteEndpoint, options.apiKey)
    );
  }
  
  // 设置用户上下文
  if (options.userId || options.sessionId) {
    globalClientErrorManager.setContext({
      userId: options.userId,
      sessionId: options.sessionId,
    });
  }
  
  return globalClientErrorManager;
};

export default {
  ClientErrorClassifier,
  ClientConsoleErrorHandler,
  ClientStorageErrorHandler,
  ClientRemoteErrorHandler,
  ClientErrorManager,
  globalClientErrorManager,
  handleClientError,
  setupClientErrorHandling,
};
