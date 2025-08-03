import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SRSService, { SRSCard, SRSAssessment } from '@/services/SRSService';
import { AnalyticsService } from '@/services/AnalyticsService';

const { width: screenWidth } = Dimensions.get('window');

interface SRSReviewScreenProps {
  sessionType?: 'daily' | 'catch_up' | 'practice';
}

/**
 * SRSReviewScreen - 间隔重复系统复习界面
 * 提供快节奏的复习体验 (2分钟5-10个单词)
 */
const SRSReviewScreen: React.FC<SRSReviewScreenProps> = ({ 
  sessionType = 'daily' 
}) => {
  const navigation = useNavigation();
  const [reviewCards, setReviewCards] = useState<SRSCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    cardsReviewed: 0,
    correctAnswers: 0,
    startTime: Date.now(),
  });
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const srsService = SRSService.getInstance();
  const analyticsService = AnalyticsService.getInstance();

  useEffect(() => {
    initializeReviewSession();
  }, []);

  const initializeReviewSession = async () => {
    try {
      setLoading(true);
      
      // 加载SRS数据
      await srsService.loadFromStorage();
      
      // 获取今日复习卡片
      const todayCards = srsService.getTodayReviewCards();
      
      if (todayCards.length === 0) {
        Alert.alert(
          '太棒了！',
          '今天没有需要复习的单词。继续保持学习习惯！',
          [
            { text: '返回', onPress: () => navigation.goBack() },
            { text: '练习模式', onPress: () => startPracticeMode() },
          ]
        );
        return;
      }

      // 限制复习数量 (5-10个单词)
      const limitedCards = todayCards.slice(0, Math.min(10, todayCards.length));
      setReviewCards(limitedCards);
      
      // 开始复习会话
      const newSessionId = srsService.startReviewSession(sessionType);
      setSessionId(newSessionId);
      
      analyticsService.track('srs_session_started', {
        sessionType,
        totalCards: limitedCards.length,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error initializing review session:', error);
      Alert.alert('错误', '初始化复习会话失败，请重试。');
    } finally {
      setLoading(false);
    }
  };

  const startPracticeMode = () => {
    // 练习模式：随机选择一些已学过的单词
    const allCards = Array.from(srsService['cards'].values());
    const practiceCards = allCards
      .filter(card => card.status !== 'new')
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    
    setReviewCards(practiceCards);
    const newSessionId = srsService.startReviewSession('practice');
    setSessionId(newSessionId);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    
    // 显示答案动画
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleAssessment = (assessment: SRSAssessment) => {
    if (!sessionId || currentCardIndex >= reviewCards.length) return;

    const currentCard = reviewCards[currentCardIndex];
    const responseTime = Date.now() - sessionStats.startTime;
    
    try {
      // 更新SRS卡片
      srsService.reviewCard(currentCard.id, assessment, responseTime);
      
      // 更新会话统计
      const isCorrect = assessment === 'good' || assessment === 'easy';
      setSessionStats(prev => ({
        ...prev,
        cardsReviewed: prev.cardsReviewed + 1,
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      }));

      // 记录分析事件
      analyticsService.track('srs_card_reviewed', {
        cardId: currentCard.id,
        word: currentCard.word,
        assessment,
        responseTime,
        isCorrect,
        timestamp: Date.now(),
      });

      // 移动到下一张卡片
      moveToNextCard();
      
    } catch (error) {
      console.error('Error processing assessment:', error);
      Alert.alert('错误', '处理复习结果失败，请重试。');
    }
  };

  const moveToNextCard = () => {
    if (currentCardIndex + 1 >= reviewCards.length) {
      // 复习完成
      completeSession();
      return;
    }

    // 重置状态
    setShowAnswer(false);
    setCurrentCardIndex(prev => prev + 1);
    setSessionStats(prev => ({ ...prev, startTime: Date.now() }));
    
    // 卡片切换动画
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const completeSession = () => {
    if (!sessionId) return;

    try {
      // 结束会话
      const completedSession = srsService.endReviewSession(sessionId);
      
      const accuracy = sessionStats.cardsReviewed > 0 
        ? Math.round((sessionStats.correctAnswers / sessionStats.cardsReviewed) * 100)
        : 0;

      analyticsService.track('srs_session_completed', {
        sessionId,
        sessionType,
        cardsReviewed: sessionStats.cardsReviewed,
        correctAnswers: sessionStats.correctAnswers,
        accuracy,
        duration: Date.now() - sessionStats.startTime,
        timestamp: Date.now(),
      });

      // 显示完成结果
      Alert.alert(
        '复习完成！',
        `太棒了！你复习了 ${sessionStats.cardsReviewed} 个单词，正确率 ${accuracy}%。\n\n继续保持这个节奏，你的英语会越来越好！`,
        [
          { text: '返回', onPress: () => navigation.goBack() },
        ]
      );
      
    } catch (error) {
      console.error('Error completing session:', error);
      navigation.goBack();
    }
  };

  const renderProgressBar = () => {
    const progress = reviewCards.length > 0 ? (currentCardIndex + 1) / reviewCards.length : 0;
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentCardIndex + 1} / {reviewCards.length}
        </Text>
      </View>
    );
  };

  const renderCard = () => {
    if (currentCardIndex >= reviewCards.length) return null;
    
    const currentCard = reviewCards[currentCardIndex];
    
    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity: fadeAnim,
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -20],
              })
            }]
          }
        ]}
      >
        {/* 单词卡片 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>听音识词</Text>
            <TouchableOpacity style={styles.audioButton}>
              <Text style={styles.audioButtonText}>🔊</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.cardContent}>
            <Text style={styles.word}>{currentCard.word}</Text>
            
            {showAnswer && (
              <Animated.View
                style={[
                  styles.answerContainer,
                  {
                    opacity: slideAnim,
                    transform: [{
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      })
                    }]
                  }
                ]}
              >
                <Text style={styles.translation}>{currentCard.translation}</Text>
              </Animated.View>
            )}
          </View>
        </View>

        {/* 操作按钮 */}
        {!showAnswer ? (
          <TouchableOpacity style={styles.showAnswerButton} onPress={handleShowAnswer}>
            <Text style={styles.showAnswerButtonText}>显示答案</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.assessmentContainer}>
            <Text style={styles.assessmentTitle}>你对这个单词的掌握程度？</Text>
            
            <View style={styles.assessmentButtons}>
              <TouchableOpacity
                style={[styles.assessmentButton, styles.forgotButton]}
                onPress={() => handleAssessment('forgot')}
              >
                <Text style={styles.assessmentButtonText}>🤯</Text>
                <Text style={styles.assessmentLabel}>忘了</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.assessmentButton, styles.hardButton]}
                onPress={() => handleAssessment('hard')}
              >
                <Text style={styles.assessmentButtonText}>🤔</Text>
                <Text style={styles.assessmentLabel}>想了一下</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.assessmentButton, styles.goodButton]}
                onPress={() => handleAssessment('good')}
              >
                <Text style={styles.assessmentButtonText}>😊</Text>
                <Text style={styles.assessmentLabel}>还不错</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.assessmentButton, styles.easyButton]}
                onPress={() => handleAssessment('easy')}
              >
                <Text style={styles.assessmentButtonText}>😎</Text>
                <Text style={styles.assessmentLabel}>秒懂</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>准备复习材料...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {sessionType === 'daily' ? '每日复习' : 
           sessionType === 'catch_up' ? '补习复习' : '练习模式'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* 进度条 */}
      {renderProgressBar()}

      {/* 卡片内容 */}
      <View style={styles.content}>
        {renderCard()}
      </View>

      {/* 底部提示 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 诚实评估有助于优化复习计划
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 18,
    color: '#64748b',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  cardContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  audioButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioButtonText: {
    fontSize: 20,
  },
  cardContent: {
    alignItems: 'center',
  },
  word: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  answerContainer: {
    alignItems: 'center',
  },
  translation: {
    fontSize: 24,
    color: '#10b981',
    fontWeight: '600',
  },
  showAnswerButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    alignSelf: 'center',
  },
  showAnswerButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  assessmentContainer: {
    alignItems: 'center',
  },
  assessmentTitle: {
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 24,
    textAlign: 'center',
  },
  assessmentButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  assessmentButton: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    minWidth: 70,
  },
  forgotButton: {
    backgroundColor: '#fef2f2',
  },
  hardButton: {
    backgroundColor: '#fef3c7',
  },
  goodButton: {
    backgroundColor: '#ecfdf5',
  },
  easyButton: {
    backgroundColor: '#eff6ff',
  },
  assessmentButtonText: {
    fontSize: 24,
    marginBottom: 8,
  },
  assessmentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default SRSReviewScreen;
