/**
 * 情感化成就确认模态框
 * 使用温暖、鼓励性的文案庆祝用户成就
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { getFeedbackMessage, getStreakCelebration } from '../../../shared/constants/emotionalFeedback';

const { width, height } = Dimensions.get('window');

export interface Achievement {
  id: string;
  type: 'streak' | 'completion' | 'milestone' | 'first_time';
  title: string;
  description: string;
  value?: number; // 连击数、完成数等
  emoji?: string;
}

export interface EmotionalAchievementModalProps {
  visible: boolean;
  achievement: Achievement | null;
  onClose: () => void;
  onContinue?: () => void;
}

const EmotionalAchievementModal: React.FC<EmotionalAchievementModalProps> = ({
  visible,
  achievement,
  onClose,
  onContinue,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && achievement) {
      // 入场动画
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 3 }
        ),
      ]).start();
    } else {
      // 重置动画
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      bounceAnim.setValue(0);
    }
  }, [visible, achievement]);

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    }
    handleClose();
  };

  if (!achievement) return null;

  // 获取情感化反馈文案
  const getEmotionalContent = () => {
    switch (achievement.type) {
      case 'streak':
        return getStreakCelebration(achievement.value || 1);
      case 'completion':
        return getFeedbackMessage('success', 'LEVEL_COMPLETE');
      case 'milestone':
        return getFeedbackMessage('success', 'PERFECT_ROUND');
      case 'first_time':
        return getFeedbackMessage('success', 'FIRST_CORRECT');
      default:
        return getFeedbackMessage('success', 'FIRST_CORRECT');
    }
  };

  const emotionalContent = getEmotionalContent();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <SafeAreaView style={styles.container}>
          <Animated.View
            style={[
              styles.modal,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* 庆祝动画背景 */}
            <View style={styles.celebrationBackground}>
              <Animated.Text
                style={[
                  styles.celebrationEmoji,
                  {
                    transform: [
                      {
                        scale: bounceAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.2],
                        }),
                      },
                    ],
                  },
                ]}
              >
                ✨
              </Animated.Text>
              <Animated.Text
                style={[
                  styles.celebrationEmoji,
                  styles.celebrationEmojiRight,
                  {
                    transform: [
                      {
                        scale: bounceAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                🎉
              </Animated.Text>
            </View>

            {/* 主要内容 */}
            <View style={styles.content}>
              {/* 成就图标 */}
              <View style={styles.iconContainer}>
                <Text style={styles.achievementEmoji}>
                  {emotionalContent.emoji || achievement.emoji || '🏆'}
                </Text>
              </View>

              {/* 情感化标题 */}
              <Text style={styles.emotionalTitle}>
                {emotionalContent.title}
              </Text>

              {/* 成就描述 */}
              <Text style={styles.achievementTitle}>
                {achievement.title}
              </Text>

              {/* 情感化描述 */}
              <Text style={styles.emotionalDescription}>
                {emotionalContent.message}
              </Text>

              {/* 成就详情 */}
              {achievement.description && (
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
              )}

              {/* 数值显示 */}
              {achievement.value && achievement.type === 'streak' && (
                <View style={styles.valueContainer}>
                  <Text style={styles.valueNumber}>{achievement.value}</Text>
                  <Text style={styles.valueLabel}>连续正确</Text>
                </View>
              )}
            </View>

            {/* 操作按钮 */}
            <View style={styles.buttonContainer}>
              {onContinue && (
                <TouchableOpacity
                  style={[styles.button, styles.continueButton]}
                  onPress={handleContinue}
                >
                  <Text style={styles.continueButtonText}>继续探索</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.button, styles.closeButton]}
                onPress={handleClose}
              >
                <Text style={styles.closeButtonText}>
                  {onContinue ? '稍后继续' : '太棒了！'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: width * 0.9,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  celebrationBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationEmoji: {
    fontSize: 40,
    position: 'absolute',
    top: 20,
    left: 20,
  },
  celebrationEmojiRight: {
    top: 30,
    right: 20,
    left: 'auto',
  },
  content: {
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: '#4A90E2',
  },
  achievementEmoji: {
    fontSize: 48,
  },
  emotionalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A90E2',
    textAlign: 'center',
    marginBottom: 16,
  },
  emotionalDescription: {
    fontSize: 16,
    color: '#34495E',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  valueContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  valueNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  valueLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#4A90E2',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#ECF0F1',
  },
  closeButtonText: {
    color: '#2C3E50',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EmotionalAchievementModal;
