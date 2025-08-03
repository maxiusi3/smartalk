/**
 * EnhancedSRSUserExperienceService - V2 增强间隔重复系统用户体验服务
 * 提供完整的SRS用户体验：智能通知、快节奏复习、自评系统、非侵入式提醒
 * 支持个性化复习策略、情感化交互、学习习惯分析
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { AnalyticsService } from './AnalyticsService';
import SRSService, { SRSCard } from './SRSService';
import { useSoundAndHaptic } from '@/hooks/useSoundAndHaptic';

// SRS用户体验配置
export interface SRSUserExperienceConfig {
  userId: string;
  
  // 通知偏好
  notificationPreferences: {
    enabled: boolean;
    quietHours: {
      enabled: boolean;
      startHour: number;
      endHour: number;
    };
    frequency: 'low' | 'medium' | 'high'; // 1-2, 3-4, 5+ per day
    reminderStyle: 'gentle' | 'motivational' | 'urgent';
    customMessages: string[];
  };
  
  // 复习偏好
  reviewPreferences: {
    sessionLength: 'short' | 'medium' | 'long'; // 5, 10, 15 cards
    reviewSpeed: 'relaxed' | 'normal' | 'fast'; // 10s, 7s, 5s per card
    difficultyAdaptation: boolean;
    showProgress: boolean;
    celebrateStreaks: boolean;
  };
  
  // 学习习惯
  learningHabits: {
    preferredTimes: number[]; // hours of day
    averageSessionDuration: number; // minutes
    consistencyScore: number; // 0-100
    lastActiveTime: string;
    streakCount: number;
    longestStreak: number;
  };
  
  // 个性化设置
  personalization: {
    motivationLevel: 'low' | 'medium' | 'high';
    feedbackStyle: 'minimal' | 'encouraging' | 'detailed';
    visualTheme: 'simple' | 'colorful' | 'elegant';
    soundEnabled: boolean;
    hapticsEnabled: boolean;
  };
}

// SRS会话状态
export interface SRSSessionState {
  sessionId: string;
  userId: string;
  
  // 会话信息
  startedAt: string;
  completedAt?: string;
  sessionType: 'scheduled' | 'manual' | 'streak_recovery';
  
  // 复习卡片
  cards: SRSCard[];
  currentCardIndex: number;
  
  // 会话配置
  targetDuration: number; // seconds
  maxCards: number;
  
  // 实时状态
  responses: SRSResponse[];
  currentStreak: number;
  perfectAnswers: number;
  
  // 性能指标
  averageResponseTime: number;
  accuracyRate: number;
  
  // 情感状态
  userMood: 'frustrated' | 'neutral' | 'confident' | 'excited';
  engagementLevel: number; // 0-100
}

// SRS响应记录
export interface SRSResponse {
  cardId: string;
  response: 'instantly_got_it' | 'had_to_think' | 'forgot';
  responseTime: number; // milliseconds
  timestamp: string;
  
  // 上下文信息
  cardDifficulty: number;
  previousInterval: number;
  newInterval: number;
  
  // 用户反馈
  confidence: number; // 1-5
  difficulty: number; // 1-5
  enjoyment?: number; // 1-5
}

// 智能通知策略
export interface IntelligentNotificationStrategy {
  userId: string;
  
  // 用户行为分析
  activityPattern: {
    mostActiveHours: number[];
    averageSessionsPerDay: number;
    responseRate: number; // to notifications
    lastEngagementTime: string;
  };
  
  // 通知优化
  notificationOptimization: {
    bestTimes: number[];
    worstTimes: number[];
    optimalFrequency: number;
    messageEffectiveness: { [message: string]: number };
  };
  
  // 个性化消息
  personalizedMessages: {
    motivational: string[];
    gentle: string[];
    urgent: string[];
    streak_recovery: string[];
    achievement: string[];
  };
}

// 复习提醒类型
export type ReviewPromptType = 
  | 'gentle_reminder'      // 温和提醒
  | 'streak_maintenance'   // 连击维持
  | 'forgetting_curve'     // 遗忘曲线
  | 'achievement_unlock'   // 成就解锁
  | 'habit_building'       // 习惯养成
  | 'comeback_encouragement'; // 回归鼓励

class EnhancedSRSUserExperienceService {
  private static instance: EnhancedSRSUserExperienceService;
  private analyticsService = AnalyticsService.getInstance();
  private srsService = SRSService.getInstance();
  
  // 用户配置和状态
  private userConfigs: Map<string, SRSUserExperienceConfig> = new Map();
  private activeSessions: Map<string, SRSSessionState> = new Map();
  private notificationStrategies: Map<string, IntelligentNotificationStrategy> = new Map();
  
  // 通知管理
  private scheduledNotifications: Map<string, string[]> = new Map(); // userId -> notificationIds
  
  // 存储键
  private readonly USER_CONFIGS_KEY = 'srs_user_configs';
  private readonly NOTIFICATION_STRATEGIES_KEY = 'srs_notification_strategies';

  static getInstance(): EnhancedSRSUserExperienceService {
    if (!EnhancedSRSUserExperienceService.instance) {
      EnhancedSRSUserExperienceService.instance = new EnhancedSRSUserExperienceService();
    }
    return EnhancedSRSUserExperienceService.instance;
  }

  constructor() {
    this.initializeService();
  }

  // ===== 初始化 =====

  /**
   * 初始化增强SRS用户体验服务
   */
  private async initializeService(): Promise<void> {
    try {
      // 配置通知
      await this.configureNotifications();
      
      // 加载本地数据
      await this.loadLocalData();
      
      // 开始智能分析
      this.startIntelligentAnalysis();
      
      this.analyticsService.track('enhanced_srs_ux_service_initialized', {
        usersCount: this.userConfigs.size,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error initializing enhanced SRS UX service:', error);
    }
  }

  /**
   * 配置通知系统
   */
  private async configureNotifications(): Promise<void> {
    try {
      // 设置通知处理器
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      // 监听通知响应
      Notifications.addNotificationResponseReceivedListener(response => {
        this.handleNotificationResponse(response);
      });

    } catch (error) {
      console.error('Error configuring notifications:', error);
    }
  }

  /**
   * 加载本地数据
   */
  private async loadLocalData(): Promise<void> {
    try {
      // 加载用户配置
      const configsData = await AsyncStorage.getItem(this.USER_CONFIGS_KEY);
      if (configsData) {
        const configs: SRSUserExperienceConfig[] = JSON.parse(configsData);
        configs.forEach(config => {
          this.userConfigs.set(config.userId, config);
        });
      }

      // 加载通知策略
      const strategiesData = await AsyncStorage.getItem(this.NOTIFICATION_STRATEGIES_KEY);
      if (strategiesData) {
        const strategies: IntelligentNotificationStrategy[] = JSON.parse(strategiesData);
        strategies.forEach(strategy => {
          this.notificationStrategies.set(strategy.userId, strategy);
        });
      }

    } catch (error) {
      console.error('Error loading local data:', error);
    }
  }

  /**
   * 开始智能分析
   */
  private startIntelligentAnalysis(): void {
    // 每小时分析用户行为模式
    setInterval(() => {
      this.analyzeUserBehaviorPatterns();
    }, 60 * 60 * 1000);
    
    // 每天优化通知策略
    setInterval(() => {
      this.optimizeNotificationStrategies();
    }, 24 * 60 * 60 * 1000);
    
    // 立即执行一次
    this.analyzeUserBehaviorPatterns();
  }

  // ===== 用户配置管理 =====

  /**
   * 初始化用户配置
   */
  async initializeUserConfig(userId: string): Promise<SRSUserExperienceConfig> {
    try {
      const config: SRSUserExperienceConfig = {
        userId,
        notificationPreferences: {
          enabled: true,
          quietHours: {
            enabled: true,
            startHour: 22,
            endHour: 8,
          },
          frequency: 'medium',
          reminderStyle: 'motivational',
          customMessages: [],
        },
        reviewPreferences: {
          sessionLength: 'medium',
          reviewSpeed: 'normal',
          difficultyAdaptation: true,
          showProgress: true,
          celebrateStreaks: true,
        },
        learningHabits: {
          preferredTimes: [9, 12, 18, 21], // 默认学习时间
          averageSessionDuration: 5,
          consistencyScore: 0,
          lastActiveTime: new Date().toISOString(),
          streakCount: 0,
          longestStreak: 0,
        },
        personalization: {
          motivationLevel: 'medium',
          feedbackStyle: 'encouraging',
          visualTheme: 'colorful',
          soundEnabled: true,
          hapticsEnabled: true,
        },
      };

      this.userConfigs.set(userId, config);
      await this.saveUserConfigs();

      // 初始化通知策略
      await this.initializeNotificationStrategy(userId);

      return config;

    } catch (error) {
      console.error('Error initializing user config:', error);
      throw error;
    }
  }

  /**
   * 更新用户配置
   */
  async updateUserConfig(userId: string, updates: Partial<SRSUserExperienceConfig>): Promise<void> {
    try {
      const config = this.userConfigs.get(userId);
      if (!config) {
        await this.initializeUserConfig(userId);
        return;
      }

      const updatedConfig = { ...config, ...updates };
      this.userConfigs.set(userId, updatedConfig);
      await this.saveUserConfigs();

      // 重新调度通知
      if (updates.notificationPreferences) {
        await this.rescheduleNotifications(userId);
      }

      this.analyticsService.track('srs_user_config_updated', {
        userId,
        updates: Object.keys(updates),
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error updating user config:', error);
      throw error;
    }
  }

  // ===== 智能通知系统 =====

  /**
   * 初始化通知策略
   */
  private async initializeNotificationStrategy(userId: string): Promise<void> {
    try {
      const strategy: IntelligentNotificationStrategy = {
        userId,
        activityPattern: {
          mostActiveHours: [9, 12, 18, 21],
          averageSessionsPerDay: 2,
          responseRate: 0.7,
          lastEngagementTime: new Date().toISOString(),
        },
        notificationOptimization: {
          bestTimes: [9, 18],
          worstTimes: [1, 2, 3, 4, 5, 6],
          optimalFrequency: 3,
          messageEffectiveness: {},
        },
        personalizedMessages: {
          motivational: [
            '🌟 准备好迎接新的学习挑战了吗？',
            '💪 继续保持，你的英语正在稳步提升！',
            '🎯 今天的复习会让你更接近流利英语！',
          ],
          gentle: [
            '📚 有几个单词想和你重新见面',
            '🌸 轻松复习几分钟，巩固学习成果',
            '☕ 喝咖啡的时间，顺便复习一下？',
          ],
          urgent: [
            '⏰ 遗忘曲线提醒：现在复习效果最佳！',
            '🔥 连击即将中断，快来拯救你的学习记录！',
            '💎 重要单词需要及时复习，别让它们溜走！',
          ],
          streak_recovery: [
            '🌈 每个人都有低谷，重新开始永远不晚',
            '🚀 重启学习引擎，继续你的英语之旅',
            '💝 我们为你保留了学习进度，随时欢迎回来',
          ],
          achievement: [
            '🏆 恭喜解锁新成就！分享你的学习成果吧',
            '⭐ 你的坚持获得了回报，继续加油！',
            '🎉 学习里程碑达成，为自己骄傲吧！',
          ],
        },
      };

      this.notificationStrategies.set(userId, strategy);
      await this.saveNotificationStrategies();

    } catch (error) {
      console.error('Error initializing notification strategy:', error);
    }
  }

  /**
   * 调度智能通知
   */
  async scheduleIntelligentNotifications(userId: string): Promise<void> {
    try {
      const config = this.userConfigs.get(userId);
      const strategy = this.notificationStrategies.get(userId);
      
      if (!config?.notificationPreferences.enabled || !strategy) return;

      // 取消现有通知
      await this.cancelScheduledNotifications(userId);

      // 获取待复习卡片
      const dueCards = await this.srsService.getDueCards(userId);
      if (dueCards.length === 0) return;

      // 计算最佳通知时间
      const optimalTimes = this.calculateOptimalNotificationTimes(config, strategy);
      
      // 调度通知
      const notificationIds: string[] = [];
      
      for (const time of optimalTimes) {
        const notificationId = await this.scheduleNotification(
          userId,
          time,
          this.selectOptimalMessage(strategy, 'gentle_reminder'),
          dueCards.length
        );
        
        if (notificationId) {
          notificationIds.push(notificationId);
        }
      }

      this.scheduledNotifications.set(userId, notificationIds);

      this.analyticsService.track('intelligent_notifications_scheduled', {
        userId,
        notificationsCount: notificationIds.length,
        dueCardsCount: dueCards.length,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error scheduling intelligent notifications:', error);
    }
  }

  /**
   * 计算最佳通知时间
   */
  private calculateOptimalNotificationTimes(
    config: SRSUserExperienceConfig,
    strategy: IntelligentNotificationStrategy
  ): Date[] {
    const now = new Date();
    const times: Date[] = [];
    
    // 基于用户偏好和行为模式
    const preferredHours = config.learningHabits.preferredTimes;
    const bestHours = strategy.notificationOptimization.bestTimes;
    
    // 合并并排序最佳时间
    const optimalHours = [...new Set([...preferredHours, ...bestHours])].sort();
    
    // 根据频率设置选择时间点
    const frequency = config.notificationPreferences.frequency;
    const maxNotifications = frequency === 'low' ? 2 : frequency === 'medium' ? 3 : 5;
    
    for (let i = 0; i < Math.min(optimalHours.length, maxNotifications); i++) {
      const hour = optimalHours[i];
      
      // 检查是否在静默时间内
      if (this.isInQuietHours(hour, config.notificationPreferences.quietHours)) {
        continue;
      }
      
      const notificationTime = new Date(now);
      notificationTime.setHours(hour, 0, 0, 0);
      
      // 如果时间已过，设置为明天
      if (notificationTime <= now) {
        notificationTime.setDate(notificationTime.getDate() + 1);
      }
      
      times.push(notificationTime);
    }
    
    return times;
  }

  /**
   * 检查是否在静默时间内
   */
  private isInQuietHours(hour: number, quietHours: { enabled: boolean; startHour: number; endHour: number }): boolean {
    if (!quietHours.enabled) return false;
    
    const { startHour, endHour } = quietHours;
    
    if (startHour <= endHour) {
      return hour >= startHour && hour <= endHour;
    } else {
      // 跨越午夜的情况
      return hour >= startHour || hour <= endHour;
    }
  }

  /**
   * 选择最佳消息
   */
  private selectOptimalMessage(strategy: IntelligentNotificationStrategy, promptType: ReviewPromptType): string {
    const messages = strategy.personalizedMessages.gentle; // 默认使用温和消息
    
    // 基于消息效果选择
    const effectiveness = strategy.notificationOptimization.messageEffectiveness;
    const sortedMessages = messages.sort((a, b) => (effectiveness[b] || 0) - (effectiveness[a] || 0));
    
    return sortedMessages[0] || messages[0];
  }

  /**
   * 调度单个通知
   */
  private async scheduleNotification(
    userId: string,
    scheduledTime: Date,
    message: string,
    dueCardsCount: number
  ): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'SmarTalk 复习提醒',
          body: `${message} (${dueCardsCount}个单词等待复习)`,
          data: {
            userId,
            type: 'srs_review',
            dueCardsCount,
          },
        },
        trigger: {
          date: scheduledTime,
        },
      });

      return notificationId;

    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  /**
   * 取消已调度的通知
   */
  private async cancelScheduledNotifications(userId: string): Promise<void> {
    try {
      const notificationIds = this.scheduledNotifications.get(userId);
      if (!notificationIds) return;

      for (const notificationId of notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }

      this.scheduledNotifications.delete(userId);

    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  /**
   * 重新调度通知
   */
  private async rescheduleNotifications(userId: string): Promise<void> {
    await this.cancelScheduledNotifications(userId);
    await this.scheduleIntelligentNotifications(userId);
  }

  /**
   * 处理通知响应
   */
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    try {
      const { userId, type } = response.notification.request.content.data as any;
      
      if (type === 'srs_review') {
        // 记录通知响应
        this.recordNotificationResponse(userId, true);
        
        // 触发复习会话
        this.triggerReviewSession(userId, 'scheduled');
      }

    } catch (error) {
      console.error('Error handling notification response:', error);
    }
  }

  /**
   * 记录通知响应
   */
  private recordNotificationResponse(userId: string, responded: boolean): void {
    try {
      const strategy = this.notificationStrategies.get(userId);
      if (!strategy) return;

      // 更新响应率
      const currentRate = strategy.activityPattern.responseRate;
      const newRate = responded ? 
        Math.min(1, currentRate + 0.1) : 
        Math.max(0, currentRate - 0.05);
      
      strategy.activityPattern.responseRate = newRate;
      strategy.activityPattern.lastEngagementTime = new Date().toISOString();

      this.notificationStrategies.set(userId, strategy);

    } catch (error) {
      console.error('Error recording notification response:', error);
    }
  }

  // ===== 快节奏复习会话 =====

  /**
   * 开始复习会话
   */
  async startReviewSession(
    userId: string,
    sessionType: 'scheduled' | 'manual' | 'streak_recovery' = 'manual'
  ): Promise<string> {
    try {
      const config = this.userConfigs.get(userId);
      if (!config) {
        await this.initializeUserConfig(userId);
      }

      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 获取待复习卡片
      const dueCards = await this.srsService.getDueCards(userId);
      
      // 根据配置确定会话参数
      const maxCards = this.getSessionMaxCards(config!.reviewPreferences.sessionLength);
      const targetDuration = this.getSessionTargetDuration(config!.reviewPreferences.sessionLength);
      
      const session: SRSSessionState = {
        sessionId,
        userId,
        startedAt: new Date().toISOString(),
        sessionType,
        cards: dueCards.slice(0, maxCards),
        currentCardIndex: 0,
        targetDuration,
        maxCards,
        responses: [],
        currentStreak: 0,
        perfectAnswers: 0,
        averageResponseTime: 0,
        accuracyRate: 0,
        userMood: 'neutral',
        engagementLevel: 50,
      };

      this.activeSessions.set(sessionId, session);

      this.analyticsService.track('srs_review_session_started', {
        sessionId,
        userId,
        sessionType,
        cardsCount: session.cards.length,
        timestamp: Date.now(),
      });

      return sessionId;

    } catch (error) {
      console.error('Error starting review session:', error);
      throw error;
    }
  }

  /**
   * 获取会话最大卡片数
   */
  private getSessionMaxCards(sessionLength: 'short' | 'medium' | 'long'): number {
    switch (sessionLength) {
      case 'short': return 5;
      case 'medium': return 10;
      case 'long': return 15;
      default: return 10;
    }
  }

  /**
   * 获取会话目标时长
   */
  private getSessionTargetDuration(sessionLength: 'short' | 'medium' | 'long'): number {
    switch (sessionLength) {
      case 'short': return 60; // 1 minute
      case 'medium': return 120; // 2 minutes
      case 'long': return 180; // 3 minutes
      default: return 120;
    }
  }

  /**
   * 触发复习会话
   */
  private async triggerReviewSession(userId: string, sessionType: 'scheduled' | 'manual' | 'streak_recovery'): Promise<void> {
    try {
      const sessionId = await this.startReviewSession(userId, sessionType);
      
      // 这里可以触发导航到复习界面
      // 在实际应用中，这会通过事件系统或导航服务来处理
      
    } catch (error) {
      console.error('Error triggering review session:', error);
    }
  }

  // ===== 行为分析 =====

  /**
   * 分析用户行为模式
   */
  private async analyzeUserBehaviorPatterns(): Promise<void> {
    try {
      for (const [userId, config] of this.userConfigs) {
        const strategy = this.notificationStrategies.get(userId);
        if (!strategy) continue;

        // 分析学习时间模式
        const recentSessions = await this.getRecentSessions(userId, 7); // 最近7天
        const activeHours = this.extractActiveHours(recentSessions);
        
        // 更新活动模式
        strategy.activityPattern.mostActiveHours = activeHours;
        strategy.activityPattern.averageSessionsPerDay = recentSessions.length / 7;
        
        // 优化通知时间
        strategy.notificationOptimization.bestTimes = activeHours.slice(0, 3);
        
        this.notificationStrategies.set(userId, strategy);
      }
      
      await this.saveNotificationStrategies();

    } catch (error) {
      console.error('Error analyzing user behavior patterns:', error);
    }
  }

  /**
   * 获取最近会话
   */
  private async getRecentSessions(userId: string, days: number): Promise<SRSSessionState[]> {
    // 这里应该从数据库或存储中获取实际的会话数据
    // 现在返回模拟数据
    return [];
  }

  /**
   * 提取活跃时间
   */
  private extractActiveHours(sessions: SRSSessionState[]): number[] {
    const hourCounts: { [hour: number]: number } = {};
    
    sessions.forEach(session => {
      const hour = new Date(session.startedAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    return Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([hour]) => parseInt(hour))
      .slice(0, 4);
  }

  /**
   * 优化通知策略
   */
  private async optimizeNotificationStrategies(): Promise<void> {
    try {
      for (const [userId, strategy] of this.notificationStrategies) {
        // 基于响应率调整频率
        if (strategy.activityPattern.responseRate < 0.3) {
          // 响应率低，减少通知频率
          const config = this.userConfigs.get(userId);
          if (config && config.notificationPreferences.frequency !== 'low') {
            config.notificationPreferences.frequency = 'low';
            this.userConfigs.set(userId, config);
          }
        } else if (strategy.activityPattern.responseRate > 0.8) {
          // 响应率高，可以适当增加频率
          const config = this.userConfigs.get(userId);
          if (config && config.notificationPreferences.frequency === 'low') {
            config.notificationPreferences.frequency = 'medium';
            this.userConfigs.set(userId, config);
          }
        }
        
        // 重新调度通知
        await this.rescheduleNotifications(userId);
      }
      
      await this.saveUserConfigs();

    } catch (error) {
      console.error('Error optimizing notification strategies:', error);
    }
  }

  // ===== 数据持久化 =====

  private async saveUserConfigs(): Promise<void> {
    try {
      const configs = Array.from(this.userConfigs.values());
      await AsyncStorage.setItem(this.USER_CONFIGS_KEY, JSON.stringify(configs));
    } catch (error) {
      console.error('Error saving user configs:', error);
    }
  }

  private async saveNotificationStrategies(): Promise<void> {
    try {
      const strategies = Array.from(this.notificationStrategies.values());
      await AsyncStorage.setItem(this.NOTIFICATION_STRATEGIES_KEY, JSON.stringify(strategies));
    } catch (error) {
      console.error('Error saving notification strategies:', error);
    }
  }

  // ===== 公共API =====

  /**
   * 获取用户配置
   */
  getUserConfig(userId: string): SRSUserExperienceConfig | null {
    return this.userConfigs.get(userId) || null;
  }

  /**
   * 获取活跃会话
   */
  getActiveSession(sessionId: string): SRSSessionState | null {
    return this.activeSessions.get(sessionId) || null;
  }

  /**
   * 获取用户统计
   */
  getUserStatistics(userId: string): {
    totalSessions: number;
    averageAccuracy: number;
    currentStreak: number;
    longestStreak: number;
    notificationResponseRate: number;
  } {
    const config = this.userConfigs.get(userId);
    const strategy = this.notificationStrategies.get(userId);
    
    return {
      totalSessions: 0, // 从历史数据计算
      averageAccuracy: 0.85, // 从历史数据计算
      currentStreak: config?.learningHabits.streakCount || 0,
      longestStreak: config?.learningHabits.longestStreak || 0,
      notificationResponseRate: strategy?.activityPattern.responseRate || 0,
    };
  }
}

export default EnhancedSRSUserExperienceService;
