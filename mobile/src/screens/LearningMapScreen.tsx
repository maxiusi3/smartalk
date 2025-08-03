import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { ApiService } from '@/services/ApiService';
import { useAppStore } from '@/store/useAppStore';

const { width: screenWidth } = Dimensions.get('window');

type LearningMapRouteProp = RouteProp<RootStackParamList, 'LearningMap'>;
type LearningMapNavigationProp = StackNavigationProp<RootStackParamList>;

interface Chapter {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  progress: number;
  keywordCount: number;
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  // V2 增强字段
  state: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  completionBadge?: string;
  interestName: string;
  unlockRequirement?: string;
  completedAt?: string;
}

interface LearningPath {
  currentChapter: number;
  totalChapters: number;
  overallProgress: number;
  streakDays: number;
  totalTimeSpent: number;
  // V2 增强字段
  wordsMastered: number;
  chaptersCompleted: number;
  totalSessions: number;
  lastActivityDate: string;
  achievements: string[];
}

const LearningMapScreen: React.FC = () => {
  const navigation = useNavigation<LearningMapNavigationProp>();
  const route = useRoute<LearningMapRouteProp>();
  const { dramaId } = route.params || {};
  const { user, selectedInterest } = useAppStore();
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [learningPath, setLearningPath] = useState<LearningPath>({
    currentChapter: 2,
    totalChapters: 4,
    overallProgress: 70,
    streakDays: 7,
    totalTimeSpent: 2700, // in seconds
    // V2 增强数据
    wordsMastered: 45,
    chaptersCompleted: 3,
    totalSessions: 15,
    lastActivityDate: new Date().toISOString(),
    achievements: ['旅行生存家', '电影达人'],
  });
  const [loading, setLoading] = useState(true);
  const [showTip, setShowTip] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState<string | null>(null);

  const fadeAnim = new Animated.Value(0);
  const tipAnim = new Animated.Value(0);
  const unlockAnim = new Animated.Value(0);

  useEffect(() => {
    loadLearningData();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadLearningData = async () => {
    try {
      setLoading(true);
      
      // Load chapters based on selected interest
      const mockChapters: Chapter[] = [
        {
          id: 'chapter-1',
          title: '咖啡馆初遇',
          description: '在巴黎的咖啡馆学会自然对话',
          thumbnailUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
          isUnlocked: true,
          isCompleted: true,
          progress: 100,
          keywordCount: 15,
          estimatedTime: 600,
          difficulty: 'easy',
          // V2 增强字段
          state: 'completed',
          completionBadge: '旅行生存家',
          interestName: '旅行',
          completedAt: '2025-01-01T10:00:00Z',
        },
        {
          id: 'chapter-2',
          title: '电影院偶遇',
          description: '学会讨论电影偏好和推荐',
          thumbnailUrl: 'https://images.unsplash.com/photo-1489185078527-20ad2b3d0b6d?w=400',
          isUnlocked: true,
          isCompleted: false,
          progress: 50,
          keywordCount: 15,
          estimatedTime: 720,
          difficulty: 'easy',
          // V2 增强字段
          state: 'in_progress',
          completionBadge: '电影达人',
          interestName: '娱乐',
        },
        {
          id: 'chapter-3',
          title: '会议室讨论',
          description: '在团队会议中表达观点',
          thumbnailUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
          isUnlocked: true,
          isCompleted: false,
          progress: 0,
          keywordCount: 20,
          estimatedTime: 900,
          difficulty: 'medium',
          // V2 增强字段
          state: 'unlocked',
          completionBadge: '职场精英',
          interestName: '职场',
        },
        {
          id: 'chapter-4',
          title: '购物体验',
          description: '在商店中询问和购买',
          thumbnailUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
          isUnlocked: false,
          isCompleted: false,
          progress: 0,
          keywordCount: 22,
          estimatedTime: 1080,
          difficulty: 'medium',
          // V2 增强字段
          state: 'locked',
          completionBadge: '购物达人',
          interestName: '生活',
          unlockRequirement: '完成"会议室讨论"章节',
        },
      ];
      
      setChapters(mockChapters);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load learning data:', error);
      setLoading(false);
    }
  };

  const handleChapterPress = (chapter: Chapter) => {
    // V2: 增强的章节状态处理
    AnalyticsService.getInstance().track('chapter_selected', {
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      chapterState: chapter.state,
      interestName: chapter.interestName,
      timestamp: Date.now(),
    });

    if (chapter.state === 'locked') {
      Alert.alert(
        '章节未解锁',
        chapter.unlockRequirement || '完成前面的章节来解锁这个内容',
        [{ text: '知道了', style: 'default' }]
      );
      return;
    }

    // 导航到vTPR学习界面
    navigation.navigate('VTPRLearning', { dramaId: chapter.id });
  };

  const handleTipPress = () => {
    setShowTip(true);
    Animated.timing(tipAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseTip = () => {
    Animated.timing(tipAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowTip(false);
    });
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}小时${minutes % 60}分钟`;
    }
    return `${minutes}分钟`;
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#757575';
    }
  };

  const getDifficultyText = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return '简单';
      case 'medium': return '中等';
      case 'hard': return '困难';
      default: return '未知';
    }
  };

  // V2: 兴趣筛选器
  const renderInterestFilter = () => {
    const interests = [...new Set(chapters.map(c => c.interestName))];

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[styles.filterButton, !selectedFilter && styles.filterButtonActive]}
          onPress={() => setSelectedFilter(null)}
        >
          <Text style={[styles.filterButtonText, !selectedFilter && styles.filterButtonTextActive]}>
            全部
          </Text>
        </TouchableOpacity>

        {interests.map(interest => (
          <TouchableOpacity
            key={interest}
            style={[styles.filterButton, selectedFilter === interest && styles.filterButtonActive]}
            onPress={() => setSelectedFilter(interest)}
          >
            <Text style={[styles.filterButtonText, selectedFilter === interest && styles.filterButtonTextActive]}>
              {interest}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderProgressStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{learningPath.wordsMastered}</Text>
        <Text style={styles.statLabel}>掌握单词</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{learningPath.streakDays}</Text>
        <Text style={styles.statLabel}>连续天数</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{learningPath.chaptersCompleted}</Text>
        <Text style={styles.statLabel}>完成章节</Text>
      </View>
    </View>
  );

  const getChapterIcon = (index: number) => {
    const icons = ['✈️', '🎬', '💼', '🏪'];
    return icons[index] || '📚';
  };

  const getChapterGradient = (index: number) => {
    const gradients = [
      ['#fb923c', '#ef4444'], // orange to red
      ['#60a5fa', '#a855f7'], // blue to purple
      ['#9ca3af', '#6b7280'], // gray (locked)
      ['#9ca3af', '#6b7280'], // gray (locked)
    ];
    return gradients[index] || ['#9ca3af', '#6b7280'];
  };

  const renderChapterCard = (chapter: Chapter, index: number) => (
    <Animated.View
      key={chapter.id}
      style={[
        styles.chapterContainer,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.chapterCard,
          chapter.isCompleted && styles.chapterCardCompleted,
          chapter.progress > 0 && !chapter.isCompleted && styles.chapterCardInProgress,
          !chapter.isUnlocked && styles.chapterCardLocked,
        ]}
        onPress={() => handleChapterPress(chapter)}
        disabled={!chapter.isUnlocked}
        activeOpacity={0.8}
      >
        <View style={styles.chapterContent}>
          <LinearGradient
            colors={chapter.isUnlocked ? getChapterGradient(index) : ['#9ca3af', '#6b7280']}
            style={styles.chapterIcon}
          >
            <Text style={styles.chapterIconText}>{getChapterIcon(index)}</Text>
          </LinearGradient>
          
          <View style={styles.chapterInfo}>
            <Text style={[
              styles.chapterTitle,
              !chapter.isUnlocked && styles.chapterTitleLocked
            ]}>
              {chapter.title}
            </Text>
            <Text style={[
              styles.chapterDescription,
              !chapter.isUnlocked && styles.chapterDescriptionLocked
            ]}>
              {chapter.description}
            </Text>
            
            {chapter.isCompleted && (
              <View style={styles.chapterStatus}>
                <Text style={styles.statusIcon}>✅</Text>
                <Text style={styles.statusText}>已完成 • {chapter.keywordCount}个故事线索</Text>
              </View>
            )}
            
            {chapter.progress > 0 && !chapter.isCompleted && (
              <View style={styles.chapterStatus}>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${chapter.progress}%` }]} />
                  </View>
                  <Text style={styles.progressStatusText}>进行中 • {Math.floor(chapter.progress * chapter.keywordCount / 100)}/{chapter.keywordCount}</Text>
                </View>
              </View>
            )}
            
            {!chapter.isUnlocked && (
              <View style={styles.chapterStatus}>
                <Text style={styles.statusIcon}>🔒</Text>
                <Text style={styles.statusTextLocked}>完成上一章节后解锁</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Status badges */}
        {chapter.isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>✓</Text>
          </View>
        )}
        
        {!chapter.isUnlocked && (
          <View style={styles.lockedBadge}>
            <Text style={styles.lockedBadgeText}>🔒</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>正在加载学习地图...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient
      colors={['#f8fafc', '#e2e8f0']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Header Card */}
            <View style={styles.headerCard}>
              <View style={styles.headerContent}>
                <View style={styles.headerText}>
                  <Text style={styles.headerTitle}>学习地图</Text>
                  <Text style={styles.headerSubtitle}>你的英语习得之旅</Text>
                </View>
                <View style={styles.progressRing}>
                  <Text style={styles.progressText}>{learningPath.overallProgress}%</Text>
                </View>
              </View>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{learningPath.streakDays}</Text>
                  <Text style={styles.statLabel}>连续天数</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>45</Text>
                  <Text style={styles.statLabel}>故事线索</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>3</Text>
                  <Text style={styles.statLabel}>完成章节</Text>
                </View>
              </View>
            </View>

            {/* V2: 兴趣筛选器 */}
            {renderInterestFilter()}

            {/* Chapters */}
            <View style={styles.chaptersContainer}>
              {chapters
                .filter(chapter => !selectedFilter || chapter.interestName === selectedFilter)
                .map((chapter, index) => renderChapterCard(chapter, index))}
            </View>

            {/* Motivational section */}
            <View style={styles.motivationSection}>
              <Text style={styles.motivationIcon}>🌟</Text>
              <Text style={styles.motivationTitle}>坚持得很棒！</Text>
              <Text style={styles.motivationText}>
                你已经连续学习{learningPath.streakDays}天了。每一天的坚持都在让你的英语能力悄悄提升。
              </Text>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tabItem}>
            <Text style={styles.tabIcon}>🏠</Text>
            <Text style={styles.tabLabel}>首页</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabItem, styles.tabItemActive]}>
            <Text style={styles.tabIcon}>🗺️</Text>
            <Text style={[styles.tabLabel, styles.tabLabelActive]}>学习地图</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <Text style={styles.tabIcon}>🏆</Text>
            <Text style={styles.tabLabel}>成就</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <Text style={styles.tabIcon}>👤</Text>
            <Text style={styles.tabLabel}>我的</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>

      {/* Speaking tips overlay */}
      {showTip && (
        <Animated.View
          style={[
            styles.tipOverlay,
            { opacity: tipAnim },
          ]}
        >
          <TouchableOpacity
            style={styles.tipBackdrop}
            onPress={handleCloseTip}
            activeOpacity={1}
          />
          <Animated.View
            style={[
              styles.tipCard,
              {
                transform: [
                  {
                    scale: tipAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.tipTitle}>💬 实用口语技巧</Text>
            <Text style={styles.tipText}>
              当你在实际对话中遇到困难时，记住这两个万能句子：
            </Text>
            <View style={styles.tipExample}>
              <Text style={styles.tipExampleText}>
                1. "Sorry, I mean..." (抱歉，我的意思是...)
              </Text>
              <Text style={styles.tipExampleText}>
                2. "How do you say... in English?" (...用英语怎么说？)
              </Text>
            </View>
            <Text style={styles.tipText}>
              记住，沟通的目标是解决问题，而不是追求完美的语法。
              SmarTalk帮你建立强大的理解能力，让你有话可说！
            </Text>
            <TouchableOpacity style={styles.closeTipButton} onPress={handleCloseTip}>
              <Text style={styles.closeTipText}>我知道了</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  headerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  chaptersContainer: {
    gap: 16,
  },
  chapterContainer: {
    position: 'relative',
  },
  chapterCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    position: 'relative',
  },
  chapterCardCompleted: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  chapterCardInProgress: {
    borderColor: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
  },
  chapterCardLocked: {
    opacity: 0.6,
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
  },
  chapterContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chapterIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  chapterIconText: {
    fontSize: 20,
    color: '#ffffff',
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  chapterTitleLocked: {
    color: '#6b7280',
  },
  chapterDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  chapterDescriptionLocked: {
    color: '#9ca3af',
  },
  chapterStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#059669',
  },
  statusTextLocked: {
    fontSize: 12,
    color: '#9ca3af',
  },
  progressBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBg: {
    width: 80,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginRight: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  progressStatusText: {
    fontSize: 12,
    color: '#3b82f6',
  },
  completedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lockedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#9ca3af',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedBadgeText: {
    color: '#ffffff',
    fontSize: 12,
  },
  motivationSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    alignItems: 'center',
  },
  motivationIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d97706',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    color: '#d97706',
    lineHeight: 20,
    textAlign: 'center',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
  },
  tabItemActive: {
    // Active tab styling
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  tabLabelActive: {
    color: '#667eea',
  },
  tipOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  tipBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  tipCard: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tipTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 16,
    textAlign: 'center',
  },
  tipText: {
    fontSize: 16,
    color: '#424242',
    lineHeight: 22,
    marginBottom: 16,
  },
  tipExample: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  tipExampleText: {
    fontSize: 16,
    color: '#1A237E',
    marginBottom: 8,
    fontWeight: '500',
  },
  closeTipButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 8,
  },
  closeTipText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // V2 筛选器样式
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
});

export default LearningMapScreen;