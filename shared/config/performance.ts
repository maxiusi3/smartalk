/**
 * SmarTalk 性能优化配置
 * 统一管理性能相关的配置和优化策略
 */

export interface PerformanceConfig {
  // 应用启动优化
  startup: {
    lazyLoadComponents: boolean;
    preloadCriticalAssets: boolean;
    enableCodeSplitting: boolean;
    bundleAnalysis: boolean;
  };
  
  // 视频性能优化
  video: {
    enablePreloading: boolean;
    maxConcurrentLoads: number;
    compressionLevel: 'low' | 'medium' | 'high';
    adaptiveBitrate: boolean;
    cacheStrategy: 'memory' | 'disk' | 'hybrid';
  };
  
  // API性能优化
  api: {
    enableCaching: boolean;
    requestTimeout: number;
    retryAttempts: number;
    batchRequests: boolean;
    compressionEnabled: boolean;
  };
  
  // 内存管理
  memory: {
    enableGarbageCollection: boolean;
    maxCacheSize: number;
    imageOptimization: boolean;
    componentPooling: boolean;
  };
  
  // 网络优化
  network: {
    enableServiceWorker: boolean;
    offlineSupport: boolean;
    prefetchStrategy: 'aggressive' | 'conservative' | 'smart';
    cdnEnabled: boolean;
  };
}

/**
 * 默认性能配置
 */
export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  startup: {
    lazyLoadComponents: true,
    preloadCriticalAssets: true,
    enableCodeSplitting: true,
    bundleAnalysis: process.env.NODE_ENV === 'development',
  },
  
  video: {
    enablePreloading: true,
    maxConcurrentLoads: 2,
    compressionLevel: 'medium',
    adaptiveBitrate: true,
    cacheStrategy: 'hybrid',
  },
  
  api: {
    enableCaching: true,
    requestTimeout: 10000,
    retryAttempts: 3,
    batchRequests: true,
    compressionEnabled: true,
  },
  
  memory: {
    enableGarbageCollection: true,
    maxCacheSize: 50 * 1024 * 1024, // 50MB
    imageOptimization: true,
    componentPooling: true,
  },
  
  network: {
    enableServiceWorker: true,
    offlineSupport: true,
    prefetchStrategy: 'smart',
    cdnEnabled: true,
  },
};

/**
 * 环境特定配置
 */
export const ENVIRONMENT_CONFIGS: Record<string, Partial<PerformanceConfig>> = {
  development: {
    startup: {
      bundleAnalysis: true,
    },
    video: {
      compressionLevel: 'low',
      enablePreloading: false,
    },
    api: {
      enableCaching: false,
    },
  },
  
  production: {
    startup: {
      bundleAnalysis: false,
    },
    video: {
      compressionLevel: 'high',
      enablePreloading: true,
    },
    api: {
      enableCaching: true,
      compressionEnabled: true,
    },
  },
  
  test: {
    startup: {
      lazyLoadComponents: false,
      preloadCriticalAssets: false,
    },
    video: {
      enablePreloading: false,
      maxConcurrentLoads: 1,
    },
    api: {
      enableCaching: false,
      requestTimeout: 5000,
    },
  },
};

/**
 * 性能监控指标
 */
export const PERFORMANCE_METRICS = {
  // 关键性能指标
  CRITICAL: {
    APP_STARTUP_TIME: 'app_startup_time',
    FIRST_CONTENTFUL_PAINT: 'first_contentful_paint',
    TIME_TO_INTERACTIVE: 'time_to_interactive',
    VIDEO_LOAD_TIME: 'video_load_time',
  },
  
  // 用户体验指标
  USER_EXPERIENCE: {
    NAVIGATION_RESPONSE: 'navigation_response',
    BUTTON_CLICK_RESPONSE: 'button_click_response',
    SCROLL_PERFORMANCE: 'scroll_performance',
    ANIMATION_SMOOTHNESS: 'animation_smoothness',
  },
  
  // 资源使用指标
  RESOURCE_USAGE: {
    MEMORY_USAGE: 'memory_usage',
    CPU_USAGE: 'cpu_usage',
    NETWORK_USAGE: 'network_usage',
    BATTERY_USAGE: 'battery_usage',
  },
  
  // 错误和稳定性指标
  STABILITY: {
    CRASH_RATE: 'crash_rate',
    ERROR_RATE: 'error_rate',
    NETWORK_ERROR_RATE: 'network_error_rate',
    VIDEO_ERROR_RATE: 'video_error_rate',
  },
};

/**
 * 性能优化策略
 */
export const OPTIMIZATION_STRATEGIES = {
  // 代码分割策略
  CODE_SPLITTING: {
    ROUTE_BASED: 'route_based',
    COMPONENT_BASED: 'component_based',
    FEATURE_BASED: 'feature_based',
  },
  
  // 缓存策略
  CACHING: {
    MEMORY_CACHE: 'memory_cache',
    DISK_CACHE: 'disk_cache',
    NETWORK_CACHE: 'network_cache',
    HYBRID_CACHE: 'hybrid_cache',
  },
  
  // 预加载策略
  PRELOADING: {
    CRITICAL_RESOURCES: 'critical_resources',
    NEXT_SCREEN: 'next_screen',
    USER_PREDICTED: 'user_predicted',
    BACKGROUND_SYNC: 'background_sync',
  },
  
  // 图像优化策略
  IMAGE_OPTIMIZATION: {
    LAZY_LOADING: 'lazy_loading',
    PROGRESSIVE_LOADING: 'progressive_loading',
    ADAPTIVE_QUALITY: 'adaptive_quality',
    FORMAT_OPTIMIZATION: 'format_optimization',
  },
};

