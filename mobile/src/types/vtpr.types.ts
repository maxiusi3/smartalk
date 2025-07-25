// vTPR (video Total Physical Response) 相关类型定义

import { KeywordItem } from './keyword-wall.types';

export interface VideoOption {
  id: string;
  keywordId: string;
  thumbnailUrl: string;
  videoUrl?: string;
  title: string;
  description: string;
  isCorrect: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  duration?: number;
  sortOrder: number;
}

export interface vTPRState {
  currentKeyword: KeywordItem;
  audioUrl: string;
  videoOptions: VideoOption[];
  selectedOption: string | null;
  isCorrect: boolean | null;
  showFeedback: boolean;
  attempts: number;
  correctAttempts: number;
  hintsUsed: number;
  isAudioPlaying: boolean;
  isLoading: boolean;
  error?: string;
  timeSpent: number;
  startTime: Date;
}

export interface vTPRScreenProps {
  keywordId: string;
  onComplete: (result: LearningResult) => void;
  onProgress: (progress: LearningProgress) => void;
  onSkip?: () => void;
  showHints?: boolean;
  maxAttempts?: number;
  autoPlayAudio?: boolean;
}

export interface AudioPlayerProps {
  audioUrl: string;
  autoPlay?: boolean;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onPlayComplete?: () => void;
  showControls?: boolean;
  volume?: number;
  playbackRate?: number;
}

export interface VideoOptionSelectorProps {
  options: VideoOption[];
  selectedOption: string | null;
  onSelect: (optionId: string) => void;
  showResult?: boolean;
  disabled?: boolean;
  layout?: 'grid' | 'list';
  columns?: number;
}

export interface VideoOptionProps {
  option: VideoOption;
  isSelected: boolean;
  isCorrect?: boolean;
  showResult?: boolean;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export interface FeedbackDisplayProps {
  type: FeedbackType;
  message?: string;
  visible: boolean;
  duration?: number;
  onHide?: () => void;
  showAnimation?: boolean;
  customStyle?: any;
  // 新增情感化反馈相关属性
  attemptCount?: number;
  streakCount?: number;
  isFirstCorrect?: boolean;
  context?: 'learning' | 'progress' | 'achievement';
}

export type FeedbackType = 'correct' | 'incorrect' | 'encouragement' | 'milestone' | 'info';

export interface LearningProgress {
  keywordId: string;
  attempts: number;
  correctAttempts: number;
  timeSpent: number;
  hintsUsed: number;
  accuracy: number;
  completedAt?: Date;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface LearningResult {
  keywordId: string;
  isCorrect: boolean;
  attempts: number;
  timeSpent: number;
  hintsUsed: number;
  finalAnswer: string;
  progress: LearningProgress;
}

// 音频播放状态
export interface AudioState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  playbackRate: number;
  error?: string;
}

// 反馈消息类型
export interface FeedbackMessage {
  type: 'correct' | 'incorrect' | 'hint' | 'encouragement';
  message: string;
  icon?: string;
  color?: string;
  animation?: 'bounce' | 'fade' | 'slide' | 'celebration';
}

// vTPR配置
export interface vTPRConfig {
  maxAttempts: number;
  autoPlayAudio: boolean;
  showHints: boolean;
  hintDelay: number;
  feedbackDuration: number;
  audioVolume: number;
  videoPreviewEnabled: boolean;
  celebrationEnabled: boolean;
}

// 学习会话数据
export interface LearningSession {
  id: string;
  userId: string;
  dramaId: string;
  keywordId: string;
  startTime: Date;
  endTime?: Date;
  totalAttempts: number;
  correctAttempts: number;
  hintsUsed: number;
  timeSpent: number;
  completed: boolean;
  accuracy: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

// 学习统计
export interface LearningStats {
  totalSessions: number;
  completedSessions: number;
  averageAccuracy: number;
  averageTimePerKeyword: number;
  totalTimeSpent: number;
  hintsUsedTotal: number;
  improvementRate: number;
  streakCount: number;
}

// 提示系统
export interface HintSystem {
  hints: Hint[];
  currentHintIndex: number;
  maxHints: number;
  hintDelay: number;
  autoShowHints: boolean;
}

export interface Hint {
  id: string;
  keywordId: string;
  type: 'audio' | 'visual' | 'text';
  content: string;
  level: 1 | 2 | 3; // 提示级别，1最轻微，3最明显
  delay: number;
}

// 动画配置
export interface vTPRAnimations {
  selection: AnimationConfig;
  feedback: AnimationConfig;
  transition: AnimationConfig;
  celebration: AnimationConfig;
}

interface AnimationConfig {
  duration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  delay?: number;
  repeat?: boolean;
}

// 主题配置
export interface vTPRTheme {
  colors: {
    primary: string;
    secondary: string;
    correct: string;
    incorrect: string;
    neutral: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
  fonts: {
    title: TextStyle;
    subtitle: TextStyle;
    body: TextStyle;
    button: TextStyle;
    caption: TextStyle;
    keyword: TextStyle;
    feedback: TextStyle;
    option: TextStyle;
    hint: TextStyle;
  };
  spacing: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
  };
  shadows: {
    small: ShadowStyle;
    medium: ShadowStyle;
    large: ShadowStyle;
  };
}

interface TextStyle {
  fontSize: number;
  fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  lineHeight?: number;
  letterSpacing?: number;
  color?: string;
}

interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

// 错误处理
export interface vTPRError {
  code: 'AUDIO_LOAD_ERROR' | 'VIDEO_LOAD_ERROR' | 'NETWORK_ERROR' | 'PLAYBACK_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  details?: any;
  timestamp: Date;
  recoverable: boolean;
}

// 事件类型
export type vTPREvent = 
  | 'audio_play'
  | 'audio_pause'
  | 'audio_complete'
  | 'option_select'
  | 'answer_correct'
  | 'answer_incorrect'
  | 'hint_used'
  | 'session_complete'
  | 'session_skip';

export interface vTPREventData {
  type: vTPREvent;
  keywordId: string;
  optionId?: string;
  attempts?: number;
  timeSpent?: number;
  timestamp: Date;
}

// API相关类型
export interface vTPRContentRequest {
  keywordId: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  userId: string;
}

export interface vTPRContentResponse {
  success: boolean;
  data?: {
    keyword: KeywordItem;
    audioUrl: string;
    videoOptions: VideoOption[];
    hints: Hint[];
  };
  error?: string;
}

export interface LearningResultRequest {
  userId: string;
  sessionId: string;
  keywordId: string;
  isCorrect: boolean;
  attempts: number;
  timeSpent: number;
  hintsUsed: number;
}

export interface LearningResultResponse {
  success: boolean;
  data?: {
    progress: LearningProgress;
    unlocked: boolean;
    achievements?: Achievement[];
  };
  error?: string;
}

interface Achievement {
  id: string;
  type: 'accuracy' | 'speed' | 'streak' | 'completion';
  title: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt: Date;
}
