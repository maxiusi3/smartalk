// API类型定义
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode?: number;
  };
}

// 用户相关类型
export interface User {
  id: string;
  deviceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  deviceId: string;
}

// 兴趣主题类型
export interface Interest {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  iconUrl?: string;
  sortOrder: number;
}

// 剧集类型
export interface Drama {
  id: string;
  title: string;
  description?: string;
  duration: number;
  videoUrl: string;
  videoUrlNoSubs: string;
  subtitleUrl?: string;
  thumbnailUrl?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sortOrder: number;
  interest: {
    name: string;
    displayName: string;
  };
}

// 词汇类型
export interface Keyword {
  id: string;
  word: string;
  translation: string;
  audioUrl: string;
  subtitleStart: number;
  subtitleEnd: number;
  sortOrder: number;
  videoClips: KeywordVideoClip[];
}

export interface KeywordVideoClip {
  id: string;
  videoUrl: string;
  startTime: number;
  endTime: number;
  isCorrect: boolean;
  sortOrder: number;
}

// 用户进度类型
export interface UserProgress {
  id: string;
  userId: string;
  dramaId: string;
  keywordId?: string;
  status: 'locked' | 'unlocked' | 'completed';
  attempts: number;
  correctAttempts: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  keyword?: {
    id: string;
    word: string;
    translation: string;
    sortOrder: number;
  };
}

// 进度更新请求
export interface UpdateProgressRequest {
  userId: string;
  dramaId: string;
  keywordId: string;
  isCorrect: boolean;
}

// 分析事件类型
export interface AnalyticsEvent {
  id: string;
  userId: string;
  eventType: 
    | 'onboarding_start'
    | 'onboarding_complete'
    | 'interest_selected'
    | 'video_play_start'
    | 'video_play_complete'
    | 'keyword_attempt'
    | 'keyword_unlock'
    | 'milestone_reached'
    | 'activation_complete'
    | 'app_background'
    | 'app_foreground';
  eventData?: Record<string, any>;
  timestamp: string;
}

export interface RecordEventRequest {
  userId: string;
  eventType: AnalyticsEvent['eventType'];
  eventData?: Record<string, any>;
}

// 健康检查响应
export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
  environment: string;
  database?: string;
}
