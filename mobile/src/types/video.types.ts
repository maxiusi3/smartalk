// 视频播放器相关类型定义

export interface VideoPlayerProps {
  videoUrl: string;
  subtitleUrl?: string;
  keywords?: KeywordData[];
  onProgress?: (progress: VideoProgress) => void;
  onKeywordClick?: (keyword: KeywordData) => void;
  onVideoEnd?: () => void;
  onError?: (error: VideoError) => void;
  autoPlay?: boolean;
  showControls?: boolean;
  enableFullscreen?: boolean;
}

export interface VideoProgress {
  currentTime: number;
  duration: number;
  playableDuration: number;
  seekableDuration: number;
}

export interface VideoError {
  code: number;
  message: string;
  details?: any;
}

export interface SubtitleItem {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
  keywords?: string[];
}

export interface KeywordData {
  id: string;
  word: string;
  translation: string;
  audioUrl?: string;
  startTime: number;
  endTime: number;
}

export interface VideoPlayerState {
  isLoading: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isFullscreen: boolean;
  showControls: boolean;
  currentTime: number;
  duration: number;
  error: VideoError | null;
  currentSubtitle: SubtitleItem | null;
  subtitles: SubtitleItem[];
}

export interface VideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onFullscreen: () => void;
  showControls: boolean;
}

export interface SubtitleDisplayProps {
  subtitle: SubtitleItem | null;
  keywords: KeywordData[];
  onKeywordClick: (keyword: KeywordData) => void;
  style?: any;
}

export interface KeywordHighlightProps {
  text: string;
  keywords: KeywordData[];
  onKeywordClick: (keyword: KeywordData) => void;
  highlightStyle?: any;
}

// 视频播放器配置
export interface VideoPlayerConfig {
  resizeMode: 'contain' | 'cover' | 'stretch' | 'none';
  repeat: boolean;
  muted: boolean;
  volume: number;
  rate: number;
  ignoreSilentSwitch: 'inherit' | 'ignore' | 'obey';
  mixWithOthers: 'inherit' | 'mix' | 'duck';
}

// SRT字幕解析结果
export interface ParsedSubtitles {
  subtitles: SubtitleItem[];
  totalCount: number;
  duration: number;
}

// 视频播放器事件
export type VideoPlayerEvent = 
  | 'onLoad'
  | 'onProgress'
  | 'onEnd'
  | 'onError'
  | 'onBuffer'
  | 'onSeek'
  | 'onFullscreenPlayerWillPresent'
  | 'onFullscreenPlayerDidPresent'
  | 'onFullscreenPlayerWillDismiss'
  | 'onFullscreenPlayerDidDismiss';

// 视频播放器方法
export interface VideoPlayerMethods {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setFullscreen: (fullscreen: boolean) => void;
  setVolume: (volume: number) => void;
  setRate: (rate: number) => void;
}

// 字幕时间格式
export interface SubtitleTimeFormat {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

// 视频元数据
export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  canPlaySlowForward: boolean;
  canPlayReverse: boolean;
  canPlaySlowReverse: boolean;
  canPlayFastForward: boolean;
  canStepForward: boolean;
  canStepBackward: boolean;
}
