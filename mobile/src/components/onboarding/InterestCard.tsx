import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { InterestCardProps } from '@/types/onboarding.types';
import { ONBOARDING_STYLES, ANIMATION_CONFIG } from '@/constants/onboarding';

/**
 * InterestCard组件
 * 兴趣选择卡片
 */
const InterestCard: React.FC<InterestCardProps> = ({
  interest,
  isSelected,
  onSelect,
  disabled = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 选中状态动画
    Animated.parallel([
      Animated.timing(borderAnim, {
        toValue: isSelected ? 1 : 0,
        duration: ANIMATION_CONFIG.card.duration,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isSelected, borderAnim]);

  /**
   * 处理按压开始
   */
  const handlePressIn = () => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    }
  };

  /**
   * 处理按压结束
   */
  const handlePressOut = () => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  /**
   * 处理卡片点击
   */
  const handlePress = () => {
    if (!disabled) {
      onSelect(interest.id);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: scaleAnim }],
            borderColor: borderAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [ONBOARDING_STYLES.colors.border, interest.color],
            }),
            borderWidth: borderAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 2],
            }),
          },
          disabled && styles.disabled,
        ]}
      >
        {/* 背景渐变 */}
        <LinearGradient
          colors={isSelected ? interest.gradient : ['#ffffff', '#ffffff']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* 内容区域 */}
        <View style={styles.content}>
          {/* 图标和标题 */}
          <View style={styles.header}>
            <View style={[
              styles.iconContainer,
              isSelected && styles.iconContainerSelected,
            ]}>
              <Text style={styles.icon}>{interest.icon}</Text>
            </View>
            
            <View style={styles.titleContainer}>
              <Text style={[
                styles.title,
                isSelected && styles.titleSelected,
              ]}>
                {interest.title}
              </Text>
              <Text style={[
                styles.subtitle,
                isSelected && styles.subtitleSelected,
              ]}>
                {interest.subtitle}
              </Text>
            </View>

            {/* 选中指示器 */}
            {isSelected && (
              <Animated.View style={styles.checkContainer}>
                <View style={styles.checkIcon}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              </Animated.View>
            )}
          </View>

          {/* 描述 */}
          <Text style={[
            styles.description,
            isSelected && styles.descriptionSelected,
          ]}>
            {interest.description}
          </Text>

          {/* 示例列表 */}
          <View style={styles.examplesContainer}>
            {interest.examples.slice(0, 3).map((example, index) => (
              <View key={index} style={styles.exampleItem}>
                <View style={[
                  styles.exampleDot,
                  isSelected && styles.exampleDotSelected,
                ]} />
                <Text style={[
                  styles.exampleText,
                  isSelected && styles.exampleTextSelected,
                ]}>
                  {example}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: ONBOARDING_STYLES.borderRadius.lg,
    backgroundColor: ONBOARDING_STYLES.colors.background,
    ...ONBOARDING_STYLES.shadows.medium,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.6,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    padding: ONBOARDING_STYLES.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: ONBOARDING_STYLES.spacing.md,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ONBOARDING_STYLES.spacing.md,
  },
  iconContainerSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  icon: {
    fontSize: 24,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: ONBOARDING_STYLES.fonts.subtitle.fontSize,
    fontWeight: ONBOARDING_STYLES.fonts.subtitle.fontWeight,
    color: ONBOARDING_STYLES.colors.text,
    marginBottom: 2,
  },
  titleSelected: {
    color: ONBOARDING_STYLES.colors.textLight,
  },
  subtitle: {
    fontSize: ONBOARDING_STYLES.fonts.caption.fontSize,
    color: ONBOARDING_STYLES.colors.textSecondary,
    fontWeight: '500',
  },
  subtitleSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  checkContainer: {
    marginLeft: ONBOARDING_STYLES.spacing.sm,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    color: '#4caf50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  description: {
    fontSize: ONBOARDING_STYLES.fonts.body.fontSize,
    color: ONBOARDING_STYLES.colors.textSecondary,
    lineHeight: ONBOARDING_STYLES.fonts.body.lineHeight,
    marginBottom: ONBOARDING_STYLES.spacing.md,
  },
  descriptionSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  examplesContainer: {
    gap: ONBOARDING_STYLES.spacing.xs,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exampleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ONBOARDING_STYLES.colors.textSecondary,
    marginRight: ONBOARDING_STYLES.spacing.sm,
  },
  exampleDotSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  exampleText: {
    fontSize: ONBOARDING_STYLES.fonts.caption.fontSize,
    color: ONBOARDING_STYLES.colors.textSecondary,
    flex: 1,
  },
  exampleTextSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default InterestCard;
