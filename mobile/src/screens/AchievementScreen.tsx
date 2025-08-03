import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { AnalyticsService } from '@/services/AnalyticsService';
import { UserService } from '@/services/UserService';
import { ApiService } from '@/services/ApiService';

type AchievementRouteProp = RouteProp<RootStackParamList, 'Achievement'>;
type AchievementNavigationProp = StackNavigationProp<RootStackParamList>;

interface FeedbackOption {
  id: string;
  text: string;
  emoji: string;
  selected: boolean;
  sentiment?: 'very_positive' | 'positive' | 'neutral' | 'needs_improvement';
}

interface Badge {
  id: string;
  name: string;
  displayName: string;
  description: string;
  iconUrl: string;
  interestId: string;
  earnedAt?: string;
}

interface Drama {
  id: string;
  title: string;
  interest: {
    id: string;
    name: string;
    displayName: string;
    primaryColor: string;
    secondaryColor: string;
    badgeName: string;
  };
}

const AchievementScreen: React.FC = () => {
  const navigation = useNavigation<AchievementNavigationProp>();
  const route = useRoute<AchievementRouteProp>();
  const { dramaId } = route.params;

  // V2 Magic Moment反馈选项
  const [feedbackOptions, setFeedbackOptions] = useState<FeedbackOption[]>([
    { id: 'completely_understood', text: '完全听懂了！', emoji: '🤯', selected: false, sentiment: 'very_positive' },
    { id: 'more_than_expected', text: '比我想象的听懂更多！', emoji: '😲', selected: false, sentiment: 'very_positive' },
    { id: 'partially_understood', text: '听懂了一部分', emoji: '🙂', selected: false, sentiment: 'positive' },
  ]);

  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
  const [showBadgeCeremony, setShowBadgeCeremony] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState<Badge | null>(null);
  const [drama, setDrama] = useState<Drama | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const badgeScaleAnim = new Animated.Value(0);
  const confettiAnim = new Animated.Value(0);

  const analyticsService = AnalyticsService.getInstance();
  const userService = UserService.getInstance();

  useEffect(() => {
    loadDramaAndBadge();

    // V2: 记录Magic Moment反馈页面进入
    analyticsService.track('magic_moment_feedback_started', {
      dramaId,
      timestamp: Date.now(),
    });

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [dramaId]);

  const loadDramaAndBadge = async () => {
    try {
      setLoading(true);

      // 加载剧集信息
      const dramaData = await ApiService.getDrama(dramaId);
      setDrama(dramaData);

      // 模拟徽章数据（实际应用中从API获取）
      const mockBadge: Badge = {
        id: 'badge_' + dramaData.interestId,
        name: dramaData.interest?.badgeName || '学习达人',
        displayName: dramaData.interest?.badgeName || '学习达人',
        description: `完成${dramaData.title}的学习，获得专业认证！`,
        iconUrl: '',
        interestId: dramaData.interestId,
      };

      setEarnedBadge(mockBadge);

      // 模拟检查用户是否已经获得此徽章
      const hasBadge = false; // 实际应用中从用户数据检查

      if (!hasBadge) {
        // 用户首次获得此徽章，准备颁奖仪式
        setTimeout(() => {
          setShowBadgeCeremony(true);
          startBadgeCeremony();
        }, 2000);
      }

    } catch (error) {
      console.error('Error loading drama and badge:', error);
    } finally {
      setLoading(false);
    }
  };

  const startBadgeCeremony = () => {
    // 徽章颁奖动画
    Animated.sequence([
      Animated.timing(badgeScaleAnim, {
        toValue: 1.2,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(badgeScaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // 庆祝动画
    Animated.timing(confettiAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  };

  const handleFeedbackSelect = (id: string) => {
    const selectedOption = feedbackOptions.find(option => option.id === id);
    setSelectedFeedback(id);

    // V2: 记录Magic Moment反馈选择
    analyticsService.track('magic_moment_feedback_given', {
      dramaId,
      feedbackId: id,
      feedbackText: selectedOption?.text,
      sentiment: selectedOption?.sentiment,
      timestamp: Date.now(),
    });

    setFeedbackOptions(options =>
      options.map(option => ({
        ...option,
        selected: option.id === id,
      }))
    );

    // V2: 无论选择什么，都给予正向反馈
    showEncouragingResponse(selectedOption);
  };

  const showEncouragingResponse = (selectedOption: FeedbackOption | undefined) => {
    let encouragingMessage = '';

    switch (selectedOption?.id) {
      case 'completely_understood':
        encouragingMessage = '太棒了！你已经达到了语言学习的一个重要里程碑！🎉';
        break;
      case 'more_than_expected':
        encouragingMessage = '这就是语言学习的魔法！你的大脑正在快速适应！✨';
        break;
      case 'partially_understood':
        encouragingMessage = '很好的开始！每一次理解都是进步，继续保持！💪';
        break;
      default:
        encouragingMessage = '你做得很好！继续这样的学习节奏！🌟';
    }

    // 这里可以显示鼓励消息的模态框
    console.log('Encouraging message:', encouragingMessage);
  };

  const handleContinue = async () => {
    const selectedFeedback = feedbackOptions.find(option => option.selected);
    
    if (!selectedFeedback) {
      // Encourage user to provide feedback with gentle animation
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    setIsSubmitting(true);

    try {
      // Create emotional response data
      const emotionalResponse: EmotionalResponse = {
        comprehensionLevel: selectedFeedback.id,
        confidenceLevel: selectedFeedback.sentiment === 'very_positive' ? 5 : 
                         selectedFeedback.sentiment === 'positive' ? 4 :
                         selectedFeedback.sentiment === 'neutral' ? 3 : 2,
        emotionalState: selectedFeedback.sentiment || 'neutral',
        willingnessToContinue: selectedFeedback.sentiment !== 'needs_improvement',
      };

      // Track activation completion with emotional feedback
      AnalyticsService.getInstance().track('user_activation_completed', {
        dramaId,
        comprehensionLevel: emotionalResponse.comprehensionLevel,
        confidenceLevel: emotionalResponse.confidenceLevel,
        emotionalState: emotionalResponse.emotionalState,
        willingnessToContinue: emotionalResponse.willingnessToContinue,
        timestamp: Date.now(),
      });

      // Navigate to learning map to continue journey
      navigation.navigate('LearningMap', { dramaId });
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Still navigate even if analytics fails
      navigation.navigate('LearningMap', { dramaId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBadgeCeremony = () => {
    if (!showBadgeCeremony || !earnedBadge || !drama) return null;

    return (
      <View style={styles.badgeCeremonyOverlay}>
        <View style={styles.badgeCeremonyContainer}>
          <Animated.View
            style={[
              styles.badgeContainer,
              { transform: [{ scale: badgeScaleAnim }] }
            ]}
          >
            <Text style={styles.badgeIcon}>🏆</Text>
            <Text style={styles.badgeTitle}>恭喜获得徽章！</Text>
            <Text style={[styles.badgeName, { color: drama.interest.primaryColor }]}>
              {drama.interest.badgeName}
            </Text>
            <Text style={styles.badgeDescription}>
              {earnedBadge.description}
            </Text>
          </Animated.View>

          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: drama.interest.primaryColor }]}
            onPress={() => setShowBadgeCeremony(false)}
          >
            <Text style={styles.continueButtonText}>继续</Text>
          </TouchableOpacity>
        </View>

        {/* 庆祝粒子效果 */}
        <Animated.View
          style={[
            styles.confettiContainer,
            { opacity: confettiAnim }
          ]}
        >
          <Text style={styles.confetti}>🎉✨🎊✨🎉</Text>
        </Animated.View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>准备成就反馈...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* V2 Magic Moment庆祝 */}
            <View style={styles.celebrationContainer}>
              <Text style={styles.magicMomentIcon}>✨</Text>
              <Text style={styles.magicMomentTitle}>Magic Moment!</Text>
              <Text style={styles.magicMomentSubtitle}>
                你刚刚体验了语言学习的魔法时刻
              </Text>
            </View>
            
            {/* Title and Description */}
            <View style={styles.textSection}>
              <Text style={styles.title}>这就是"习得"的感觉！</Text>
              <Text style={styles.description}>
                可能有些词你还没反应过来，但你一定抓住了故事的主线，对吗？
                {'\n\n'}
                这就是我们大脑最自然的工作方式——先理解大意，再填充细节。你刚刚亲身体验了绕过翻译、直接用英语思维的过程。
                {'\n\n'}
                为你这关键的一步喝彩！
              </Text>
            </View>
            
            {/* V2 Feedback Options */}
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackTitle}>你的理解程度如何？</Text>
              <Text style={styles.feedbackSubtitle}>
                无论选择什么，你都已经取得了很大的进步！
              </Text>
              <View style={styles.feedbackOptions}>
                {feedbackOptions.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.feedbackOption,
                      option.selected && styles.feedbackOptionSelected,
                    ]}
                    onPress={() => handleFeedbackSelect(option.id)}
                  >
                    <Text style={styles.feedbackText}>
                      {option.emoji} {option.text}
                    </Text>
                    {option.selected && (
                      <View style={styles.selectedIndicator}>
                        <Text style={styles.selectedCheckmark}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* V2 鼓励性反馈 */}
              {selectedFeedback && (
                <View style={styles.encouragementContainer}>
                  <Text style={styles.encouragementText}>
                    {selectedFeedback === 'completely_understood' && '太棒了！你已经达到了语言学习的一个重要里程碑！🎉'}
                    {selectedFeedback === 'more_than_expected' && '这就是语言学习的魔法！你的大脑正在快速适应！✨'}
                    {selectedFeedback === 'partially_understood' && '很好的开始！每一次理解都是进步，继续保持！💪'}
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Speaking Tips Card */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 实用口语小贴士</Text>
            <Text style={styles.tipsSubtitle}>
              当你未来和人交流时，如果说错了，别慌！学会这两个万能句子：
            </Text>
            
            <View style={styles.tipsContent}>
              <View style={styles.tipItem}>
                <Text style={styles.tipPhrase}>"Sorry, I mean..."</Text>
                <Text style={styles.tipTranslation}>抱歉，我的意思是...</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipPhrase}>"How do you say... in English?"</Text>
                <Text style={styles.tipTranslation}>...用英语怎么说？</Text>
              </View>
            </View>
            
            <Text style={styles.tipsFooter}>
              记住，沟通的关键是解决问题，而不是追求完美。
            </Text>
          </View>

          {/* Continue Button */}
          <TouchableOpacity 
            style={[
              styles.continueButton,
              isSubmitting && styles.continueButtonDisabled
            ]} 
            onPress={handleContinue}
            disabled={isSubmitting}
          >
            <Text style={[
              styles.buttonText,
              isSubmitting && styles.buttonTextDisabled
            ]}>
              {isSubmitting ? '正在保存...' : '继续学习之旅'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      {/* V2 徽章颁奖仪式 */}
      {renderBadgeCeremony()}
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
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  contentContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 32,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  celebrationContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  celebrationIcon: {
    fontSize: 80,
    textAlign: 'center',
  },
  textSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  feedbackContainer: {
    marginBottom: 0,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  feedbackOptions: {
    gap: 12,
  },
  feedbackOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  feedbackOptionSelected: {
    borderColor: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  feedbackText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  tipsCard: {
    backgroundColor: 'rgba(240, 249, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 12,
    textAlign: 'center',
  },
  tipsSubtitle: {
    fontSize: 14,
    color: '#1d4ed8',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  tipsContent: {
    gap: 12,
    marginBottom: 16,
  },
  tipItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12,
    padding: 12,
  },
  tipPhrase: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 4,
  },
  tipTranslation: {
    fontSize: 12,
    color: '#1d4ed8',
  },
  tipsFooter: {
    fontSize: 12,
    color: '#1d4ed8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  continueButton: {
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonGradient: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonTextDisabled: {
    color: '#9ca3af',
  },
  // V2 新增样式
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  magicMomentIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  magicMomentTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  magicMomentSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  feedbackSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#10b981',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheckmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  encouragementContainer: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  encouragementText: {
    fontSize: 16,
    color: '#166534',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },
  badgeCeremonyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  badgeCeremonyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    marginHorizontal: 24,
    alignItems: 'center',
    maxWidth: 400,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  badgeIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  badgeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  badgeDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  confettiContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  confetti: {
    fontSize: 32,
    letterSpacing: 8,
  },
});

export default AchievementScreen;