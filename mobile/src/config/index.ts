/**
 * 移动端配置管理
 * 整合共享配置和移动端特定配置
 */

import baseConfig from '../../../shared/config/base.config';

// 移动端特定的环境变量
const mobileEnv = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1',
  CDN_BASE_URL: process.env.EXPO_PUBLIC_CDN_BASE_URL || 'https://cdn.smartalk.app',
  CDN_BACKUP_URL: process.env.EXPO_PUBLIC_CDN_BACKUP_URL || 'https://backup-cdn.smartalk.app',
  ANALYTICS_ENABLED: process.env.EXPO_PUBLIC_ANALYTICS_ENABLED === 'true',
  DEBUG_MODE: process.env.EXPO_PUBLIC_DEBUG_MODE === 'true',
  PERFORMANCE_MONITORING_ENABLED: process.env.EXPO_PUBLIC_PERFORMANCE_MONITORING_ENABLED === 'true',
  FEATURE_OFFLINE_MODE: process.env.EXPO_PUBLIC_FEATURE_OFFLINE_MODE !== 'false',
  FEATURE_ADAPTIVE_QUALITY: process.env.EXPO_PUBLIC_FEATURE_ADAPTIVE_QUALITY !== 'false',
  FEATURE_PRELOADING: process.env.EXPO_PUBLIC_FEATURE_PRELOADING !== 'false',
  FEATURE_CDN_OPTIMIZATION: process.env.EXPO_PUBLIC_FEATURE_CDN_OPTIMIZATION !== 'false'
};

// 移动端特定配置
const mobileConfig = {
  // 设备配置
  device: {
    orientations: ['portrait', 'landscape'],
    defaultOrientation: 'portrait',
    statusBarStyle: 'dark-content',
    navigationBarStyle: 'dark-content'
  },

  // 存储配置
  storage: {
    maxSize: 500 * 1024 * 1024, // 500MB
    cacheLocation: 'DocumentDirectoryPath',
    tempLocation: 'TemporaryDirectoryPath'
  },

  // 网络配置
  network: {
    timeout: 15000,
    retryAttempts: 3,
    retryDelay: 1000,
    backgroundSync: true
  },

  // 推送通知配置
  notifications: {
    enabled: true,
    categories: ['learning', 'achievement', 'reminder'],
    sound: true,
    badge: true
  },

  // 手势配置
  gestures: {
    swipeThreshold: 50,
    longPressDelay: 500,
    doubleTapDelay: 300
  },

  // 动画配置
  animations: {
    duration: {
      short: 200,
      medium: 300,
      long: 500
    },
    easing: 'ease-in-out',
    reducedMotion: false
  },

  // 可访问性配置
  accessibility: {
    enabled: true,
    announceScreenChanges: true,
    reduceTransparency: false,
    increaseContrast: false
  }
};

// 合并配置
const config = {
  ...baseConfig,
  env: mobileEnv,
  mobile: mobileConfig,
  
  // 便捷访问器
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
  
  // API 配置
  api: {
    ...baseConfig.api,
    baseURL: mobileEnv.API_BASE_URL,
    timeout: mobileConfig.network.timeout
  },

  // CDN 配置
  cdn: {
    baseURL: mobileEnv.CDN_BASE_URL,
    backupURL: mobileEnv.CDN_BACKUP_URL,
    regions: baseConfig.regions.available
  },

  // 功能开关
  features: {
    ...baseConfig.features,
    offlineMode: mobileEnv.FEATURE_OFFLINE_MODE,
    adaptiveQuality: mobileEnv.FEATURE_ADAPTIVE_QUALITY,
    preloading: mobileEnv.FEATURE_PRELOADING,
    cdnOptimization: mobileEnv.FEATURE_CDN_OPTIMIZATION,
    analytics: mobileEnv.ANALYTICS_ENABLED,
    performanceMonitoring: mobileEnv.PERFORMANCE_MONITORING_ENABLED
  },

  // 缓存配置（移动端优化）
  cache: {
    ...baseConfig.cache,
    maxSize: {
      ...baseConfig.cache.maxSize,
      total: mobileConfig.storage.maxSize
    }
  }
};

export default config;

// 导出特定配置部分
export const { api, cdn, features, cache, mobile } = config;
export const isDevelopment = config.isDevelopment;
export const isProduction = config.isProduction;
