import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { ProgressIndicatorProps } from '@/types/keyword-wall.types';
import { KEYWORD_WALL_THEME, KEYWORD_WALL_ANIMATIONS } from '@/constants/keyword-wall';

const { width: screenWidth } = Dimensions.get('window');

/**
 * ProgressIndicator组件
 * 显示故事线索发现进度的圆形进度条和文字描述
 */
const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  current,
  total,
  title,
  subtitle,
  showPercentage = true,
  size = 'medium',
  color = KEYWORD_WALL_THEME.colors.progress,
  backgroundColor = KEYWORD_WALL_THEME.colors.locked,
  animationDuration = KEYWORD_WALL_ANIMATIONS.progress.duration,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const countAnim = useRef(new Animated.Value(0)).current;

  const percentage = total > 0 ? (current / total) * 100 : 0;

  // 组件挂载动画
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  // 进度更新动画
  useEffect(() => {
    const targetProgress = percentage / 100;
    
    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: targetProgress,
        duration: animationDuration,
        useNativeDriver: false,
      }),
      Animated.timing(countAnim, {
        toValue: current,
        duration: animationDuration,
        useNativeDriver: false,
      }),
    ]).start();
  }, [current, percentage, progressAnim, countAnim, animationDuration]);

  /**
   * 获取尺寸配置
   */
  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          circleSize: 60,
          strokeWidth: 4,
          fontSize: 14,
          titleFontSize: 16,
        };
      case 'large':
        return {
          circleSize: 120,
          strokeWidth: 8,
          fontSize: 20,
          titleFontSize: 24,
        };
      default:
        return {
          circleSize: 80,
          strokeWidth: 6,
          fontSize: 16,
          titleFontSize: 18,
        };
    }
  };

  const sizeConfig = getSizeConfig();
  const radius = (sizeConfig.circleSize - sizeConfig.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* 标题 */}
      {title && (
        <Text
          style={[
            styles.title,
            {
              fontSize: sizeConfig.titleFontSize,
              color: KEYWORD_WALL_THEME.colors.text,
              marginBottom: 12,
            },
          ]}
        >
          {title}
        </Text>
      )}

      {/* 圆形进度条 */}
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressCircle,
            {
              width: sizeConfig.circleSize,
              height: sizeConfig.circleSize,
            },
          ]}
        >
          {/* 背景圆环 */}
          <View
            style={[
              styles.backgroundCircle,
              {
                width: sizeConfig.circleSize,
                height: sizeConfig.circleSize,
                borderRadius: sizeConfig.circleSize / 2,
                borderWidth: sizeConfig.strokeWidth,
                borderColor: backgroundColor,
              },
            ]}
          />

          {/* 进度圆环 */}
          <Animated.View
            style={[
              styles.progressRing,
              {
                width: sizeConfig.circleSize,
                height: sizeConfig.circleSize,
                borderRadius: sizeConfig.circleSize / 2,
                borderWidth: sizeConfig.strokeWidth,
                borderColor: color,
                transform: [
                  { rotate: '-90deg' },
                  {
                    scale: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ],
              },
            ]}
          />

          {/* 中心内容 */}
          <View style={styles.centerContent}>
            {/* 数字显示 */}
            <Animated.Text
              style={[
                styles.progressNumber,
                {
                  fontSize: sizeConfig.fontSize,
                  color: KEYWORD_WALL_THEME.colors.text,
                },
              ]}
            >
              {countAnim.interpolate({
                inputRange: [0, total],
                outputRange: [0, current],
                extrapolate: 'clamp',
              })}
            </Animated.Text>

            <Text
              style={[
                styles.totalNumber,
                {
                  fontSize: sizeConfig.fontSize * 0.7,
                  color: KEYWORD_WALL_THEME.colors.text,
                  opacity: 0.6,
                },
              ]}
            >
              / {total}
            </Text>

            {/* 百分比显示 */}
            {showPercentage && (
              <Animated.Text
                style={[
                  styles.percentage,
                  {
                    fontSize: sizeConfig.fontSize * 0.6,
                    color: color,
                  },
                ]}
              >
                {progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, percentage],
                  extrapolate: 'clamp',
                })}%
              </Animated.Text>
            )}
          </View>
        </View>

        {/* 进度条装饰 */}
        <View style={styles.decorations}>
          {Array.from({ length: 8 }, (_, index) => {
            const angle = (index * 45) * (Math.PI / 180);
            const isActive = (index / 8) <= (percentage / 100);
            
            return (
              <Animated.View
                key={index}
                style={[
                  styles.decoration,
                  {
                    backgroundColor: isActive ? color : backgroundColor,
                    transform: [
                      {
                        translateX: Math.cos(angle) * (sizeConfig.circleSize / 2 + 15),
                      },
                      {
                        translateY: Math.sin(angle) * (sizeConfig.circleSize / 2 + 15),
                      },
                      {
                        scale: progressAnim.interpolate({
                          inputRange: [0, (index + 1) / 8],
                          outputRange: [0.3, isActive ? 1 : 0.3],
                          extrapolate: 'clamp',
                        }),
                      },
                    ],
                  },
                ]}
              />
            );
          })}
        </View>
      </View>

      {/* 副标题 */}
      {subtitle && (
        <Text
          style={[
            styles.subtitle,
            {
              fontSize: sizeConfig.fontSize * 0.8,
              color: KEYWORD_WALL_THEME.colors.text,
              opacity: 0.7,
              marginTop: 12,
            },
          ]}
        >
          {subtitle}
        </Text>
      )}

      {/* 里程碑指示器 */}
      <View style={styles.milestones}>
        {[25, 50, 75, 100].map((milestone) => (
          <View
            key={milestone}
            style={[
              styles.milestone,
              {
                backgroundColor: percentage >= milestone ? color : backgroundColor,
                opacity: percentage >= milestone ? 1 : 0.3,
              },
            ]}
          >
            <Text
              style={[
                styles.milestoneText,
                {
                  color: percentage >= milestone ? '#FFFFFF' : KEYWORD_WALL_THEME.colors.text,
                  fontSize: 10,
                },
              ]}
            >
              {milestone}%
            </Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircle: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundCircle: {
    position: 'absolute',
  },
  progressRing: {
    position: 'absolute',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressNumber: {
    fontWeight: 'bold',
  },
  totalNumber: {
    fontWeight: 'normal',
  },
  percentage: {
    fontWeight: '600',
    marginTop: 2,
  },
  decorations: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  decoration: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  subtitle: {
    textAlign: 'center',
    fontWeight: 'normal',
  },
  milestones: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  milestone: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  milestoneText: {
    fontWeight: '600',
  },
});

export default ProgressIndicator;
