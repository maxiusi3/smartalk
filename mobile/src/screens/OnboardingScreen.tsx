import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { AnalyticsService } from '@/services/AnalyticsService';

type OnboardingNavigationProp = StackNavigationProp<RootStackParamList>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  emoji: string;
  animationType?: 'bounce' | 'float' | 'pulse';
}

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'pain_point',
      title: '背了10年英语，\n还是张不开嘴？',
      subtitle: '我们换个方式',
      content: '传统的背单词、学语法让你积累了知识，但无法自然交流。\n\n是时候体验真正有效的语言习得方法了。',
      emoji: '😤',
      animationType: 'float'
    },
    {
      id: 'method_intro_1',
      title: '神经沉浸法',
      subtitle: '像婴儿一样习得语言',
      content: '我们的大脑天生具备语言习得能力。通过声音和画面的直接连接，绕过翻译思维，让英语成为你的第二本能。',
      emoji: '🧠💫',
      animationType: 'pulse'
    },
    {
      id: 'method_intro_2',
      title: '可理解性输入',
      subtitle: '在理解中自然习得',
      content: '不是死记硬背，而是在有意义的情境中理解。每个词汇都与真实场景建立连接，让探索变成自然的认知过程。',
      emoji: '👂➡️💭',
      animationType: 'bounce'
    },
    {
      id: 'promise',
      title: '准备好见证奇迹了吗？',
      subtitle: '接下来的30分钟将改变你对英语的认知',
      content: '你将通过发现15个"声音钥匙"来解锁一部迷你剧的完整理解。\n\n从"听不懂"到"无字幕听懂"，这就是我们为你准备的魔法时刻。',
      emoji: '🎭',
      animationType: 'float'
    }
  ];

  useEffect(() => {
    startFloatingAnimation();
  }, [currentStep]);

  const startFloatingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const animateToNextStep = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 0,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    AnalyticsService.getInstance().track('onboarding_step_completed', {
      stepId: onboardingSteps[currentStep].id,
      stepNumber: currentStep + 1,
      totalSteps: onboardingSteps.length,
      timestamp: Date.now(),
    });

    if (currentStep < onboardingSteps.length - 1) {
      animateToNextStep();
      setCurrentStep(currentStep + 1);
    } else {
      AnalyticsService.getInstance().track('onboarding_completed', {
        totalSteps: onboardingSteps.length,
        timestamp: Date.now(),
      });
      
      navigation.replace('InterestSelection');
    }
  };

  const handleSkip = () => {
    AnalyticsService.getInstance().track('onboarding_skipped', {
      skippedAtStep: currentStep + 1,
      totalSteps: onboardingSteps.length,
      timestamp: Date.now(),
    });
    
    navigation.replace('InterestSelection');
  };

  const currentStepData = onboardingSteps[currentStep];

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {onboardingSteps.map((_, index) => (
        <View
          key={index}
          style={[
            styles.stepDot,
            index === currentStep && styles.stepDotActive,
            index < currentStep && styles.stepDotCompleted,
          ]}
        />
      ))}
    </View>
  );

  const renderEmojiAnimation = () => {
    const animationStyle = {
      transform: [{ translateY: floatAnim }],
    };

    return (
      <Animated.View style={[styles.emojiContainer, animationStyle]}>
        <View style={styles.emojiCircle}>
          <Text style={styles.emoji}>{currentStepData.emoji}</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <LinearGradient
      colors={['#f8fafc', '#e2e8f0']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          {renderStepIndicator()}
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>跳过</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Visual Element */}
          <View style={styles.visualContainer}>
            {renderEmojiAnimation()}
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{currentStepData.title}</Text>
            <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
            <Text style={styles.contentText}>{currentStepData.content}</Text>
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === onboardingSteps.length - 1 ? '开始体验' : '继续'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 4,
    transition: 'all 0.3s ease',
  },
  stepDotActive: {
    width: 24,
    backgroundColor: '#667eea',
  },
  stepDotCompleted: {
    backgroundColor: '#10b981',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  skipText: {
    fontSize: 16,
    color: '#757575',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  visualContainer: {
    height: screenHeight * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  emojiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a237e',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 20,
    color: '#667eea',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  contentText: {
    fontSize: 16,
    color: '#424242',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  nextButton: {
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonGradient: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;