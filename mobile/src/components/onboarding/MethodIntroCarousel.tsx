import React, { useState, useRef, useEffect } from 'react';
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
import { MethodIntroCarouselProps, MethodIntroSlide } from '@/types/onboarding.types';
import { AnalyticsService } from '@/services/AnalyticsService';

const { width, height } = Dimensions.get('window');

/**
 * 神经沉浸法介绍轮播组件
 * 介绍 vTPR 学习方法的核心原理和优势
 */
const MethodIntroCarousel: React.FC<MethodIntroCarouselProps> = ({
  onComplete,
  onSkip,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [fadeAnim] = useState(new Animated.Value(1));

  // 方法介绍幻灯片数据
  const slides: MethodIntroSlide[] = [
    {
      id: 'brain-science',
      title: '基于脑科学的探索法',
      subtitle: 'vTPR 神经沉浸法',
      description: '模拟大脑自然语言习得过程，让探索变得轻松自然',
      illustration: '🧠',
      keyPoints: [
        '激活大脑语言区域',
        '建立神经连接',
        '自然语言习得'
      ],
      backgroundColor: '#667eea',
    },
    {
      id: 'visual-audio',
      title: '视听结合，深度理解',
      subtitle: 'Visual + Audio = Magic',
      description: '通过视频情境和音频刺激，让大脑在真实场景中探索',
      illustration: '👁️‍🗨️',
      keyPoints: [
        '真实场景探索',
        '多感官刺激',
        '情境化记忆'
      ],
      backgroundColor: '#764ba2',
    },
    {
      id: 'pattern-recognition',
      title: '模式识别，快速匹配',
      subtitle: 'Pattern Recognition',
      description: '训练大脑识别语言模式，实现音画快速匹配',
      illustration: '🎯',
      keyPoints: [
        '模式识别训练',
        '快速反应能力',
        '直觉式理解'
      ],
      backgroundColor: '#f093fb',
    },
    {
      id: 'immersive-experience',
      title: '沉浸式故事体验',
      subtitle: 'Total Immersion',
      description: '完全沉浸在故事情境中，忘记你在"背单词"',
      illustration: '🌊',
      keyPoints: [
        '故事线索驱动',
        '去学习化体验',
        '自然语言输入'
      ],
      backgroundColor: '#4facfe',
    },
    {
      id: 'ready-to-start',
      title: '准备好开始了吗？',
      subtitle: 'Ready to Transform?',
      description: '让我们一起体验这个革命性的探索方法！',
      illustration: '🚀',
      keyPoints: [
        '个性化故事路径',
        '实时进度追踪',
        '持续优化体验'
      ],
      backgroundColor: '#43e97b',
    },
  ];

  useEffect(() => {
    // 记录方法介绍查看事件
    AnalyticsService.trackEvent({
      eventType: 'method_intro_viewed',
      step: 'method-intro',
      timeSpent: 0,
    });
  }, []);

  const handleSlideChange = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
    
    // 滚动到对应位置
    scrollViewRef.current?.scrollTo({
      x: slideIndex * width,
      animated: true,
    });

    // 添加淡入动画
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      handleSlideChange(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      handleSlideChange(currentSlide - 1);
    }
  };

  const handleComplete = () => {
    AnalyticsService.trackEvent({
      eventType: 'method_intro_viewed',
      step: 'method-intro',
      timeSpent: Date.now(),
    });
    onComplete();
  };

  const handleSkip = () => {
    if (onSkip) {
      AnalyticsService.trackEvent({
        eventType: 'onboarding_skipped',
        step: 'method-intro',
        skipReason: 'user_skip',
      });
      onSkip();
    }
  };

  const renderSlide = (slide: MethodIntroSlide, index: number) => (
    <View key={slide.id} style={[styles.slide, { backgroundColor: slide.backgroundColor }]}>
      <SafeAreaView style={styles.slideContent}>
        {/* 跳过按钮 */}
        {onSkip && index === 0 && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>跳过</Text>
          </TouchableOpacity>
        )}

        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          {/* 插图 */}
          <View style={styles.illustrationContainer}>
            <Text style={styles.illustration}>{slide.illustration}</Text>
          </View>

          {/* 标题 */}
          <Text style={styles.title}>{slide.title}</Text>

          {/* 副标题 */}
          <Text style={styles.subtitle}>{slide.subtitle}</Text>

          {/* 描述 */}
          <Text style={styles.description}>{slide.description}</Text>

          {/* 关键点 */}
          <View style={styles.keyPointsContainer}>
            {slide.keyPoints.map((point, pointIndex) => (
              <View key={pointIndex} style={styles.keyPointItem}>
                <View style={styles.keyPointBullet} />
                <Text style={styles.keyPointText}>{point}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* 底部导航 */}
        <View style={styles.bottomNavigation}>
          {/* 进度指示器 */}
          <View style={styles.progressContainer}>
            {slides.map((_, slideIndex) => (
              <TouchableOpacity
                key={slideIndex}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: slideIndex === index ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)',
                    transform: [{ scale: slideIndex === index ? 1.2 : 1 }],
                  },
                ]}
                onPress={() => handleSlideChange(slideIndex)}
              />
            ))}
          </View>

          {/* 导航按钮 */}
          <View style={styles.navigationButtons}>
            {index > 0 && (
              <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
                <Text style={styles.navButtonText}>上一步</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.navButton, styles.nextButton]} 
              onPress={handleNext}
            >
              <Text style={[styles.navButtonText, styles.nextButtonText]}>
                {index === slides.length - 1 ? '开始体验' : '下一步'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentSlide(slideIndex);
        }}
        scrollEventThrottle={16}
      >
        {slides.map((slide, index) => renderSlide(slide, index))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    height,
  },
  slideContent: {
    flex: 1,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  illustrationContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  illustration: {
    fontSize: 72,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  keyPointsContainer: {
    alignItems: 'flex-start',
  },
  keyPointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  keyPointBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 12,
  },
  keyPointText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  bottomNavigation: {
    paddingBottom: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  nextButton: {
    backgroundColor: '#FFFFFF',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nextButtonText: {
    color: '#333',
  },
});

export default MethodIntroCarousel;
