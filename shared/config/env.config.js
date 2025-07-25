/**
 * 环境变量配置管理器
 * 统一处理所有环境变量的读取、验证和默认值
 */

const baseConfig = require('./base.config');

/**
 * 环境变量验证规则
 */
const ENV_VALIDATION = {
  // 必需的环境变量
  required: [
    'NODE_ENV',
    'DATABASE_URL',
    'JWT_SECRET'
  ],
  
  // 可选的环境变量及其默认值
  optional: {
    PORT: '3001',
    HOST: 'localhost',
    API_BASE_URL: 'http://localhost:3001/api/v1',
    CDN_BASE_URL: 'https://cdn.smartalk.app',
    LOG_LEVEL: 'info',
    CACHE_TTL: '3600',
    RATE_LIMIT_WINDOW: '900000',
    RATE_LIMIT_MAX_REQUESTS: '100'
  },

  // 环境变量类型转换
  types: {
    PORT: 'number',
    CACHE_TTL: 'number',
    RATE_LIMIT_WINDOW: 'number',
    RATE_LIMIT_MAX_REQUESTS: 'number',
    ANALYTICS_ENABLED: 'boolean',
    DEBUG_MODE: 'boolean',
    PERFORMANCE_MONITORING_ENABLED: 'boolean'
  }
};

/**
 * 类型转换函数
 */
function convertType(value, type) {
  if (value === undefined || value === null) return value;
  
  switch (type) {
    case 'number':
      const num = Number(value);
      return isNaN(num) ? value : num;
    case 'boolean':
      return value === 'true' || value === '1' || value === 'yes';
    case 'array':
      return typeof value === 'string' ? value.split(',').map(s => s.trim()) : value;
    default:
      return value;
  }
}

/**
 * 验证必需的环境变量
 */
