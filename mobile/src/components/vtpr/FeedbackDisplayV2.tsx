import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface Keyword {
  id: string;
  word: string;
  translation: string;
  pronunciation?: string;
  phoneticTips?: string[];
  contextClues?: string[];
}

interface FeedbackDisplayProps {
  type: 'correct' | 'incorrect';
  keyword: Keyword;
  aquaPointsEarned?: number;
  onAnimationComplete?: () => void;
}

/**
 * FeedbackDisplay组件 - V2增强版
 * 显示正确/错误反馈，支持Aqua积分奖励和鼓励性文案
 */
const FeedbackDisplayV2: React.FC<FeedbackDisplayProps> = ({
  type,
  keyword,
  aquaPointsEarned = 0,
  onAnimationComplete,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pointsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 入场动画
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
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

    // 如果有积分奖励，播放积分动画
    if (aquaPointsEarned > 0) {
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(pointsAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(pointsAnim, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(pointsAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }, 500);
    }

    // 自动消失
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onAnimationComplete?.();
      });
    }, type === 'correct' ? 2000 : 1500);

    return () => clearTimeout(timer);
  }, [type, aquaPointsEarned]);

  const renderCorrectFeedback = () => (
    <View style={styles.correctContainer}>
      {/* 成功图标 */}
      <View style={styles.iconContainer}>
        <Text style={styles.correctIcon}>🎉</Text>
      </View>

      {/* 成功消息 */}
      <Text style={styles.correctTitle}>Perfect!</Text>
      <Text style={styles.correctSubtitle}>你的大脑正在建立连接！</Text>

      {/* 单词信息 */}
      <View style={styles.wordInfo}>
        <Text style={styles.word}>{keyword.word}</Text>
        <Text style={styles.translation}>{keyword.translation}</Text>
        {keyword.pronunciation && (
          <Text style={styles.pronunciation}>{keyword.pronunciation}</Text>
        )}
      </View>

      {/* Aqua积分奖励 */}
      {aquaPointsEarned > 0 && (
        <Animated.View
          style={[
            styles.pointsReward,
            {
              opacity: pointsAnim,
              transform: [{ scale: pointsAnim }],
            },
          ]}
        >
          <Text style={styles.pointsIcon}>💧</Text>
          <Text style={styles.pointsText}>+{aquaPointsEarned} Aqua-Points</Text>
        </Animated.View>
      )}

      {/* 鼓励性文案 */}
      <Text style={styles.encouragementText}>
        太棒了！继续保持这个节奏！
      </Text>
    </View>
  );

  const renderIncorrectFeedback = () => (
    <View style={styles.incorrectContainer}>
      {/* 思考图标 */}
      <View style={styles.iconContainer}>
        <Text style={styles.incorrectIcon}>🤔</Text>
      </View>

      {/* 鼓励消息 */}
      <Text style={styles.incorrectTitle}>再想想？</Text>
      <Text style={styles.incorrectSubtitle}>你的大脑正在建立连接！</Text>

      {/* 提示信息 */}
      {keyword.contextClues && keyword.contextClues.length > 0 && (
        <View style={styles.hintsContainer}>
          <Text style={styles.hintsTitle}>💡 小提示：</Text>
          {JSON.parse(keyword.contextClues[0] || '[]').map((clue: string, index: number) => (
            <Text key={index} style={styles.hintText}>• {clue}</Text>
          ))}
        </View>
      )}

      {/* 鼓励性文案 */}
      <Text style={styles.encouragementText}>
        没关系，学习就是这样的过程！
      </Text>
    </View>
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: slideAnim },
          ],
        },
      ]}
    >
      {type === 'correct' ? renderCorrectFeedback() : renderIncorrectFeedback()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '30%',
    left: 24,
    right: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 1000,
  },
  correctContainer: {
    alignItems: 'center',
  },
  incorrectContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  correctIcon: {
    fontSize: 48,
  },
  incorrectIcon: {
    fontSize: 48,
  },
  correctTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
  },
  incorrectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 8,
  },
  correctSubtitle: {
    fontSize: 16,
    color: '#059669',
    marginBottom: 20,
    textAlign: 'center',
  },
  incorrectSubtitle: {
    fontSize: 16,
    color: '#d97706',
    marginBottom: 20,
    textAlign: 'center',
  },
  wordInfo: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    width: '100%',
  },
  word: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  translation: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 4,
  },
  pronunciation: {
    fontSize: 16,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  pointsReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  pointsIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  hintsContainer: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  hintsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  hintText: {
    fontSize: 14,
    color: '#a16207',
    marginBottom: 4,
    lineHeight: 20,
  },
  encouragementText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});

export default FeedbackDisplayV2;
