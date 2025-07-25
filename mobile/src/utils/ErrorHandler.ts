import { Alert } from 'react-native';
import { AnalyticsService } from '@/services/AnalyticsService';

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
  context?: string;
  recoverable: boolean;
}

export interface ErrorHandlerOptions {
  showAlert?: boolean;
  trackError?: boolean;
  context?: string;
  fallbackAction?: () => void;
}

/**
 * Centralized error handling system
 * Provides consistent error handling, logging, and user feedback
 */
class ErrorHandlerClass {
  private errorQueue: AppError[] = [];
  private readonly MAX_ERROR_QUEUE = 50;

  /**
   * Handle application errors with consistent UX
   */
  handleError(
    error: Error | string,
    options: ErrorHandlerOptions = {}
  ): AppError {
    const {
      showAlert = true,
      trackError = true,
      context = 'unknown',
      fallbackAction,
    } = options;

    // Create standardized error object
    const appError: AppError = {
      code: this.getErrorCode(error),
      message: this.getErrorMessage(error),
      details: error,
      timestamp: Date.now(),
      context,
      recoverable: this.isRecoverableError(error),
    };

    // Add to error queue
    this.addToErrorQueue(appError);

    // Log error
    console.error(`[${context}] Error:`, appError);

    // Track error analytics
    if (trackError) {
      this.trackError(appError);
    }

    // Show user-friendly alert
    if (showAlert) {
      this.showErrorAlert(appError, fallbackAction);
    }

    return appError;
  }

  /**
   * Handle network errors specifically
   */
  handleNetworkError(
    error: any,
    options: ErrorHandlerOptions = {}
  ): AppError {
    const networkError = this.createNetworkError(error);
    return this.handleError(networkError, {
      ...options,
      context: options.context || 'network',
    });
  }

  /**
   * Handle video playback errors
   */
  handleVideoError(
    error: any,
    options: ErrorHandlerOptions = {}
  ): AppError {
    const videoError = this.createVideoError(error);
    return this.handleError(videoError, {
      ...options,
      context: options.context || 'video',
    });
  }

  /**
   * Handle API errors
   */
  handleApiError(
    error: any,
    options: ErrorHandlerOptions = {}
  ): AppError {
    const apiError = this.createApiError(error);
    return this.handleError(apiError, {
      ...options,
      context: options.context || 'api',
    });
  }

  /**
   * Get error code from error object
   */
  private getErrorCode(error: Error | string): string {
    if (typeof error === 'string') return 'GENERIC_ERROR';
    
    // Network errors
    if (error.message.includes('Network')) return 'NETWORK_ERROR';
    if (error.message.includes('timeout')) return 'TIMEOUT_ERROR';
    if (error.message.includes('Failed to fetch')) return 'FETCH_ERROR';
    
    // API errors
    if (error.message.includes('401')) return 'UNAUTHORIZED_ERROR';
    if (error.message.includes('403')) return 'FORBIDDEN_ERROR';
    if (error.message.includes('404')) return 'NOT_FOUND_ERROR';
    if (error.message.includes('500')) return 'SERVER_ERROR';
    
    // Video errors
    if (error.message.includes('Video')) return 'VIDEO_ERROR';
    if (error.message.includes('playback')) return 'PLAYBACK_ERROR';
    
    return 'UNKNOWN_ERROR';
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: Error | string): string {
    if (typeof error === 'string') return error;

    const code = this.getErrorCode(error);
    
    switch (code) {
      case 'NETWORK_ERROR':
        return '网络连接出现问题，请检查网络设置';
      case 'TIMEOUT_ERROR':
        return '请求超时，请稍后重试';
      case 'FETCH_ERROR':
        return '无法连接到服务器，请检查网络连接';
      case 'UNAUTHORIZED_ERROR':
        return '身份验证失败，请重新登录';
      case 'FORBIDDEN_ERROR':
        return '没有权限访问此内容';
      case 'NOT_FOUND_ERROR':
        return '请求的内容不存在';
      case 'SERVER_ERROR':
        return '服务器出现问题，请稍后重试';
      case 'VIDEO_ERROR':
        return '视频播放出现问题，请稍后重试';
      case 'PLAYBACK_ERROR':
        return '视频无法播放，请检查网络连接';
      default:
        return '出现了一个问题，请稍后重试';
    }
  }

