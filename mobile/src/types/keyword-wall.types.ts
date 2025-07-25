// Keyword Wall相关类型定义

export interface KeywordItem {
  id: string;
  word: string;
  translation: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: Date;
  category: 'travel' | 'movies' | 'workplace';
  difficulty: 'basic' | 'intermediate' | 'advanced';
  contextSentence: string;
  audioUrl?: string;
  videoTimestamp?: number;
  sortOrder: number;
}

export interface KeywordWallState {
  keywords: KeywordItem[];
  unlockedCount: number;
  totalCount: number;
  isLoading: boolean;
  lastUnlockedId?: string;
  error?: string;
}

export interface KeywordWallProps {
  dramaId: string;
  userId: string;
  onKeywordClick?: (keyword: KeywordItem) => void;
  onProgressUpdate?: (progress: ProgressData) => void;
  theme?: KeywordWallTheme;
  animationEnabled?: boolean;
  showProgressIndicator?: boolean;
}

export interface KeywordItemProps {
  keyword: KeywordItem;
  isRecentlyUnlocked?: boolean;
  onPress?: (keyword: KeywordItem) => void;
  onLongPress?: (keyword: KeywordItem) => void;
  animationDelay?: number;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

export interface ProgressIndicatorProps {
  current: number;
  total: number;
  title?: string;
  subtitle?: string;
  showPercentage?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  backgroundColor?: string;
  animationDuration?: number;
}

export interface UnlockAnimationProps {
  isVisible: boolean;
  keyword: KeywordItem;
  onAnimationComplete?: () => void;
  duration?: number;
  particleCount?: number;
}

export interface ProgressData {
  unlockedCount: number;
  totalCount: number;
  percentage: number;
  recentlyUnlocked: KeywordItem[];
  milestoneReached?: boolean;
  milestoneType?: 'quarter' | 'half' | 'three_quarters' | 'complete';
}

// 动画相关类型
export interface UnlockAnimationConfig {
  duration: number;
  delay: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  particleEffect: boolean;
  glowEffect: boolean;
  scaleEffect: boolean;
}

export interface KeywordWallAnimations {
  unlock: UnlockAnimationConfig;
  progress: UnlockAnimationConfig;
  entrance: UnlockAnimationConfig;
  hover: UnlockAnimationConfig;
}

// 主题相关类型
export interface KeywordWallTheme {
  colors: {
    locked: string;
    unlocked: string;
    recentlyUnlocked: string;
    background: string;
    text: string;
    progress: string;
    accent: string;
  };
  fonts: {
    title: TextStyle;
    subtitle: TextStyle;
    keyword: TextStyle;
    progress: TextStyle;
  };
  spacing: {
    grid: number;
    item: number;
    container: number;
  };
  borderRadius: {
    item: number;
    progress: number;
  };
  shadows: {
    locked: ShadowStyle;
    unlocked: ShadowStyle;
    progress: ShadowStyle;
  };
}

interface TextStyle {
  fontSize: number;
  fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  lineHeight?: number;
  letterSpacing?: number;
}

interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

// 布局相关类型
export interface GridLayout {
  columns: number;
  rows: number;
  itemSize: number;
  spacing: number;
  containerWidth: number;
  containerHeight: number;
}

export interface ResponsiveConfig {
  phone: GridLayout;
  tablet: GridLayout;
  landscape: GridLayout;
}

// API相关类型
export interface KeywordProgressRequest {
  userId: string;
  dramaId: string;
  keywordId: string;
  isCorrect: boolean;
  timestamp: number;
}

export interface KeywordProgressResponse {
  success: boolean;
  data?: {
    keyword: KeywordItem;
    progress: ProgressData;
    achievements?: Achievement[];
  };
  error?: string;
}

export interface Achievement {
  id: string;
  type: 'milestone' | 'streak' | 'perfect' | 'speed';
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  points: number;
}

// 事件相关类型
export type KeywordWallEvent = 
  | 'keyword_unlocked'
  | 'progress_updated'
  | 'milestone_reached'
  | 'achievement_earned'
  | 'wall_completed';

export interface KeywordWallEventData {
  type: KeywordWallEvent;
  keyword?: KeywordItem;
  progress?: ProgressData;
  achievement?: Achievement;
  timestamp: number;
}

// 状态管理相关类型
export interface KeywordWallActions {
  loadKeywords: (dramaId: string, userId: string) => Promise<void>;
  unlockKeyword: (keywordId: string) => Promise<void>;
  updateProgress: (progress: ProgressData) => void;
  resetProgress: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// 配置相关类型
export interface KeywordWallConfig {
  totalKeywords: number;
  gridColumns: number;
  animationEnabled: boolean;
  autoSave: boolean;
  offlineMode: boolean;
  debugMode: boolean;
  milestones: number[];
  achievements: Achievement[];
}

// 错误处理类型
export interface KeywordWallError {
  code: 'NETWORK_ERROR' | 'API_ERROR' | 'STORAGE_ERROR' | 'ANIMATION_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  details?: any;
  timestamp: Date;
  recoverable: boolean;
}

// 性能监控类型
export interface PerformanceMetrics {
  renderTime: number;
  animationFPS: number;
  memoryUsage: number;
  apiResponseTime: number;
  errorCount: number;
}

// 可访问性类型
export interface AccessibilityConfig {
  screenReaderEnabled: boolean;
  highContrastMode: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  voiceOver: boolean;
}
