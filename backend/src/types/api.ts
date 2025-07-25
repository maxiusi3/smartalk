// API请求和响应类型定义

// 基础API响应格式
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode?: number;
    details?: any;
  };
}

// 用户相关类型
export interface CreateAnonymousUserRequest {
  deviceId: string;
}

export interface UserResponse {
  id: string;
  deviceId: string;
  createdAt: Date;
  updatedAt: Date;
}

// 进度相关类型
export interface UnlockProgressRequest {
  userId: string;
  keywordId: string;
  status?: 'unlocked' | 'completed';
  isCorrect?: boolean;
}

export interface UserProgressResponse {
  id: string;
  userId: string;
  keywordId: string;
  dramaId: string;
  status: string;
  attempts: number;
  correctAttempts: number;
  completedAt: Date | null;
  keyword?: {
    id: string;
    word: string;
    translation: string;
    sortOrder: number;
  };
}

// 学习统计类型
export interface LearningStats {
  totalKeywords: number;
  unlockedKeywords: number;
  completedKeywords: number;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
}

// 剧集进度响应
export interface DramaProgressResponse {
  progress: UserProgressResponse[];
  stats: LearningStats;
}

// 用户总体统计
export interface UserOverallStats {
  totalDramas: number;
  totalKeywords: number;
  completedKeywords: number;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  streakDays: number;
}

// 兴趣相关类型
export interface InterestResponse {
  id: string;
  name: string;
  displayName: string;
  description: string;
  iconUrl: string;
  sortOrder: number;
}

// 剧集相关类型
export interface DramaResponse {
  id: string;
  title: string;
  description: string;
  duration: number;
  videoUrl: string;
  videoUrlNoSubs: string;
  subtitleUrl: string;
  thumbnailUrl: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sortOrder: number;
  interest: {
    name: string;
    displayName: string;
  };
}

// 关键词相关类型
export interface KeywordResponse {
  id: string;
  word: string;
  translation: string;
  audioUrl: string;
  subtitleStart: number;
  subtitleEnd: number;
  sortOrder: number;
  videoClips: VideoClipResponse[];
}

export interface VideoClipResponse {
  id: string;
  videoUrl: string;
  startTime: number;
  endTime: number;
  isCorrect: boolean;
  sortOrder: number;
}

// 分析事件类型
export interface AnalyticsEventRequest {
  userId: string;
  eventType: string;
  eventData: Record<string, any>;
  timestamp?: Date;
}

// 健康检查响应
export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: Date;
  version: string;
  database: 'connected' | 'disconnected';
  uptime: number;
}

// 错误响应类型
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    statusCode: number;
    details?: any;
  };
}