  /**
   * Check if error is recoverable
   */
  private isRecoverableError(error: Error | string): boolean {
    const code = this.getErrorCode(error);
    
    const recoverableErrors = [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'FETCH_ERROR',
      'VIDEO_ERROR',
      'PLAYBACK_ERROR',
    ];
    
    return recoverableErrors.includes(code);
  }

  /**
   * Create network-specific error
   */
  private createNetworkError(error: any): Error {
    if (error.code === 'NETWORK_REQUEST_FAILED') {
      return new Error('网络请求失败，请检查网络连接');
    }
    if (error.message?.includes('timeout')) {
      return new Error('网络请求超时，请稍后重试');
    }
    return new Error('网络连接出现问题');
  }

  /**
   * Create video-specific error
   */
  private createVideoError(error: any): Error {
    if (error.code === -11800) {
      return new Error('视频文件损坏或格式不支持');
    }
    if (error.code === -12660) {
      return new Error('视频无法加载，请检查网络连接');
    }
    return new Error('视频播放出现问题');
  }

  /**
   * Create API-specific error
   */
  private createApiError(error: any): Error {
    if (error.response?.status) {
      const status = error.response.status;
      switch (status) {
        case 401:
          return new Error('身份验证失败');
        case 403:
          return new Error('没有访问权限');
        case 404:
          return new Error('请求的资源不存在');
        case 500:
          return new Error('服务器内部错误');
        default:
          return new Error(`API请求失败 (${status})`);
      }
    }
    return new Error('API请求出现问题');
  }

  /**
   * Add error to queue for debugging
   */
  private addToErrorQueue(error: AppError): void {
    this.errorQueue.push(error);
    
    // Keep queue size manageable
    if (this.errorQueue.length > this.MAX_ERROR_QUEUE) {
      this.errorQueue.shift();
    }
  }

  /**
   * Track error in analytics
   */
  private trackError(error: AppError): void {
    try {
      AnalyticsService.getInstance().track('app_error', {
        errorCode: error.code,
        errorMessage: error.message,
        context: error.context,
        recoverable: error.recoverable,
        timestamp: error.timestamp,
      });
    } catch (e) {
      console.error('Failed to track error:', e);
    }
  }

  /**
   * Show user-friendly error alert
   */
  private showErrorAlert(error: AppError, fallbackAction?: () => void): void {
    const buttons = [
      {
        text: '确定',
        onPress: fallbackAction,
      },
    ];

    // Add retry button for recoverable errors
    if (error.recoverable && fallbackAction) {
      buttons.unshift({
        text: '重试',
        onPress: fallbackAction,
      });
    }

    Alert.alert(
      '出现问题',
      error.message,
      buttons,
      { cancelable: false }
    );
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(count: number = 10): AppError[] {
    return this.errorQueue.slice(-count);
  }

  /**
   * Clear error queue
   */
  clearErrorQueue(): void {
    this.errorQueue = [];
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    recoverableErrors: number;
    errorsByContext: Record<string, number>;
  } {
    const stats = {
      totalErrors: this.errorQueue.length,
      recoverableErrors: this.errorQueue.filter(e => e.recoverable).length,
      errorsByContext: {} as Record<string, number>,
    };

    this.errorQueue.forEach(error => {
      const context = error.context || 'unknown';
      stats.errorsByContext[context] = (stats.errorsByContext[context] || 0) + 1;
    });

    return stats;
  }
}

export const ErrorHandler = new ErrorHandlerClass();