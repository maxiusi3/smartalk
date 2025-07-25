/**
 * SmarTalk 共享常量定义
 * 统一管理应用中的所有常量
 */

// 应用配置常量
export const APP_CONFIG = {
  NAME: 'SmarTalk',
  VERSION: '1.0.0',
  DESCRIPTION: '神经沉浸式英语学习平台',
  AUTHOR: 'SmarTalk Team',
  WEBSITE: 'https://smartalk.app',
  SUPPORT_EMAIL: 'support@smartalk.app',
} as const;

// 环境常量
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;

// 平台常量
export const PLATFORMS = {
  WEB: 'web',
  MOBILE: 'mobile',
  DESKTOP: 'desktop',
  API: 'api',
} as const;

// 语言和地区常量
export const LOCALES = {
  ZH_CN: 'zh-CN',
  ZH_TW: 'zh-TW',
  EN_US: 'en-US',
  EN_GB: 'en-GB',
  JA_JP: 'ja-JP',
  KO_KR: 'ko-KR',
} as const;

// 主题常量
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
} as const;

// 用户角色常量
export const USER_ROLES = {
  GUEST: 'guest',
  USER: 'user',
  PREMIUM: 'premium',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;

// 学习兴趣常量
export const INTERESTS = {
  TRAVEL: 'travel',
  MOVIE: 'movie',
  WORKPLACE: 'workplace',
  DAILY_LIFE: 'daily_life',
  BUSINESS: 'business',
  TECHNOLOGY: 'technology',
} as const;

// 学习难度常量
export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
} as const;

// 内容类型常量
export const CONTENT_TYPES = {
  STORY: 'story',
  KEYWORD: 'keyword',
  VIDEO: 'video',
  AUDIO: 'audio',
  IMAGE: 'image',
  TEXT: 'text',
} as const;

// 视频类型常量
export const VIDEO_TYPES = {
  CONTEXT: 'context',
  OPTION_A: 'option_a',
  OPTION_B: 'option_b',
  OPTION_C: 'option_c',
  OPTION_D: 'option_d',
  EXPLANATION: 'explanation',
} as const;

// 学习状态常量
export const LEARNING_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  FAILED: 'failed',
} as const;

// 成就类型常量
export const ACHIEVEMENT_TYPES = {
  FIRST_CORRECT: 'first_correct',
  STREAK: 'streak',
  COMPLETION: 'completion',
  MILESTONE: 'milestone',
  SPEED: 'speed',
  ACCURACY: 'accuracy',
  PERSISTENCE: 'persistence',
} as const;

// API 状态码常量
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// 错误代码常量
export const ERROR_CODES = {
  // 通用错误
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // 认证错误
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // 业务错误
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  STORY_NOT_FOUND: 'STORY_NOT_FOUND',
  KEYWORD_NOT_FOUND: 'KEYWORD_NOT_FOUND',
  VIDEO_NOT_FOUND: 'VIDEO_NOT_FOUND',
  PROGRESS_NOT_FOUND: 'PROGRESS_NOT_FOUND',
  
  // 资源错误
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  RESOURCE_LIMIT_EXCEEDED: 'RESOURCE_LIMIT_EXCEEDED',
  
  // 文件错误
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
} as const;

// 存储键常量
export const STORAGE_KEYS = {
  // 用户相关
  USER_TOKEN: 'smartalk_user_token',
  USER_PROFILE: 'smartalk_user_profile',
  USER_PREFERENCES: 'smartalk_user_preferences',
  
  // 学习相关
  LEARNING_PROGRESS: 'smartalk_learning_progress',
  CURRENT_STORY: 'smartalk_current_story',
  COMPLETED_KEYWORDS: 'smartalk_completed_keywords',
  
  // 应用状态
  APP_SETTINGS: 'smartalk_app_settings',
  THEME_PREFERENCE: 'smartalk_theme_preference',
  LANGUAGE_PREFERENCE: 'smartalk_language_preference',
  
  // 缓存
  STORIES_CACHE: 'smartalk_stories_cache',
  KEYWORDS_CACHE: 'smartalk_keywords_cache',
  VIDEOS_CACHE: 'smartalk_videos_cache',
} as const;

