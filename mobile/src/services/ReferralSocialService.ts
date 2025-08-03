/**
 * ReferralSocialService - V2 推荐和社交功能服务
 * 提供完整的社交功能：好友邀请、学习竞争、社会证明、推荐奖励、里程碑分享
 * 支持学习社区建设、用户获取、社交互动、成就展示
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { AnalyticsService } from './AnalyticsService';
import AchievementSharingService from './AchievementSharingService';

// 好友关系状态
export type FriendshipStatus = 
  | 'pending'     // 待确认
  | 'accepted'    // 已接受
  | 'blocked'     // 已屏蔽
  | 'declined';   // 已拒绝

// 推荐状态
export type ReferralStatus = 
  | 'sent'        // 已发送
  | 'clicked'     // 已点击
  | 'registered'  // 已注册
  | 'activated'   // 已激活
  | 'rewarded';   // 已奖励

// 社交证明类型
export type SocialProofType = 
  | 'learning_streak'     // 学习连击
  | 'achievement_unlock'  // 成就解锁
  | 'milestone_reached'   // 里程碑达成
  | 'level_up'           // 升级
  | 'community_rank'     // 社区排名
  | 'study_time'         // 学习时长
  | 'consistency'        // 学习坚持
  | 'improvement';       // 进步表现

// 好友信息
export interface Friend {
  friendId: string;
  userId: string;
  friendUserId: string;
  
  // 好友基本信息
  friendUsername: string;
  friendDisplayName: string;
  friendAvatar?: string;
  
  // 关系信息
  status: FriendshipStatus;
  requestedAt: string;
  acceptedAt?: string;
  
  // 学习信息
  learningStats: {
    currentLevel: string;
    totalBadges: number;
    currentStreak: number;
    totalStudyDays: number;
    lastActiveAt: string;
  };
  
  // 互动信息
  interactions: {
    totalShares: number;
    mutualAchievements: number;
    competitionWins: number;
    encouragements: number;
  };
  
  // 隐私设置
  privacySettings: {
    showProgress: boolean;
    showAchievements: boolean;
    showActivity: boolean;
    allowCompetition: boolean;
  };
}

// 推荐记录
export interface ReferralRecord {
  referralId: string;
  referrerUserId: string;
  
  // 推荐信息
  inviteCode: string;
  inviteLink: string;
  referredUserId?: string;
  
  // 推荐渠道
  channel: 'sms' | 'email' | 'social' | 'link' | 'qr_code';
  platform?: string;
  
  // 状态跟踪
  status: ReferralStatus;
  sentAt: string;
  clickedAt?: string;
  registeredAt?: string;
  activatedAt?: string;
  rewardedAt?: string;
  
  // 奖励信息
  rewards: {
    referrerReward: {
      type: 'badge' | 'points' | 'premium_days' | 'content_unlock';
      value: string | number;
      claimed: boolean;
    };
    referredReward: {
      type: 'badge' | 'points' | 'premium_days' | 'content_unlock';
      value: string | number;
      claimed: boolean;
    };
  };
  
  // 跟踪数据
  tracking: {
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: string;
    location?: string;
  };
}

// 学习竞争
export interface LearningCompetition {
  competitionId: string;
  
  // 竞争信息
  name: string;
  description: string;
  type: 'streak' | 'study_time' | 'achievements' | 'progress' | 'custom';
  
  // 参与者
  participants: {
    userId: string;
    username: string;
    displayName: string;
    avatar?: string;
    joinedAt: string;
  }[];
  
  // 竞争规则
  rules: {
    duration: number; // days
    metric: string;
    target?: number;
    startDate: string;
    endDate: string;
  };
  
  // 当前排行
  leaderboard: {
    userId: string;
    score: number;
    rank: number;
    progress: number; // 0-1
    lastUpdated: string;
  }[];
  
  // 奖励设置
  rewards: {
    rank: number;
    reward: {
      type: 'badge' | 'points' | 'premium_days' | 'title';
      value: string | number;
    };
  }[];
  
  // 状态
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// 社会证明元素
export interface SocialProofElement {
  proofId: string;
  userId: string;
  
  // 证明信息
  type: SocialProofType;
  title: string;
  description: string;
  
  // 数据支持
  metrics: {
    value: number;
    unit: string;
    comparison?: {
      type: 'percentile' | 'rank' | 'average';
      value: number;
      context: string;
    };
  };
  
  // 视觉元素
  visual: {
    icon: string;
    color: string;
    animation?: string;
    badge?: string;
  };
  
  // 展示设置
  display: {
    priority: number; // 1-10
    contexts: ('profile' | 'leaderboard' | 'sharing' | 'achievement')[];
    duration: number; // days to show
    autoShow: boolean;
  };
  
  // 社交影响
  socialImpact: {
    shareCount: number;
    likeCount: number;
    commentCount: number;
    inspirationCount: number; // 激励他人数量
  };
  
  // 状态
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

// 里程碑分享
export interface MilestoneShare {
  shareId: string;
  userId: string;
  
  // 里程碑信息
  milestoneType: 'days_studied' | 'hours_learned' | 'words_mastered' | 'stories_completed' | 'streak_achieved' | 'level_reached';
  milestoneValue: number;
  milestoneTitle: string;
  milestoneDescription: string;
  
  // 分享内容
  shareContent: {
    text: string;
    hashtags: string[];
    mentions: string[];
    visualElements: {
      background: string;
      icons: string[];
      colors: string[];
    };
  };
  
  // 分享统计
  shareStats: {
    platforms: string[];
    totalShares: number;
    totalViews: number;
    totalClicks: number;
    conversions: number;
  };
  
  // 社区反响
  communityResponse: {
    congratulations: number;
    inspirations: number;
    follows: number;
    friendRequests: number;
  };
  
  // 时间信息
  achievedAt: string;
  sharedAt: string;
  lastUpdated: string;
}

class ReferralSocialService {
  private static instance: ReferralSocialService;
  private analyticsService = AnalyticsService.getInstance();
  private sharingService = AchievementSharingService.getInstance();
  
  // 数据存储
  private friends: Map<string, Friend> = new Map();
  private referralRecords: Map<string, ReferralRecord> = new Map();
  private competitions: Map<string, LearningCompetition> = new Map();
  private socialProofs: Map<string, SocialProofElement> = new Map();
  private milestoneShares: Map<string, MilestoneShare> = new Map();
  
  // 存储键
  private readonly FRIENDS_KEY = 'social_friends';
  private readonly REFERRALS_KEY = 'referral_records';
  private readonly COMPETITIONS_KEY = 'learning_competitions';
  private readonly PROOFS_KEY = 'social_proofs';
  private readonly MILESTONES_KEY = 'milestone_shares';

  static getInstance(): ReferralSocialService {
    if (!ReferralSocialService.instance) {
      ReferralSocialService.instance = new ReferralSocialService();
    }
    return ReferralSocialService.instance;
  }

  constructor() {
    this.initializeService();
  }

  // ===== 初始化 =====

  /**
   * 初始化推荐社交服务
   */
  private async initializeService(): Promise<void> {
    try {
      // 加载本地数据
      await this.loadLocalData();
      
      // 初始化默认竞争
      this.initializeDefaultCompetitions();
      
      // 开始定期更新
      this.startPeriodicUpdates();
      
      this.analyticsService.track('referral_social_service_initialized', {
        friendsCount: this.friends.size,
        referralsCount: this.referralRecords.size,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error initializing referral social service:', error);
    }
  }

  /**
   * 加载本地数据
   */
  private async loadLocalData(): Promise<void> {
    try {
      // 加载好友数据
      const friendsData = await AsyncStorage.getItem(this.FRIENDS_KEY);
      if (friendsData) {
        const friends: Friend[] = JSON.parse(friendsData);
        friends.forEach(friend => {
          this.friends.set(friend.friendId, friend);
        });
      }

      // 加载推荐记录
      const referralsData = await AsyncStorage.getItem(this.REFERRALS_KEY);
      if (referralsData) {
        const referrals: ReferralRecord[] = JSON.parse(referralsData);
        referrals.forEach(referral => {
          this.referralRecords.set(referral.referralId, referral);
        });
      }

      // 加载竞争数据
      const competitionsData = await AsyncStorage.getItem(this.COMPETITIONS_KEY);
      if (competitionsData) {
        const competitions: LearningCompetition[] = JSON.parse(competitionsData);
        competitions.forEach(competition => {
          this.competitions.set(competition.competitionId, competition);
        });
      }

      // 加载社会证明
      const proofsData = await AsyncStorage.getItem(this.PROOFS_KEY);
      if (proofsData) {
        const proofs: SocialProofElement[] = JSON.parse(proofsData);
        proofs.forEach(proof => {
          this.socialProofs.set(proof.proofId, proof);
        });
      }

      // 加载里程碑分享
      const milestonesData = await AsyncStorage.getItem(this.MILESTONES_KEY);
      if (milestonesData) {
        const milestones: MilestoneShare[] = JSON.parse(milestonesData);
        milestones.forEach(milestone => {
          this.milestoneShares.set(milestone.shareId, milestone);
        });
      }

    } catch (error) {
      console.error('Error loading local data:', error);
    }
  }

  /**
   * 初始化默认竞争
   */
  private initializeDefaultCompetitions(): void {
    const defaultCompetitions: LearningCompetition[] = [
      {
        competitionId: 'weekly_streak_challenge',
        name: '每周连击挑战',
        description: '看谁能保持最长的学习连击！',
        type: 'streak',
        participants: [],
        rules: {
          duration: 7,
          metric: 'daily_streak',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        leaderboard: [],
        rewards: [
          { rank: 1, reward: { type: 'badge', value: 'streak_champion' } },
          { rank: 2, reward: { type: 'points', value: 500 } },
          { rank: 3, reward: { type: 'points', value: 300 } },
        ],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        competitionId: 'monthly_study_marathon',
        name: '月度学习马拉松',
        description: '比拼本月总学习时长，坚持就是胜利！',
        type: 'study_time',
        participants: [],
        rules: {
          duration: 30,
          metric: 'total_study_minutes',
          target: 1800, // 30 hours
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        leaderboard: [],
        rewards: [
          { rank: 1, reward: { type: 'premium_days', value: 30 } },
          { rank: 2, reward: { type: 'premium_days', value: 14 } },
          { rank: 3, reward: { type: 'premium_days', value: 7 } },
        ],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    defaultCompetitions.forEach(competition => {
      if (!this.competitions.has(competition.competitionId)) {
        this.competitions.set(competition.competitionId, competition);
      }
    });
  }

  /**
   * 开始定期更新
   */
  private startPeriodicUpdates(): void {
    // 每小时更新竞争排行榜
    setInterval(() => {
      this.updateCompetitionLeaderboards();
    }, 60 * 60 * 1000);
    
    // 每天更新社会证明
    setInterval(() => {
      this.updateSocialProofs();
    }, 24 * 60 * 60 * 1000);
    
    // 立即执行一次
    this.updateCompetitionLeaderboards();
    this.updateSocialProofs();
  }

  // ===== 好友系统 =====

  /**
   * 发送好友请求
   */
  async sendFriendRequest(userId: string, targetUserId: string): Promise<string> {
    try {
      const friendId = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `friend_${userId}_${targetUserId}_${Date.now()}`
      );

      const friend: Friend = {
        friendId,
        userId,
        friendUserId: targetUserId,
        friendUsername: `user_${targetUserId}`, // 应该从用户服务获取
        friendDisplayName: `User ${targetUserId}`,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        learningStats: {
          currentLevel: 'Beginner',
          totalBadges: 0,
          currentStreak: 0,
          totalStudyDays: 0,
          lastActiveAt: new Date().toISOString(),
        },
        interactions: {
          totalShares: 0,
          mutualAchievements: 0,
          competitionWins: 0,
          encouragements: 0,
        },
        privacySettings: {
          showProgress: true,
          showAchievements: true,
          showActivity: true,
          allowCompetition: true,
        },
      };

      this.friends.set(friendId, friend);
      await this.saveFriends();

      this.analyticsService.track('friend_request_sent', {
        userId,
        targetUserId,
        timestamp: Date.now(),
      });

      return friendId;

    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }

  /**
   * 接受好友请求
   */
  async acceptFriendRequest(friendId: string): Promise<boolean> {
    try {
      const friend = this.friends.get(friendId);
      if (!friend || friend.status !== 'pending') {
        return false;
      }

      friend.status = 'accepted';
      friend.acceptedAt = new Date().toISOString();
      
      this.friends.set(friendId, friend);
      await this.saveFriends();

      this.analyticsService.track('friend_request_accepted', {
        friendId,
        userId: friend.userId,
        friendUserId: friend.friendUserId,
        timestamp: Date.now(),
      });

      return true;

    } catch (error) {
      console.error('Error accepting friend request:', error);
      return false;
    }
  }

  /**
   * 获取用户好友列表
   */
  getUserFriends(userId: string): Friend[] {
    return Array.from(this.friends.values())
      .filter(friend => 
        (friend.userId === userId || friend.friendUserId === userId) && 
        friend.status === 'accepted'
      );
  }

  // ===== 推荐系统 =====

  /**
   * 创建推荐邀请
   */
  async createReferralInvite(
    referrerUserId: string,
    channel: ReferralRecord['channel'],
    platform?: string
  ): Promise<ReferralRecord> {
    try {
      const referralId = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `referral_${referrerUserId}_${Date.now()}`
      );

      const inviteCode = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `invite_${referrerUserId}_${Math.random()}`
      );

      const inviteLink = `https://smartalk.app/invite/${inviteCode}`;

      const referral: ReferralRecord = {
        referralId,
        referrerUserId,
        inviteCode: inviteCode.substring(0, 8).toUpperCase(),
        inviteLink,
        channel,
        platform,
        status: 'sent',
        sentAt: new Date().toISOString(),
        rewards: {
          referrerReward: {
            type: 'premium_days',
            value: 7,
            claimed: false,
          },
          referredReward: {
            type: 'points',
            value: 100,
            claimed: false,
          },
        },
        tracking: {},
      };

      this.referralRecords.set(referralId, referral);
      await this.saveReferralRecords();

      this.analyticsService.track('referral_invite_created', {
        referralId,
        referrerUserId,
        channel,
        platform,
        timestamp: Date.now(),
      });

      return referral;

    } catch (error) {
      console.error('Error creating referral invite:', error);
      throw error;
    }
  }

  /**
   * 处理推荐点击
   */
  async handleReferralClick(inviteCode: string, trackingData?: any): Promise<boolean> {
    try {
      const referral = Array.from(this.referralRecords.values())
        .find(r => r.inviteCode === inviteCode);

      if (!referral) {
        return false;
      }

      referral.status = 'clicked';
      referral.clickedAt = new Date().toISOString();
      referral.tracking = { ...referral.tracking, ...trackingData };

      this.referralRecords.set(referral.referralId, referral);
      await this.saveReferralRecords();

      return true;

    } catch (error) {
      console.error('Error handling referral click:', error);
      return false;
    }
  }

  /**
   * 处理推荐注册
   */
  async handleReferralRegistration(inviteCode: string, newUserId: string): Promise<boolean> {
    try {
      const referral = Array.from(this.referralRecords.values())
        .find(r => r.inviteCode === inviteCode);

      if (!referral) {
        return false;
      }

      referral.status = 'registered';
      referral.referredUserId = newUserId;
      referral.registeredAt = new Date().toISOString();

      this.referralRecords.set(referral.referralId, referral);
      await this.saveReferralRecords();

      return true;

    } catch (error) {
      console.error('Error handling referral registration:', error);
      return false;
    }
  }

  // ===== 学习竞争 =====

  /**
   * 加入学习竞争
   */
  async joinCompetition(competitionId: string, userId: string): Promise<boolean> {
    try {
      const competition = this.competitions.get(competitionId);
      if (!competition || competition.status !== 'active') {
        return false;
      }

      // 检查是否已经参与
      const alreadyJoined = competition.participants.some(p => p.userId === userId);
      if (alreadyJoined) {
        return false;
      }

      // 添加参与者
      competition.participants.push({
        userId,
        username: `user_${userId}`, // 应该从用户服务获取
        displayName: `User ${userId}`,
        joinedAt: new Date().toISOString(),
      });

      // 添加到排行榜
      competition.leaderboard.push({
        userId,
        score: 0,
        rank: competition.leaderboard.length + 1,
        progress: 0,
        lastUpdated: new Date().toISOString(),
      });

      competition.updatedAt = new Date().toISOString();
      this.competitions.set(competitionId, competition);
      await this.saveCompetitions();

      this.analyticsService.track('competition_joined', {
        competitionId,
        userId,
        participantsCount: competition.participants.length,
        timestamp: Date.now(),
      });

      return true;

    } catch (error) {
      console.error('Error joining competition:', error);
      return false;
    }
  }

  /**
   * 更新竞争分数
   */
  async updateCompetitionScore(
    competitionId: string,
    userId: string,
    score: number
  ): Promise<boolean> {
    try {
      const competition = this.competitions.get(competitionId);
      if (!competition) {
        return false;
      }

      const leaderboardEntry = competition.leaderboard.find(entry => entry.userId === userId);
      if (!leaderboardEntry) {
        return false;
      }

      leaderboardEntry.score = score;
      leaderboardEntry.lastUpdated = new Date().toISOString();

      // 重新排序排行榜
      competition.leaderboard.sort((a, b) => b.score - a.score);
      competition.leaderboard.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      this.competitions.set(competitionId, competition);
      await this.saveCompetitions();

      return true;

    } catch (error) {
      console.error('Error updating competition score:', error);
      return false;
    }
  }

  // ===== 社会证明 =====

  /**
   * 创建社会证明元素
   */
  async createSocialProof(
    userId: string,
    type: SocialProofType,
    metrics: SocialProofElement['metrics']
  ): Promise<string> {
    try {
      const proofId = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `proof_${userId}_${type}_${Date.now()}`
      );

      const socialProof: SocialProofElement = {
        proofId,
        userId,
        type,
        title: this.getSocialProofTitle(type, metrics),
        description: this.getSocialProofDescription(type, metrics),
        metrics,
        visual: this.getSocialProofVisual(type),
        display: {
          priority: this.getSocialProofPriority(type),
          contexts: ['profile', 'leaderboard', 'sharing'],
          duration: 30, // 30 days
          autoShow: true,
        },
        socialImpact: {
          shareCount: 0,
          likeCount: 0,
          commentCount: 0,
          inspirationCount: 0,
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      this.socialProofs.set(proofId, socialProof);
      await this.saveSocialProofs();

      this.analyticsService.track('social_proof_created', {
        proofId,
        userId,
        type,
        metricsValue: metrics.value,
        timestamp: Date.now(),
      });

      return proofId;

    } catch (error) {
      console.error('Error creating social proof:', error);
      throw error;
    }
  }

  /**
   * 获取用户社会证明
   */
  getUserSocialProofs(userId: string): SocialProofElement[] {
    return Array.from(this.socialProofs.values())
      .filter(proof => proof.userId === userId && proof.isActive)
      .sort((a, b) => b.display.priority - a.display.priority);
  }

  // ===== 里程碑分享 =====

  /**
   * 创建里程碑分享
   */
  async createMilestoneShare(
    userId: string,
    milestoneType: MilestoneShare['milestoneType'],
    milestoneValue: number
  ): Promise<string> {
    try {
      const shareId = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `milestone_${userId}_${milestoneType}_${Date.now()}`
      );

      const milestoneShare: MilestoneShare = {
        shareId,
        userId,
        milestoneType,
        milestoneValue,
        milestoneTitle: this.getMilestoneTitle(milestoneType, milestoneValue),
        milestoneDescription: this.getMilestoneDescription(milestoneType, milestoneValue),
        shareContent: {
          text: this.generateMilestoneShareText(milestoneType, milestoneValue),
          hashtags: ['#SmarTalk', '#EnglishLearning', '#Milestone', '#Achievement'],
          mentions: ['@SmarTalkApp'],
          visualElements: {
            background: this.getMilestoneBackground(milestoneType),
            icons: this.getMilestoneIcons(milestoneType),
            colors: this.getMilestoneColors(milestoneType),
          },
        },
        shareStats: {
          platforms: [],
          totalShares: 0,
          totalViews: 0,
          totalClicks: 0,
          conversions: 0,
        },
        communityResponse: {
          congratulations: 0,
          inspirations: 0,
          follows: 0,
          friendRequests: 0,
        },
        achievedAt: new Date().toISOString(),
        sharedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };

      this.milestoneShares.set(shareId, milestoneShare);
      await this.saveMilestoneShares();

      // 自动触发分享
      await this.sharingService.triggerAchievementShare(
        userId,
        'custom_milestone',
        shareId,
        {
          achievementTitle: milestoneShare.milestoneTitle,
          autoTrigger: true,
        }
      );

      this.analyticsService.track('milestone_share_created', {
        shareId,
        userId,
        milestoneType,
        milestoneValue,
        timestamp: Date.now(),
      });

      return shareId;

    } catch (error) {
      console.error('Error creating milestone share:', error);
      throw error;
    }
  }

  // ===== 辅助方法 =====

  private getSocialProofTitle(type: SocialProofType, metrics: SocialProofElement['metrics']): string {
    const titles: { [key in SocialProofType]: string } = {
      learning_streak: `${metrics.value}天学习连击！`,
      achievement_unlock: `解锁新成就！`,
      milestone_reached: `达成重要里程碑！`,
      level_up: `升级到${metrics.unit}！`,
      community_rank: `社区排名第${metrics.value}名！`,
      study_time: `累计学习${metrics.value}${metrics.unit}！`,
      consistency: `坚持学习${metrics.value}天！`,
      improvement: `学习进步${metrics.value}%！`,
    };
    return titles[type];
  }

  private getSocialProofDescription(type: SocialProofType, metrics: SocialProofElement['metrics']): string {
    const descriptions: { [key in SocialProofType]: string } = {
      learning_streak: '坚持每天学习，养成良好习惯！',
      achievement_unlock: '通过努力学习获得新的成就认可！',
      milestone_reached: '在学习路上又迈出重要一步！',
      level_up: '学习能力得到显著提升！',
      community_rank: '在学习社区中表现优秀！',
      study_time: '投入大量时间专注学习！',
      consistency: '展现出色的学习坚持力！',
      improvement: '学习效果显著提升！',
    };
    return descriptions[type];
  }

  private getSocialProofVisual(type: SocialProofType): SocialProofElement['visual'] {
    const visuals: { [key in SocialProofType]: SocialProofElement['visual'] } = {
      learning_streak: { icon: '🔥', color: '#ff6b35', animation: 'pulse' },
      achievement_unlock: { icon: '🏆', color: '#ffd700', animation: 'bounce' },
      milestone_reached: { icon: '🎯', color: '#4caf50', animation: 'scale' },
      level_up: { icon: '⬆️', color: '#2196f3', animation: 'slide' },
      community_rank: { icon: '👑', color: '#9c27b0', animation: 'rotate' },
      study_time: { icon: '⏰', color: '#ff9800', animation: 'fade' },
      consistency: { icon: '💪', color: '#795548', animation: 'shake' },
      improvement: { icon: '📈', color: '#009688', animation: 'grow' },
    };
    return visuals[type];
  }

  private getSocialProofPriority(type: SocialProofType): number {
    const priorities: { [key in SocialProofType]: number } = {
      learning_streak: 9,
      achievement_unlock: 8,
      milestone_reached: 7,
      level_up: 8,
      community_rank: 9,
      study_time: 6,
      consistency: 7,
      improvement: 8,
    };
    return priorities[type];
  }

  private getMilestoneTitle(type: MilestoneShare['milestoneType'], value: number): string {
    const titles: { [key in MilestoneShare['milestoneType']]: string } = {
      days_studied: `学习${value}天达成！`,
      hours_learned: `累计学习${value}小时！`,
      words_mastered: `掌握${value}个单词！`,
      stories_completed: `完成${value}个故事！`,
      streak_achieved: `${value}天连击成就！`,
      level_reached: `达到${value}级水平！`,
    };
    return titles[type];
  }

  private getMilestoneDescription(type: MilestoneShare['milestoneType'], value: number): string {
    const descriptions: { [key in MilestoneShare['milestoneType']]: string } = {
      days_studied: '坚持每天学习，积少成多！',
      hours_learned: '投入时间，收获知识！',
      words_mastered: '词汇量稳步提升！',
      stories_completed: '通过故事学习英语！',
      streak_achieved: '保持学习连击不中断！',
      level_reached: '英语水平显著提升！',
    };
    return descriptions[type];
  }

  private generateMilestoneShareText(type: MilestoneShare['milestoneType'], value: number): string {
    const texts: { [key in MilestoneShare['milestoneType']]: string } = {
      days_studied: `🎉 我在SmarTalk坚持学习${value}天了！通过故事学英语真的很有效果，推荐大家试试！`,
      hours_learned: `📚 在SmarTalk累计学习${value}小时！每个故事都让我学到新知识，英语进步看得见！`,
      words_mastered: `📖 我在SmarTalk已经掌握${value}个单词了！故事化学习让记忆更深刻！`,
      stories_completed: `🎬 完成了${value}个英语故事！每个故事都是一次奇妙的学习之旅！`,
      streak_achieved: `🔥 SmarTalk学习连击${value}天！坚持的力量让我的英语越来越好！`,
      level_reached: `⬆️ 在SmarTalk达到${value}级水平！感谢故事化学习方法的帮助！`,
    };
    return texts[type];
  }

  private getMilestoneBackground(type: MilestoneShare['milestoneType']): string {
    const backgrounds: { [key in MilestoneShare['milestoneType']]: string } = {
      days_studied: 'gradient_blue',
      hours_learned: 'gradient_green',
      words_mastered: 'gradient_purple',
      stories_completed: 'gradient_orange',
      streak_achieved: 'gradient_red',
      level_reached: 'gradient_gold',
    };
    return backgrounds[type];
  }

  private getMilestoneIcons(type: MilestoneShare['milestoneType']): string[] {
    const icons: { [key in MilestoneShare['milestoneType']]: string[] } = {
      days_studied: ['📅', '✅', '🎯'],
      hours_learned: ['⏰', '📚', '💡'],
      words_mastered: ['📖', '🧠', '💪'],
      stories_completed: ['🎬', '📚', '🌟'],
      streak_achieved: ['🔥', '⚡', '🏆'],
      level_reached: ['⬆️', '🎓', '🌟'],
    };
    return icons[type];
  }

  private getMilestoneColors(type: MilestoneShare['milestoneType']): string[] {
    const colors: { [key in MilestoneShare['milestoneType']]: string[] } = {
      days_studied: ['#3b82f6', '#1e40af', '#dbeafe'],
      hours_learned: ['#10b981', '#047857', '#d1fae5'],
      words_mastered: ['#8b5cf6', '#5b21b6', '#ede9fe'],
      stories_completed: ['#f59e0b', '#d97706', '#fef3c7'],
      streak_achieved: ['#ef4444', '#dc2626', '#fee2e2'],
      level_reached: ['#fbbf24', '#f59e0b', '#fef3c7'],
    };
    return colors[type];
  }

  // ===== 定期更新 =====

  private async updateCompetitionLeaderboards(): Promise<void> {
    try {
      // 模拟更新竞争排行榜
      this.competitions.forEach(competition => {
        if (competition.status === 'active') {
          competition.leaderboard.forEach(entry => {
            // 模拟分数增长
            entry.score += Math.floor(Math.random() * 10);
            entry.lastUpdated = new Date().toISOString();
          });
          
          // 重新排序
          competition.leaderboard.sort((a, b) => b.score - a.score);
          competition.leaderboard.forEach((entry, index) => {
            entry.rank = index + 1;
          });
        }
      });

      await this.saveCompetitions();

    } catch (error) {
      console.error('Error updating competition leaderboards:', error);
    }
  }

  private async updateSocialProofs(): Promise<void> {
    try {
      // 清理过期的社会证明
      const now = new Date();
      
      this.socialProofs.forEach((proof, proofId) => {
        if (proof.expiresAt && new Date(proof.expiresAt) < now) {
          proof.isActive = false;
        }
      });

      await this.saveSocialProofs();

    } catch (error) {
      console.error('Error updating social proofs:', error);
    }
  }

  // ===== 数据持久化 =====

  private async saveFriends(): Promise<void> {
    try {
      const friends = Array.from(this.friends.values());
      await AsyncStorage.setItem(this.FRIENDS_KEY, JSON.stringify(friends));
    } catch (error) {
      console.error('Error saving friends:', error);
    }
  }

  private async saveReferralRecords(): Promise<void> {
    try {
      const referrals = Array.from(this.referralRecords.values());
      await AsyncStorage.setItem(this.REFERRALS_KEY, JSON.stringify(referrals));
    } catch (error) {
      console.error('Error saving referral records:', error);
    }
  }

  private async saveCompetitions(): Promise<void> {
    try {
      const competitions = Array.from(this.competitions.values());
      await AsyncStorage.setItem(this.COMPETITIONS_KEY, JSON.stringify(competitions));
    } catch (error) {
      console.error('Error saving competitions:', error);
    }
  }

  private async saveSocialProofs(): Promise<void> {
    try {
      const proofs = Array.from(this.socialProofs.values());
      await AsyncStorage.setItem(this.PROOFS_KEY, JSON.stringify(proofs));
    } catch (error) {
      console.error('Error saving social proofs:', error);
    }
  }

  private async saveMilestoneShares(): Promise<void> {
    try {
      const milestones = Array.from(this.milestoneShares.values());
      await AsyncStorage.setItem(this.MILESTONES_KEY, JSON.stringify(milestones));
    } catch (error) {
      console.error('Error saving milestone shares:', error);
    }
  }

  // ===== 公共API =====

  /**
   * 获取推荐统计
   */
  getReferralStatistics(userId: string): {
    totalInvites: number;
    successfulReferrals: number;
    pendingRewards: number;
    totalRewardsEarned: number;
  } {
    const userReferrals = Array.from(this.referralRecords.values())
      .filter(referral => referral.referrerUserId === userId);

    const totalInvites = userReferrals.length;
    const successfulReferrals = userReferrals.filter(r => r.status === 'activated').length;
    const pendingRewards = userReferrals.filter(r => 
      r.status === 'activated' && !r.rewards.referrerReward.claimed
    ).length;
    const totalRewardsEarned = userReferrals.filter(r => 
      r.rewards.referrerReward.claimed
    ).length;

    return {
      totalInvites,
      successfulReferrals,
      pendingRewards,
      totalRewardsEarned,
    };
  }

  /**
   * 获取活跃竞争
   */
  getActiveCompetitions(): LearningCompetition[] {
    return Array.from(this.competitions.values())
      .filter(competition => competition.status === 'active')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * 获取用户里程碑分享
   */
  getUserMilestoneShares(userId: string): MilestoneShare[] {
    return Array.from(this.milestoneShares.values())
      .filter(share => share.userId === userId)
      .sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime());
  }

  /**
   * 获取社交统计
   */
  getSocialStatistics(): {
    totalFriends: number;
    activeCompetitions: number;
    totalSocialProofs: number;
    totalMilestoneShares: number;
  } {
    return {
      totalFriends: Array.from(this.friends.values()).filter(f => f.status === 'accepted').length,
      activeCompetitions: Array.from(this.competitions.values()).filter(c => c.status === 'active').length,
      totalSocialProofs: Array.from(this.socialProofs.values()).filter(p => p.isActive).length,
      totalMilestoneShares: this.milestoneShares.size,
    };
  }
}

export default ReferralSocialService;
