import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Slider } from 'react-native';
import { VideoControlsProps } from '@/types/video.types';
import { SubtitleParser } from '@/utils/subtitleParser';

/**
 * 视频播放控制组件
 * 提供播放/暂停、进度条、全屏等控制功能
 */
const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onSeek,
  onFullscreen,
  showControls
}) => {
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekTime, setSeekTime] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(showControls);

  // 自动隐藏控制界面
  useEffect(() => {
    if (isPlaying && controlsVisible) {
      const timer = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isPlaying, controlsVisible]);

  // 显示控制界面
  const showControlsTemporarily = () => {
    setControlsVisible(true);
  };

  /**
   * 开始拖拽进度条
   */
  const handleSeekStart = (value: number) => {
    setIsSeeking(true);
    setSeekTime(value);
  };

  /**
   * 拖拽进度条中
   */
  const handleSeekChange = (value: number) => {
    setSeekTime(value);
  };

  /**
   * 结束拖拽进度条
   */
  const handleSeekEnd = (value: number) => {
    setIsSeeking(false);
    onSeek(value);
  };

  /**
   * 快进/快退
   */
  const handleSkip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    onSeek(newTime);
  };

  if (!controlsVisible && !isSeeking) {
    return (
      <TouchableOpacity
        style={styles.hiddenControlsOverlay}
        onPress={showControlsTemporarily}
        activeOpacity={1}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* 顶部控制栏 */}
      <View style={styles.topControls}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {/* 返回按钮逻辑 */}}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        {onFullscreen && (
          <TouchableOpacity
            style={styles.fullscreenButton}
            onPress={onFullscreen}
          >
            <Text style={styles.fullscreenButtonText}>⛶</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 中央播放控制 */}
      <View style={styles.centerControls}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => handleSkip(-10)}
        >
          <Text style={styles.skipButtonText}>-10s</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playPauseButton}
          onPress={onPlayPause}
        >
          <Text style={styles.playPauseButtonText}>
            {isPlaying ? '⏸' : '▶'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => handleSkip(10)}
        >
          <Text style={styles.skipButtonText}>+10s</Text>
        </TouchableOpacity>
      </View>

      {/* 底部进度控制 */}
      <View style={styles.bottomControls}>
        <Text style={styles.timeText}>
          {SubtitleParser.formatTime(isSeeking ? seekTime : currentTime)}
        </Text>

        <View style={styles.progressContainer}>
          <Slider
            style={styles.progressSlider}
            minimumValue={0}
            maximumValue={duration}
            value={isSeeking ? seekTime : currentTime}
            onSlidingStart={handleSeekStart}
            onValueChange={handleSeekChange}
            onSlidingComplete={handleSeekEnd}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#333333"
            thumbStyle={styles.sliderThumb}
          />
        </View>

        <Text style={styles.timeText}>
          {SubtitleParser.formatTime(duration)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-between',
  },
  hiddenControlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  fullscreenButton: {
    padding: 10,
  },
  fullscreenButtonText: {
    color: '#ffffff',
    fontSize: 20,
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  skipButton: {
    padding: 15,
    marginHorizontal: 20,
  },
  skipButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButtonText: {
    color: '#ffffff',
    fontSize: 32,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  timeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 50,
    textAlign: 'center',
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 15,
  },
  progressSlider: {
    height: 40,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    backgroundColor: '#007AFF',
  },
});

export default VideoControls;
