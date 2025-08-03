/**
 * useEnhancedVideoPlayer - V2 增强视频播放器Hook
 * 提供组件级别的视频播放功能
 * 自动处理播放状态、字幕显示、质量自适应
 */

import { useEffect, useCallback, useState, useRef } from 'react';
import EnhancedVideoPlayerService, { 
  VideoPlayerInstance,
  VideoPlayerMode,
  VideoPlayerState,
  VideoQuality,
  SubtitleItem
} from '@/services/EnhancedVideoPlayerService';

// 播放器Hook状态
interface VideoPlayerHookState {
  player: VideoPlayerInstance | null;
  playerState: VideoPlayerState | null;
  loading: boolean;
  error: string | null;
  
  // 便捷状态
  isReady: boolean;
  canPlay: boolean;
  isBuffering: boolean;
  hasSubtitles: boolean;
  
  // 网络状态
  networkQuality: 'excellent' | 'good' | 'fair' | 'poor';
  cacheStatus: { size: number; maxSize: number; usage: number };
}

/**
 * 增强视频播放器Hook
 */
export const useEnhancedVideoPlayer = (
  contentId?: string,
  mode: VideoPlayerMode = 'learning'
) => {
  const [state, setState] = useState<VideoPlayerHookState>({
    player: null,
    playerState: null,
    loading: false,
    error: null,
    isReady: false,
    canPlay: false,
    isBuffering: false,
    hasSubtitles: false,
    networkQuality: 'good',
    cacheStatus: { size: 0, maxSize: 100, usage: 0 },
  });

  const videoPlayerService = EnhancedVideoPlayerService.getInstance();
  const updateInterval = useRef<NodeJS.Timeout | null>(null);

  // 初始化播放器
  useEffect(() => {
    if (contentId) {
      initializePlayer();
    }
    
    return () => {
      cleanup();
    };
  }, [contentId, mode]);

  // 定期更新状态
  useEffect(() => {
    if (state.player) {
      startStateUpdates();
    }
    
    return () => {
      stopStateUpdates();
    };
  }, [state.player]);

  const initializePlayer = useCallback(async () => {
    if (!contentId) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const player = await videoPlayerService.createPlayer(contentId, {
        mode,
        autoplay: false,
        adaptiveQuality: true,
      });

      setState(prev => ({
        ...prev,
        player,
        playerState: player.state,
        loading: false,
        isReady: true,
        canPlay: true,
        hasSubtitles: player.sources[0]?.subtitles?.enabled || false,
        networkQuality: videoPlayerService.getNetworkQuality(),
        cacheStatus: videoPlayerService.getCacheStatus(),
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || '播放器初始化失败',
      }));
    }
  }, [contentId, mode]);

  const startStateUpdates = useCallback(() => {
    updateInterval.current = setInterval(() => {
      if (state.player) {
        setState(prev => ({
          ...prev,
          playerState: state.player!.state,
          isBuffering: state.player!.state.isBuffering,
          networkQuality: videoPlayerService.getNetworkQuality(),
          cacheStatus: videoPlayerService.getCacheStatus(),
        }));
      }
    }, 100); // 每100ms更新一次
  }, [state.player]);

  const stopStateUpdates = useCallback(() => {
    if (updateInterval.current) {
      clearInterval(updateInterval.current);
      updateInterval.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    stopStateUpdates();
    
    if (state.player) {
      videoPlayerService.destroyPlayer(state.player.id);
    }
  }, [state.player, stopStateUpdates]);

  // 播放控制方法
  const play = useCallback(async () => {
    if (state.player) {
      await state.player.play();
    }
  }, [state.player]);

  const pause = useCallback(() => {
    if (state.player) {
      state.player.pause();
    }
  }, [state.player]);

  const stop = useCallback(() => {
    if (state.player) {
      state.player.stop();
    }
  }, [state.player]);

  const seek = useCallback((time: number) => {
    if (state.player) {
      state.player.seek(time);
    }
  }, [state.player]);

  const setVolume = useCallback((volume: number) => {
    if (state.player) {
      state.player.setVolume(volume);
    }
  }, [state.player]);

  const setPlaybackRate = useCallback((rate: number) => {
    if (state.player) {
      state.player.setPlaybackRate(rate);
    }
  }, [state.player]);

  const setQuality = useCallback((quality: VideoQuality) => {
    if (state.player) {
      state.player.setQuality(quality);
    }
  }, [state.player]);

  const toggleSubtitles = useCallback(() => {
    if (state.player) {
      state.player.toggleSubtitles();
    }
  }, [state.player]);

  const enterTheaterMode = useCallback(() => {
    if (state.player) {
      state.player.enterTheaterMode();
    }
  }, [state.player]);

  const exitTheaterMode = useCallback(() => {
    if (state.player) {
      state.player.exitTheaterMode();
    }
  }, [state.player]);

  return {
    // 状态
    ...state,
    
    // 控制方法
    play,
    pause,
    stop,
    seek,
    setVolume,
    setPlaybackRate,
    setQuality,
    toggleSubtitles,
    enterTheaterMode,
    exitTheaterMode,
    
    // 便捷属性
    isPlaying: state.playerState?.isPlaying || false,
    isPaused: state.playerState?.isPaused || false,
    currentTime: state.playerState?.currentTime || 0,
    duration: state.playerState?.duration || 0,
    progress: state.playerState?.progress || 0,
    currentSubtitle: state.playerState?.currentSubtitle || null,
    highlightedKeywords: state.playerState?.highlightedKeywords || [],
    isTheaterMode: state.playerState?.mode === 'theater',
    subtitlesEnabled: state.playerState?.subtitlesEnabled || false,
  };
};

