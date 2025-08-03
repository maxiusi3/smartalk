import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { AnalyticsService } from '@/services/AnalyticsService';
import { UserService, PlacementTestResult } from '@/services/UserService';

type PlacementTestNavigationProp = StackNavigationProp<RootStackParamList>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ListeningQuestion {
  id: string;
  audioUrl: string;
  options: {
    id: string;
    imageUrl: string;
    text: string;
  }[];
  correctAnswer: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2';
}

interface SpeakingQuestion {
  id: string;
  text: string;
  expectedPhonemes: string[];
  difficulty: 'A1' | 'A2' | 'B1' | 'B2';
}

const PlacementTestScreen: React.FC = () => {
  const navigation = useNavigation<PlacementTestNavigationProp>();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testType, setTestType] = useState<'listening' | 'speaking'>('listening');
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(180); // 3分钟
  const [isRecording, setIsRecording] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const userService = UserService.getInstance();
  const analyticsService = AnalyticsService.getInstance();

  // 听力测试题目（3题）
  const listeningQuestions: ListeningQuestion[] = [
    {
      id: 'listen_1',
      audioUrl: '/audio/placement/hello_how_are_you.mp3',
      options: [
        { id: 'a', imageUrl: '/images/placement/greeting.png', text: '问候' },
        { id: 'b', imageUrl: '/images/placement/shopping.png', text: '购物' },
        { id: 'c', imageUrl: '/images/placement/eating.png', text: '用餐' },
      ],
      correctAnswer: 'a',
      difficulty: 'A1',
    },
    {
      id: 'listen_2',
      audioUrl: '/audio/placement/weather_conversation.mp3',
      options: [
        { id: 'a', imageUrl: '/images/placement/weather.png', text: '天气' },
        { id: 'b', imageUrl: '/images/placement/travel.png', text: '旅行' },
        { id: 'c', imageUrl: '/images/placement/work.png', text: '工作' },
      ],
      correctAnswer: 'a',
      difficulty: 'A2',
    },
    {
      id: 'listen_3',
      audioUrl: '/audio/placement/business_meeting.mp3',
      options: [
        { id: 'a', imageUrl: '/images/placement/family.png', text: '家庭' },
        { id: 'b', imageUrl: '/images/placement/business.png', text: '商务' },
        { id: 'c', imageUrl: '/images/placement/hobby.png', text: '爱好' },
      ],
      correctAnswer: 'b',
      difficulty: 'B1',
    },
  ];

  // 口语测试题目（2题）
  const speakingQuestions: SpeakingQuestion[] = [
    {
      id: 'speak_1',
      text: 'Hello, how are you today?',
      expectedPhonemes: ['h', 'ə', 'l', 'oʊ', 'h', 'aʊ', 'ɑr', 'ju', 't', 'ə', 'd', 'eɪ'],
      difficulty: 'A1',
    },
    {
      id: 'speak_2',
      text: 'I would like to make a reservation for dinner.',
      expectedPhonemes: ['aɪ', 'w', 'ʊ', 'd', 'l', 'aɪ', 'k', 't', 'ə', 'm', 'eɪ', 'k'],
      difficulty: 'B1',
    },
  ];

  useEffect(() => {
    // 开始计时器
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 记录测试开始事件
    analyticsService.track('placement_test_started', {
      timestamp: Date.now(),
    });

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // 更新进度条
    const totalQuestions = listeningQuestions.length + speakingQuestions.length;
    const currentProgress = currentQuestionIndex / totalQuestions;
    
    Animated.timing(progressAnim, {
      toValue: currentProgress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentQuestionIndex]);

  const handleTimeUp = () => {
    Alert.alert(
      '时间到',
      '测试时间已结束，将根据已完成的题目进行评估。',
      [{ text: '确定', onPress: calculateResults }]
    );
  };

  const handleListeningAnswer = (questionId: string, answerId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId,
    }));

    // 动画过渡到下一题
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      if (currentQuestionIndex < listeningQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // 切换到口语测试
        setTestType('speaking');
        setCurrentQuestionIndex(0);
      }
    }, 200);
  };

  const handleSpeakingComplete = (questionId: string, audioData: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: audioData,
    }));

    if (currentQuestionIndex < speakingQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // 测试完成
      calculateResults();
    }
  };

  const calculateResults = async () => {
    try {
      // 计算听力得分
      let listeningScore = 0;
      listeningQuestions.forEach(question => {
        if (answers[question.id] === question.correctAnswer) {
          listeningScore += question.difficulty === 'A1' ? 20 : 
                          question.difficulty === 'A2' ? 25 : 30;
        }
      });

      // 模拟发音得分（实际应用中会调用发音API）
      const pronunciationScore = Math.random() * 40 + 60; // 60-100分

      // 计算词汇得分（基于难度）
      const vocabularyScore = Math.random() * 30 + 70; // 70-100分

      // 计算总分
      const overallScore = (listeningScore + pronunciationScore + vocabularyScore) / 3;

      // 确定CEFR等级
      let cefrLevel = 'A1';
      if (overallScore >= 85) cefrLevel = 'B2';
      else if (overallScore >= 75) cefrLevel = 'B1';
      else if (overallScore >= 65) cefrLevel = 'A2';

      const result: PlacementTestResult = {
        cefrLevel,
        pronunciationScore,
        listeningScore,
        vocabularyScore,
        overallScore,
      };

      // 保存结果
      await userService.savePlacementTestResult(result);

      // 显示结果
      setShowResults(true);

    } catch (error) {
      console.error('Error calculating results:', error);
      Alert.alert('错误', '计算结果时出现问题，请重试。');
    }
  };

  const handleSkip = () => {
    Alert.alert(
      '跳过测试',
      '跳过测试将默认设置为A1级别，您可以稍后在设置中重新测试。',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '跳过', 
          onPress: async () => {
            const defaultResult: PlacementTestResult = {
              cefrLevel: 'A1',
              pronunciationScore: 70,
              listeningScore: 70,
              vocabularyScore: 70,
              overallScore: 70,
            };
            await userService.savePlacementTestResult(defaultResult);
            navigation.replace('InterestSelection');
          }
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderListeningQuestion = () => {
    const question = listeningQuestions[currentQuestionIndex];
    
    return (
      <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
        <Text style={styles.questionTitle}>听短句选图</Text>
        <Text style={styles.questionSubtitle}>听音频，选择最符合内容的图片</Text>
        
        {/* 音频播放按钮 */}
        <TouchableOpacity style={styles.audioButton}>
          <Text style={styles.audioButtonText}>🔊 播放音频</Text>
        </TouchableOpacity>

        {/* 选项 */}
        <View style={styles.optionsContainer}>
          {question.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={() => handleListeningAnswer(question.id, option.id)}
            >
              <View style={styles.optionImageContainer}>
                <Text style={styles.optionImagePlaceholder}>📷</Text>
              </View>
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderSpeakingQuestion = () => {
    const question = speakingQuestions[currentQuestionIndex];
    
    return (
      <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
        <Text style={styles.questionTitle}>跟读句子</Text>
        <Text style={styles.questionSubtitle}>大声朗读下面的句子</Text>
        
        <View style={styles.sentenceContainer}>
          <Text style={styles.sentenceText}>{question.text}</Text>
        </View>

        {/* 录音按钮 */}
        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordButtonActive]}
          onPress={() => {
            setIsRecording(!isRecording);
            // 这里应该集成录音功能
            setTimeout(() => {
              setIsRecording(false);
              handleSpeakingComplete(question.id, { recorded: true });
            }, 3000);
          }}
        >
          <Text style={styles.recordButtonText}>
            {isRecording ? '🎤 录音中...' : '🎤 开始录音'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (showResults) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>测试完成！</Text>
            <Text style={styles.resultsSubtitle}>您的英语水平评估结果</Text>
            
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>CEFR Level</Text>
              <Text style={styles.levelValue}>A2</Text>
            </View>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => navigation.replace('InterestSelection')}
            >
              <Text style={styles.continueButtonText}>继续选择主题</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {currentQuestionIndex + 1} / {listeningQuestions.length + speakingQuestions.length}
            </Text>
          </View>
          
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
          </View>
          
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>跳过</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {testType === 'listening' ? renderListeningQuestion() : renderSpeakingQuestion()}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  progressContainer: {
    flex: 1,
    marginRight: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  timerContainer: {
    marginRight: 16,
  },
  timerText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  questionSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 40,
  },
  audioButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 40,
  },
  audioButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  optionCard: {
    width: screenWidth * 0.25,
    alignItems: 'center',
    marginBottom: 20,
  },
  optionImageContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionImagePlaceholder: {
    fontSize: 32,
  },
  optionText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    fontWeight: '500',
  },
  sentenceContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sentenceText: {
    fontSize: 20,
    color: '#1e293b',
    textAlign: 'center',
    lineHeight: 28,
  },
  recordButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignSelf: 'center',
  },
  recordButtonActive: {
    backgroundColor: '#dc2626',
  },
  recordButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  resultsTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  resultsSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 40,
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 24,
    paddingHorizontal: 48,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 60,
  },
  levelText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  levelValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  continueButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
  },
  continueButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PlacementTestScreen;
