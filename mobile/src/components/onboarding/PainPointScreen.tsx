import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { PainPointScreenProps } from '@/types/onboarding.types';
import { AnalyticsService } from '@/services/AnalyticsService';

const { width, height } = Dimensions.get('window');

/**
 * 痛点共鸣启动页组件
 * 通过展示用户学习英语的痛点来建立情感连接
 */
const PainPointScreen: React.FC<PainPointScreenProps> = ({
  onComplete,
  onSkip,
}) => {
  const [currentPainPoint, setCurrentPainPoint] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  // 痛点数据
  const painPoints = [
    {
      id: 'vocabulary',
      title: '单词背了就忘？',
      subtitle: '传统记忆法让你痛苦不堪',
      description: '死记硬背的单词总是记不住，考试一过就全忘了。你是否也有这样的困扰？',
      emoji: '😵‍💫',
      color: '#FF6B6B',
    },
    {
      id: 'context',
      title: '看懂单词，听不懂句子？',
      subtitle: '缺乏真实语境的学习',
      description: '单独的单词都认识，但放在真实对话中就完全听不懂了。这种挫败感你一定体验过。',
      emoji: '🤔',
      color: '#4ECDC4',
    },
    {
      id: 'motivation',
      title: '学习枯燥，难以坚持？',
      subtitle: '传统教材让你失去兴趣',
      description: '枯燥的语法练习和机械的重复让你对英语学习失去了热情。学习应该是快乐的！',
      emoji: '😴',
      color: '#45B7D1',
    },
    {
      id: 'solution',
      title: '是时候改变了！',
      subtitle: '让大脑用最自然的方式学习',
      description: '就像婴儿学母语一样，通过故事情境自然习得。这就是我们要带给你的全新体验。',
      emoji: '✨',
      color: '#96CEB4',
    },
  ];

  useEffect(() => {
    // 记录痛点页面查看事件
    AnalyticsService.trackEvent({
      eventType: 'pain_point_viewed',
      step: 'pain-point',
      timeSpent: 0,
    });

    // 启动入场动画
    startAnimation();

    // 自动轮播
    const interval = setInterval(() => {
      setCurrentPainPoint((prev) => {
        const next = (prev + 1) % painPoints.length;
        if (next === 0) {
          // 轮播完成，自动进入下一步
          setTimeout(() => {
            handleComplete();
          }, 2000);
        }
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // 每次切换痛点时重新播放动画
    startAnimation();
  }, [currentPainPoint]);

  const startAnimation = () => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleComplete = () => {
    AnalyticsService.trackEvent({
      eventType: 'pain_point_viewed',
      step: 'pain-point',
      timeSpent: Date.now(),
    });
    onComplete();
  };

  const handleSkip = () => {
    if (onSkip) {
      AnalyticsService.trackEvent({
        eventType: 'onboarding_skipped',
        step: 'pain-point',
        skipReason: 'user_skip',
      });
      onSkip();
    }
  };

  const currentPain = painPoints[currentPainPoint];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentPain.color }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 跳过按钮 */}
        {onSkip && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>跳过</Text>
          </TouchableOpacity>
        )}

        {/* 主要内容 */}
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* 表情符号 */}
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>{currentPain.emoji}</Text>
          </View>

          {/* 标题 */}
          <Text style={styles.title}>{currentPain.title}</Text>

          {/* 副标题 */}
          <Text style={styles.subtitle}>{currentPain.subtitle}</Text>

          {/* 描述 */}
          <Text style={styles.description}>{currentPain.description}</Text>

          {/* 进度指示器 */}
          <View style={styles.progressContainer}>
            {painPoints.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: index === currentPainPoint ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)',
                    transform: [{ scale: index === currentPainPoint ? 1.2 : 1 }],
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* 底部操作区 */}
        <View style={styles.bottomContainer}>
          {currentPainPoint === painPoints.length - 1 && (
            <TouchableOpacity style={styles.continueButton} onPress={handleComplete}>
              <Text style={styles.continueButtonText}>开始全新的学习之旅</Text>
            </TouchableOpacity>
          )}

          {/* 手动切换按钮 */}
          <View style={styles.navigationContainer}>
            {painPoints.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.navDot,
                  {
                    backgroundColor: index === currentPainPoint ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                  },
                ]}
                onPress={() => setCurrentPainPoint(index)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  contentContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  bottomContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
  },
});

export default PainPointScreen;
