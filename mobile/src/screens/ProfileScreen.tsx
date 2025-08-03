import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { AnalyticsService } from '@/services/AnalyticsService';
import { UserService } from '@/services/UserService';

type ProfileNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const { width: screenWidth } = Dimensions.get('window');

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
  lastActiveDate: string;
}

interface UserStats {
  totalLearningTime: number; // 分钟
  wordsMastered: number;
  chaptersCompleted: number;
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  averageSessionTime: number; // 分钟
  totalAquaPoints: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  earnedAt: string;
  category: 'learning' | 'streak' | 'mastery' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileNavigationProp>();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedTab, setSelectedTab] = useState<'stats' | 'achievements' | 'settings'>('stats');
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const analyticsService = AnalyticsService.getInstance();
  const userService = UserService.getInstance();

  useEffect(() => {
    loadUserData();
    
    // 入场动画
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // 加载用户档案
      const profile: UserProfile = {
        id: 'user-123',
        name: '学习者',
        email: 'learner@smartalk.app',
        joinDate: '2024-12-01T00:00:00Z',
        lastActiveDate: new Date().toISOString(),
      };
      setUserProfile(profile);
      
      // 加载用户统计
      const stats: UserStats = {
        totalLearningTime: 180, // 3小时
        wordsMastered: 67,
        chaptersCompleted: 4,
        currentStreak: 12,
        longestStreak: 15,
        totalSessions: 23,
        averageSessionTime: 8, // 8分钟
        totalAquaPoints: 450,
      };
      setUserStats(stats);
      
      // 加载成就
      const userAchievements: Achievement[] = [
        {
          id: 'first_chapter',
          name: '初学者',
          description: '完成第一个章节',
          iconUrl: '',
          earnedAt: '2024-12-15T10:00:00Z',
          category: 'learning',
          rarity: 'common',
        },
        {
          id: 'travel_master',
          name: '旅行生存家',
          description: '掌握旅行相关对话',
          iconUrl: '',
          earnedAt: '2024-12-20T14:30:00Z',
          category: 'mastery',
          rarity: 'rare',
        },
        {
          id: 'movie_expert',
          name: '电影达人',
          description: '精通电影话题讨论',
          iconUrl: '',
          earnedAt: '2024-12-25T16:45:00Z',
          category: 'mastery',
          rarity: 'rare',
        },
        {
          id: 'streak_week',
          name: '坚持一周',
          description: '连续学习7天',
          iconUrl: '',
          earnedAt: '2025-01-01T09:00:00Z',
          category: 'streak',
          rarity: 'epic',
        },
      ];
      setAchievements(userAchievements);
      
      analyticsService.track('profile_viewed', {
        userId: profile.id,
        totalAchievements: userAchievements.length,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('错误', '加载用户数据失败，请重试。');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}小时${mins}分钟`;
    }
    return `${mins}分钟`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRarityColor = (rarity: Achievement['rarity']): string => {
    switch (rarity) {
      case 'common': return '#64748b';
      case 'rare': return '#3b82f6';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const getRarityBgColor = (rarity: Achievement['rarity']): string => {
    switch (rarity) {
      case 'common': return '#f1f5f9';
      case 'rare': return '#eff6ff';
      case 'epic': return '#f3e8ff';
      case 'legendary': return '#fffbeb';
      default: return '#f1f5f9';
    }
  };

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userProfile?.name.charAt(0) || 'U'}
          </Text>
        </View>
      </View>
      
      <View style={styles.profileInfo}>
        <Text style={styles.userName}>{userProfile?.name}</Text>
        <Text style={styles.userEmail}>{userProfile?.email}</Text>
        <Text style={styles.joinDate}>
          加入时间：{userProfile ? formatDate(userProfile.joinDate) : ''}
        </Text>
      </View>
      
      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editButtonText}>编辑</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTabButtons = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tabButton, selectedTab === 'stats' && styles.activeTabButton]}
        onPress={() => setSelectedTab('stats')}
      >
        <Text style={[styles.tabButtonText, selectedTab === 'stats' && styles.activeTabButtonText]}>
          统计
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tabButton, selectedTab === 'achievements' && styles.activeTabButton]}
        onPress={() => setSelectedTab('achievements')}
      >
        <Text style={[styles.tabButtonText, selectedTab === 'achievements' && styles.activeTabButtonText]}>
          成就
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tabButton, selectedTab === 'settings' && styles.activeTabButton]}
        onPress={() => setSelectedTab('settings')}
      >
        <Text style={[styles.tabButtonText, selectedTab === 'settings' && styles.activeTabButtonText]}>
          设置
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStatsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>学习统计</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{userStats?.totalLearningTime ? formatTime(userStats.totalLearningTime) : '0分钟'}</Text>
          <Text style={styles.statLabel}>总学习时长</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{userStats?.wordsMastered || 0}</Text>
          <Text style={styles.statLabel}>掌握单词</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{userStats?.chaptersCompleted || 0}</Text>
          <Text style={styles.statLabel}>完成章节</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{userStats?.currentStreak || 0}</Text>
          <Text style={styles.statLabel}>当前连击</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{userStats?.longestStreak || 0}</Text>
          <Text style={styles.statLabel}>最长连击</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{userStats?.totalAquaPoints || 0}</Text>
          <Text style={styles.statLabel}>Aqua积分</Text>
        </View>
      </View>
      
      <View style={styles.additionalStats}>
        <View style={styles.additionalStatItem}>
          <Text style={styles.additionalStatLabel}>总学习会话</Text>
          <Text style={styles.additionalStatValue}>{userStats?.totalSessions || 0} 次</Text>
        </View>
        
        <View style={styles.additionalStatItem}>
          <Text style={styles.additionalStatLabel}>平均会话时长</Text>
          <Text style={styles.additionalStatValue}>
            {userStats?.averageSessionTime ? formatTime(userStats.averageSessionTime) : '0分钟'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderAchievementsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>成就墙 ({achievements.length})</Text>
      
      <View style={styles.achievementsGrid}>
        {achievements.map((achievement) => (
          <View
            key={achievement.id}
            style={[
              styles.achievementCard,
              { backgroundColor: getRarityBgColor(achievement.rarity) }
            ]}
          >
            <View style={styles.achievementIcon}>
              <Text style={styles.achievementIconText}>🏆</Text>
            </View>
            
            <View style={styles.achievementInfo}>
              <Text style={[
                styles.achievementName,
                { color: getRarityColor(achievement.rarity) }
              ]}>
                {achievement.name}
              </Text>
              <Text style={styles.achievementDescription}>
                {achievement.description}
              </Text>
              <Text style={styles.achievementDate}>
                {formatDate(achievement.earnedAt)}
              </Text>
            </View>
            
            <View style={[
              styles.rarityBadge,
              { backgroundColor: getRarityColor(achievement.rarity) }
            ]}>
              <Text style={styles.rarityText}>
                {achievement.rarity === 'common' && '普通'}
                {achievement.rarity === 'rare' && '稀有'}
                {achievement.rarity === 'epic' && '史诗'}
                {achievement.rarity === 'legendary' && '传说'}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderSettingsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>设置</Text>
      
      <View style={styles.settingsGroup}>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>通知设置</Text>
          <Text style={styles.settingValue}>></Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>语言设置</Text>
          <Text style={styles.settingValue}>中文</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>数据导出</Text>
          <Text style={styles.settingValue}>></Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>关于我们</Text>
          <Text style={styles.settingValue}>></Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>加载个人中心...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* 个人档案头部 */}
          {renderProfileHeader()}
          
          {/* 标签页按钮 */}
          {renderTabButtons()}
          
          {/* 标签页内容 */}
          {selectedTab === 'stats' && renderStatsTab()}
          {selectedTab === 'achievements' && renderAchievementsTab()}
          {selectedTab === 'settings' && renderSettingsTab()}
        </Animated.View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTabButton: {
    backgroundColor: '#667eea',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabButtonText: {
    color: '#FFFFFF',
  },
  tabContent: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (screenWidth - 72) / 2, // 2列布局，考虑padding和gap
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  additionalStats: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  additionalStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  additionalStatLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  additionalStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  achievementsGrid: {
    gap: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    position: 'relative',
  },
  achievementIcon: {
    marginRight: 16,
  },
  achievementIconText: {
    fontSize: 32,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  rarityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingLabel: {
    fontSize: 16,
    color: '#1e293b',
  },
  settingValue: {
    fontSize: 16,
    color: '#64748b',
  },
});

export default ProfileScreen;
