import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { OnboardingPageProps } from '@/types/onboarding.types';
import { ONBOARDING_STYLES, ANIMATION_CONFIG } from '@/constants/onboarding';

const { width, height } = Dimensions.get('window');

/**
 * OnboardingPage组件
 * 单个onboarding页面的内容展示
 */
const OnboardingPage: React.FC<OnboardingPageProps> = ({
  data,
  isActive,
  index,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (isActive) {
      // 页面激活时启动动画
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATION_CONFIG.carousel.duration + 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: ANIMATION_CONFIG.carousel.duration + 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: ANIMATION_CONFIG.carousel.duration + 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // 页面非激活时重置动画
      fadeAnim.setValue(0);
      slideAnim.setValue(30);
      scaleAnim.setValue(0.9);
    }
  }, [isActive, fadeAnim, slideAnim, scaleAnim]);

  return (
    <View style={[styles.container, { width }]}>
      {/* 背景渐变 */}
      <LinearGradient
        colors={[data.backgroundColor, `${data.backgroundColor}CC`]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* 内容区域 */}
      <View style={styles.content}>
        {/* 插图区域 */}
        <Animated.View
          style={[
            styles.illustrationContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
              ],
            },
          ]}
        >
          <View style={styles.illustrationBackground}>
            <Text style={styles.illustration}>{data.illustration}</Text>
          </View>
          
          {/* 装饰圆圈 */}
          <View style={styles.decorativeCircles}>
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />
            <View style={[styles.circle, styles.circle3]} />
          </View>
        </Animated.View>

        {/* 文本内容 */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.subtitle}>{data.subtitle}</Text>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.description}>{data.description}</Text>
        </Animated.View>

        {/* 进度指示 */}
        <Animated.View
          style={[
            styles.progressContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${((index + 1) / 3) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{index + 1} / 3</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.6,
  },
  content: {
    flex: 1,
    paddingHorizontal: ONBOARDING_STYLES.spacing.xl,
    paddingTop: 100,
    justifyContent: 'space-between',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: ONBOARDING_STYLES.spacing.xxl,
    position: 'relative',
  },
  illustrationBackground: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    ...ONBOARDING_STYLES.shadows.large,
  },
  illustration: {
    fontSize: 80,
  },
  decorativeCircles: {
    position: 'absolute',
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle1: {
    width: 20,
    height: 20,
    top: 20,
    right: 30,
  },
  circle2: {
    width: 15,
    height: 15,
    bottom: 40,
    left: 20,
  },
  circle3: {
    width: 25,
    height: 25,
    top: 60,
    left: 10,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: ONBOARDING_STYLES.spacing.md,
    backgroundColor: ONBOARDING_STYLES.colors.background,
    borderRadius: ONBOARDING_STYLES.borderRadius.xl,
    paddingVertical: ONBOARDING_STYLES.spacing.xl,
    marginHorizontal: -ONBOARDING_STYLES.spacing.md,
    ...ONBOARDING_STYLES.shadows.medium,
  },
  subtitle: {
    fontSize: ONBOARDING_STYLES.fonts.caption.fontSize,
    color: ONBOARDING_STYLES.colors.textSecondary,
    textAlign: 'center',
    marginBottom: ONBOARDING_STYLES.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  title: {
    fontSize: ONBOARDING_STYLES.fonts.title.fontSize,
    fontWeight: ONBOARDING_STYLES.fonts.title.fontWeight,
    color: ONBOARDING_STYLES.colors.text,
    textAlign: 'center',
    marginBottom: ONBOARDING_STYLES.spacing.md,
    lineHeight: ONBOARDING_STYLES.fonts.title.lineHeight,
  },
  description: {
    fontSize: ONBOARDING_STYLES.fonts.body.fontSize,
    color: ONBOARDING_STYLES.colors.textSecondary,
    textAlign: 'center',
    lineHeight: ONBOARDING_STYLES.fonts.body.lineHeight,
    maxWidth: width * 0.8,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: ONBOARDING_STYLES.spacing.lg,
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: ONBOARDING_STYLES.colors.border,
    borderRadius: 2,
    marginBottom: ONBOARDING_STYLES.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: ONBOARDING_STYLES.colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: ONBOARDING_STYLES.fonts.caption.fontSize,
    color: ONBOARDING_STYLES.colors.textSecondary,
    fontWeight: '600',
  },
});

export default OnboardingPage;
