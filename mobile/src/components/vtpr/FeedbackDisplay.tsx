import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { FeedbackDisplayProps, FeedbackType } from '@/types/vtpr.types';
import { VTPR_THEME, VTPR_TEXTS } from '@/constants/vtpr';
import { getFeedbackMessage, getProgressiveEncouragement, getStreakCelebration } from '../../../shared/constants/emotionalFeedback';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * FeedbackDisplay组件
 * 显示学习反馈信息，支持正确/错误/鼓励等不同类型的反馈
 */
const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({
  type,
  message,
  visible,
  duration = 2000,
  onHide,
  showAnimation = true,
  customStyle,
  attemptCount = 1,
  streakCount = 0,
  isFirstCorrect = false,
  context = 'learning',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      showFeedback();
    } else {
      hideFeedback();
    }
  }, [visible]);

  /**
   * 显示反馈动画
   */
  const showFeedback = () => {
    if (showAnimation) {
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
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // 自动隐藏
      if (duration > 0) {
        setTimeout(() => {
          hideFeedback();
        }, duration);
      }
    } else {
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
      slideAnim.setValue(0);
    }
  };

  /**
   * 隐藏反馈动画
   */
  const hideFeedback = () => {
    if (showAnimation) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 30,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide?.();
      });
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      slideAnim.setValue(50);
      onHide?.();
    }
  };

  /**
   * 获取情感化反馈配置
   */
  const getEmotionalFeedbackConfig = (feedbackType: FeedbackType) => {
    let emotionalFeedback;

    switch (feedbackType) {
      case 'correct':
        if (streakCount > 0) {
          emotionalFeedback = getStreakCelebration(streakCount);
        } else if (isFirstCorrect) {
          emotionalFeedback = getFeedbackMessage('success', 'FIRST_CORRECT');
        } else {
          emotionalFeedback = getFeedbackMessage('success', 'FIRST_CORRECT');
        }
        return {
          emoji: emotionalFeedback.emoji || '🎉',
          backgroundColor: VTPR_THEME.colors.correct + '20',
          borderColor: VTPR_THEME.colors.correct,
          textColor: VTPR_THEME.colors.correct,
          title: emotionalFeedback.title,
          defaultMessage: emotionalFeedback.message,
        };

      case 'incorrect':
        emotionalFeedback = getProgressiveEncouragement(attemptCount);
        return {
          emoji: emotionalFeedback.emoji || '💡',
          backgroundColor: VTPR_THEME.colors.background,
          borderColor: VTPR_THEME.colors.neutral,
          textColor: VTPR_THEME.colors.text,
          title: emotionalFeedback.title,
          defaultMessage: emotionalFeedback.message,
        };

      case 'encouragement':
        emotionalFeedback = getFeedbackMessage('encouragement', 'BRAIN_SCIENCE');
        return {
          emoji: emotionalFeedback.emoji || '🌟',
          backgroundColor: VTPR_THEME.colors.secondary + '20',
          borderColor: VTPR_THEME.colors.secondary,
          textColor: VTPR_THEME.colors.secondary,
          title: emotionalFeedback.title,
          defaultMessage: emotionalFeedback.message,
        };

      case 'milestone':
        emotionalFeedback = getFeedbackMessage('success', 'LEVEL_COMPLETE');
        return {
          emoji: emotionalFeedback.emoji || '🏆',
          backgroundColor: VTPR_THEME.colors.primary + '20',
          borderColor: VTPR_THEME.colors.primary,
          textColor: VTPR_THEME.colors.primary,
          title: emotionalFeedback.title,
          defaultMessage: emotionalFeedback.message,
        };

      default:
        return {
          emoji: 'ℹ️',
          backgroundColor: VTPR_THEME.colors.neutral + '20',
          borderColor: VTPR_THEME.colors.neutral,
          textColor: VTPR_THEME.colors.text,
          title: '提示',
          defaultMessage: '信息提示',
        };
    }
  };

  const config = getEmotionalFeedbackConfig(type);
  const displayMessage = message || config.defaultMessage;

  if (!visible && fadeAnim._value === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: config.backgroundColor,
            borderColor: config.borderColor,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim },
            ],
          },
          customStyle,
        ]}
      >
        {/* 表情图标 */}
        <Text style={styles.emoji}>{config.emoji}</Text>

        {/* 反馈标题 */}
        {config.title && (
          <Text style={[styles.title, { color: config.textColor }]}>
            {config.title}
          </Text>
        )}

        {/* 反馈文本 */}
        <Text
          style={[
            styles.message,
            { color: config.textColor },
          ]}
        >
          {displayMessage}
        </Text>

        {/* 额外的鼓励文本（仅在错误时显示） */}
        {type === 'incorrect' && (
          <Text style={styles.encouragementText}>
            {VTPR_TEXTS.feedback.encouragement}
          </Text>
        )}

        {/* 进度指示器（仅在里程碑时显示） */}
        {type === 'milestone' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
            <Text style={styles.progressText}>学习完成</Text>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1000,
  },
  container: {
    maxWidth: screenWidth * 0.8,
    minWidth: screenWidth * 0.6,
    paddingHorizontal: VTPR_THEME.spacing.xlarge,
    paddingVertical: VTPR_THEME.spacing.large,
    borderRadius: VTPR_THEME.borderRadius.large,
    borderWidth: 2,
    alignItems: 'center',
    ...VTPR_THEME.shadows.large,
  },
  emoji: {
    fontSize: 48,
    marginBottom: VTPR_THEME.spacing.medium,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: VTPR_THEME.spacing.small,
    paddingHorizontal: VTPR_THEME.spacing.medium,
  },
  message: {
    fontSize: VTPR_THEME.fonts.feedback.fontSize,
    fontWeight: VTPR_THEME.fonts.feedback.fontWeight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: VTPR_THEME.spacing.small,
    paddingHorizontal: VTPR_THEME.spacing.medium,
    opacity: 0.9,
  },
  encouragementText: {
    fontSize: VTPR_THEME.fonts.body.fontSize,
    color: VTPR_THEME.colors.text,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 20,
  },
  progressContainer: {
    width: '100%',
    marginTop: VTPR_THEME.spacing.medium,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: VTPR_THEME.colors.neutral + '30',
    borderRadius: 3,
    marginBottom: VTPR_THEME.spacing.small,
  },
  progressFill: {
    width: '100%',
    height: '100%',
    backgroundColor: VTPR_THEME.colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: VTPR_THEME.fonts.caption.fontSize,
    color: VTPR_THEME.colors.text,
    opacity: 0.7,
  },
});

export default FeedbackDisplay;