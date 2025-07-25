/**
 * 中心化日志记录系统
 * 提供统一的日志格式和多级别日志记录
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4,
}

export interface LogContext {
  userId?: string;
  requestId?: string;
  sessionId?: string;
  userAgent?: string;
  ip?: string;
  url?: string;
  method?: string;
  component?: string;
  action?: string;
  duration?: number;
  additionalData?: Record<string, any>;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
}

/**
 * 日志记录器类
 */
export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private environment: string;

  private constructor() {
    this.logLevel = this.getLogLevelFromEnv();
    this.environment = process.env.NODE_ENV || 'development';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * 从环境变量获取日志级别
   */
  private getLogLevelFromEnv(): LogLevel {
    const level = process.env.LOG_LEVEL?.toUpperCase();
    switch (level) {
      case 'ERROR':
        return LogLevel.ERROR;
      case 'WARN':
        return LogLevel.WARN;
      case 'INFO':
        return LogLevel.INFO;
      case 'DEBUG':
        return LogLevel.DEBUG;
      case 'TRACE':
        return LogLevel.TRACE;
      default:
        return this.environment === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
    }
  }

  /**
   * 检查是否应该记录指定级别的日志
   */
  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  /**
   * 格式化日志条目
   */
  private formatLogEntry(entry: LogEntry): string {
    const { timestamp, level, message, context, error } = entry;
    const levelName = LogLevel[level];

    const baseLog = {
      timestamp,
      level: levelName,
      message,
      environment: this.environment,
      ...context,
    };

    if (error) {
      baseLog.error = error;
    }

    return JSON.stringify(baseLog, null, this.environment === 'development' ? 2 : 0);
  }

  /**
   * 输出日志
   */
  private output(entry: LogEntry): void {
    const formattedLog = this.formatLogEntry(entry);

    // 在开发环境中使用彩色输出
    if (this.environment === 'development') {
      this.outputToConsole(entry, formattedLog);
    } else {
      // 生产环境中输出到标准输出
      console.log(formattedLog);
    }

    // 在生产环境中，可以添加其他日志输出目标
    // 例如：文件、数据库、外部日志服务等
    if (this.environment === 'production') {
      this.outputToExternalService(entry);
    }
  }

  /**
   * 控制台彩色输出（开发环境）
   */
  private outputToConsole(entry: LogEntry, formattedLog: string): void {
    const colors = {
      [LogLevel.ERROR]: '\x1b[31m', // 红色
      [LogLevel.WARN]: '\x1b[33m',  // 黄色
      [LogLevel.INFO]: '\x1b[36m',  // 青色
      [LogLevel.DEBUG]: '\x1b[32m', // 绿色
      [LogLevel.TRACE]: '\x1b[37m', // 白色
    };

    const reset = '\x1b[0m';
    const color = colors[entry.level] || reset;

    console.log(`${color}${formattedLog}${reset}`);
  }

  /**
   * 输出到外部服务（生产环境）
   */
  private outputToExternalService(entry: LogEntry): void {
    // 这里可以集成外部日志服务
    // 例如：Winston、Bunyan、Pino 等
    // 或者发送到 ELK Stack、Splunk、DataDog 等
    
    // 示例：发送错误日志到监控服务
    if (entry.level === LogLevel.ERROR && entry.error) {
      this.sendToErrorMonitoring(entry);
    }
  }

  /**
   * 发送到错误监控服务
   */
  private sendToErrorMonitoring(entry: LogEntry): void {
    // 集成 Sentry、Bugsnag 等错误监控服务
    // 这里是示例代码
    try {
      // Sentry.captureException(entry.error);
    } catch (error) {
      // 避免日志记录本身出错
      console.error('Failed to send error to monitoring service:', error);
    }
  }

  /**
   * 记录错误日志
   */
  error(message: string, context: LogContext = {}, error?: Error): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      context,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      };
    }

    this.output(entry);
  }

  /**
   * 记录警告日志
   */
  warn(message: string, context: LogContext = {}): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      message,
      context,
    };

    this.output(entry);
  }

  /**
   * 记录信息日志
   */
  info(message: string, context: LogContext = {}): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message,
      context,
    };

    this.output(entry);
  }

  /**
   * 记录调试日志
   */
  debug(message: string, context: LogContext = {}): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
      message,
      context,
    };

    this.output(entry);
  }

  /**
   * 记录跟踪日志
   */
  trace(message: string, context: LogContext = {}): void {
    if (!this.shouldLog(LogLevel.TRACE)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.TRACE,
      message,
      context,
    };

    this.output(entry);
  }

  /**
   * 记录性能日志
   */
  performance(action: string, duration: number, context: LogContext = {}): void {
    this.info(`Performance: ${action}`, {
      ...context,
      action,
      duration,
    });
  }

  /**
   * 记录API请求日志
   */
  apiRequest(method: string, url: string, context: LogContext = {}): void {
    this.info(`API Request: ${method} ${url}`, {
      ...context,
      method,
      url,
    });
  }

  /**
   * 记录API响应日志
   */
  apiResponse(method: string, url: string, status: number, duration: number, context: LogContext = {}): void {
    const level = status >= 400 ? LogLevel.WARN : LogLevel.INFO;
    const message = `API Response: ${method} ${url} - ${status} (${duration}ms)`;

    if (level === LogLevel.WARN) {
      this.warn(message, { ...context, method, url, status, duration });
    } else {
      this.info(message, { ...context, method, url, status, duration });
    }
  }

  /**
   * 设置日志级别
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * 获取当前日志级别
   */
  getLogLevel(): LogLevel {
    return this.logLevel;
  }
}

// 导出单例实例
export const logger = Logger.getInstance();

// 便捷的日志记录函数
export const log = {
  error: (message: string, context?: LogContext, error?: Error) => logger.error(message, context, error),
  warn: (message: string, context?: LogContext) => logger.warn(message, context),
  info: (message: string, context?: LogContext) => logger.info(message, context),
  debug: (message: string, context?: LogContext) => logger.debug(message, context),
  trace: (message: string, context?: LogContext) => logger.trace(message, context),
  performance: (action: string, duration: number, context?: LogContext) => logger.performance(action, duration, context),
  apiRequest: (method: string, url: string, context?: LogContext) => logger.apiRequest(method, url, context),
  apiResponse: (method: string, url: string, status: number, duration: number, context?: LogContext) => 
    logger.apiResponse(method, url, status, duration, context),
};
