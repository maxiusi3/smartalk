import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanGestureHandler,
  State,
} from 'react-native';
import { Video } from 'expo-av';
import { useEnhancedVideoPlayer, useSubtitleDisplay, useVideoProgress, useTheaterMode } from '@/hooks/useEnhancedVideoPlayer';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import { useInternationalization } from '@/hooks/useInternationalization';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';
import { VideoPlayerMode, VideoQuality } from '@/services/EnhancedVideoPlayerService';

interface EnhancedVideoPlayerProps {
  contentId: string;
  mode?: VideoPlayerMode;
  autoplay?: boolean;
  showControls?: boolean;
  onPlaybackStatusUpdate?: (status: any) => void;
  onTheaterModeChange?: (isTheaterMode: boolean) => void;
  style?: any;
}

/**
 * EnhancedVideoPlayer - V2 增强视频播放器组件
 * 提供完整的视频播放体验：双模式支持、字幕引擎、剧院模式
 */
const EnhancedVideoPlayer: React.FC<EnhancedVideoPlayerProps> = ({
  contentId,
  mode = 'learning',
  autoplay = false,
  showControls = true,
  onPlaybackStatusUpdate,
  onTheaterModeChange,
  style,
}) => {
  const { t, isRTL, getLayoutDirectionStyles } = useInternationalization();
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();

  // 视频播放器Hook
  const {
    player,
    playerState,
    loading,
    error,
    isReady,
    isPlaying,
    isPaused,
    currentTime,
    duration,
    progress,
    currentSubtitle,
    highlightedKeywords,
    subtitlesEnabled,
    networkQuality,
    play,
    pause,
    seek,
    setVolume,
    toggleSubtitles,
    enterTheaterMode,
    exitTheaterMode,
  } = useEnhancedVideoPlayer(contentId, mode);

  // 字幕显示Hook
  const {
    displayText,
    highlightedText,
    hasSubtitle,
    effect,
    position,
  } = useSubtitleDisplay(currentSubtitle, highlightedKeywords);

  // 播放进度Hook
  const {
    progress: displayProgress,
    formattedCurrentTime,
    formattedDuration,
    isDragging,
    startDrag,
    updateDrag,
    endDrag,
  } = useVideoProgress(currentTime, duration, seek);

  // 剧院模式Hook
  const {
    isTheaterMode,
    isTransitioning,
    toggleTheaterMode,
  } = useTheaterMode();

  const [showControlsOverlay, setShowControlsOverlay] = useState(true);
  const [volume, setVolumeState] = useState(1);
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality>('auto');
  
  const videoRef = useRef<Video>(null);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // 屏幕尺寸
  const screenData = Dimensions.get('window');
  const isLandscape = screenData.width > screenData.height;

  useEffect(() => {
    if (autoplay && isReady) {
      play();
    }
  }, [autoplay, isReady, play]);

  useEffect(() => {
    if (onTheaterModeChange) {
      onTheaterModeChange(isTheaterMode);
    }
  }, [isTheaterMode, onTheaterModeChange]);

  // 自动隐藏控制栏
  useEffect(() => {
    if (showControls && showControlsOverlay && isPlaying) {
      resetControlsTimeout();
    }
  }, [showControlsOverlay, isPlaying, showControls]);

  const resetControlsTimeout = () => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    
    controlsTimeout.current = setTimeout(() => {
      hideControls();
    }, 3000); // 3秒后隐藏控制栏
  };

  const showControls = () => {
    setShowControlsOverlay(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const hideControls = () => {
    if (!isTheaterMode) return; // 非剧院模式不自动隐藏
    
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowControlsOverlay(false);
    });
  };

  const handleVideoPress = () => {
    if (isTheaterMode) {
      if (showControlsOverlay) {
        hideControls();
      } else {
        showControls();
        resetControlsTimeout();
      }
    } else {
      handlePlayPause();
    }
  };

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        pause();
        screenReader.announce('视频已暂停');
      } else {
        await play();
        screenReader.announce('视频开始播放');
      }
    } catch (error) {
      screenReader.announceError('播放控制失败');
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolumeState(newVolume);
    setVolume(newVolume);
  };

  const handleQualityChange = (quality: VideoQuality) => {
    setSelectedQuality(quality);
    // setQuality(quality); // 这里会调用播放器的质量设置方法
  };

  const renderSubtitles = () => {
    if (!subtitlesEnabled || !hasSubtitle || !displayText) return null;

    const subtitleStyle = [
      styles.subtitle,
      position === 'center' && styles.subtitleCenter,
      position === 'top' && styles.subtitleTop,
    ];

    const effectStyle = {
      glow: styles.subtitleGlow,
      bounce: styles.subtitleBounce,
      pulse: styles.subtitlePulse,
      fade: styles.subtitleFade,
      scale: styles.subtitleScale,
    }[effect] || {};

    return (
      <AccessibilityWrapper
        accessibilityRole="text"
        accessibilityLabel={`字幕：${displayText}`}
        applyHighContrast={true}
      >
        <View style={[subtitleStyle, effectStyle]}>
          <Text style={styles.subtitleText}>
            {highlightedKeywords.length > 0 ? (
              // 渲染高亮关键词
              displayText.split(' ').map((word, index) => (
                <Text
                  key={index}
                  style={[
                    styles.subtitleWord,
                    highlightedKeywords.includes(word.toLowerCase()) && styles.highlightedWord
                  ]}
                >
                  {word}{' '}
                </Text>
              ))
            ) : (
              displayText
            )}
          </Text>
        </View>
      </AccessibilityWrapper>
    );
  };

  const renderPlayButton = () => (
    <AccessibilityWrapper
      accessibilityRole="button"
      accessibilityLabel={isPlaying ? '暂停视频' : '播放视频'}
      accessibilityHint="点击控制视频播放"
      applyExtendedTouchTarget={true}
    >
      <TouchableOpacity
        style={styles.playButton}
        onPress={handlePlayPause}
        accessible={true}
        accessibilityRole="button"
      >
        <Text style={styles.playButtonText}>
          {isPlaying ? '⏸️' : '▶️'}
        </Text>
      </TouchableOpacity>
    </AccessibilityWrapper>
  );

  const renderProgressBar = () => (
    <AccessibilityWrapper
      accessibilityRole="adjustable"
      accessibilityLabel={`播放进度：${Math.round(displayProgress * 100)}%`}
      accessibilityHint="滑动调整播放进度"
      applyExtendedTouchTarget={true}
    >
      <View style={styles.progressContainer}>
        <Text style={styles.timeText}>{formattedCurrentTime}</Text>
        
        <View style={styles.progressBar}>
          <View style={styles.progressTrack}>
            <View 
              style={[
                styles.progressFill,
                { width: `${displayProgress * 100}%` }
              ]}
            />
            <View 
              style={[
                styles.progressThumb,
                { left: `${displayProgress * 100}%` }
              ]}
            />
          </View>
        </View>
        
        <Text style={styles.timeText}>{formattedDuration}</Text>
      </View>
    </AccessibilityWrapper>
  );

  const renderControls = () => {
    if (!showControls || (!showControlsOverlay && isTheaterMode)) return null;

    return (
      <Animated.View 
        style={[
          styles.controlsOverlay,
          { opacity: fadeAnim }
        ]}
      >
        <View style={styles.controlsContainer}>
          {/* 顶部控制栏 */}
          <View style={styles.topControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleSubtitles}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={subtitlesEnabled ? '关闭字幕' : '开启字幕'}
            >
              <Text style={styles.controlButtonText}>
                {subtitlesEnabled ? '字幕' : '字幕'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleTheaterMode}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={isTheaterMode ? '退出剧院模式' : '进入剧院模式'}
            >
              <Text style={styles.controlButtonText}>
                {isTheaterMode ? '🔲' : '⛶'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 中央播放按钮 */}
          <View style={styles.centerControls}>
            {renderPlayButton()}
          </View>

          {/* 底部控制栏 */}
          <View style={styles.bottomControls}>
            {renderProgressBar()}
            
            <View style={styles.bottomControlsRow}>
              <Text style={styles.qualityText}>
                {selectedQuality === 'auto' ? `自动(${networkQuality})` : selectedQuality}
              </Text>
              
              <Text style={styles.volumeText}>
                🔊 {Math.round(volume * 100)}%
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>加载中...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>播放出错</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => window.location.reload()}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="重试"
      >
        <Text style={styles.retryButtonText}>重试</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) return renderLoadingState();
  if (error) return renderErrorState();

  return (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="视频播放器"
      applyHighContrast={true}
    >
      <View style={[
        styles.container,
        isTheaterMode && styles.theaterContainer,
        style
      ]}>
        {/* 视频播放区域 */}
        <TouchableOpacity
          style={styles.videoContainer}
          onPress={handleVideoPress}
          activeOpacity={1}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="视频播放区域"
          accessibilityHint="点击控制播放或显示控制栏"
        >
          {/* 这里应该是实际的视频组件，暂时用占位符 */}
          <View style={[
            styles.videoPlaceholder,
            isTheaterMode && styles.theaterVideoPlaceholder
          ]}>
            <Text style={styles.videoPlaceholderText}>
              {contentId} - {mode} 模式
            </Text>
            <Text style={styles.videoStatusText}>
              {isPlaying ? '播放中' : isPaused ? '已暂停' : '准备就绪'}
            </Text>
          </View>

          {/* 字幕显示 */}
          {renderSubtitles()}

          {/* 控制栏 */}
          {renderControls()}

          {/* 剧院模式过渡效果 */}
          {isTransitioning && (
            <View style={styles.transitionOverlay}>
              <Text style={styles.transitionText}>
                {isTheaterMode ? '进入剧院模式' : '退出剧院模式'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 网络质量指示器 */}
        <View style={styles.networkIndicator}>
          <Text style={[
            styles.networkText,
            { color: 
              networkQuality === 'excellent' ? '#10b981' :
              networkQuality === 'good' ? '#3b82f6' :
              networkQuality === 'fair' ? '#f59e0b' : '#ef4444'
            }
          ]}>
            {networkQuality === 'excellent' ? '网络优秀' :
             networkQuality === 'good' ? '网络良好' :
             networkQuality === 'fair' ? '网络一般' : '网络较差'}
          </Text>
        </View>
      </View>
    </AccessibilityWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#000000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  theaterContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 0,
    zIndex: 1000,
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16/9,
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  theaterVideoPlaceholder: {
    height: '100%',
  },
  videoPlaceholderText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  videoStatusText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  controlsContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerControls: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    gap: 12,
  },
  bottomControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  controlButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 20,
    justifyContent: 'center',
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    marginLeft: -8,
  },
  timeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    minWidth: 40,
    textAlign: 'center',
  },
  qualityText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  volumeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  subtitle: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  subtitleCenter: {
    top: '50%',
    bottom: 'auto',
    transform: [{ translateY: -20 }],
  },
  subtitleTop: {
    top: 80,
    bottom: 'auto',
  },
  subtitleText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    lineHeight: 24,
  },
  subtitleWord: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  highlightedWord: {
    color: '#fbbf24',
    fontWeight: 'bold',
    textShadowColor: '#f59e0b',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  subtitleGlow: {
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  subtitleBounce: {
    // 弹跳效果需要动画实现
  },
  subtitlePulse: {
    // 脉冲效果需要动画实现
  },
  subtitleFade: {
    // 淡入淡出效果需要动画实现
  },
  subtitleScale: {
    // 缩放效果需要动画实现
  },
  networkIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  networkText: {
    fontSize: 10,
    fontWeight: '600',
  },
  loadingContainer: {
    aspectRatio: 16/9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  errorContainer: {
    aspectRatio: 16/9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  retryButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  transitionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transitionText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default EnhancedVideoPlayer;