// 事件名称常量
export const EVENT_NAMES = {
  // 用户事件
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_REGISTER: 'user_register',
  USER_PROFILE_UPDATE: 'user_profile_update',
  
  // 学习事件
  STORY_START: 'story_start',
  STORY_COMPLETE: 'story_complete',
  KEYWORD_CORRECT: 'keyword_correct',
  KEYWORD_INCORRECT: 'keyword_incorrect',
  VIDEO_PLAY: 'video_play',
  VIDEO_COMPLETE: 'video_complete',
  
  // 成就事件
  ACHIEVEMENT_UNLOCK: 'achievement_unlock',
  MILESTONE_REACH: 'milestone_reach',
  STREAK_ACHIEVE: 'streak_achieve',
  
  // 系统事件
  APP_START: 'app_start',
  APP_BACKGROUND: 'app_background',
  APP_FOREGROUND: 'app_foreground',
  ERROR_OCCURRED: 'error_occurred',
} as const;

// 性能指标常量
export const PERFORMANCE_METRICS = {
  // 时间指标 (毫秒)
  APP_STARTUP_TARGET: 2000,
  API_RESPONSE_TARGET: 500,
  VIDEO_LOAD_TARGET: 3000,
  IMAGE_LOAD_TARGET: 1000,
  
  // 大小指标 (字节)
  MAX_BUNDLE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGE_SIZE: 500 * 1024, // 500KB
  MAX_VIDEO_SIZE: 10 * 1024 * 1024, // 10MB
  
  // 内存指标 (字节)
  MAX_MEMORY_USAGE: 100 * 1024 * 1024, // 100MB
  MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB
} as const;

// 动画常量
export const ANIMATIONS = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    VERY_SLOW: 1000,
  },
  EASING: {
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
    LINEAR: 'linear',
  },
} as const;

// 布局常量
export const LAYOUT = {
  BREAKPOINTS: {
    XS: 320,
    SM: 576,
    MD: 768,
    LG: 992,
    XL: 1200,
    XXL: 1400,
  },
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
    XXL: 48,
  },
  Z_INDEX: {
    DROPDOWN: 1000,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    TOAST: 1080,
  },
} as const;

// 颜色常量
export const COLORS = {
  PRIMARY: '#4A90E2',
  SECONDARY: '#7BB3F0',
  SUCCESS: '#27AE60',
  WARNING: '#F39C12',
  ERROR: '#E74C3C',
  INFO: '#3498DB',
  
  GRAY: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
} as const;

// 正则表达式常量
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^1[3-9]\d{9}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
} as const;

// 文件类型常量
export const FILE_TYPES = {
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  VIDEO: ['mp4', 'webm', 'ogg', 'avi', 'mov'],
  AUDIO: ['mp3', 'wav', 'ogg', 'aac', 'm4a'],
  DOCUMENT: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
  ARCHIVE: ['zip', 'rar', '7z', 'tar', 'gz'],
} as const;

// 导出所有常量的类型
export type AppConfig = typeof APP_CONFIG;
export type Environment = typeof ENVIRONMENTS[keyof typeof ENVIRONMENTS];
export type Platform = typeof PLATFORMS[keyof typeof PLATFORMS];
export type Locale = typeof LOCALES[keyof typeof LOCALES];
export type Theme = typeof THEMES[keyof typeof THEMES];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type Interest = typeof INTERESTS[keyof typeof INTERESTS];
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[keyof typeof DIFFICULTY_LEVELS];
export type ContentType = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];
export type VideoType = typeof VIDEO_TYPES[keyof typeof VIDEO_TYPES];
export type LearningStatus = typeof LEARNING_STATUS[keyof typeof LEARNING_STATUS];
export type AchievementType = typeof ACHIEVEMENT_TYPES[keyof typeof ACHIEVEMENT_TYPES];
export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
export type EventName = typeof EVENT_NAMES[keyof typeof EVENT_NAMES];

// 常量统计信息
export const CONSTANTS_STATS = {
  totalCategories: 20,
  totalConstants: Object.keys({
    ...APP_CONFIG,
    ...ENVIRONMENTS,
    ...PLATFORMS,
    ...LOCALES,
    ...THEMES,
    ...USER_ROLES,
    ...INTERESTS,
    ...DIFFICULTY_LEVELS,
    ...CONTENT_TYPES,
    ...VIDEO_TYPES,
    ...LEARNING_STATUS,
    ...ACHIEVEMENT_TYPES,
    ...HTTP_STATUS,
    ...ERROR_CODES,
    ...STORAGE_KEYS,
    ...EVENT_NAMES,
    ...PERFORMANCE_METRICS,
    ...ANIMATIONS,
    ...LAYOUT,
    ...COLORS,
  }).length,
  version: '1.0.0',
};