function validateRequiredEnv() {
  const missing = ENV_VALIDATION.required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * 获取环境变量配置
 */
function getEnvConfig() {
  // 验证必需的环境变量
  validateRequiredEnv();
  
  const config = {
    // 基础环境信息
    NODE_ENV: process.env.NODE_ENV,
    PORT: convertType(process.env.PORT, 'number'),
    HOST: process.env.HOST,
    
    // 数据库配置
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_POOL_SIZE: convertType(process.env.DATABASE_POOL_SIZE, 'number') || 10,
    DATABASE_TIMEOUT: convertType(process.env.DATABASE_TIMEOUT, 'number') || 30000,
    
    // API 配置
    API_BASE_URL: process.env.API_BASE_URL,
    API_TIMEOUT: convertType(process.env.API_TIMEOUT, 'number') || baseConfig.api.timeout,
    
    // 安全配置
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || baseConfig.security.jwt.expiresIn,
    BCRYPT_ROUNDS: convertType(process.env.BCRYPT_ROUNDS, 'number') || baseConfig.security.bcrypt.rounds,
    
    // CDN 配置
    CDN_BASE_URL: process.env.CDN_BASE_URL,
    CDN_BACKUP_URL: process.env.CDN_BACKUP_URL,
    CDN_STATIC_URL: process.env.CDN_STATIC_URL,
    CDN_API_KEY: process.env.CDN_API_KEY,
    CDN_ZONE_ID: process.env.CDN_ZONE_ID,
    
    // 存储配置
    STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || 'local',
    STORAGE_BASE_PATH: process.env.STORAGE_BASE_PATH || './content',
    UPLOAD_MAX_SIZE: process.env.UPLOAD_MAX_SIZE || '100MB',
    
    // AWS 配置（如果使用）
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
    
    // 缓存配置
    CACHE_TTL: convertType(process.env.CACHE_TTL, 'number'),
    CACHE_TTL_VIDEOS: convertType(process.env.CACHE_TTL_VIDEOS, 'number') || baseConfig.cache.ttl.videos,
    CACHE_TTL_AUDIO: convertType(process.env.CACHE_TTL_AUDIO, 'number') || baseConfig.cache.ttl.audio,
    CACHE_TTL_SUBTITLES: convertType(process.env.CACHE_TTL_SUBTITLES, 'number') || baseConfig.cache.ttl.subtitles,
    
    // 性能配置
    PERFORMANCE_MONITORING_ENABLED: convertType(process.env.PERFORMANCE_MONITORING_ENABLED, 'boolean'),
    ANALYTICS_ENABLED: convertType(process.env.ANALYTICS_ENABLED, 'boolean'),
    ERROR_REPORTING_ENABLED: convertType(process.env.ERROR_REPORTING_ENABLED, 'boolean'),
    
    // 速率限制
    RATE_LIMIT_WINDOW: convertType(process.env.RATE_LIMIT_WINDOW, 'number'),
    RATE_LIMIT_MAX_REQUESTS: convertType(process.env.RATE_LIMIT_MAX_REQUESTS, 'number'),
    
    // 日志配置
    LOG_LEVEL: process.env.LOG_LEVEL || baseConfig.logging.defaultLevel,
    LOG_FORMAT: process.env.LOG_FORMAT || baseConfig.logging.format,
    LOG_FILE_ENABLED: convertType(process.env.LOG_FILE_ENABLED, 'boolean'),
    LOG_FILE_PATH: process.env.LOG_FILE_PATH || './logs/app.log',
    
    // CORS 配置
    CORS_ORIGIN: process.env.CORS_ORIGIN ? 
      convertType(process.env.CORS_ORIGIN, 'array') : 
      ['http://localhost:3000', 'http://localhost:19006'],
    CORS_CREDENTIALS: convertType(process.env.CORS_CREDENTIALS, 'boolean'),
    
    // 功能开关
    FEATURE_OFFLINE_MODE: convertType(process.env.FEATURE_OFFLINE_MODE, 'boolean'),
    FEATURE_ADAPTIVE_QUALITY: convertType(process.env.FEATURE_ADAPTIVE_QUALITY, 'boolean'),
    FEATURE_PRELOADING: convertType(process.env.FEATURE_PRELOADING, 'boolean'),
    FEATURE_CDN_OPTIMIZATION: convertType(process.env.FEATURE_CDN_OPTIMIZATION, 'boolean'),
    
    // 开发配置
    DEBUG_MODE: convertType(process.env.DEBUG_MODE, 'boolean'),
    MOCK_API_ENABLED: convertType(process.env.MOCK_API_ENABLED, 'boolean'),
    SEED_DATABASE: convertType(process.env.SEED_DATABASE, 'boolean'),
    
    // 健康检查
    HEALTH_CHECK_ENABLED: convertType(process.env.HEALTH_CHECK_ENABLED, 'boolean'),
    HEALTH_CHECK_INTERVAL: convertType(process.env.HEALTH_CHECK_INTERVAL, 'number') || 30000
  };
  
  // 应用默认值
  Object.entries(ENV_VALIDATION.optional).forEach(([key, defaultValue]) => {
    if (config[key] === undefined) {
      config[key] = convertType(defaultValue, ENV_VALIDATION.types[key]);
    }
  });
  
  return config;
}

/**
 * 获取环境特定的配置
 */
function getEnvironmentConfig() {
  const env = process.env.NODE_ENV || 'development';
  const envConfig = getEnvConfig();
  
  // 环境特定的配置覆盖
  const environmentOverrides = {
    development: {
      DEBUG_MODE: true,
      LOG_LEVEL: 'debug',
      PERFORMANCE_MONITORING_ENABLED: false,
      ANALYTICS_ENABLED: false
    },
    test: {
      DEBUG_MODE: false,
      LOG_LEVEL: 'error',
      PERFORMANCE_MONITORING_ENABLED: false,
      ANALYTICS_ENABLED: false,
      DATABASE_URL: process.env.TEST_DATABASE_URL || envConfig.DATABASE_URL
    },
    production: {
      DEBUG_MODE: false,
      LOG_LEVEL: 'info',
      PERFORMANCE_MONITORING_ENABLED: true,
      ANALYTICS_ENABLED: true,
      ERROR_REPORTING_ENABLED: true
    }
  };
  
  return {
    ...envConfig,
    ...environmentOverrides[env]
  };
}

/**
 * 验证配置完整性
 */
function validateConfig(config) {
  const errors = [];
  
  // 验证数据库 URL 格式
  if (config.DATABASE_URL && !config.DATABASE_URL.startsWith('postgresql://')) {
    errors.push('DATABASE_URL must be a valid PostgreSQL connection string');
  }
  
  // 验证端口范围
  if (config.PORT && (config.PORT < 1 || config.PORT > 65535)) {
    errors.push('PORT must be between 1 and 65535');
  }
  
  // 验证 JWT 密钥长度
  if (config.JWT_SECRET && config.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
  
  return true;
}

/**
 * 主配置导出
 */
function createConfig() {
  const config = getEnvironmentConfig();
  validateConfig(config);
  
  return {
    ...baseConfig,
    env: config,
    
    // 便捷访问器
    isDevelopment: config.NODE_ENV === 'development',
    isProduction: config.NODE_ENV === 'production',
    isTest: config.NODE_ENV === 'test'
  };
}

module.exports = createConfig();
