import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { usePerformanceOptimization, useFocusModePerformance, useRescueModePerformance } from '@/hooks/usePerformanceOptimization';
import { useAccessibility, useScreenReader, useAccessibilityStyles } from '@/hooks/useAccessibility';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';
import { AnalyticsService } from '@/services/AnalyticsService';
import { UserService } from '@/services/UserService';
import { ApiService } from '@/services/ApiService';

// 导入子组件
import AudioPlayer from './AudioPlayer';
import VideoOptionSelectorV2 from './VideoOptionSelectorV2';
import ProgressVisualizationV2 from './ProgressVisualizationV2';
import FeedbackDisplayV2 from './FeedbackDisplayV2';
import PronunciationTrainingComponent from './PronunciationTrainingComponent';
import SpeakingTipsButton from '../common/SpeakingTipsButton';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface VTPRProps {
  dramaId: string;
  keywordId?: string;
}

interface Keyword {
  id: string;
  word: string;
  translation: string;
  audioUrl: string;
  pronunciation?: string;
  phoneticTips?: string[];
  contextClues?: string[];
  highlightEffect?: 'bounce' | 'glow' | 'pulse';
  rescueVideoUrl?: string;
}

interface VideoClip {
  id: string;
  videoUrl: string;
  startTime: number;
  endTime: number;
  isCorrect: boolean;
  sortOrder: number;
}