/**
 * 性能预算配置
 */
export const PERFORMANCE_BUDGETS = {
  // 时间预算 (毫秒)
  TIME_BUDGETS: {
    APP_STARTUP: 2000,
    SCREEN_TRANSITION: 300,
    API_RESPONSE: 500,
    VIDEO_LOAD: 3000,
    IMAGE_LOAD: 1000,
  },
  
  // 大小预算 (字节)
  SIZE_BUDGETS: {
    TOTAL_BUNDLE: 5 * 1024 * 1024, // 5MB
    INITIAL_BUNDLE: 1 * 1024 * 1024, // 1MB
    IMAGE_MAX_SIZE: 500 * 1024, // 500KB
    VIDEO_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  },
  
  // 内存预算 (字节)
  MEMORY_BUDGETS: {
    HEAP_SIZE: 100 * 1024 * 1024, // 100MB
    CACHE_SIZE: 50 * 1024 * 1024, // 50MB
    IMAGE_CACHE: 20 * 1024 * 1024, // 20MB
    VIDEO_CACHE: 30 * 1024 * 1024, // 30MB
  },
  
  // 网络预算
  NETWORK_BUDGETS: {
    REQUESTS_PER_MINUTE: 60,
    BANDWIDTH_USAGE: 1 * 1024 * 1024, // 1MB/min
    CONCURRENT_REQUESTS: 6,
  },
};

/**
 * 获取当前环境的性能配置
 */
export function getPerformanceConfig(environment?: string): PerformanceConfig {
  const env = environment || process.env.NODE_ENV || 'development';
  const envConfig = ENVIRONMENT_CONFIGS[env] || {};
  
  return {
    ...DEFAULT_PERFORMANCE_CONFIG,
    ...envConfig,
  };
}

/**
 * 检查性能预算是否超标
 */
export function checkPerformanceBudget(
  metric: string,
  value: number,
  category: 'time' | 'size' | 'memory' | 'network'
): {
  withinBudget: boolean;
  budget: number;
  usage: number;
  percentage: number;
} {
  let budget: number;
  
  switch (category) {
    case 'time':
      budget = PERFORMANCE_BUDGETS.TIME_BUDGETS[metric as keyof typeof PERFORMANCE_BUDGETS.TIME_BUDGETS] || 0;
      break;
    case 'size':
      budget = PERFORMANCE_BUDGETS.SIZE_BUDGETS[metric as keyof typeof PERFORMANCE_BUDGETS.SIZE_BUDGETS] || 0;
      break;
    case 'memory':
      budget = PERFORMANCE_BUDGETS.MEMORY_BUDGETS[metric as keyof typeof PERFORMANCE_BUDGETS.MEMORY_BUDGETS] || 0;
      break;
    case 'network':
      budget = PERFORMANCE_BUDGETS.NETWORK_BUDGETS[metric as keyof typeof PERFORMANCE_BUDGETS.NETWORK_BUDGETS] || 0;
      break;
    default:
      budget = 0;
  }
  
  const percentage = budget > 0 ? (value / budget) * 100 : 0;
  
  return {
    withinBudget: value <= budget,
    budget,
    usage: value,
    percentage: Math.round(percentage),
  };
}

/**
 * 性能优化建议
 */
export function getOptimizationSuggestions(metrics: Record<string, number>): string[] {
  const suggestions: string[] = [];
  
  // 检查启动时间
  if (metrics.APP_STARTUP_TIME > PERFORMANCE_BUDGETS.TIME_BUDGETS.APP_STARTUP) {
    suggestions.push('考虑启用代码分割和懒加载来减少初始包大小');
    suggestions.push('优化关键渲染路径，延迟非关键资源加载');
  }
  
  // 检查视频加载时间
  if (metrics.VIDEO_LOAD_TIME > PERFORMANCE_BUDGETS.TIME_BUDGETS.VIDEO_LOAD) {
    suggestions.push('启用视频预加载和自适应码率');
    suggestions.push('考虑使用CDN加速视频内容分发');
  }
  
  // 检查API响应时间
  if (metrics.API_RESPONSE > PERFORMANCE_BUDGETS.TIME_BUDGETS.API_RESPONSE) {
    suggestions.push('启用API响应缓存');
    suggestions.push('考虑使用请求批处理减少网络往返');
  }
  
  // 检查内存使用
  if (metrics.MEMORY_USAGE > PERFORMANCE_BUDGETS.MEMORY_BUDGETS.HEAP_SIZE) {
    suggestions.push('启用组件池化和内存回收');
    suggestions.push('优化图片和视频缓存策略');
  }
  
  return suggestions;
}
