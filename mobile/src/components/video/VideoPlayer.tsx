import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, AppState, AppStateStatus } from 'react-native';
import Video from 'react-native-video';
import { VideoPlayerProps, VideoPlayerState, SubtitleItem, KeywordData } from '@/types/video.types';
import { SubtitleParser } from '@/utils/subtitleParser';
import { KeywordMatcher } from '@/utils/keywordMatcher';
import { ContentCacheService } from '@/services/ContentCacheService';
import { PerformanceMonitor } from '@/services/PerformanceMonitor';
import { ErrorHandler } from '@/utils/ErrorHandler';
import CDNService from '@/services/CDNService';
import VideoControls from './VideoControls';
import SubtitleDisplay from './SubtitleDisplay';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * SmarTalk视频播放器组件
 * 支持视频播放、字幕显示、关键词高亮等功能
 */
const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  subtitleUrl,
  keywords = [],
  onProgress,
  onKeywordClick,
  onVideoEnd,
  onError,
  autoPlay = false,
  showControls = true,
  enableFullscreen = true
}) => {
  // 使用CDN优化的URL
  const optimizedVideoUrl = useMemo(() => {
    return CDNService.getVideoUrl(videoUrl, {
      quality: 'auto',
      format: 'auto'
    });
  }, [videoUrl]);

  const optimizedSubtitleUrl = useMemo(() => {
    return subtitleUrl ? CDNService.getSubtitleUrl(subtitleUrl) : undefined;
  }, [subtitleUrl]);
  const videoRef = useRef<Video>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const subtitleCacheRef = useRef<Map<string, SubtitleItem[]>>(new Map());
  const videoMetricId = useRef<string | null>(null);
  const loadStartTime = useRef<number>(0);
  
  const [state, setState] = useState<VideoPlayerState>({
    isLoading: true,
    isPlaying: autoPlay,
    isPaused: !autoPlay,
    isFullscreen: false,
    showControls: showControls,
    currentTime: 0,
    duration: 0,
    error: null,
    currentSubtitle: null,
    subtitles: []
  });

  // Start video loading performance tracking
  useEffect(() => {
    if (videoUrl) {
      loadStartTime.current = Date.now();
      videoMetricId.current = PerformanceMonitor.trackVideoLoading(videoUrl);
      PerformanceMonitor.startMetric('video_load');
    }
  }, [videoUrl]);

  // Memoized current subtitle calculation for performance
  const currentSubtitle = useMemo(() => {
    return SubtitleParser.getCurrentSubtitle(state.subtitles, state.currentTime);
  }, [state.subtitles, state.currentTime]);

  // Memoized current keywords calculation
  const currentKeywords = useMemo((): KeywordData[] => {
    if (!currentSubtitle) return [];
    
    return KeywordMatcher.filterKeywordsByTime(
      keywords,
      currentSubtitle.startTime,
      currentSubtitle.endTime
    );
  }, [keywords, currentSubtitle]);

  // Handle app state changes for performance optimization
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground - resume if was playing
        if (state.isPlaying && state.isPaused) {
          setState(prev => ({ ...prev, isPaused: false }));
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App went to background - pause video to save resources
        if (state.isPlaying) {
          setState(prev => ({ ...prev, isPaused: true }));
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [state.isPlaying, state.isPaused]);

  // Optimized subtitle loading with caching
  useEffect(() => {
    if (optimizedSubtitleUrl) {
      loadSubtitlesOptimized(optimizedSubtitleUrl);
    }
  }, [optimizedSubtitleUrl]);

  // Update current subtitle state only when it actually changes
  useEffect(() => {
    if (currentSubtitle !== state.currentSubtitle) {
      setState(prev => ({ ...prev, currentSubtitle }));
    }
  }, [currentSubtitle, state.currentSubtitle]);

  /**
   * Optimized subtitle loading with caching
   */
  const loadSubtitlesOptimized = async (url: string) => {
    try {
      // Check cache first
      const cacheKey = `subtitles_${url}`;
      let cachedSubtitles = subtitleCacheRef.current.get(cacheKey);
      
      if (!cachedSubtitles) {
        cachedSubtitles = await ContentCacheService.get<SubtitleItem[]>(cacheKey);
      }

      if (cachedSubtitles) {
        setState(prev => ({ ...prev, subtitles: cachedSubtitles! }));
        subtitleCacheRef.current.set(cacheKey, cachedSubtitles);
        return;
      }

      // Load from network
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'max-age=3600', // 1 hour cache
        },
      });
      const srtContent = await response.text();
      
      if (SubtitleParser.validateSRT(srtContent)) {
        const parsed = SubtitleParser.parseSRT(srtContent);
        const subtitles = parsed.subtitles;
        
        setState(prev => ({ ...prev, subtitles }));
        
        // Cache for future use
        subtitleCacheRef.current.set(cacheKey, subtitles);
        await ContentCacheService.set(cacheKey, subtitles, 24 * 60 * 60 * 1000); // 24 hours
      } else {
        console.warn('Invalid SRT format');
      }
    } catch (error) {
      console.error('Failed to load subtitles:', error);
      // Fallback to basic loading
      loadSubtitles(url);
    }
  };

  /**
   * Basic subtitle loading (fallback)
   */
  const loadSubtitles = async (url: string) => {
    try {
      const response = await fetch(url);
      const srtContent = await response.text();
      
      if (SubtitleParser.validateSRT(srtContent)) {
        const parsed = SubtitleParser.parseSRT(srtContent);
        setState(prev => ({ ...prev, subtitles: parsed.subtitles }));
      } else {
        console.warn('Invalid SRT format');
      }
    } catch (error) {
      console.error('Failed to load subtitles:', error);
    }
  };

  /**
   * 视频加载完成
   */
  const handleVideoLoad = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      duration: data.duration
    }));

    // Track video loading performance
    PerformanceMonitor.endMetric('video_load', {
      duration: data.duration,
      videoUrl,
      loadTime: Date.now() - loadStartTime.current,
    });
    
    PerformanceMonitor.completeVideoLoading(videoUrl, true);
    console.log(`📹 Video loaded successfully in ${Date.now() - loadStartTime.current}ms`);
  }, [videoUrl]);

  /**
   * 视频播放进度更新
   */
  const handleProgress = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      currentTime: data.currentTime
    }));

    onProgress?.(data);
  }, [onProgress]);

  /**
   * 视频播放结束
   */
  const handleVideoEnd = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: true
    }));

    onVideoEnd?.();
  }, [onVideoEnd]);

  /**
   * 视频错误处理 - Enhanced with performance tracking
   */
  const handleVideoError = useCallback((error: any) => {
    // Track video error
    PerformanceMonitor.recordVideoError(videoUrl);
    PerformanceMonitor.completeVideoLoading(videoUrl, false);
    PerformanceMonitor.endMetric('video_load', { error: true });

    // Use enhanced error handler
    const handledError = ErrorHandler.handleVideoError(error, {
      showAlert: true,
      trackError: true,
      context: 'video_player',
      fallbackAction: () => {
        // Retry loading the video
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        loadStartTime.current = Date.now();
      },
    });

    setState(prev => ({
      ...prev,
      isLoading: false,
      error: {
        code: error.error?.code || -1,
        message: handledError.message,
        details: error
      }
    }));

    onError?.(handledError);
  }, [onError, videoUrl]);

  /**
   * 播放/暂停切换
   */
  const handlePlayPause = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying,
      isPaused: prev.isPlaying
    }));
  }, []);

  /**
   * 跳转到指定时间
   */
  const handleSeek = useCallback((time: number) => {
    videoRef.current?.seek(time);
    setState(prev => ({ ...prev, currentTime: time }));
  }, []);

  /**
   * 切换全屏模式
   */
  const handleFullscreen = useCallback(() => {
    setState(prev => ({
      ...prev,
      isFullscreen: !prev.isFullscreen
    }));
  }, []);

  /**
   * 关键词点击处理
   */
  const handleKeywordClick = useCallback((keyword: KeywordData) => {
    onKeywordClick?.(keyword);
  }, [onKeywordClick]);

  // 渲染加载状态
  if (state.isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </View>
    );
  }

  // 渲染错误状态
  if (state.error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>播放出错</Text>
          <Text style={styles.errorMessage}>{state.error.message}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, state.isFullscreen && styles.fullscreenContainer]}>
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: optimizedVideoUrl }}
          style={styles.video}
          resizeMode="contain"
          paused={state.isPaused}
          onLoad={handleVideoLoad}
          onProgress={handleProgress}
          onEnd={handleVideoEnd}
          onError={handleVideoError}
          onBuffer={({ isBuffering }) => {
            if (isBuffering) {
              PerformanceMonitor.recordVideoBuffer(optimizedVideoUrl);
            }
          }}
          progressUpdateInterval={100}
          bufferConfig={{
            minBufferMs: 15000,
            maxBufferMs: 50000,
            bufferForPlaybackMs: 2500,
            bufferForPlaybackAfterRebufferMs: 5000,
          }}
        />

        {/* 字幕显示 */}
        <SubtitleDisplay
          subtitle={state.currentSubtitle}
          keywords={currentKeywords}
          onKeywordClick={handleKeywordClick}
          style={styles.subtitleOverlay}
        />

        {/* 视频控制界面 */}
        {state.showControls && (
          <VideoControls
            isPlaying={state.isPlaying}
            currentTime={state.currentTime}
            duration={state.duration}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
            onFullscreen={enableFullscreen ? handleFullscreen : undefined}
            showControls={state.showControls}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  video: {
    flex: 1,
    backgroundColor: '#000000',
  },
  subtitleOverlay: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 20,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorMessage: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default VideoPlayer;
