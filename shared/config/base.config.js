/**
 * SmarTalk 基础配置
 * 所有环境共享的基础配置项
 */

module.exports = {
  // 应用基础信息
  app: {
    name: 'SmarTalk',
    version: '1.0.0',
    description: 'AI-powered language learning through video content',
    author: 'SmarTalk Team'
  },

  // API 配置
  api: {
    version: 'v1',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000
  },

  // 缓存配置
  cache: {
    ttl: {
      videos: 24 * 60 * 60 * 1000,      // 24 hours
      audio: 24 * 60 * 60 * 1000,       // 24 hours
      subtitles: 7 * 24 * 60 * 60 * 1000, // 7 days
      api: 60 * 60 * 1000,              // 1 hour
      user: 30 * 60 * 1000              // 30 minutes
    },
    maxSize: {
      videos: 100 * 1024 * 1024,        // 100MB
      audio: 50 * 1024 * 1024,          // 50MB
      subtitles: 10 * 1024 * 1024,      // 10MB
      api: 5 * 1024 * 1024               // 5MB
    }
  },

  // 媒体配置
  media: {
    video: {
      formats: ['mp4', 'webm', 'mov'],
      qualities: ['low', 'medium', 'high', 'auto'],
      defaultQuality: 'auto',
      bufferSize: 15000,
      maxBufferSize: 50000,
      playbackBufferMs: 2500,
      rebufferMs: 5000
    },
    audio: {
      formats: ['mp3', 'aac', 'wav'],
      bitrates: [64, 96, 128],
      defaultBitrate: 96
    },
    subtitles: {
      formats: ['srt', 'vtt'],
      defaultFormat: 'srt'
    }
  },

  // 性能配置
  performance: {
    targets: {
      appStartTime: 2000,              // 2 seconds
      videoLoadTime: 3000,             // 3 seconds
      apiResponseTime: 1000,           // 1 second
      uiResponseTime: 100              // 100ms
    },
    monitoring: {
      enabled: true,
      sampleRate: 0.1,                 // 10% sampling
      batchSize: 100,
      flushInterval: 30000             // 30 seconds
    }
  },

  // 学习配置
  learning: {
    vtpr: {
      maxAttempts: 3,
      timeoutMs: 30000,
      difficultyLevels: ['easy', 'medium', 'hard'],
      progressThresholds: {
        beginner: 0.3,
        intermediate: 0.6,
        advanced: 0.8
      }
    },
    achievements: {
      milestones: [5, 10, 15, 25, 50, 100],
      streakTargets: [3, 7, 14, 30],
      accuracyThresholds: [0.7, 0.8, 0.9, 0.95]
    }
  },

  // 安全配置
  security: {
    jwt: {
      expiresIn: '7d',
      algorithm: 'HS256'
    },
    bcrypt: {
      rounds: 12
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000,        // 15 minutes
      maxRequests: 100
    }
  },

  // 日志配置
  logging: {
    levels: ['error', 'warn', 'info', 'debug'],
    defaultLevel: 'info',
    format: 'combined',
    maxFileSize: 10 * 1024 * 1024,     // 10MB
    maxFiles: 5
  },

  // 功能开关
  features: {
    offlineMode: true,
    adaptiveQuality: true,
    preloading: true,
    cdnOptimization: true,
    analytics: true,
    errorReporting: true,
    performanceMonitoring: true
  },

  // 地区配置
  regions: {
    default: 'asia-east1',
    available: ['asia-east1', 'asia-southeast1', 'us-west1', 'eu-west1'],
    fallback: 'us-west1'
  },

  // 内容配置
  content: {
    categories: ['travel', 'business', 'daily', 'entertainment'],
    difficulties: ['beginner', 'intermediate', 'advanced'],
    languages: ['en', 'zh-CN', 'zh-TW'],
    defaultLanguage: 'zh-CN'
  }
};
