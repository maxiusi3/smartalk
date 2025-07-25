/**
 * 错误监控和性能监控配置
 * 集成第三方监控服务
 */

import { logger } from '../../shared/utils/Logger';
import { AppError } from '../../shared/utils/AppError';

export interface MonitoringConfig {
  enabled: boolean;
  environment: string;
  serviceName: string;
  version: string;
  sentry?: {
    dsn: string;
    tracesSampleRate: number;
  };
  datadog?: {
    apiKey: string;
    service: string;
  };
  newrelic?: {
    licenseKey: string;
    appName: string;
  };
}

/**
 * 监控服务管理器
 */
export class MonitoringManager {
  private static instance: MonitoringManager;
  private config: MonitoringConfig;
  private initialized: boolean = false;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): MonitoringManager {
    if (!MonitoringManager.instance) {
      MonitoringManager.instance = new MonitoringManager();
    }
    return MonitoringManager.instance;
  }

  /**
   * 加载监控配置
   */
  private loadConfig(): MonitoringConfig {
    return {
      enabled: process.env.MONITORING_ENABLED === 'true',
      environment: process.env.NODE_ENV || 'development',
      serviceName: 'smartalk-backend',
      version: process.env.APP_VERSION || '1.0.0',
      sentry: {
        dsn: process.env.SENTRY_DSN || '',
        tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
      },
      datadog: {
        apiKey: process.env.DATADOG_API_KEY || '',
        service: 'smartalk-backend',
      },
      newrelic: {
        licenseKey: process.env.NEW_RELIC_LICENSE_KEY || '',
        appName: 'SmarTalk Backend',
      },
    };
  }

  /**
   * 初始化监控服务
   */
  public async initialize(): Promise<void> {
    if (!this.config.enabled || this.initialized) {
      return;
    }

    try {
      // 初始化 Sentry
      if (this.config.sentry?.dsn) {
        await this.initializeSentry();
      }

      // 初始化 DataDog
      if (this.config.datadog?.apiKey) {
        await this.initializeDataDog();
      }

      // 初始化 New Relic
      if (this.config.newrelic?.licenseKey) {
        await this.initializeNewRelic();
      }

      this.initialized = true;
      logger.info('Monitoring services initialized successfully', {
        component: 'MonitoringManager',
        services: this.getEnabledServices(),
      });
    } catch (error) {
      logger.error('Failed to initialize monitoring services', {
        component: 'MonitoringManager',
      }, error as Error);
    }
  }

  /**
   * 初始化 Sentry
   */
  private async initializeSentry(): Promise<void> {
    try {
      // 动态导入 Sentry（避免在未配置时加载）
      const Sentry = await import('@sentry/node');
      
      Sentry.init({
        dsn: this.config.sentry!.dsn,
        environment: this.config.environment,
        release: this.config.version,
        tracesSampleRate: this.config.sentry!.tracesSampleRate,
        integrations: [
          new Sentry.Integrations.Http({ tracing: true }),
          new Sentry.Integrations.Express({ app: undefined }),
        ],
      });

      logger.info('Sentry initialized successfully');
    } catch (error) {
      logger.warn('Failed to initialize Sentry', {}, error as Error);
    }
  }

  /**
   * 初始化 DataDog
   */
  private async initializeDataDog(): Promise<void> {
    try {
      // 动态导入 DataDog
      const tracer = await import('dd-trace');
      
      tracer.init({
        service: this.config.datadog!.service,
        env: this.config.environment,
        version: this.config.version,
      });

      logger.info('DataDog initialized successfully');
    } catch (error) {
      logger.warn('Failed to initialize DataDog', {}, error as Error);
    }
  }

  /**
   * 初始化 New Relic
   */
  private async initializeNewRelic(): Promise<void> {
    try {
      // New Relic 需要在应用启动前初始化
      // 通常通过环境变量配置
      logger.info('New Relic configured via environment variables');
    } catch (error) {
      logger.warn('Failed to initialize New Relic', {}, error as Error);
    }
  }

  /**
   * 报告错误到监控服务
   */
  public reportError(error: AppError | Error, context?: Record<string, any>): void {
    if (!this.config.enabled) {
      return;
    }

    try {
      // 报告到 Sentry
      if (this.config.sentry?.dsn) {
        this.reportToSentry(error, context);
      }

      // 报告到其他监控服务
      // DataDog 和 New Relic 通常通过日志或 APM 自动收集错误
      
    } catch (reportError) {
      logger.error('Failed to report error to monitoring services', {
        component: 'MonitoringManager',
      }, reportError as Error);
    }
  }

  /**
   * 报告错误到 Sentry
   */
  private async reportToSentry(error: AppError | Error, context?: Record<string, any>): Promise<void> {
    try {
      const Sentry = await import('@sentry/node');
      
      Sentry.withScope((scope) => {
        // 设置用户信息
        if (context?.userId) {
          scope.setUser({ id: context.userId });
        }

        // 设置请求信息
        if (context?.requestId) {
          scope.setTag('requestId', context.requestId);
        }

        // 设置额外上下文
        if (context) {
          scope.setContext('additional', context);
        }

        // 设置错误级别
        if (error instanceof AppError) {
          scope.setLevel(error.httpStatus >= 500 ? 'error' : 'warning');
          scope.setTag('errorCode', error.code);
          scope.setTag('errorCategory', error.category);
        }

        Sentry.captureException(error);
      });
    } catch (sentryError) {
      logger.error('Failed to report to Sentry', {}, sentryError as Error);
    }
  }

  /**
   * 记录性能指标
   */
  public recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    if (!this.config.enabled) {
      return;
    }

    // 记录到日志（可以被日志收集器采集）
    logger.info(`Metric: ${name}`, {
      component: 'MonitoringManager',
      metric: name,
      value,
      tags,
    });

    // 这里可以添加其他指标收集服务的集成
    // 例如：StatsD、Prometheus、DataDog 等
  }

  /**
   * 记录业务事件
   */
  public recordEvent(event: string, properties?: Record<string, any>): void {
    if (!this.config.enabled) {
      return;
    }

    logger.info(`Event: ${event}`, {
      component: 'MonitoringManager',
      event,
      properties,
    });
  }

  /**
   * 获取已启用的监控服务
   */
  private getEnabledServices(): string[] {
    const services: string[] = [];
    
    if (this.config.sentry?.dsn) {
      services.push('Sentry');
    }
    
    if (this.config.datadog?.apiKey) {
      services.push('DataDog');
    }
    
    if (this.config.newrelic?.licenseKey) {
      services.push('New Relic');
    }

    return services;
  }

  /**
   * 健康检查
   */
  public getHealthStatus(): {
    enabled: boolean;
    services: string[];
    initialized: boolean;
  } {
    return {
      enabled: this.config.enabled,
      services: this.getEnabledServices(),
      initialized: this.initialized,
    };
  }
}

// 导出单例实例
export const monitoring = MonitoringManager.getInstance();

// 便捷的监控函数
export const monitor = {
  reportError: (error: AppError | Error, context?: Record<string, any>) => 
    monitoring.reportError(error, context),
  recordMetric: (name: string, value: number, tags?: Record<string, string>) => 
    monitoring.recordMetric(name, value, tags),
  recordEvent: (event: string, properties?: Record<string, any>) => 
    monitoring.recordEvent(event, properties),
  getHealthStatus: () => monitoring.getHealthStatus(),
};
