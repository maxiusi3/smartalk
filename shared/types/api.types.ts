/**
 * SmarTalk API 类型定义
 * 统一的 API 请求和响应类型
 */

// HTTP 状态码枚举
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

// API 错误码枚举
export enum ApiErrorCode {
  // 通用错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  
  // 用户相关错误
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  
  // 内容相关错误
  STORY_NOT_FOUND = 'STORY_NOT_FOUND',
  VIDEO_NOT_FOUND = 'VIDEO_NOT_FOUND',
  KEYWORD_NOT_FOUND = 'KEYWORD_NOT_FOUND',
  
  // 学习相关错误
  PROGRESS_NOT_FOUND = 'PROGRESS_NOT_FOUND',
  ACHIEVEMENT_NOT_FOUND = 'ACHIEVEMENT_NOT_FOUND',
  
  // 文件相关错误
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
}

// 基础 API 响应接口
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
  timestamp: string;
  requestId: string;
}

// API 错误接口
export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: Record<string, any>;
  field?: string;
  stack?: string; // 仅开发环境
}

// API 元数据接口
export interface ApiMeta {
  pagination?: PaginationMeta;
  version?: string;
  deprecation?: DeprecationMeta;
  rateLimit?: RateLimitMeta;
}

// 分页元数据
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 弃用警告元数据
export interface DeprecationMeta {
  deprecated: boolean;
  deprecationDate?: string;
  removalDate?: string;
  replacement?: string;
  message?: string;
}

// 速率限制元数据
export interface RateLimitMeta {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// 分页查询参数
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// 搜索查询参数
export interface SearchQuery extends PaginationQuery {
  q?: string;
  filters?: Record<string, any>;
}

// API 路由参数类型
export interface RouteParams {
  id?: string;
  userId?: string;
  storyId?: string;
  videoId?: string;
  keywordId?: string;
  achievementId?: string;
}

// 用户相关 API 类型
export interface UserCreateRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  preferredLanguage?: string;
  learningGoals?: string[];
}

export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  preferredLanguage?: string;
  learningGoals?: string[];
  avatar?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  preferredLanguage: string;
  learningGoals: string[];
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// 认证相关 API 类型
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: UserResponse;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

// 故事相关 API 类型
export interface StoryResponse {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  thumbnailUrl?: string;
  keywords: KeywordResponse[];
  videos: VideoResponse[];
  isCompleted?: boolean;
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoryListQuery extends SearchQuery {
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  completed?: boolean;
}

// 视频相关 API 类型
export interface VideoResponse {
  id: string;
  storyId: string;
  title: string;
  description?: string;
  type: 'context' | 'option_a' | 'option_b';
  url: string;
  duration: number;
  thumbnailUrl?: string;
  order: number;
  isWatched?: boolean;
  createdAt: string;
  updatedAt: string;
}

// 关键词相关 API 类型
export interface KeywordResponse {
  id: string;
  word: string;
  definition: string;
  pronunciation?: string;
  audioUrl?: string;
  examples: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  isLearned?: boolean;
  createdAt: string;
  updatedAt: string;
}

// 学习进度相关 API 类型
export interface ProgressResponse {
  id: string;
  userId: string;
  storyId: string;
  videoId?: string;
  keywordId?: string;
  type: 'story' | 'video' | 'keyword';
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  timeSpent: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressUpdateRequest {
  status?: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  timeSpent?: number;
}

// 成就相关 API 类型
export interface AchievementResponse {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'story_completion' | 'keyword_mastery' | 'streak' | 'time_spent';
  criteria: Record<string, any>;
  reward?: {
    type: 'badge' | 'points' | 'unlock';
    value: any;
  };
  isUnlocked?: boolean;
  unlockedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 统计相关 API 类型
export interface UserStatsResponse {
  totalStoriesCompleted: number;
  totalKeywordsLearned: number;
  totalTimeSpent: number;
  currentStreak: number;
  longestStreak: number;
  achievementsUnlocked: number;
  level: number;
  experience: number;
  nextLevelExperience: number;
}

export interface LearningStatsResponse {
  dailyStats: DailyStatsResponse[];
  weeklyStats: WeeklyStatsResponse[];
  monthlyStats: MonthlyStatsResponse[];
}

export interface DailyStatsResponse {
  date: string;
  storiesCompleted: number;
  keywordsLearned: number;
  timeSpent: number;
}

export interface WeeklyStatsResponse {
  week: string;
  storiesCompleted: number;
  keywordsLearned: number;
  timeSpent: number;
}

export interface MonthlyStatsResponse {
  month: string;
  storiesCompleted: number;
  keywordsLearned: number;
  timeSpent: number;
}

// 文件上传相关 API 类型
export interface FileUploadRequest {
  file: File | Buffer;
  type: 'avatar' | 'content' | 'audio';
  metadata?: Record<string, any>;
}

export interface FileUploadResponse {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// 健康检查 API 类型
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
    storage: ServiceStatus;
  };
  metrics: {
    memoryUsage: number;
    cpuUsage: number;
    activeConnections: number;
  };
}

export interface ServiceStatus {
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  error?: string;
}

// API 版本信息
export interface ApiVersionResponse {
  version: string;
  buildDate: string;
  gitCommit: string;
  environment: string;
  features: string[];
  deprecations: DeprecationMeta[];
}

// 通用响应类型别名
export type SuccessResponse<T = any> = ApiResponse<T> & { success: true };
export type ErrorResponse = ApiResponse<never> & { success: false; error: ApiError };

// API 端点路径常量
export const API_ENDPOINTS = {
  // 认证
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    REGISTER: '/auth/register',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // 用户
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    STATS: '/users/stats',
    ACHIEVEMENTS: '/users/achievements',
    PROGRESS: '/users/progress',
  },
  
  // 故事
  STORIES: {
    LIST: '/stories',
    DETAIL: '/stories/:id',
    VIDEOS: '/stories/:id/videos',
    KEYWORDS: '/stories/:id/keywords',
    PROGRESS: '/stories/:id/progress',
  },
  
  // 视频
  VIDEOS: {
    DETAIL: '/videos/:id',
    PROGRESS: '/videos/:id/progress',
  },
  
  // 关键词
  KEYWORDS: {
    LIST: '/keywords',
    DETAIL: '/keywords/:id',
    PROGRESS: '/keywords/:id/progress',
  },
  
  // 学习进度
  PROGRESS: {
    LIST: '/progress',
    UPDATE: '/progress/:id',
    STATS: '/progress/stats',
  },
  
  // 成就
  ACHIEVEMENTS: {
    LIST: '/achievements',
    DETAIL: '/achievements/:id',
    USER_ACHIEVEMENTS: '/achievements/user',
  },
  
  // 文件上传
  FILES: {
    UPLOAD: '/files/upload',
    DETAIL: '/files/:id',
  },
  
  // 系统
  SYSTEM: {
    HEALTH: '/health',
    VERSION: '/version',
    METRICS: '/metrics',
  },
} as const;
