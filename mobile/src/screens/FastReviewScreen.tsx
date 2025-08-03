import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { useSRSReview } from '@/hooks/useSRSReview';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import { useInternationalization } from '@/hooks/useInternationalization';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';
import { SelfAssessmentResult } from '@/services/SRSNotificationService';

interface FastReviewScreenProps {
  route: {
    params?: {
      autoStart?: boolean;
    };
  };
}

/**
 * FastReviewScreen - V2 快速复习界面
 * 提供高效的复习体验：音频播放、图像选择、自评系统
 */
const FastReviewScreen: React.FC<FastReviewScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { t, isRTL, getLayoutDirectionStyles } = useInternationalization();
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();

  const { autoStart = false } = route.params || {};

  const {
    currentReviewSession,
    currentReviewItem,
    loading,
    error,
    isReviewing,
    reviewProgress,
    canStartReview,
    startReviewSession,
    submitReviewAnswer,
    completeReviewSession,
    cancelReviewSession,
  } = useSRSReview();

  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
  const [selfAssessment, setSelfAssessment] = useState<SelfAssessmentResult | null>(null);
  const [showSelfAssessment, setShowSelfAssessment] = useState(false);
  const [responseStartTime, setResponseStartTime] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const soundRef = useRef<Audio.Sound | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const screenData = Dimensions.get('window');

  useEffect(() => {
    if (autoStart && canStartReview) {
      handleStartReview();
    }
  }, [autoStart, canStartReview]);

  useEffect(() => {
    if (currentReviewSession && !currentReviewSession.isCompleted) {
      startTimer();
      screenReader.announce('复习会话已开始');
    }

    return () => {
      stopTimer();
      cleanupAudio();
    };
  }, [currentReviewSession]);

  useEffect(() => {
    if (currentReviewItem) {
      setSelectedImageUrl('');
      setSelfAssessment(null);
      setShowSelfAssessment(false);
      setResponseStartTime(Date.now());
      
      // 自动播放音频
      playAudio();
    }
  }, [currentReviewItem]);

  useEffect(() => {
    // 更新进度动画
    Animated.timing(progressAnim, {
      toValue: reviewProgress / 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [reviewProgress]);

  const startTimer = () => {
    if (!currentReviewSession) return;

    const targetDuration = currentReviewSession.targetDuration;
    const startTime = new Date(currentReviewSession.startedAt).getTime();

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, targetDuration - elapsed);
      setRemainingTime(remaining);

      if (remaining === 0) {
        // 时间到，自动完成会话
        handleCompleteSession();
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const playAudio = async () => {
    if (!currentReviewItem) return;

    try {
      setIsPlayingAudio(true);
      
      // 清理之前的音频
      await cleanupAudio();

      // 加载并播放新音频
      const { sound } = await Audio.Sound.createAsync(
        { uri: currentReviewItem.audioUrl },
        { shouldPlay: true }
      );

      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlayingAudio(false);
        }
      });

      screenReader.announce(`播放关键词音频：${currentReviewItem.keyword}`);

    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlayingAudio(false);
      screenReader.announceError('音频播放失败');
    }
  };

  const cleanupAudio = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      } catch (error) {
        console.error('Error cleaning up audio:', error);
      }
    }
  };

  const handleStartReview = async () => {
    try {
      await startReviewSession();
    } catch (error) {
      screenReader.announceError('开始复习失败');
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setShowSelfAssessment(true);
    
    screenReader.announce('图片已选择，请进行自评');
  };

  const handleSelfAssessment = async (assessment: SelfAssessmentResult) => {
    if (!selectedImageUrl || !currentReviewItem) return;

    try {
      setSelfAssessment(assessment);
      
      const responseTime = Date.now() - responseStartTime;
      
      // 淡出动画
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(async () => {
        await submitReviewAnswer(selectedImageUrl, assessment, responseTime);
        
        // 淡入动画
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });

      const assessmentText = {
        'instantly_got_it': '秒懂',
        'had_to_think': '想了一下',
        'forgot': '忘了'
      }[assessment];

      screenReader.announce(`自评：${assessmentText}`);

    } catch (error) {
      screenReader.announceError('提交答案失败');
    }
  };

  const handleCompleteSession = async () => {
    try {
      const completedSession = await completeReviewSession();
      if (completedSession) {
        navigation.navigate('ReviewResultScreen', {
          sessionId: completedSession.sessionId,
        });
      }
    } catch (error) {
      screenReader.announceError('完成复习失败');
    }
  };

  const handleCancelReview = () => {
    cancelReviewSession();
    navigation.goBack();
    screenReader.announce('复习已取消');
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderStartScreen = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="开始复习"
      applyHighContrast={true}
    >
      <View style={styles.startContainer}>
        <Text style={styles.startIcon}>📚</Text>
        <Text style={styles.startTitle}>快速复习</Text>
        <Text style={styles.startSubtitle}>
          2分钟巩固学习成果
        </Text>
        
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartReview}
          disabled={loading || !canStartReview}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="开始复习"
          accessibilityHint="开始快速复习会话"
        >
          <Text style={styles.startButtonText}>
            {loading ? '准备中...' : '开始复习'}
          </Text>
        </TouchableOpacity>
      </View>
    </AccessibilityWrapper>
  );

  const renderReviewItem = () => {
    if (!currentReviewItem) return null;

    const allImages = [
      currentReviewItem.correctImageUrl,
      ...currentReviewItem.distractorImages,
    ].sort(() => Math.random() - 0.5); // 随机排序

    return (
      <Animated.View style={[styles.reviewContainer, { opacity: fadeAnim }]}>
        {/* 音频播放区域 */}
        <AccessibilityWrapper
          accessibilityRole="button"
          accessibilityLabel="播放关键词音频"
          accessibilityHint="点击重新播放音频"
          applyExtendedTouchTarget={true}
        >
          <TouchableOpacity
            style={styles.audioContainer}
            onPress={playAudio}
            disabled={isPlayingAudio}
            accessible={true}
            accessibilityRole="button"
          >
            <View style={[
              styles.audioButton,
              isPlayingAudio && styles.audioButtonPlaying
            ]}>
              <Text style={styles.audioIcon}>
                {isPlayingAudio ? '🔊' : '🔊'}
              </Text>
            </View>
            <Text style={styles.audioText}>
              {isPlayingAudio ? '播放中...' : '点击播放'}
            </Text>
          </TouchableOpacity>
        </AccessibilityWrapper>

        {/* 图片选择区域 */}
        <AccessibilityWrapper
          accessibilityRole="group"
          accessibilityLabel="选择正确的图片"
          applyHighContrast={true}
        >
          <Text style={styles.instructionText}>
            选择正确的图片
          </Text>
          
          <View style={styles.imagesGrid}>
            {allImages.map((imageUrl, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.imageOption,
                  selectedImageUrl === imageUrl && styles.selectedImageOption
                ]}
                onPress={() => handleImageSelect(imageUrl)}
                disabled={showSelfAssessment}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`选项${index + 1}`}
                accessibilityState={{ selected: selectedImageUrl === imageUrl }}
              >
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.optionImage}
                  resizeMode="cover"
                />
                {selectedImageUrl === imageUrl && (
                  <View style={styles.selectedOverlay}>
                    <Text style={styles.selectedIcon}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </AccessibilityWrapper>

        {/* 自评区域 */}
        {showSelfAssessment && (
          <AccessibilityWrapper
            accessibilityRole="group"
            accessibilityLabel="自我评估"
            applyHighContrast={true}
          >
            <Text style={styles.assessmentTitle}>
              你对这个关键词的掌握程度如何？
            </Text>
            
            <View style={styles.assessmentButtons}>
              <TouchableOpacity
                style={[styles.assessmentButton, styles.instantlyButton]}
                onPress={() => handleSelfAssessment('instantly_got_it')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="秒懂"
                accessibilityHint="我立即想起了这个关键词"
              >
                <Text style={styles.assessmentEmoji}>😎</Text>
                <Text style={styles.assessmentText}>秒懂</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.assessmentButton, styles.thinkButton]}
                onPress={() => handleSelfAssessment('had_to_think')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="想了一下"
                accessibilityHint="我需要思考一下才想起来"
              >
                <Text style={styles.assessmentEmoji}>🤔</Text>
                <Text style={styles.assessmentText}>想了一下</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.assessmentButton, styles.forgotButton]}
                onPress={() => handleSelfAssessment('forgot')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="忘了"
                accessibilityHint="我完全忘记了这个关键词"
              >
                <Text style={styles.assessmentEmoji}>🤯</Text>
                <Text style={styles.assessmentText}>忘了</Text>
              </TouchableOpacity>
            </View>
          </AccessibilityWrapper>
        )}
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <AccessibilityWrapper
      accessibilityRole="header"
      accessibilityLabel="复习页面头部"
      applyHighContrast={true}
    >
      <View style={[styles.header, getLayoutDirectionStyles()]}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancelReview}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="取消复习"
        >
          <Text style={styles.cancelButtonText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          {currentReviewSession && (
            <>
              <Text style={styles.progressText}>
                {currentReviewSession.completedItems + 1}/{currentReviewSession.totalItems}
              </Text>
              <View style={styles.progressBarContainer}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
            </>
          )}
        </View>

        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            {formatTime(remainingTime)}
          </Text>
        </View>
      </View>
    </AccessibilityWrapper>
  );

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>复习出错</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="返回"
          >
            <Text style={styles.retryButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, getLayoutDirectionStyles()]}>
      {isReviewing && renderHeader()}
      
      <View style={styles.content}>
        {!isReviewing ? renderStartScreen() : renderReviewItem()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  cancelButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  startContainer: {
    alignItems: 'center',
  },
  startIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  startTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  startSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  startButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  reviewContainer: {
    width: '100%',
    alignItems: 'center',
  },
  audioContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  audioButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  audioButtonPlaying: {
    backgroundColor: '#10b981',
  },
  audioIcon: {
    fontSize: 32,
  },
  audioText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 24,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
    marginBottom: 32,
  },
  imageOption: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  selectedImageOption: {
    borderColor: '#3b82f6',
  },
  optionImage: {
    width: '100%',
    height: '100%',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  assessmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 20,
  },
  assessmentButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  assessmentButton: {
    flex: 1,
    maxWidth: 100,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  instantlyButton: {
    backgroundColor: '#dcfce7',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  thinkButton: {
    backgroundColor: '#fef3c7',
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  forgotButton: {
    backgroundColor: '#fecaca',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  assessmentEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  assessmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default FastReviewScreen;
