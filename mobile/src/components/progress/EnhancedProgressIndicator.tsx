/**
 * 增强的故事线索发现进度指示器
 * 提供更丰富的视觉反馈和情感化表达
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

const { width } = Dimensions.get('window');

export interface EnhancedProgressProps {
  current: number;
  total: number;
  title?: string;
  subtitle?: string;
  showDetails?: boolean;
  onPress?: () => void;
  theme?: 'story' | 'achievement' | 'exploration';
  animationDuration?: number;
}

const EnhancedProgressIndicator: React.FC<EnhancedProgressProps> = ({
  current,
  total,
  title = '故事线索发现进度',
  subtitle,
  showDetails = true,
  onPress,
  theme = 'story',
  animationDuration = 1000,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const progress = Math.min(current / total, 1);
  const percentage = Math.round(progress * 100);

  useEffect(() => {
    // 进度条动画
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: animationDuration,
      useNativeDriver: false,
    }).start();

    // 如果达到里程碑，播放庆祝动画
    if (current > 0 && current % 5 === 0) {
      playMilestoneAnimation();
    }

    // 如果完成，播放完成动画
    if (current === total) {
      playCompletionAnimation();
    }
  }, [current, total]);

  const playMilestoneAnimation = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const playCompletionAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      { iterations: 3 }
    ).start();
  };

  const getThemeColors = () => {
    switch (theme) {
      case 'story':
        return {
          primary: '#4A90E2',
          secondary: '#7BB3F0',
          background: '#F0F8FF',
          text: '#2C3E50',
        };
      case 'achievement':
        return {
          primary: '#F39C12',
          secondary: '#F7DC6F',
          background: '#FEF9E7',
          text: '#8B4513',
        };
      case 'exploration':
        return {
          primary: '#27AE60',
          secondary: '#58D68D',
          background: '#E8F8F5',
          text: '#1B4F3C',
        };
      default:
        return {
          primary: '#4A90E2',
          secondary: '#7BB3F0',
          background: '#F0F8FF',
          text: '#2C3E50',
        };
    }
  };

  const colors = getThemeColors();

  const getProgressMessage = () => {
    if (current === 0) {
      return '开始你的故事探索之旅！';
    } else if (current === total) {
      return '🎉 所有线索都被你发现了！';
    } else if (progress >= 0.8) {
      return '就差一点点了，加油！';
    } else if (progress >= 0.5) {
      return '你已经发现了一半的秘密！';
    } else if (progress >= 0.2) {
      return '很好的开始，继续探索！';
    } else {
      return '每个线索都让你更接近真相！';
    }
  };

  const renderProgressBar = () => (
    <View style={[styles.progressBarContainer, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[
          styles.progressBar,
          {
            backgroundColor: colors.primary,
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.progressGlow,
          {
            backgroundColor: colors.secondary,
            opacity: glowAnim,
          },
        ]}
      />
    </View>
  );

  const renderCircularProgress = () => (
    <View style={styles.circularContainer}>
      <View style={[styles.circularBackground, { borderColor: colors.background }]}>
        <Animated.View
          style={[
            styles.circularProgress,
            {
              borderColor: colors.primary,
              transform: [
                {
                  rotate: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
        <View style={styles.circularCenter}>
          <Text style={[styles.percentageText, { color: colors.text }]}>
            {percentage}%
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: colors.primary }]}>{current}</Text>
        <Text style={[styles.statLabel, { color: colors.text }]}>已发现</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: colors.text }]}>{total - current}</Text>
        <Text style={[styles.statLabel, { color: colors.text }]}>待发现</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: colors.secondary }]}>{total}</Text>
        <Text style={[styles.statLabel, { color: colors.text }]}>总计</Text>
      </View>
    </View>
  );

  const content = (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.background },
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      {/* 标题区域 */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.text }]}>{subtitle}</Text>
        )}
      </View>

      {/* 进度显示 */}
      <View style={styles.progressSection}>
        {renderCircularProgress()}
        {renderProgressBar()}
      </View>

      {/* 统计信息 */}
      {showDetails && renderStats()}

      {/* 鼓励消息 */}
      <Text style={[styles.message, { color: colors.text }]}>
        {getProgressMessage()}
      </Text>
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.8,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  circularContainer: {
    marginBottom: 16,
  },
  circularBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgress: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  circularCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    width: width - 80,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E0',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.9,
  },
});

export default EnhancedProgressIndicator;
