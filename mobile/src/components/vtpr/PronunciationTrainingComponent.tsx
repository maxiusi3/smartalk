import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { AnalyticsService } from '@/services/AnalyticsService';
import PronunciationHelpModal from './PronunciationHelpModal';

interface Keyword {
  id: string;
  word: string;
  translation: string;
  audioUrl: string;
  pronunciation?: string;
  phoneticTips?: string[];
  contextClues?: string[];
  rescueVideoUrl?: string;
}

interface PronunciationTrainingProps {
  keyword: Keyword;
  dramaId: string;
  onComplete: (success: boolean, score?: number) => void;
  onRescueModeTriggered?: () => void;
}

/**
 * PronunciationTrainingComponent - V2 发音训练组件
 * 专门处理跟读训练阶段，包含Rescue Mode触发逻辑
 */
const PronunciationTrainingComponent: React.FC<PronunciationTrainingProps> = ({
  keyword,
  dramaId,
  onComplete,
  onRescueModeTriggered,
}) => {
  const [pronunciationAttempts, setPronunciationAttempts] = useState(0);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [rescueModeActive, setRescueModeActive] = useState(false);
  const [showPronunciationHelp, setShowPronunciationHelp] = useState(false);
  const [isAssessing, setIsAssessing] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recordingAnim = useRef(new Animated.Value(0)).current;

  const analyticsService = AnalyticsService.getInstance();

  useEffect(() => {
    // 记录发音训练开始
    analyticsService.track('pronunciation_training_started', {
      dramaId,
      keywordId: keyword.id,
      timestamp: Date.now(),
    });
  }, []);

  // V2: Rescue Mode触发逻辑（3次连续失败）
  useEffect(() => {
    if (consecutiveFailures >= 3 && !rescueModeActive) {
      triggerRescueMode();
    }
  }, [consecutiveFailures, rescueModeActive]);

  const triggerRescueMode = () => {
    setRescueModeActive(true);
    onRescueModeTriggered?.();
    
    analyticsService.track('rescue_mode_triggered', {
      dramaId,
      keywordId: keyword.id,
      consecutiveFailures,
      pronunciationAttempts,
      timestamp: Date.now(),
    });

    Alert.alert(
      '🆘 发音救援',
      '没关系！每个人的学习节奏都不同。我们来提供一些帮助：',
      [
        {
          text: '👄 看口型视频',
          onPress: () => setShowPronunciationHelp(true),
        },
        {
          text: '🎵 听发音技巧',
          onPress: () => showPronunciationTips(),
        },
        {
          text: '继续尝试',
          style: 'cancel',
          onPress: () => {},
        },
      ]
    );
  };

  const showPronunciationTips = () => {
    Alert.alert(
      '🎵 发音小贴士',
      `"${keyword.word}"\n\n${keyword.phoneticTips?.join('\n') || '专注于重音和语调，多听几遍原音。'}`,
      [{ text: '明白了', onPress: () => {} }]
    );
    
    analyticsService.track('pronunciation_tips_shown', {
      dramaId,
      keywordId: keyword.id,
      timestamp: Date.now(),
    });
  };

  const startRecording = () => {
    setIsRecording(true);
    setPronunciationAttempts(prev => prev + 1);
    
    // 开始录音动画
    Animated.loop(
      Animated.sequence([
        Animated.timing(recordingAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(recordingAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 模拟录音过程（3秒）
    setTimeout(() => {
      stopRecording();
    }, 3000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    recordingAnim.stopAnimation();
    recordingAnim.setValue(0);
    
    // 开始发音评估
    performPronunciationAssessment();
  };

  const performPronunciationAssessment = async () => {
    setIsAssessing(true);
    
    try {
      // 模拟发音评估API调用（实际应用中集成讯飞/ELSA API）
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟评分（在Rescue Mode下给予更宽松的评分）
      const baseScore = Math.random() * 40 + 40; // 40-80分基础分
      const rescueBonus = rescueModeActive ? 20 : 0; // Rescue Mode下额外20分
      const finalScore = Math.min(100, baseScore + rescueBonus);
      
      setLastScore(finalScore);
      
      analyticsService.track('pronunciation_assessment_completed', {
        dramaId,
        keywordId: keyword.id,
        score: finalScore,
        attemptNumber: pronunciationAttempts,
        rescueModeActive,
        timestamp: Date.now(),
      });
      
      handleAssessmentResult(finalScore);
      
    } catch (error) {
      console.error('Pronunciation assessment error:', error);
      Alert.alert('评估暂时不可用', '请继续学习，稍后再试。');
    } finally {
      setIsAssessing(false);
    }
  };

  const handleAssessmentResult = (score: number) => {
    const passThreshold = rescueModeActive ? 60 : 70; // Rescue Mode下降低通过标准
    
    if (score >= passThreshold) {
      // 发音通过
      setConsecutiveFailures(0);
      
      Alert.alert(
        '太棒了！🎉',
        `发音得分：${Math.round(score)}分\n${rescueModeActive ? '在帮助下完成得很好！' : '你的发音很标准！'}`,
        [
          {
            text: '继续',
            onPress: () => onComplete(true, score),
          },
        ]
      );
      
    } else {
      // 发音未通过
      setConsecutiveFailures(prev => prev + 1);
      
      const encouragingMessages = [
        '继续加油！多听原音，注意模仿语调。',
        '不错的尝试！再练习几次会更好。',
        '很好的努力！注意重音的位置。',
      ];
      
      const message = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
      
      Alert.alert(
        '继续努力！💪',
        `发音得分：${Math.round(score)}分\n${message}`,
        [
          {
            text: '再试一次',
            onPress: () => {},
          },
        ]
      );
    }
  };

  const renderRecordingButton = () => (
    <Animated.View
      style={[
        styles.recordingButtonContainer,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.recordingButton,
          isRecording && styles.recordingButtonActive,
        ]}
        onPress={isRecording ? undefined : startRecording}
        disabled={isAssessing}
      >
        <Animated.View
          style={[
            styles.recordingIndicator,
            {
              opacity: recordingAnim,
            },
          ]}
        />
        <Text style={styles.recordingButtonText}>
          {isRecording ? '🎤 录音中...' : isAssessing ? '⏳ 评估中...' : '🎤 开始跟读'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderScoreDisplay = () => {
    if (lastScore === null) return null;
    
    return (
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreTitle}>上次得分</Text>
        <Text style={[
          styles.scoreValue,
          lastScore >= 70 ? styles.scoreGood : styles.scoreNeedsWork
        ]}>
          {Math.round(lastScore)}分
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 单词显示 */}
      <View style={styles.wordContainer}>
        <Text style={styles.word}>{keyword.word}</Text>
        <Text style={styles.translation}>{keyword.translation}</Text>
        {keyword.pronunciation && (
          <Text style={styles.pronunciation}>{keyword.pronunciation}</Text>
        )}
      </View>

      {/* 指导文本 */}
      <Text style={styles.instructionText}>
        🎧 先听音频，然后大声跟读
      </Text>

      {/* 录音按钮 */}
      {renderRecordingButton()}

      {/* 得分显示 */}
      {renderScoreDisplay()}

      {/* 统计信息 */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          尝试次数: {pronunciationAttempts}
        </Text>
        {rescueModeActive && (
          <Text style={styles.rescueModeText}>
            🆘 救援模式已激活
          </Text>
        )}
      </View>

      {/* 发音帮助模态框 */}
      <PronunciationHelpModal
        visible={showPronunciationHelp}
        keyword={keyword}
        onClose={() => setShowPronunciationHelp(false)}
        onPronunciationAssessment={() => {
          setShowPronunciationHelp(false);
          startRecording();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  wordContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    width: '100%',
  },
  word: {
    fontSize: 32,
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
  instructionText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  recordingButtonContainer: {
    marginBottom: 24,
  },
  recordingButton: {
    backgroundColor: '#10b981',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 50,
    alignItems: 'center',
    minWidth: 200,
    position: 'relative',
  },
  recordingButtonActive: {
    backgroundColor: '#ef4444',
  },
  recordingIndicator: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 54,
    borderWidth: 3,
    borderColor: '#ef4444',
  },
  recordingButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    minWidth: 120,
  },
  scoreTitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreGood: {
    color: '#10b981',
  },
  scoreNeedsWork: {
    color: '#f59e0b',
  },
  statsContainer: {
    alignItems: 'center',
    gap: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#64748b',
  },
  rescueModeText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
});

export default PronunciationTrainingComponent;
