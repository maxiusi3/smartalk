/**
 * SmarTalk 共享配置管理
 * 统一管理所有环境变量和配置项
 */

import { z } from 'zod';

// 环境类型定义
export type Environment = 'development' | 'staging' | 'production' | 'test';

// 配置验证模式
const ConfigSchema = z.object({
  // 应用基础配置
  app: z.object({
    name: z.string().default('SmarTalk'),
    version: z.string().default('1.0.0'),
    environment: z.enum(['development', 'staging', 'production', 'test']).default('development'),
    port: z.number().default(3001),
    host: z.string().default('localhost'),
    baseUrl: z.string().url().optional(),
  }),

  // 数据库配置
  database: z.object({
    url: z.string().url(),
    host: z.string().optional(),
    port: z.number().optional(),
    name: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    ssl: z.boolean().default(false),
    poolSize: z.number().default(10),
    connectionTimeout: z.number().default(30000),
  }),

  // Redis 配置
  redis: z.object({
    url: z.string().optional(),
    host: z.string().default('localhost'),
    port: z.number().default(6379),
    password: z.string().optional(),
    db: z.number().default(0),
    ttl: z.number().default(3600),
  }),

  // JWT 配置
  jwt: z.object({
    secret: z.string().min(32),
    expiresIn: z.string().default('24h'),
    refreshSecret: z.string().min(32),
    refreshExpiresIn: z.string().default('7d'),
    issuer: z.string().default('smartalk'),
    audience: z.string().default('smartalk-users'),
  }),

  // 文件存储配置
  storage: z.object({
    provider: z.enum(['local', 'aws', 'aliyun']).default('local'),
    local: z.object({
      uploadPath: z.string().default('./uploads'),
      publicPath: z.string().default('/uploads'),
    }).optional(),
    aws: z.object({
      accessKeyId: z.string().optional(),
      secretAccessKey: z.string().optional(),
      region: z.string().optional(),
      bucket: z.string().optional(),
      cloudFrontUrl: z.string().optional(),
    }).optional(),
    aliyun: z.object({
      accessKeyId: z.string().optional(),
      accessKeySecret: z.string().optional(),
      region: z.string().optional(),
      bucket: z.string().optional(),
      cdnUrl: z.string().optional(),
    }).optional(),
  }),

  // 邮件配置
  email: z.object({
    provider: z.enum(['smtp', 'sendgrid', 'aliyun']).default('smtp'),
    smtp: z.object({
      host: z.string().optional(),
      port: z.number().optional(),
      secure: z.boolean().default(false),
      username: z.string().optional(),
      password: z.string().optional(),
    }).optional(),
    sendgrid: z.object({
      apiKey: z.string().optional(),
    }).optional(),
    from: z.string().email().default('noreply@smartalk.app'),
  }),

  // 监控配置
  monitoring: z.object({
    enabled: z.boolean().default(true),
    sentry: z.object({
      dsn: z.string().optional(),
      environment: z.string().optional(),
      tracesSampleRate: z.number().min(0).max(1).default(0.1),
    }).optional(),
    prometheus: z.object({
      enabled: z.boolean().default(false),
      port: z.number().default(9090),
      path: z.string().default('/metrics'),
    }).optional(),
  }),

  // 安全配置
  security: z.object({
    cors: z.object({
      origin: z.union([z.string(), z.array(z.string())]).default('*'),
      credentials: z.boolean().default(true),
      methods: z.array(z.string()).default(['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']),
    }),
    rateLimit: z.object({
      windowMs: z.number().default(15 * 60 * 1000), // 15分钟
      max: z.number().default(100), // 最大请求数
      skipSuccessfulRequests: z.boolean().default(false),
    }),
    helmet: z.object({
      enabled: z.boolean().default(true),
      contentSecurityPolicy: z.boolean().default(false),
    }),
  }),

  // 日志配置
  logging: z.object({
    level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    format: z.enum(['json', 'simple']).default('json'),
    file: z.object({
      enabled: z.boolean().default(true),
      path: z.string().default('./logs'),
      maxSize: z.string().default('10m'),
      maxFiles: z.number().default(5),
    }),
    console: z.object({
      enabled: z.boolean().default(true),
      colorize: z.boolean().default(true),
    }),
  }),

  // 功能开关
  features: z.object({
    registration: z.boolean().default(true),
    emailVerification: z.boolean().default(false),
    socialLogin: z.boolean().default(false),
    analytics: z.boolean().default(true),
    maintenance: z.boolean().default(false),
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

/**
 * 从环境变量加载配置
 */
function loadConfigFromEnv(): Partial<Config> {
  return {
    app: {
      name: process.env.APP_NAME,
      version: process.env.APP_VERSION,
      environment: process.env.NODE_ENV as Environment,
      port: process.env.PORT ? parseInt(process.env.PORT) : undefined,
      host: process.env.HOST,
      baseUrl: process.env.BASE_URL,
    },
    database: {
      url: process.env.DATABASE_URL!,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
      name: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true',
      poolSize: process.env.DB_POOL_SIZE ? parseInt(process.env.DB_POOL_SIZE) : undefined,
    },
    redis: {
      url: process.env.REDIS_URL,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : undefined,
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : undefined,
    },
    jwt: {
      secret: process.env.JWT_SECRET!,
      expiresIn: process.env.JWT_EXPIRES_IN,
      refreshSecret: process.env.JWT_REFRESH_SECRET!,
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    },
    storage: {
      provider: process.env.STORAGE_PROVIDER as any,
      aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
        bucket: process.env.AWS_S3_BUCKET,
        cloudFrontUrl: process.env.AWS_CLOUDFRONT_URL,
      },
      aliyun: {
        accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
        accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
        region: process.env.ALIYUN_REGION,
        bucket: process.env.ALIYUN_OSS_BUCKET,
        cdnUrl: process.env.ALIYUN_CDN_URL,
      },
    },
    email: {
      provider: process.env.EMAIL_PROVIDER as any,
      smtp: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
        secure: process.env.SMTP_SECURE === 'true',
        username: process.env.SMTP_USERNAME,
        password: process.env.SMTP_PASSWORD,
      },
      sendgrid: {
        apiKey: process.env.SENDGRID_API_KEY,
      },
      from: process.env.EMAIL_FROM,
    },
    monitoring: {
      enabled: process.env.MONITORING_ENABLED !== 'false',
      sentry: {
        dsn: process.env.SENTRY_DSN,
        environment: process.env.SENTRY_ENVIRONMENT,
        tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE ? 
          parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) : undefined,
      },
    },
    security: {
      cors: {
        origin: process.env.CORS_ORIGIN ? 
          process.env.CORS_ORIGIN.split(',') : undefined,
      },
    },
    logging: {
      level: process.env.LOG_LEVEL as any,
      format: process.env.LOG_FORMAT as any,
    },
    features: {
      registration: process.env.FEATURE_REGISTRATION !== 'false',
      emailVerification: process.env.FEATURE_EMAIL_VERIFICATION === 'true',
      socialLogin: process.env.FEATURE_SOCIAL_LOGIN === 'true',
      analytics: process.env.FEATURE_ANALYTICS !== 'false',
      maintenance: process.env.FEATURE_MAINTENANCE === 'true',
    },
  };
}

/**
 * 创建配置实例
 */
export function createConfig(): Config {
  const envConfig = loadConfigFromEnv();
  
  try {
    return ConfigSchema.parse(envConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Configuration validation failed:');
      error.errors.forEach(err => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Invalid configuration');
    }
    throw error;
  }
}

/**
 * 获取配置的类型安全访问器
 */
export function getConfig(): Config {
  if (!globalConfig) {
    globalConfig = createConfig();
  }
  return globalConfig;
}

// 全局配置实例
let globalConfig: Config | null = null;

// 导出常用配置访问器
export const config = {
  get app() { return getConfig().app; },
  get database() { return getConfig().database; },
  get redis() { return getConfig().redis; },
  get jwt() { return getConfig().jwt; },
  get storage() { return getConfig().storage; },
  get email() { return getConfig().email; },
  get monitoring() { return getConfig().monitoring; },
  get security() { return getConfig().security; },
  get logging() { return getConfig().logging; },
  get features() { return getConfig().features; },
};

// 环境检查工具
export const env = {
  isDevelopment: () => getConfig().app.environment === 'development',
  isProduction: () => getConfig().app.environment === 'production',
  isStaging: () => getConfig().app.environment === 'staging',
  isTest: () => getConfig().app.environment === 'test',
};

export default config;
