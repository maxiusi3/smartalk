import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SplashScreenProps } from '@/types/onboarding.types';
import { ONBOARDING_TEXTS, ANIMATION_CONFIG, ONBOARDING_STYLES } from '@/constants/onboarding';

const { width, height } = Dimensions.get('window');

/**
 * SplashScreen组件
 * 应用启动时的欢迎界面，展示品牌信息和核心价值主张
 */
const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  onSkip,
  autoAdvanceDelay = 2500,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // 启动动画序列
    startAnimations();

    // 自动跳转定时器
    const timer = setTimeout(() => {
      onComplete();
    }, autoAdvanceDelay);

    return () => clearTimeout(timer);
  }, [autoAdvanceDelay, onComplete]);

  /**
   * 启动入场动画
   */
  const startAnimations = () => {
    Animated.sequence([
      // 第一阶段：logo和标题淡入
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATION_CONFIG.splash.duration,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: ANIMATION_CONFIG.splash.duration,
          useNativeDriver: true,
        }),
      ]),
      // 第二阶段：副标题滑入
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /**
   * 处理跳过按钮点击
   */
  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* 渐变背景 */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* 跳过按钮 */}
      {onSkip && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>{ONBOARDING_TEXTS.carousel.skip}</Text>
        </TouchableOpacity>
      )}

      {/* 主要内容 */}
      <View style={styles.content}>
        {/* Logo和标题区域 */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Logo图标 */}
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>🎬</Text>
          </View>

          {/* 应用标题 */}
          <Text style={styles.title}>{ONBOARDING_TEXTS.splash.title}</Text>
        </Animated.View>

        {/* 副标题和描述 */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.subtitle}>{ONBOARDING_TEXTS.splash.subtitle}</Text>
          <Text style={styles.description}>{ONBOARDING_TEXTS.splash.description}</Text>
        </Animated.View>

        {/* 装饰元素 */}
        <Animated.View
          style={[
            styles.decorationContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.decoration} />
          <View style={[styles.decoration, styles.decorationDelay]} />
          <View style={[styles.decoration, styles.decorationDelay2]} />
        </Animated.View>
      </View>

      {/* 底部提示 */}
      <Animated.View
        style={[
          styles.bottomHint,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={styles.hintText}>轻触屏幕继续</Text>
      </Animated.View>

      {/* 全屏点击区域 */}
      <TouchableOpacity
        style={styles.touchArea}
        onPress={onComplete}
        activeOpacity={1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ONBOARDING_STYLES.colors.primary,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: ONBOARDING_STYLES.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  skipText: {
    color: ONBOARDING_STYLES.colors.textLight,
    fontSize: ONBOARDING_STYLES.fonts.caption.fontSize,
    fontWeight: ONBOARDING_STYLES.fonts.caption.fontWeight,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: ONBOARDING_STYLES.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: ONBOARDING_STYLES.spacing.xxl,
  },
  logoIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ONBOARDING_STYLES.spacing.lg,
    ...ONBOARDING_STYLES.shadows.medium,
  },
  logoEmoji: {
    fontSize: 60,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: ONBOARDING_STYLES.colors.textLight,
    textAlign: 'center',
    letterSpacing: 2,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: ONBOARDING_STYLES.spacing.xxl,
  },
  subtitle: {
    fontSize: ONBOARDING_STYLES.fonts.subtitle.fontSize,
    fontWeight: ONBOARDING_STYLES.fonts.subtitle.fontWeight,
    color: ONBOARDING_STYLES.colors.textLight,
    textAlign: 'center',
    marginBottom: ONBOARDING_STYLES.spacing.md,
    opacity: 0.9,
  },
  description: {
    fontSize: ONBOARDING_STYLES.fonts.body.fontSize,
    color: ONBOARDING_STYLES.colors.textLight,
    textAlign: 'center',
    lineHeight: ONBOARDING_STYLES.fonts.body.lineHeight,
    opacity: 0.8,
    maxWidth: width * 0.8,
  },
  decorationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  decoration: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 4,
  },
  decorationDelay: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  decorationDelay2: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  bottomHint: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    color: ONBOARDING_STYLES.colors.textLight,
    fontSize: ONBOARDING_STYLES.fonts.caption.fontSize,
    opacity: 0.7,
  },
  touchArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default SplashScreen;
