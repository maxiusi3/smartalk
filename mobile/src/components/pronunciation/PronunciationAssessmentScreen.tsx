import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import PronunciationAssessmentService, { PronunciationAssessment } from '@/services/PronunciationAssessmentService';
import { useUserState } from '@/contexts/UserStateContext';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';
import { AnalyticsService } from '@/services/AnalyticsService';

const { width: screenWidth } = Dimensions.get('window');

interface RouteParams {
  keywordId: string;
  targetText: string;
  context?: string;
}

/**
 * PronunciationAssessmentScreen - V2 发音评估界面
 * 提供完整的发音评估体验：录音、分析、反馈、改进建议
 */
const PronunciationAssessmentScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { keywordId, targetText, context } = route.params as RouteParams;
  const { userProgress } = useUserState();

  // Hooks
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();
  const performanceHook = usePerformanceOptimization({
    componentName: 'PronunciationAssessmentScreen',
    trackInteractions: true,
    enablePreload: true,
    preloadPriority: 'high',
  });

  // 状态管理
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'processing' | 'completed'>('idle');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [assessment, setAssessment] = useState<PronunciationAssessment | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 服务实例
  const pronunciationService = PronunciationAssessmentService.getInstance();
  const analyticsService = AnalyticsService.getInstance();

  // 动画
  const recordingAnimation = useRef(new Animated.Value(0)).current;
  const waveAnimation = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;

  // 定时器
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 页面初始化
    screenReader.announcePageChange('发音评估', `准备录制：${targetText}`);
    
    // 预加载相关资源
    performanceHook.preload.preloadAudio(`pronunciation_${keywordId}`);
    
    return () => {
      // 清理资源
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      pronunciationService.cleanup();
    };
  }, []);

  useEffect(() => {
    // 录音状态动画
    if (recordingState === 'recording') {
      startRecordingAnimation();
    } else {
      stopRecordingAnimation();
    }
  }, [recordingState]);

  const startRecordingAnimation = () => {
    // 录音按钮脉冲动画
    Animated.loop(
      Animated.sequence([
        Animated.timing(recordingAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(recordingAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 音波动画
    Animated.loop(
      Animated.timing(waveAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopRecordingAnimation = () => {
    recordingAnimation.stopAnimation();
    waveAnimation.stopAnimation();
    recordingAnimation.setValue(0);
    waveAnimation.setValue(0);
  };

  const handleStartRecording = async () => {
    if (!userProgress?.userId) {
      Alert.alert('错误', '用户信息不完整，请重新登录');
      return;
    }

    try {
      performanceHook.performance.recordInteraction('start_recording');
      
      await pronunciationService.startRecording(keywordId, targetText);
      setRecordingState('recording');
      setRecordingDuration(0);
      setError(null);

      // 开始计时
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 100);
      }, 100);

      screenReader.announce('录音开始，请清晰朗读目标文本');

      analyticsService.track('pronunciation_recording_started', {
        keywordId,
        targetText,
        context,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      setError('录音启动失败，请检查麦克风权限');
      screenReader.announceError('录音启动失败');
    }
  };

  const handleStopRecording = async () => {
    if (recordingState !== 'recording') return;

    try {
      // 停止计时
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }

      setRecordingState('processing');
      
      const audioUrl = await pronunciationService.stopRecording();
      
      screenReader.announce('录音完成，正在分析发音');

      // 开始评估
      await performAssessment(audioUrl);

    } catch (error) {
      console.error('Error stopping recording:', error);
      setError('录音处理失败，请重试');
      setRecordingState('idle');
      screenReader.announceError('录音处理失败');
    }
  };

  const performAssessment = async (audioUrl: string) => {
    if (!userProgress?.userId) return;

    try {
      const startTime = Date.now();
      
      // 显示处理进度
      Animated.timing(progressAnimation, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }).start();

      const result = await pronunciationService.assessPronunciation(
        keywordId,
        audioUrl,
        targetText,
        userProgress.userId
      );

      const assessmentTime = Date.now() - startTime;
      performanceHook.performance.recordInteraction('pronunciation_assessment');

      setAssessment(result);
      setRecordingState('completed');
      setShowResults(true);

      screenReader.announce(`发音评估完成，总分${result.overallScore}分`);

      analyticsService.track('pronunciation_assessment_completed', {
        keywordId,
        userId: userProgress.userId,
        overallScore: result.overallScore,
        accuracy: result.accuracy,
        fluency: result.fluency,
        assessmentTime,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error performing assessment:', error);
      setError('发音评估失败，请重试');
      setRecordingState('idle');
      screenReader.announceError('发音评估失败');
    }
  };

  const handleRetry = () => {
    setRecordingState('idle');
    setRecordingDuration(0);
    setAssessment(null);
    setShowResults(false);
    setError(null);
    progressAnimation.setValue(0);
    
    screenReader.announce('准备重新录音');
  };

  const handleViewDetails = () => {
    if (assessment) {
      navigation.navigate('PronunciationResultsScreen', {
        assessment,
        keywordId,
        targetText,
      });
    }
  };

  const handleContinue = () => {
    navigation.goBack();
  };

  const renderRecordingButton = () => {
    const isRecording = recordingState === 'recording';
    const isProcessing = recordingState === 'processing';
    const isCompleted = recordingState === 'completed';

    const buttonScale = recordingAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.1],
    });

    const buttonOpacity = recordingAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.8],
    });

    return (
      <AccessibilityWrapper
        accessibilityRole="button"
        accessibilityLabel={
          isRecording ? '停止录音' : 
          isProcessing ? '正在处理' : 
          isCompleted ? '录音完成' : '开始录音'
        }
        accessibilityHint={
          isRecording ? '点击停止录音并开始分析' : 
          isProcessing ? '请等待分析完成' : 
          isCompleted ? '录音和分析已完成' : '点击开始录制发音'
        }
        applyExtendedTouchTarget={true}
        applyFocusIndicator={true}
      >
        <TouchableOpacity
          style={styles.recordingButtonContainer}
          onPress={isRecording ? handleStopRecording : handleStartRecording}
          disabled={isProcessing || isCompleted}
          accessible={true}
          accessibilityRole="button"
        >
          <Animated.View
            style={[
              styles.recordingButton,
              {
                backgroundColor: isRecording ? '#ef4444' : 
                               isProcessing ? '#f59e0b' : 
                               isCompleted ? '#10b981' : '#667eea',
                transform: [{ scale: buttonScale }],
                opacity: buttonOpacity,
              }
            ]}
          >
            <Text style={styles.recordingButtonIcon}>
              {isRecording ? '⏹' : 
               isProcessing ? '⏳' : 
               isCompleted ? '✅' : '🎤'}
            </Text>
          </Animated.View>
          
          {isRecording && (
            <Animated.View
              style={[
                styles.recordingRipple,
                {
                  opacity: waveAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0],
                  }),
                  transform: [{
                    scale: waveAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.5],
                    }),
                  }],
                }
              ]}
            />
          )}
        </TouchableOpacity>
      </AccessibilityWrapper>
    );
  };

  const renderTargetText = () => (
    <AccessibilityWrapper
      accessibilityRole="text"
      accessibilityLabel={`目标文本：${targetText}`}
      applyHighContrast={true}
      applyLargeText={true}
    >
      <View style={styles.targetTextContainer}>
        <Text style={styles.targetTextLabel}>请朗读以下内容：</Text>
        <Text style={styles.targetText}>{targetText}</Text>
      </View>
    </AccessibilityWrapper>
  );

  const renderRecordingStatus = () => {
    if (recordingState === 'idle') return null;

    return (
      <AccessibilityWrapper
        accessibilityRole="status"
        accessibilityLabel={`录音状态：${getStatusText()}`}
        applyHighContrast={true}
      >
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
          
          {recordingState === 'recording' && (
            <Text style={styles.durationText}>
              {Math.floor(recordingDuration / 1000)}s
            </Text>
          )}
          
          {recordingState === 'processing' && (
            <View style={styles.progressContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  }
                ]}
              />
            </View>
          )}
        </View>
      </AccessibilityWrapper>
    );
  };

  const renderQuickResults = () => {
    if (!assessment || !showResults) return null;

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="发音评估结果"
        applyHighContrast={true}
      >
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>评估结果</Text>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.overallScore}>{assessment.overallScore}</Text>
            <Text style={styles.scoreLabel}>总分</Text>
          </View>
          
          <View style={styles.detailScores}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreValue}>{assessment.accuracy}</Text>
              <Text style={styles.scoreItemLabel}>准确度</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreValue}>{assessment.fluency}</Text>
              <Text style={styles.scoreItemLabel}>流利度</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreValue}>{assessment.completeness}</Text>
              <Text style={styles.scoreItemLabel}>完整度</Text>
            </View>
          </View>
          
          <Text style={styles.feedbackText}>
            {assessment.feedback.overall}
          </Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.detailButton}
              onPress={handleViewDetails}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="查看详细分析"
            >
              <Text style={styles.detailButtonText}>详细分析</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="重新录音"
            >
              <Text style={styles.retryButtonText}>重新录音</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AccessibilityWrapper>
    );
  };

  const getStatusText = () => {
    switch (recordingState) {
      case 'recording': return '正在录音...';
      case 'processing': return '正在分析发音...';
      case 'completed': return '分析完成';
      default: return '';
    }
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <AccessibilityWrapper
        accessibilityRole="alert"
        accessibilityLabel={`错误：${error}`}
        applyHighContrast={true}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.errorRetryButton}
            onPress={() => setError(null)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="关闭错误提示"
          >
            <Text style={styles.errorRetryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      </AccessibilityWrapper>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部 */}
      <AccessibilityWrapper
        accessibilityRole="header"
        accessibilityLabel="发音评估页面头部"
        applyHighContrast={true}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="返回"
            accessibilityHint="返回上一页"
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>发音评估</Text>
          <View style={styles.placeholder} />
        </View>
      </AccessibilityWrapper>

      <View style={styles.content}>
        {/* 目标文本 */}
        {renderTargetText()}

        {/* 录音按钮 */}
        <View style={styles.recordingSection}>
          {renderRecordingButton()}
        </View>

        {/* 录音状态 */}
        {renderRecordingStatus()}

        {/* 错误提示 */}
        {renderError()}

        {/* 快速结果 */}
        {renderQuickResults()}

        {/* 继续按钮 */}
        {showResults && (
          <AccessibilityWrapper
            applyExtendedTouchTarget={true}
            applyHighContrast={true}
          >
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="继续学习"
            >
              <Text style={styles.continueButtonText}>继续学习</Text>
            </TouchableOpacity>
          </AccessibilityWrapper>
        )}
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 18,
    color: '#64748b',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  targetTextContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  targetTextLabel: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 12,
  },
  targetText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    lineHeight: 32,
  },
  recordingSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  recordingButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordingButtonIcon: {
    fontSize: 48,
    color: '#FFFFFF',
  },
  recordingRipple: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ef4444',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  durationText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  progressContainer: {
    width: screenWidth - 80,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    marginTop: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 2,
  },
  resultsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  overallScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#10b981',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  detailScores: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  scoreItemLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  feedbackText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  detailButton: {
    flex: 1,
    backgroundColor: '#667eea',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  retryButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  continueButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    marginBottom: 12,
  },
  errorRetryButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  errorRetryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PronunciationAssessmentScreen;