/**
 * 字幕显示Hook
 */
export const useSubtitleDisplay = (
  currentSubtitle: SubtitleItem | null,
  highlightedKeywords: string[] = []
) => {
  const [displayText, setDisplayText] = useState<string>('');
  const [highlightedText, setHighlightedText] = useState<string>('');

  useEffect(() => {
    if (currentSubtitle) {
      setDisplayText(currentSubtitle.text);
      
      // 生成高亮文本
      let highlighted = currentSubtitle.text;
      highlightedKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        highlighted = highlighted.replace(regex, `<mark>${keyword}</mark>`);
      });
      setHighlightedText(highlighted);
    } else {
      setDisplayText('');
      setHighlightedText('');
    }
  }, [currentSubtitle, highlightedKeywords]);

  return {
    displayText,
    highlightedText,
    hasSubtitle: !!currentSubtitle,
    effect: currentSubtitle?.effect || 'none',
    position: currentSubtitle?.position || 'bottom',
  };
};

/**
 * 播放进度Hook
 */
export const useVideoProgress = (
  currentTime: number,
  duration: number,
  onSeek?: (time: number) => void
) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);

  const progress = duration > 0 ? currentTime / duration : 0;
  const displayTime = isDragging ? dragTime : currentTime;
  const displayProgress = isDragging ? dragTime / duration : progress;

  const startDrag = useCallback((time: number) => {
    setIsDragging(true);
    setDragTime(time);
  }, []);

  const updateDrag = useCallback((time: number) => {
    if (isDragging) {
      setDragTime(Math.max(0, Math.min(time, duration)));
    }
  }, [isDragging, duration]);

  const endDrag = useCallback(() => {
    if (isDragging && onSeek) {
      onSeek(dragTime);
    }
    setIsDragging(false);
    setDragTime(0);
  }, [isDragging, dragTime, onSeek]);

  const formatTime = useCallback((time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    progress: displayProgress,
    currentTime: displayTime,
    duration,
    formattedCurrentTime: formatTime(displayTime),
    formattedDuration: formatTime(duration),
    isDragging,
    startDrag,
    updateDrag,
    endDrag,
  };
};

/**
 * 剧院模式Hook
 */
export const useTheaterMode = () => {
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const enterTheaterMode = useCallback(async () => {
    setIsTransitioning(true);
    
    // 模拟过渡动画
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setIsTheaterMode(true);
    setIsTransitioning(false);
  }, []);

  const exitTheaterMode = useCallback(async () => {
    setIsTransitioning(true);
    
    // 模拟过渡动画
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setIsTheaterMode(false);
    setIsTransitioning(false);
  }, []);

  const toggleTheaterMode = useCallback(() => {
    if (isTheaterMode) {
      exitTheaterMode();
    } else {
      enterTheaterMode();
    }
  }, [isTheaterMode, enterTheaterMode, exitTheaterMode]);

  return {
    isTheaterMode,
    isTransitioning,
    enterTheaterMode,
    exitTheaterMode,
    toggleTheaterMode,
  };
};

/**
 * 视频质量Hook
 */
export const useVideoQuality = (
  currentQuality: VideoQuality,
  networkQuality: 'excellent' | 'good' | 'fair' | 'poor',
  onQualityChange?: (quality: VideoQuality) => void
) => {
  const [availableQualities] = useState<VideoQuality[]>([
    '240p', '360p', '480p', '720p', '1080p'
  ]);

  const getRecommendedQuality = useCallback((): VideoQuality => {
    switch (networkQuality) {
      case 'excellent': return '720p';
      case 'good': return '480p';
      case 'fair': return '360p';
      case 'poor': return '240p';
      default: return '360p';
    }
  }, [networkQuality]);

  const changeQuality = useCallback((quality: VideoQuality) => {
    if (onQualityChange) {
      onQualityChange(quality);
    }
  }, [onQualityChange]);

  const getQualityLabel = useCallback((quality: VideoQuality): string => {
    switch (quality) {
      case 'auto': return '自动';
      case '240p': return '流畅 240P';
      case '360p': return '标清 360P';
      case '480p': return '高清 480P';
      case '720p': return '超清 720P';
      case '1080p': return '蓝光 1080P';
      default: return quality;
    }
  }, []);

  return {
    currentQuality,
    availableQualities,
    recommendedQuality: getRecommendedQuality(),
    changeQuality,
    getQualityLabel,
    networkQuality,
  };
};

export default useEnhancedVideoPlayer;
