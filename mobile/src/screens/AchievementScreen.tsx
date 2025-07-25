import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { AnalyticsService } from '@/services/AnalyticsService';

type AchievementRouteProp = RouteProp<RootStackParamList, 'Achievement'>;
type AchievementNavigationProp = StackNavigationProp<RootStackParamList>;

interface FeedbackOption {
  id: string;
  text: string;
  emoji: string;
  selected: boolean;
  sentiment?: 'very_positive' | 'positive' | 'neutral' | 'needs_improvement';
}

interface EmotionalResponse {
  comprehensionLevel: string;
  confidenceLevel: number;
  emotionalState: string;
  willingnessToContinue: boolean;
  additionalComments?: string;
}

const AchievementScreen: React.FC = () => {
  const navigation = useNavigation<AchievementNavigationProp>();
  const route = useRoute<AchievementRouteProp>();
  const { dramaId } = route.params;
  
  const [feedbackOptions, setFeedbackOptions] = useState<FeedbackOption[]>([
    { id: 'understood_all', text: '我完全听懂了！', emoji: '😍', selected: true, sentiment: 'very_positive' },
    { id: 'easier_than_expected', text: '比想象的容易！', emoji: '🤩', selected: false, sentiment: 'very_positive' },
    { id: 'got_main_story', text: '抓住了主线！', emoji: '😊', selected: false, sentiment: 'positive' },
    { id: 'want_more', text: '想学更多！', emoji: '🔥', selected: false, sentiment: 'very_positive' },
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    // Track achievement screen view
    AnalyticsService.getInstance().track('achievement_screen_viewed', {
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

  const handleFeedbackSelect = (id: string) => {
    const selectedOption = feedbackOptions.find(option => option.id === id);
    
    // Track feedback selection
    AnalyticsService.getInstance().track('achievement_feedback_selected', {
      dramaId,
      feedbackId: id,
      sentiment: selectedOption?.sentiment,
      timestamp: Date.now(),
    });

    setFeedbackOptions(options =>
      options.map(option => ({
        ...option,
        selected: option.id === id,
      }))
    );
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

  return (
    <LinearGradient
      colors={['#f8fafc', '#e2e8f0']}
      style={styles.container}
    >
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
            {/* Celebration Icon */}
            <View style={styles.celebrationContainer}>
              <Animated.Text 
                style={[
                  styles.celebrationIcon,
                  {
                    transform: [{
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -10],
                      })
                    }]
                  }
                ]}
              >
                🎉
              </Animated.Text>
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
            
            {/* Feedback Options */}
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackTitle}>你的感受如何？</Text>
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
                  </TouchableOpacity>
                ))}
              </View>
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
            <LinearGradient
              colors={isSubmitting ? ['#e2e8f0', '#e2e8f0'] : ['#667eea', '#764ba2']}
              style={styles.continueButtonGradient}
            >
              <Text style={[
                styles.buttonText,
                isSubmitting && styles.buttonTextDisabled
              ]}>
                {isSubmitting ? '正在保存...' : '继续学习之旅'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
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
});

export default AchievementScreen;