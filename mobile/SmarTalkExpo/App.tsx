import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView 
} from 'react-native';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [learningProgress, setLearningProgress] = useState(0);

  const renderHomeScreen = () => (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>SmarTalk MVP</Text>
      <Text style={styles.subtitle}>英语学习应用演示</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => setCurrentScreen('onboarding')}
        >
          <Text style={styles.buttonText}>开始学习</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => setCurrentScreen('features')}
        >
          <Text style={styles.secondaryButtonText}>功能演示</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOnboardingScreen = () => (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>欢迎使用 SmarTalk</Text>
      <Text style={styles.description}>
        通过互动迷你剧学习英语，解决"哑巴英语"问题
      </Text>
      
      <View style={styles.featureList}>
        <Text style={styles.featureItem}>🎬 沉浸式迷你剧学习</Text>
        <Text style={styles.featureItem}>🎯 个性化兴趣选择</Text>
        <Text style={styles.featureItem}>📚 关键词墙系统</Text>
        <Text style={styles.featureItem}>🎮 vTPR互动练习</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={() => setCurrentScreen('interests')}
      >
        <Text style={styles.buttonText}>选择兴趣</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setCurrentScreen('home')}
      >
        <Text style={styles.backButtonText}>返回</Text>
      </TouchableOpacity>
    </View>
  );

  const renderInterestsScreen = () => (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>选择你的兴趣</Text>
      <Text style={styles.description}>
        选择感兴趣的主题，我们将为你推荐相关内容
      </Text>
      
      <View style={styles.interestGrid}>
        <TouchableOpacity 
          style={[styles.interestCard, selectedInterest === 'movies' && styles.selectedCard]}
          onPress={() => setSelectedInterest('movies')}
        >
          <Text style={styles.interestEmoji}>🎬</Text>
          <Text style={styles.interestTitle}>电影</Text>
          <Text style={styles.interestDesc}>经典电影片段</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.interestCard, selectedInterest === 'travel' && styles.selectedCard]}
          onPress={() => setSelectedInterest('travel')}
        >
          <Text style={styles.interestEmoji}>✈️</Text>
          <Text style={styles.interestTitle}>旅行</Text>
          <Text style={styles.interestDesc}>旅行场景对话</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.interestCard, selectedInterest === 'workplace' && styles.selectedCard]}
          onPress={() => setSelectedInterest('workplace')}
        >
          <Text style={styles.interestEmoji}>💼</Text>
          <Text style={styles.interestTitle}>职场</Text>
          <Text style={styles.interestDesc}>商务英语</Text>
        </TouchableOpacity>
      </View>
      
      {selectedInterest && (
        <View style={styles.selectionInfo}>
          <Text style={styles.selectionText}>
            ✅ 已选择: {selectedInterest === 'movies' ? '电影' : selectedInterest === 'travel' ? '旅行' : '职场'}英语
          </Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={[styles.primaryButton, !selectedInterest && styles.disabledButton]}
        onPress={() => selectedInterest && setCurrentScreen('learning')}
        disabled={!selectedInterest}
      >
        <Text style={styles.buttonText}>开始学习</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setCurrentScreen('onboarding')}
      >
        <Text style={styles.backButtonText}>返回</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLearningScreen = () => {
    const interestTitle = selectedInterest === 'movies' ? '电影' : selectedInterest === 'travel' ? '旅行' : '职场';
    const dramaTitle = selectedInterest === 'movies' ? '咖啡店邂逅' : selectedInterest === 'travel' ? '机场问路' : '会议讨论';
    
    return (
      <View style={styles.screenContainer}>
        <Text style={styles.title}>{interestTitle}英语学习</Text>
        <Text style={styles.description}>
          迷你剧: {dramaTitle}
        </Text>
        
        <View style={styles.mockVideoPlayer}>
          <Text style={styles.mockVideoText}>📺 {dramaTitle}</Text>
          <Text style={styles.mockSubtitle}>
            {selectedInterest === 'travel' ? '"Excuse me, where is gate 15?"' : 
             selectedInterest === 'movies' ? '"Can I have a coffee, please?"' : 
             '"Let\'s discuss the project timeline"'}
          </Text>
        </View>
        
        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>学习进度</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${learningProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>{learningProgress}% 完成</Text>
        </View>
        
        <View style={styles.keywordSection}>
          <Text style={styles.sectionTitle}>🔑 关键词汇</Text>
          <View style={styles.keywordGrid}>
            {['excuse me', 'airport', 'gate', 'boarding', 'flight'].map((word, index) => (
              <TouchableOpacity 
                key={word}
                style={[styles.keywordCard, index < learningProgress/20 && styles.unlockedKeyword]}
                onPress={() => {
                  if (learningProgress < 100) {
                    setLearningProgress(Math.min(100, learningProgress + 20));
                  }
                }}
              >
                <Text style={styles.keywordText}>{word}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.mockControls}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => setLearningProgress(Math.min(100, learningProgress + 10))}
          >
            <Text>⏯️ 播放/暂停</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => setLearningProgress(0)}
          >
            <Text>🔄 重新开始</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => learningProgress >= 80 && setCurrentScreen('achievement')}
          >
            <Text>✨ Magic Moment</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setCurrentScreen('interests')}
        >
          <Text style={styles.backButtonText}>返回选择</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFeaturesScreen = () => (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.screenContainer}>
        <Text style={styles.title}>功能特性</Text>
        
        <View style={styles.featureSection}>
          <Text style={styles.sectionTitle}>🎯 核心功能</Text>
          <Text style={styles.featureDetail}>• 30分钟首次体验流程</Text>
          <Text style={styles.featureDetail}>• 基于兴趣的内容推荐</Text>
          <Text style={styles.featureDetail}>• 渐进式词汇解锁系统</Text>
          <Text style={styles.featureDetail}>• 视频理解练习(vTPR)</Text>
        </View>
        
        <View style={styles.featureSection}>
          <Text style={styles.sectionTitle}>📊 技术特性</Text>
          <Text style={styles.featureDetail}>• React Native + TypeScript</Text>
          <Text style={styles.featureDetail}>• Node.js + Express 后端</Text>
          <Text style={styles.featureDetail}>• PostgreSQL 数据库</Text>
          <Text style={styles.featureDetail}>• 用户行为分析</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setCurrentScreen('home')}
        >
          <Text style={styles.backButtonText}>返回首页</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderAchievementScreen = () => (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>🎉 恭喜！</Text>
      <Text style={styles.description}>
        你刚刚体验了Magic Moment！
        {'\n'}没有字幕，你也能理解英语对话了！
      </Text>
      
      <View style={styles.achievementCard}>
        <Text style={styles.achievementEmoji}>🏆</Text>
        <Text style={styles.achievementTitle}>首次激活达成</Text>
        <Text style={styles.achievementDesc}>
          你已经成功完成了SmarTalk的核心学习体验
        </Text>
      </View>
      
      <View style={styles.feedbackSection}>
        <Text style={styles.feedbackTitle}>刚才那一刻，你体验到了什么？</Text>
        <View style={styles.feedbackOptions}>
          <TouchableOpacity style={styles.feedbackButton}>
            <Text style={styles.feedbackText}>😍 太神奇了！</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.feedbackButton}>
            <Text style={styles.feedbackText}>🤩 比想象的容易！</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.feedbackButton}>
            <Text style={styles.feedbackText}>😊 很有成就感！</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.feedbackButton}>
            <Text style={styles.feedbackText}>🔥 想学更多！</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={() => setCurrentScreen('journey')}
      >
        <Text style={styles.buttonText}>查看学习地图</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setCurrentScreen('home')}
      >
        <Text style={styles.backButtonText}>返回首页</Text>
      </TouchableOpacity>
    </View>
  );

  const renderJourneyScreen = () => (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.screenContainer}>
        <Text style={styles.title}>🗺️ 学习地图</Text>
        
        <View style={styles.journeySection}>
          <View style={styles.chapterCard}>
            <Text style={styles.chapterEmoji}>✅</Text>
            <Text style={styles.chapterTitle}>第1章：机场问路</Text>
            <Text style={styles.chapterStatus}>已完成</Text>
          </View>
          
          <View style={styles.chapterCard}>
            <Text style={styles.chapterEmoji}>🔒</Text>
            <Text style={styles.chapterTitle}>第2章：酒店入住</Text>
            <Text style={styles.chapterStatus}>即将解锁</Text>
          </View>
          
          <View style={styles.chapterCard}>
            <Text style={styles.chapterEmoji}>🔒</Text>
            <Text style={styles.chapterTitle}>第3章：餐厅点餐</Text>
            <Text style={styles.chapterStatus}>敬请期待</Text>
          </View>
        </View>
        
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>💡 实用口语小贴士</Text>
          <Text style={styles.tipItem}>• "Sorry, I mean..." - 纠正自己的表达</Text>
          <Text style={styles.tipItem}>• "How do you say... in English?" - 询问表达方式</Text>
          <Text style={styles.tipItem}>• "Could you repeat that?" - 请求重复</Text>
          <Text style={styles.tipHighlight}>💬 记住：沟通比完美更重要！</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setCurrentScreen('home')}
        >
          <Text style={styles.backButtonText}>返回首页</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'onboarding':
        return renderOnboardingScreen();
      case 'interests':
        return renderInterestsScreen();
      case 'learning':
        return renderLearningScreen();
      case 'achievement':
        return renderAchievementScreen();
      case 'journey':
        return renderJourneyScreen();
      case 'features':
        return renderFeaturesScreen();
      default:
        return renderHomeScreen();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {renderCurrentScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A237E',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#1A237E',
  },
  screenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 40,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    width: '80%',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF6B35',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    width: '80%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: '#FF6B35',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.7,
  },
  featureList: {
    marginBottom: 30,
  },
  featureItem: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  interestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 30,
  },
  interestCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 12,
    margin: 8,
    alignItems: 'center',
    width: 100,
  },
  interestEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  interestTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  interestDesc: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  mockVideoPlayer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 40,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    width: '90%',
  },
  mockVideoText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 10,
  },
  mockSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.7,
  },
  mockControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginBottom: 30,
  },
  controlButton: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    padding: 12,
    borderRadius: 8,
  },
  featureSection: {
    marginBottom: 30,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 12,
  },
  featureDetail: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    opacity: 0.9,
  },
  selectedCard: {
    backgroundColor: 'rgba(255, 107, 53, 0.3)',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  selectionInfo: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  selectionText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 107, 53, 0.3)',
    opacity: 0.5,
  },
  progressSection: {
    width: '90%',
    marginBottom: 20,
  },
  progressTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 4,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  keywordSection: {
    width: '90%',
    marginBottom: 20,
  },
  keywordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  keywordCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    borderRadius: 6,
    margin: 4,
  },
  unlockedKeyword: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  keywordText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  achievementCard: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 30,
    width: '90%',
  },
  achievementEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  achievementTitle: {
    color: '#FFC107',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  achievementDesc: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
  },
  feedbackSection: {
    width: '90%',
    marginBottom: 30,
  },
  feedbackTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  feedbackOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  feedbackButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    margin: 4,
  },
  feedbackText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  journeySection: {
    width: '90%',
    marginBottom: 30,
  },
  chapterCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  chapterEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  chapterTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  chapterStatus: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.7,
  },
  tipsSection: {
    width: '90%',
    marginBottom: 30,
  },
  tipItem: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
    opacity: 0.9,
  },
  tipHighlight: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
});
