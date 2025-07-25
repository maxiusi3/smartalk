import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { AudioPlayerProps, AudioState } from '@/types/vtpr.types';
import { VTPR_THEME, VTPR_TEXTS } from '@/constants/vtpr';

/**
 * AudioPlayer组件
 * 音频播放器，支持播放/暂停/重复播放功能
 */
const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  autoPlay = true,
  onPlayStateChange,
  onPlayComplete,
  showControls = true,
  volume = 0.8,
  playbackRate = 1.0,
}) => {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    duration: 0,
    currentTime: 0,
    volume,
    playbackRate,
  });

  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const audioRef = useRef<any>(null);

  useEffect(() => {
    if (audioUrl) {
      loadAudio();
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.release();
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (autoPlay && audioUrl && !audioState.isLoading) {
      playAudio();
    }
  }, [autoPlay, audioUrl, audioState.isLoading]);

  /**
   * 加载音频文件
   */
  const loadAudio = async () => {
    setAudioState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      // 这里使用react-native-sound或其他音频库
      // 由于这是示例，我们模拟音频加载
      setTimeout(() => {
        setAudioState(prev => ({
          ...prev,
          isLoading: false,
          duration: 3000, // 模拟3秒音频
        }));
      }, 500);
    } catch (error) {
      console.error('Failed to load audio:', error);
      setAudioState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load audio',
      }));
      Alert.alert('音频加载失败', '请检查网络连接后重试');
    }
  };

  /**
   * 播放音频
   */
  const playAudio = () => {
    if (audioState.isLoading) return;

    setAudioState(prev => ({ ...prev, isPlaying: true, isPaused: false }));
    onPlayStateChange?.(true);

    // 启动播放动画
    startPlayingAnimation();

    // 模拟音频播放进度
    simulateAudioProgress();
  };

  /**
   * 暂停音频
   */
  const pauseAudio = () => {
    setAudioState(prev => ({ ...prev, isPlaying: false, isPaused: true }));
    onPlayStateChange?.(false);
    
    // 停止动画
    pulseAnim.stopAnimation();
  };

  /**
   * 重播音频
   */
  const replayAudio = () => {
    setAudioState(prev => ({ ...prev, currentTime: 0 }));
    progressAnim.setValue(0);
    playAudio();
  };

  /**
   * 启动播放动画
   */
  const startPlayingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  /**
   * 模拟音频播放进度
   */
  const simulateAudioProgress = () => {
    const duration = audioState.duration;
    
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        setAudioState(prev => ({
          ...prev,
          isPlaying: false,
          currentTime: duration,
        }));
        pulseAnim.stopAnimation();
        pulseAnim.setValue(1);
        onPlayComplete?.();
      }
    });
  };

  /**
   * 格式化时间显示
   */
  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* 音频波形可视化 */}
      <View style={styles.waveformContainer}>
        <Animated.View
          style={[
            styles.waveform,
            {
              transform: [{ scale: pulseAnim }],
              opacity: audioState.isPlaying ? 1 : 0.6,
            },
          ]}
        >
          {Array.from({ length: 5 }, (_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.waveBar,
                {
                  height: audioState.isPlaying ? 20 + (index % 3) * 10 : 10,
                  backgroundColor: audioState.isPlaying 
                    ? VTPR_THEME.colors.primary 
                    : VTPR_THEME.colors.neutral,
                },
              ]}
            />
          ))}
        </Animated.View>
      </View>

      {/* 播放控制按钮 */}
      {showControls && (
        <View style={styles.controls}>
          {/* 播放/暂停按钮 */}
          <TouchableOpacity
            style={[
              styles.playButton,
              audioState.isLoading && styles.playButtonDisabled,
            ]}
            onPress={audioState.isPlaying ? pauseAudio : playAudio}
            disabled={audioState.isLoading}
          >
            <Text style={styles.playButtonText}>
              {audioState.isLoading 
                ? '⏳' 
                : audioState.isPlaying 
                  ? '⏸️' 
                  : '▶️'
              }
            </Text>
          </TouchableOpacity>

          {/* 重播按钮 */}
          <TouchableOpacity
            style={styles.replayButton}
            onPress={replayAudio}
            disabled={audioState.isLoading}
          >
            <Text style={styles.replayButtonText}>🔄</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 进度条 */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        
        {/* 时间显示 */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {formatTime(audioState.currentTime)}
          </Text>
          <Text style={styles.timeText}>
            {formatTime(audioState.duration)}
          </Text>
        </View>
      </View>

      {/* 错误提示 */}
      {audioState.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{audioState.error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: VTPR_THEME.spacing.medium,
    paddingHorizontal: VTPR_THEME.spacing.large,
    backgroundColor: VTPR_THEME.colors.background,
    borderRadius: VTPR_THEME.borderRadius.medium,
    ...VTPR_THEME.shadows.small,
  },
  waveformContainer: {
    marginBottom: VTPR_THEME.spacing.medium,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: VTPR_THEME.colors.primary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: VTPR_THEME.spacing.medium,
    marginBottom: VTPR_THEME.spacing.medium,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: VTPR_THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...VTPR_THEME.shadows.medium,
  },
  playButtonDisabled: {
    backgroundColor: VTPR_THEME.colors.neutral,
  },
  playButtonText: {
    fontSize: 24,
    color: VTPR_THEME.colors.background,
  },
  replayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: VTPR_THEME.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...VTPR_THEME.shadows.small,
  },
  replayButtonText: {
    fontSize: 18,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    height: 4,
    backgroundColor: VTPR_THEME.colors.neutral + '30',
    borderRadius: 2,
    marginBottom: VTPR_THEME.spacing.small,
  },
  progressFill: {
    height: '100%',
    backgroundColor: VTPR_THEME.colors.primary,
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    color: VTPR_THEME.colors.text,
    opacity: 0.7,
  },
  errorContainer: {
    marginTop: VTPR_THEME.spacing.small,
    padding: VTPR_THEME.spacing.small,
    backgroundColor: '#ffebee',
    borderRadius: VTPR_THEME.borderRadius.small,
  },
  errorText: {
    fontSize: 12,
    color: '#c62828',
    textAlign: 'center',
  },
});

export default AudioPlayer;
