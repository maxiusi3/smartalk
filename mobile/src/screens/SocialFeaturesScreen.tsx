import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ReferralSocialService, { 
  Friend, 
  LearningCompetition, 
  SocialProofElement,
  MilestoneShare 
} from '@/services/ReferralSocialService';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import { useInternationalization } from '@/hooks/useInternationalization';
import { useUserState } from '@/contexts/UserStateContext';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';

/**
 * SocialFeaturesScreen - V2 社交功能界面
 * 提供完整的社交功能：好友系统、学习竞争、推荐奖励、里程碑分享、社会证明
 */
const SocialFeaturesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t, isRTL, getLayoutDirectionStyles } = useInternationalization();
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();
  const { userProgress } = useUserState();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [competitions, setCompetitions] = useState<LearningCompetition[]>([]);
  const [socialProofs, setSocialProofs] = useState<SocialProofElement[]>([]);
  const [milestoneShares, setMilestoneShares] = useState<MilestoneShare[]>([]);
  const [referralStats, setReferralStats] = useState<any>(null);
  const [socialStats, setSocialStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const socialService = ReferralSocialService.getInstance();

  useEffect(() => {
    loadSocialData();
    screenReader.announcePageChange('社交功能', '管理好友关系、学习竞争和社交分享');
  }, []);

  const loadSocialData = async () => {
    try {
      setLoading(true);

      if (userProgress?.userId) {
        // 获取好友列表
        const userFriends = socialService.getUserFriends(userProgress.userId);
        setFriends(userFriends);

        // 获取活跃竞争
        const activeCompetitions = socialService.getActiveCompetitions();
        setCompetitions(activeCompetitions);

        // 获取社会证明
        const userProofs = socialService.getUserSocialProofs(userProgress.userId);
        setSocialProofs(userProofs);

        // 获取里程碑分享
        const userMilestones = socialService.getUserMilestoneShares(userProgress.userId);
        setMilestoneShares(userMilestones);

        // 获取推荐统计
        const refStats = socialService.getReferralStatistics(userProgress.userId);
        setReferralStats(refStats);

        // 获取社交统计
        const socStats = socialService.getSocialStatistics();
        setSocialStats(socStats);
      }

    } catch (error) {
      console.error('Error loading social data:', error);
      Alert.alert('错误', '加载社交数据失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const renderOverviewCards = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="社交概览卡片"
      applyHighContrast={true}
    >
      <View style={styles.overviewContainer}>
        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>{friends.length}</Text>
          <Text style={styles.overviewLabel}>好友</Text>
          <Text style={styles.overviewSubtext}>学习伙伴</Text>
        </View>

        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>{competitions.length}</Text>
          <Text style={styles.overviewLabel}>竞争</Text>
          <Text style={styles.overviewSubtext}>进行中</Text>
        </View>

        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>{referralStats?.successfulReferrals || 0}</Text>
          <Text style={styles.overviewLabel}>推荐</Text>
          <Text style={styles.overviewSubtext}>成功邀请</Text>
        </View>

        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>{milestoneShares.length}</Text>
          <Text style={styles.overviewLabel}>分享</Text>
          <Text style={styles.overviewSubtext}>里程碑</Text>
        </View>
      </View>
    </AccessibilityWrapper>
  );

  const renderFriendsList = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="好友列表"
      applyHighContrast={true}
    >
      <View style={styles.friendsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>学习好友</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addFriend()}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="添加好友"
          >
            <Text style={styles.addButtonText}>+ 添加</Text>
          </TouchableOpacity>
        </View>
        
        {friends.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>还没有学习好友</Text>
            <Text style={styles.emptyStateSubtext}>邀请朋友一起学习英语吧！</Text>
          </View>
        ) : (
          friends.slice(0, 5).map((friend, index) => (
            <View key={friend.friendId} style={styles.friendCard}>
              <View style={styles.friendAvatar}>
                <Text style={styles.friendAvatarText}>
                  {friend.friendDisplayName.charAt(0).toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend.friendDisplayName}</Text>
                <Text style={styles.friendLevel}>{friend.learningStats.currentLevel}</Text>
                <Text style={styles.friendStats}>
                  {friend.learningStats.currentStreak}天连击 • {friend.learningStats.totalBadges}个徽章
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.friendAction}
                onPress={() => viewFriendProfile(friend)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`查看${friend.friendDisplayName}的资料`}
              >
                <Text style={styles.friendActionText}>查看</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </AccessibilityWrapper>
  );

  const renderCompetitions = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="学习竞争"
      applyHighContrast={true}
    >
      <View style={styles.competitionsSection}>
        <Text style={styles.sectionTitle}>学习竞争</Text>
        
        {competitions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>暂无活跃竞争</Text>
            <Text style={styles.emptyStateSubtext}>参与竞争激发学习动力！</Text>
          </View>
        ) : (
          competitions.slice(0, 3).map((competition, index) => (
            <View key={competition.competitionId} style={styles.competitionCard}>
              <View style={styles.competitionHeader}>
                <Text style={styles.competitionName}>{competition.name}</Text>
                <Text style={styles.competitionType}>
                  {getCompetitionTypeLabel(competition.type)}
                </Text>
              </View>
              
              <Text style={styles.competitionDescription}>
                {competition.description}
              </Text>
              
              <View style={styles.competitionStats}>
                <Text style={styles.competitionStat}>
                  {competition.participants.length} 参与者
                </Text>
                <Text style={styles.competitionStat}>
                  {Math.ceil((new Date(competition.rules.endDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000))} 天剩余
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.joinButton}
                onPress={() => joinCompetition(competition.competitionId)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`参加${competition.name}`}
              >
                <Text style={styles.joinButtonText}>参加竞争</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </AccessibilityWrapper>
  );

  const renderReferralSystem = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="推荐系统"
      applyHighContrast={true}
    >
      <View style={styles.referralSection}>
        <Text style={styles.sectionTitle}>邀请好友</Text>
        
        <View style={styles.referralStats}>
          <View style={styles.referralStat}>
            <Text style={styles.referralStatValue}>{referralStats?.totalInvites || 0}</Text>
            <Text style={styles.referralStatLabel}>总邀请</Text>
          </View>
          
          <View style={styles.referralStat}>
            <Text style={styles.referralStatValue}>{referralStats?.successfulReferrals || 0}</Text>
            <Text style={styles.referralStatLabel}>成功推荐</Text>
          </View>
          
          <View style={styles.referralStat}>
            <Text style={styles.referralStatValue}>{referralStats?.pendingRewards || 0}</Text>
            <Text style={styles.referralStatLabel}>待领奖励</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.inviteButton}
          onPress={() => createInvite()}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="邀请好友"
        >
          <Text style={styles.inviteButtonText}>邀请好友学英语</Text>
        </TouchableOpacity>
      </View>
    </AccessibilityWrapper>
  );

  const renderSocialProofs = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="社会证明"
      applyHighContrast={true}
    >
      <View style={styles.proofsSection}>
        <Text style={styles.sectionTitle}>我的成就</Text>
        
        {socialProofs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>还没有社会证明</Text>
            <Text style={styles.emptyStateSubtext}>继续学习获得更多成就！</Text>
          </View>
        ) : (
          socialProofs.slice(0, 3).map((proof, index) => (
            <View key={proof.proofId} style={styles.proofCard}>
              <Text style={styles.proofIcon}>{proof.visual.icon}</Text>
              <View style={styles.proofContent}>
                <Text style={styles.proofTitle}>{proof.title}</Text>
                <Text style={styles.proofDescription}>{proof.description}</Text>
                <Text style={styles.proofMetrics}>
                  {proof.metrics.value} {proof.metrics.unit}
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.shareProofButton}
                onPress={() => shareProof(proof)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`分享${proof.title}`}
              >
                <Text style={styles.shareProofButtonText}>分享</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </AccessibilityWrapper>
  );

  const renderMilestoneShares = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="里程碑分享"
      applyHighContrast={true}
    >
      <View style={styles.milestonesSection}>
        <Text style={styles.sectionTitle}>里程碑分享</Text>
        
        {milestoneShares.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>还没有里程碑分享</Text>
            <Text style={styles.emptyStateSubtext}>达成学习目标后自动生成分享！</Text>
          </View>
        ) : (
          milestoneShares.slice(0, 3).map((milestone, index) => (
            <View key={milestone.shareId} style={styles.milestoneCard}>
              <View style={styles.milestoneHeader}>
                <Text style={styles.milestoneTitle}>{milestone.milestoneTitle}</Text>
                <Text style={styles.milestoneDate}>
                  {formatDate(milestone.achievedAt)}
                </Text>
              </View>
              
              <Text style={styles.milestoneDescription}>
                {milestone.milestoneDescription}
              </Text>
              
              <View style={styles.milestoneStats}>
                <Text style={styles.milestoneStat}>
                  {milestone.shareStats.totalShares} 分享
                </Text>
                <Text style={styles.milestoneStat}>
                  {milestone.shareStats.totalViews} 浏览
                </Text>
                <Text style={styles.milestoneStat}>
                  {milestone.communityResponse.congratulations} 祝贺
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </AccessibilityWrapper>
  );

  // 事件处理方法
  const addFriend = () => {
    Alert.alert('添加好友', '选择添加方式', [
      { text: '搜索用户名', onPress: () => searchFriend() },
      { text: '扫描二维码', onPress: () => scanQRCode() },
      { text: '通讯录邀请', onPress: () => inviteFromContacts() },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const searchFriend = () => {
    Alert.alert('搜索好友', '请输入好友的用户名或邮箱', [
      { text: '取消', style: 'cancel' },
      { text: '搜索', onPress: () => Alert.alert('功能开发中', '搜索功能即将推出') },
    ]);
  };

  const scanQRCode = () => {
    Alert.alert('功能开发中', '二维码扫描功能即将推出');
  };

  const inviteFromContacts = () => {
    Alert.alert('功能开发中', '通讯录邀请功能即将推出');
  };

  const viewFriendProfile = (friend: Friend) => {
    Alert.alert(
      friend.friendDisplayName,
      `等级: ${friend.learningStats.currentLevel}\n连击: ${friend.learningStats.currentStreak}天\n徽章: ${friend.learningStats.totalBadges}个\n学习天数: ${friend.learningStats.totalStudyDays}天`,
      [
        { text: '发送鼓励', onPress: () => sendEncouragement(friend) },
        { text: '关闭', style: 'cancel' },
      ]
    );
  };

  const sendEncouragement = (friend: Friend) => {
    Alert.alert('鼓励已发送', `已向${friend.friendDisplayName}发送学习鼓励！`);
  };

  const joinCompetition = async (competitionId: string) => {
    if (!userProgress?.userId) return;

    try {
      const success = await socialService.joinCompetition(competitionId, userProgress.userId);
      
      if (success) {
        Alert.alert('参加成功', '您已成功参加学习竞争！');
        loadSocialData(); // 刷新数据
      } else {
        Alert.alert('参加失败', '无法参加此竞争，可能已经参加过了');
      }
    } catch (error) {
      Alert.alert('错误', '参加竞争时发生错误');
    }
  };

  const createInvite = async () => {
    if (!userProgress?.userId) return;

    try {
      const referral = await socialService.createReferralInvite(
        userProgress.userId,
        'link'
      );

      const shareMessage = `🎉 我在用SmarTalk学英语，效果很棒！\n\n通过故事学习，既有趣又有效。快来和我一起学习吧！\n\n邀请码: ${referral.inviteCode}\n下载链接: ${referral.inviteLink}`;

      Share.share({
        message: shareMessage,
        title: 'SmarTalk英语学习邀请',
      });

      loadSocialData(); // 刷新数据
    } catch (error) {
      Alert.alert('错误', '创建邀请失败');
    }
  };

  const shareProof = (proof: SocialProofElement) => {
    const shareMessage = `🏆 ${proof.title}\n\n${proof.description}\n\n在SmarTalk学英语，每天都有新收获！`;

    Share.share({
      message: shareMessage,
      title: 'SmarTalk学习成就',
    });
  };

  // 辅助方法
  const getCompetitionTypeLabel = (type: string): string => {
    const labels: { [key: string]: string } = {
      streak: '连击挑战',
      study_time: '学习时长',
      achievements: '成就竞赛',
      progress: '进度比拼',
      custom: '自定义',
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载社交数据...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, getLayoutDirectionStyles()]}>
      {/* 头部 */}
      <AccessibilityWrapper
        accessibilityRole="header"
        accessibilityLabel="社交功能页面头部"
        applyHighContrast={true}
      >
        <View style={[styles.header, getLayoutDirectionStyles()]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="返回"
          >
            <Text style={styles.backButtonText}>{isRTL ? '→' : '←'}</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>社交功能</Text>
          
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadSocialData}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="刷新数据"
          >
            <Text style={styles.refreshButtonText}>🔄</Text>
          </TouchableOpacity>
        </View>
      </AccessibilityWrapper>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 概览卡片 */}
        {renderOverviewCards()}

        {/* 好友列表 */}
        {renderFriendsList()}

        {/* 学习竞争 */}
        {renderCompetitions()}

        {/* 推荐系统 */}
        {renderReferralSystem()}

        {/* 社会证明 */}
        {renderSocialProofs()}

        {/* 里程碑分享 */}
        {renderMilestoneShares()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  overviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  overviewCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 2,
  },
  overviewSubtext: {
    fontSize: 12,
    color: '#94a3b8',
  },
  friendsSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  friendAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  friendLevel: {
    fontSize: 14,
    color: '#3b82f6',
    marginBottom: 2,
  },
  friendStats: {
    fontSize: 12,
    color: '#64748b',
  },
  friendAction: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  friendActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  competitionsSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  competitionCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  competitionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  competitionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  competitionType: {
    fontSize: 12,
    color: '#3b82f6',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  competitionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  competitionStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  competitionStat: {
    fontSize: 12,
    color: '#64748b',
  },
  joinButton: {
    backgroundColor: '#10b981',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  referralSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  referralStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  referralStat: {
    alignItems: 'center',
  },
  referralStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  referralStatLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  inviteButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  proofsSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  proofCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  proofIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  proofContent: {
    flex: 1,
  },
  proofTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  proofDescription: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  proofMetrics: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  shareProofButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  shareProofButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  milestonesSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  milestoneCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  milestoneDate: {
    fontSize: 12,
    color: '#64748b',
  },
  milestoneDescription: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  milestoneStats: {
    flexDirection: 'row',
    gap: 12,
  },
  milestoneStat: {
    fontSize: 10,
    color: '#94a3b8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
});

export default SocialFeaturesScreen;