const VTPRScreenOptimized: React.FC<VTPRProps> = ({ dramaId, keywordId }) => {
  const navigation = useNavigation();

  // V2: 性能优化Hooks
  const performanceHook = usePerformanceOptimization({
    componentName: 'VTPRScreenOptimized',
    trackInteractions: true,
    trackRenderTime: true,
    enablePreload: true,
    preloadPriority: 'high',
    enableCaching: true,
    cacheKey: `vtpr_${dramaId}`,
  });

  const focusModePerformance = useFocusModePerformance();
  const rescueModePerformance = useRescueModePerformance();

  // V2: 无障碍功能Hooks
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();
  const accessibilityStyles = useAccessibilityStyles();

  const [currentKeywordIndex, setCurrentKeywordIndex] = useState(0);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [videoClips, setVideoClips] = useState<VideoClip[]>([]);
  // 正确的学习阶段状态管理
  type LearningPhase = 'context_guessing' | 'pronunciation_training' | 'completed';
  const [currentPhase, setCurrentPhase] = useState<LearningPhase>('context_guessing');

  // 情景猜义阶段状态
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [contextGuessingAttempts, setContextGuessingAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect'>('correct');

  // 发音训练阶段状态
  const [pronunciationAttempts, setPronunciationAttempts] = useState(0);
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
  const [showPronunciationTraining, setShowPronunciationTraining] = useState(false);

  // 通用状态
  const [aquaPoints, setAquaPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  // 简化实现，移除动画

  const analyticsService = AnalyticsService.getInstance();
  const userService = UserService.getInstance();

  useEffect(() => {
    loadLearningContent();
  }, [dramaId, keywordId]);

  useEffect(() => {
    // 简化实现，移除动画
    loadLearningContent();
  }, [dramaId, keywordId]);

  const loadLearningContent = async () => {
    try {
      setLoading(true);
      
      // 模拟关键词数据
      const mockKeywords: Keyword[] = [
        {
          id: 'keyword-1',
          word: 'coffee',
          translation: '咖啡',
          audioUrl: 'https://example.com/audio/coffee.mp3',
          pronunciation: '/ˈkɔːfi/',
          contextClues: ['在咖啡馆', '点饮料时'],
          phoneticTips: ['重音在第一个音节', '注意双写的f发音'],
        },
        {
          id: 'keyword-2',
          word: 'please',
          translation: '请',
          audioUrl: 'https://example.com/audio/please.mp3',
          pronunciation: '/pliːz/',
          contextClues: ['礼貌用语', '请求时使用'],
          phoneticTips: ['长音i', '结尾的z要清晰'],
        },
      ];

      setKeywords(mockKeywords);

      // 如果指定了特定关键词，找到其索引
      if (keywordId) {
        const index = mockKeywords.findIndex((k: Keyword) => k.id === keywordId);
        if (index !== -1) {
          setCurrentKeywordIndex(index);
        }
      }

      // 加载第一个关键词的视频片段
      if (mockKeywords.length > 0) {
        await loadVideoClips(mockKeywords[currentKeywordIndex].id);
      }

      // 记录学习开始事件
      analyticsService.track('learning_session_started', {
        dramaId,
        keywordId: keywordId || mockKeywords[0]?.id,
        totalKeywords: mockKeywords.length,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error loading learning content:', error);
      Alert.alert('错误', '加载学习内容失败，请重试。');
    } finally {
      setLoading(false);
    }
  };

  const loadVideoClips = async (keywordId: string) => {
    try {
      // 模拟视频片段数据
      const mockClips: VideoClip[] = [
        {
          id: 'clip-1',
          videoUrl: 'https://example.com/video/coffee1.mp4',
          isCorrect: true,
          startTime: 0,
          endTime: 10,
          sortOrder: 1,
        },
        {
          id: 'clip-2',
          videoUrl: 'https://example.com/video/coffee2.mp4',
          isCorrect: false,
          startTime: 0,
          endTime: 10,
          sortOrder: 2,
        },
        {
          id: 'clip-3',
          videoUrl: 'https://example.com/video/coffee3.mp4',
          isCorrect: false,
          startTime: 0,
          endTime: 10,
          sortOrder: 3,
        },
        {
          id: 'clip-4',
          videoUrl: 'https://example.com/video/coffee4.mp4',
          isCorrect: false,
          startTime: 0,
          endTime: 10,
          sortOrder: 4,
        },
      ];

      setVideoClips(mockClips);
    } catch (error) {
      console.error('Error loading video clips:', error);
    }
  };

  // 正确的情景猜义阶段处理
  const handleContextGuessingSelect = async (clipId: string) => {
    // 只在情景猜义阶段处理
    if (currentPhase !== 'context_guessing') return;

    const selectedClip = videoClips.find(clip => clip.id === clipId);
    if (!selectedClip) return;

    setSelectedOption(clipId);
    setContextGuessingAttempts(prev => prev + 1);

    // 记录情景猜义选择事件
    analyticsService.track('context_guessing_attempt', {
      dramaId,
      keywordId: keywords[currentKeywordIndex].id,
      selectedClipId: clipId,
      isCorrect: selectedClip.isCorrect,
      attemptNumber: contextGuessingAttempts + 1,
      timestamp: Date.now(),
    });

    if (selectedClip.isCorrect) {
      // 情景猜义正确 - 进入发音训练阶段
      setFeedbackType('correct');
      setShowFeedback(true);

      // 奖励Aqua积分
      const pointsEarned = 10; // 情景猜义阶段固定积分
      setAquaPoints(prev => prev + pointsEarned);

      // 播放成功动画
      playSuccessAnimation();

      // 延迟后进入发音训练阶段
      setTimeout(() => {
        transitionToPronunciationTraining();
      }, 2000);

    } else {
      // 情景猜义错误 - Focus Mode由VideoOptionSelectorV2内部处理
      setFeedbackType('incorrect');
      setShowFeedback(true);

      // 播放错误动画
      playErrorAnimation();

      // 重置选择状态
      setTimeout(() => {
        setSelectedOption(null);
        setShowFeedback(false);
      }, 1500);
    }
  };

  // 转换到发音训练阶段
  const transitionToPronunciationTraining = () => {
    setCurrentPhase('pronunciation_training');
    setShowFeedback(false);
    setSelectedOption(null);
    setShowPronunciationTraining(true);

    analyticsService.track('pronunciation_training_started', {
      dramaId,
      keywordId: keywords[currentKeywordIndex].id,
      contextGuessingAttempts,
      timestamp: Date.now(),
    });
  };

  const playSuccessAnimation = () => {
    // 简化实现，移除动画
    console.log('Success animation');
  };

  const playErrorAnimation = () => {
    // 简化实现，移除动画
    console.log('Error animation');
  };

  // 发音训练完成处理
  const handlePronunciationTrainingComplete = (success: boolean, score?: number) => {
    if (success) {
      // 发音训练成功，进入下一个关键词
      const pointsEarned = 5; // 发音训练阶段积分
      setAquaPoints(prev => prev + pointsEarned);

      analyticsService.track('pronunciation_training_completed', {
        dramaId,
        keywordId: keywords[currentKeywordIndex].id,
        score,
        attempts: pronunciationAttempts,
        timestamp: Date.now(),
      });

      setTimeout(() => {
        handleNextKeyword();
      }, 1500);

    } else {
      // 发音训练失败，重试
      setPronunciationAttempts(prev => prev + 1);
    }
  };

  const handleNextKeyword = async () => {
    if (currentKeywordIndex < keywords.length - 1) {
      const nextIndex = currentKeywordIndex + 1;
      setCurrentKeywordIndex(nextIndex);

      // 重置所有阶段状态
      setCurrentPhase('context_guessing');
      setSelectedOption(null);
      setShowFeedback(false);
      setContextGuessingAttempts(0);
      setPronunciationAttempts(0);
      setShowPronunciationTraining(false);

      // 加载下一个关键词的视频片段
      await loadVideoClips(keywords[nextIndex].id);

    } else {
      // 完成所有关键词学习
      handleLearningComplete();
    }
  };

  const handleLearningComplete = () => {
    analyticsService.track('learning_session_completed', {
      dramaId,
      totalKeywords: keywords.length,
      totalAquaPoints: aquaPoints,
      timestamp: Date.now(),
    });

    // 导航到成就页面或下一个剧集
    navigation.navigate('Achievement', { dramaId });
  };

  const currentKeyword = keywords[currentKeywordIndex];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>加载学习内容中...</Text>
      </View>
    );
  }

  if (!currentKeyword) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>未找到学习内容</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          
          <ProgressVisualizationV2
            current={currentKeywordIndex + 1}
            total={keywords.length}
            aquaPoints={aquaPoints}
          />
          
          <View style={styles.helpButtonsContainer}>
            <TouchableOpacity
              style={styles.helpButton}
              onPress={() => {
                // 帮助按钮现在根据当前阶段显示不同帮助
                if (currentPhase === 'context_guessing') {
                  Alert.alert('提示', '仔细听音频，选择最匹配的画面');
                } else if (currentPhase === 'pronunciation_training') {
                  Alert.alert('提示', '跟着音频大声朗读，注意发音');
                }
              }}
            >
              <Text style={styles.helpButtonText}>?</Text>
            </TouchableOpacity>

            {/* V2: 实用口语建议按钮 */}
            <SpeakingTipsButton
              userLevel="beginner"
              currentTheme="学习"
              style={styles.speakingTipsButton}
            />
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Audio Player */}
          <AudioPlayer
            audioUrl={currentKeyword.audioUrl}
            word={currentKeyword.word}
            pronunciation={currentKeyword.pronunciation}
            slowMode={false} // slowMode由VideoOptionSelectorV2内部的Focus Mode控制
          />

          {/* 情景猜义阶段 */}
          {currentPhase === 'context_guessing' && (
            <VideoOptionSelectorV2
              videoClips={videoClips}
              selectedOption={selectedOption}
              onOptionSelect={handleContextGuessingSelect}
              focusModeActive={false} // Focus Mode现在由VideoOptionSelectorV2内部管理
              disabled={showFeedback}
            />
          )}

          {/* 发音训练阶段 */}
          {currentPhase === 'pronunciation_training' && showPronunciationTraining && (
            <PronunciationTrainingComponent
              keyword={currentKeyword}
              dramaId={dramaId}
              onComplete={handlePronunciationTrainingComplete}
              onRescueModeTriggered={() => {
                analyticsService.track('rescue_mode_activated', {
                  dramaId,
                  keywordId: currentKeyword.id,
                  timestamp: Date.now(),
                });
              }}
            />
          )}

          {/* Feedback Display */}
          {showFeedback && (
            <FeedbackDisplayV2
              type={feedbackType}
              keyword={currentKeyword}
              aquaPointsEarned={feedbackType === 'correct' ? 10 : 0} // 固定积分，不再依赖Focus Mode
              onAnimationComplete={() => {
                if (feedbackType === 'incorrect') {
                  setShowFeedback(false);
                  setSelectedOption(null);
                }
              }}
            />
          )}
        </View>

        {/* Encouraging Messages */}
        <View style={styles.encouragementContainer}>
          <Text style={styles.encouragementText}>
            {currentPhase === 'context_guessing'
              ? "听声音，选择最匹配的画面"
              : "跟着音频大声朗读"}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#1e293b',
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpButtonText: {
    fontSize: 18,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  focusModeOverlay: {
    position: 'absolute',
    top: 100,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(102, 126, 234, 0.9)',
    padding: 16,
    borderRadius: 12,
    zIndex: 1000,
  },
  focusModeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  encouragementContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  encouragementText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // V2 新增样式
  helpButtonsContainer: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  speakingTipsButton: {
    // SpeakingTipsButton的自定义样式
  },
});

export default VTPRScreenOptimized;
