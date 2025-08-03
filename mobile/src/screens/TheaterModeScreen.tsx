import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  BackHandler,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Video from 'react-native-video';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { ApiService } from '@/services/ApiService';
import { AnalyticsService } from '@/services/AnalyticsService';
import { UserService } from '@/services/UserService';
import { useAppStore } from '@/store/useAppStore';

type TheaterModeRouteProp = RouteProp<RootStackParamList, 'TheaterMode'>;
type TheaterModeNavigationProp = StackNavigationProp<RootStackParamList>;

const TheaterModeScreen: React.FC = () => {
  const navigation = useNavigation<TheaterModeNavigationProp>();
  const route = useRoute<TheaterModeRouteProp>();
  const { dramaId } = route.params;
  const { user } = useAppStore();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [completed, setCompleted] = useState(false);

  // V2 Magic Moment 增强状态
  const [showComprehensionTest, setShowComprehensionTest] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [comprehensionTriggered, setComprehensionTriggered] = useState(false);
  const [vignetteVisible, setVignetteVisible] = useState(true);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const vignetteAnim = useRef(new Animated.Value(0)).current;
  const videoRef = useRef<Video>(null);

  const analyticsService = AnalyticsService.getInstance();
  const userService = UserService.getInstance();

  useEffect(() => {
    // Hide status bar for immersive experience
    StatusBar.setHidden(true);

    // V2: 启动暗角效果
    Animated.timing(vignetteAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // V2: 记录Theater Mode开始事件
    analyticsService.track('theater_mode_started', {
      dramaId,
      timestamp: Date.now(),
    });

    // Load video content
    loadContent();

    // Auto-hide controls after delay
    const timer = setTimeout(() => {
      hideControls();
    }, 3000);

    // Handle back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!controlsVisible) {
        showControls();
        return true;
      }
      return false;
    });

    return () => {
      StatusBar.setHidden(false);
      clearTimeout(timer);
      backHandler.remove();
    };
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);

      // Get drama ID from navigation params or store
      const dramaId = route.params?.dramaId || appStore.currentDrama?.id;

      if (!dramaId) {
        throw new Error('No drama ID provided');
      }

      // Load drama data with real video URL
      const drama = await ApiService.getDrama(dramaId);

      // Use subtitle-free video URL for theater mode
      const videoUrl = drama.videoUrlNoSubs || drama.videoUrl;

      if (!videoUrl) {
        throw new Error('No video URL available for this drama');
      }

      setVideoUrl(videoUrl);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load theater mode content:', err);
      setError(err instanceof Error ? err.message : 'Failed to load video content');
      setLoading(false);
    }
  };

  const hideControls = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setControlsVisible(false);
    });
  };

  const showControls = () => {
    setControlsVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Auto-hide after delay
    const timer = setTimeout(() => {
      hideControls();
    }, 3000);
    return () => clearTimeout(timer);
  };

  const handleVideoPress = () => {
    if (controlsVisible) {
      hideControls();
    } else {
      showControls();
    }
  };

  // V2: 视频进度处理，触发理解测试
  const handleVideoProgress = (data: { currentTime: number; playableDuration: number }) => {
    setCurrentTime(data.currentTime);

    // 30秒时触发理解测试
    if (data.currentTime >= 30 && !comprehensionTriggered) {
      setComprehensionTriggered(true);
      triggerComprehensionTest();
    }
  };

  // V2: 触发理解测试
  const triggerComprehensionTest = () => {
    setShowComprehensionTest(true);

    analyticsService.track('comprehension_test_triggered', {
      dramaId,
      videoTime: currentTime,
      timestamp: Date.now(),
    });
  };

  // V2: 处理理解测试回应
  const handleComprehensionResponse = (understood: boolean) => {
    analyticsService.track('comprehension_response', {
      dramaId,
      understood,
      videoTime: currentTime,
      timestamp: Date.now(),
    });

    setShowComprehensionTest(false);

    if (understood) {
      // 用户理解了，显示成功消息
      showMagicMomentSuccess();
    } else {
      // 用户没理解，提供帮助选项
      showHelpOptions();
    }
  };

  // V2: 显示Magic Moment成功消息
  const showMagicMomentSuccess = () => {
    analyticsService.track('magic_moment_completed', {
      dramaId,
      timestamp: Date.now(),
    });

    // 这里可以显示成功的模态框或导航到成就页面
    setTimeout(() => {
      navigation.navigate('Achievement', { dramaId });
    }, 2000);
  };

  // V2: 显示帮助选项
  const showHelpOptions = () => {
    // 这里可以提供重播、显示字幕等选项
    console.log('Showing help options for user');
  };

  const handleVideoEnd = () => {
    setCompleted(true);
    navigation.navigate('Achievement', { dramaId });
  };

  const handleClose = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>正在准备您的魔法时刻...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadContent}>
          <Text style={styles.retryText}>重试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        activeOpacity={1}
        style={styles.videoContainer}
        onPress={handleVideoPress}
      >
        {videoUrl && (
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            style={styles.video}
            resizeMode="contain"
            onEnd={handleVideoEnd}
            onError={() => setError('Video playback error')}
            onProgress={handleVideoProgress}
            controls={false}
            paused={showComprehensionTest}
          />
        )}

        {/* V2: 暗角效果 */}
        {vignetteVisible && (
          <Animated.View
            style={[
              styles.vignette,
              { opacity: vignetteAnim }
            ]}
          />
        )}
      </TouchableOpacity>

      {controlsVisible && (
        <Animated.View style={[styles.controls, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.centerControls}>
            <Text style={styles.theaterModeText}>剧场模式</Text>
          </View>
        </Animated.View>
      )}

      {/* V2: 理解测试覆盖层 */}
      {showComprehensionTest && (
        <View style={styles.comprehensionOverlay}>
          <View style={styles.comprehensionContainer}>
            <Text style={styles.comprehensionTitle}>理解检测</Text>
            <Text style={styles.comprehensionQuestion}>
              你能理解刚才的对话内容吗？
            </Text>

            <View style={styles.comprehensionButtons}>
              <TouchableOpacity
                style={[styles.comprehensionButton, styles.yesButton]}
                onPress={() => handleComprehensionResponse(true)}
              >
                <Text style={styles.yesButtonText}>能理解 ✓</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.comprehensionButton, styles.noButton]}
                onPress={() => handleComprehensionResponse(false)}
              >
                <Text style={styles.noButtonText}>需要帮助</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  magicMomentOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -100 }],
    width: 200,
    alignItems: 'center',
    zIndex: 10,
  },
  magicMomentIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  magicMomentTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  magicMomentSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -40 }],
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  playIcon: {
    color: '#1f2937',
    fontSize: 32,
    marginLeft: 4,
  },
  controls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
  },
  topControls: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  theaterModeBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  theaterModeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: 'rgba(102, 126, 234, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // V2 新增样式
  vignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderWidth: 60,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    pointerEvents: 'none',
  },
  comprehensionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  comprehensionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    marginHorizontal: 24,
    alignItems: 'center',
    maxWidth: 400,
  },
  comprehensionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  comprehensionQuestion: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  comprehensionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  comprehensionButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  yesButton: {
    backgroundColor: '#10b981',
  },
  noButton: {
    backgroundColor: '#f59e0b',
  },
  yesButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TheaterModeScreen;