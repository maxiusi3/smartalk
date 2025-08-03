/**
 * SRSNotificationService - V2 SRS通知和触发系统
 * 提供智能复习提醒：推送通知、应用内提示、个性化时机
 * 支持用户活动模式分析、通知权限管理、复习触发优化
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalyticsService } from './AnalyticsService';
import LearningProgressService, { KeywordProgress } from './LearningProgressService';
import UserStateService from './UserStateService';

// 通知类型
export type NotificationType = 
  | 'review_reminder'
  | 'streak_reminder'
  | 'achievement_unlock'
  | 'daily_goal'
  | 'weekly_summary';

// 通知设置
export interface NotificationSettings {
  enabled: boolean;
  reviewReminders: boolean;
  streakReminders: boolean;
  achievementNotifications: boolean;
  dailyGoalReminders: boolean;
  
  // 时间设置
  preferredTime: {
    hour: number; // 0-23
    minute: number; // 0-59
  };
  
  // 频率设置
  reviewReminderFrequency: 'immediate' | 'daily' | 'every_2_days' | 'weekly';
  streakReminderEnabled: boolean;
  
  // 高级设置
  intelligentTiming: boolean; // 基于用户活动模式
  quietHours: {
    enabled: boolean;
    startHour: number;
    endHour: number;
  };
}

// 通知内容
export interface NotificationContent {
  title: string;
  body: string;
  data?: any;
  categoryId?: string;
  sound?: boolean;
  badge?: number;
}

// 用户活动模式
export interface UserActivityPattern {
  userId: string;
  
  // 活跃时间段
  activeHours: {
    hour: number;
    activityScore: number; // 0-1
  }[];
  
  // 学习偏好
  preferredLearningTimes: number[]; // 小时数组
  averageSessionDuration: number; // minutes
  
  // 响应模式
  notificationResponseRate: number; // 0-1
  bestResponseTimes: number[]; // 小时数组
  
  // 更新时间
  lastUpdatedAt: string;
}

// 计划的通知
export interface ScheduledNotification {
  id: string;
  userId: string;
  type: NotificationType;
  content: NotificationContent;
  
  // 调度信息
  scheduledFor: string;
  triggerKeywords?: string[]; // 触发此通知的关键词
  
  // 状态
  status: 'scheduled' | 'sent' | 'cancelled' | 'failed';
  sentAt?: string;
  
  // 响应数据
  opened: boolean;
  openedAt?: string;
  actionTaken?: string;
  
  createdAt: string;
}

class SRSNotificationService {
  private static instance: SRSNotificationService;
  private analyticsService = AnalyticsService.getInstance();
  private learningProgressService = LearningProgressService.getInstance();
  private userStateService = UserStateService.getInstance();
  
  // 通知设置和状态
  private notificationSettings: Map<string, NotificationSettings> = new Map();
  private userActivityPatterns: Map<string, UserActivityPattern> = new Map();
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  
  // 权限状态
  private hasNotificationPermission: boolean = false;
  private permissionRequestShown: boolean = false;
  
  // 存储键
  private readonly SETTINGS_KEY = 'notification_settings';
  private readonly PATTERNS_KEY = 'activity_patterns';
  private readonly SCHEDULED_KEY = 'scheduled_notifications';
  private readonly PERMISSION_KEY = 'notification_permission_shown';

  static getInstance(): SRSNotificationService {
    if (!SRSNotificationService.instance) {
      SRSNotificationService.instance = new SRSNotificationService();
    }
    return SRSNotificationService.instance;
  }

  constructor() {
    this.initializeService();
  }

  // ===== 初始化 =====

  /**
   * 初始化SRS通知服务
   */
  private async initializeService(): Promise<void> {
    try {
      // 配置通知处理器
      this.configureNotificationHandlers();
      
      // 加载本地数据
      await this.loadLocalData();
      
      // 检查通知权限
      await this.checkNotificationPermission();
      
      // 开始活动模式跟踪
      this.startActivityTracking();
      
      this.analyticsService.track('srs_notification_service_initialized', {
        hasPermission: this.hasNotificationPermission,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error initializing SRS notification service:', error);
    }
  }

  /**
   * 配置通知处理器
   */
  private configureNotificationHandlers(): void {
    // 设置通知处理器
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // 监听通知响应
    Notifications.addNotificationResponseReceivedListener(response => {
      this.handleNotificationResponse(response);
    });

    // 监听前台通知
    Notifications.addNotificationReceivedListener(notification => {
      this.handleNotificationReceived(notification);
    });
  }

  /**
   * 加载本地数据
   */
  private async loadLocalData(): Promise<void> {
    try {
      // 加载通知设置
      const settingsData = await AsyncStorage.getItem(this.SETTINGS_KEY);
      if (settingsData) {
        const settings: { [userId: string]: NotificationSettings } = JSON.parse(settingsData);
        Object.entries(settings).forEach(([userId, setting]) => {
          this.notificationSettings.set(userId, setting);
        });
      }

      // 加载活动模式
      const patternsData = await AsyncStorage.getItem(this.PATTERNS_KEY);
      if (patternsData) {
        const patterns: UserActivityPattern[] = JSON.parse(patternsData);
        patterns.forEach(pattern => {
          this.userActivityPatterns.set(pattern.userId, pattern);
        });
      }

      // 加载计划通知
      const scheduledData = await AsyncStorage.getItem(this.SCHEDULED_KEY);
      if (scheduledData) {
        const notifications: ScheduledNotification[] = JSON.parse(scheduledData);
        notifications.forEach(notification => {
          this.scheduledNotifications.set(notification.id, notification);
        });
      }

      // 加载权限状态
      const permissionShown = await AsyncStorage.getItem(this.PERMISSION_KEY);
      this.permissionRequestShown = permissionShown === 'true';

    } catch (error) {
      console.error('Error loading local data:', error);
    }
  }

  /**
   * 检查通知权限
   */
  private async checkNotificationPermission(): Promise<void> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      this.hasNotificationPermission = status === 'granted';
    } catch (error) {
      console.error('Error checking notification permission:', error);
      this.hasNotificationPermission = false;
    }
  }

  /**
   * 开始活动模式跟踪
   */
  private startActivityTracking(): void {
    // 定期更新用户活动模式
    setInterval(() => {
      this.updateActivityPatterns();
    }, 60000); // 每分钟更新一次
  }

  // ===== 权限管理 =====

  /**
   * 请求通知权限
   */
  async requestNotificationPermission(userId: string): Promise<boolean> {
    try {
      if (this.hasNotificationPermission) return true;

      const { status } = await Notifications.requestPermissionsAsync();
      this.hasNotificationPermission = status === 'granted';
      this.permissionRequestShown = true;

      // 保存权限请求状态
      await AsyncStorage.setItem(this.PERMISSION_KEY, 'true');

      this.analyticsService.track('notification_permission_requested', {
        userId,
        granted: this.hasNotificationPermission,
        timestamp: Date.now(),
      });

      return this.hasNotificationPermission;

    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * 检查是否应该请求权限
   */
  shouldRequestPermission(userId: string): boolean {
    // 在用户完成第一个魔法时刻后请求权限
    if (this.permissionRequestShown || this.hasNotificationPermission) {
      return false;
    }

    const userProgress = this.learningProgressService.getUserProgress(userId);
    if (!userProgress) return false;

    // 检查是否有完成的故事
    const hasCompletedStory = userProgress.then(progress => 
      progress?.themes.some(theme => 
        theme.stories.some(story => story.status === 'completed')
      )
    );

    return !!hasCompletedStory;
  }

  // ===== 通知设置 =====

  /**
   * 获取用户通知设置
   */
  getNotificationSettings(userId: string): NotificationSettings {
    return this.notificationSettings.get(userId) || this.getDefaultSettings();
  }

  /**
   * 获取默认通知设置
   */
  private getDefaultSettings(): NotificationSettings {
    return {
      enabled: true,
      reviewReminders: true,
      streakReminders: true,
      achievementNotifications: true,
      dailyGoalReminders: false,
      preferredTime: {
        hour: 19, // 晚上7点
        minute: 0,
      },
      reviewReminderFrequency: 'daily',
      streakReminderEnabled: true,
      intelligentTiming: true,
      quietHours: {
        enabled: true,
        startHour: 22, // 晚上10点
        endHour: 8,    // 早上8点
      },
    };
  }

  /**
   * 更新通知设置
   */
  async updateNotificationSettings(userId: string, settings: Partial<NotificationSettings>): Promise<void> {
    try {
      const currentSettings = this.getNotificationSettings(userId);
      const updatedSettings = { ...currentSettings, ...settings };
      
      this.notificationSettings.set(userId, updatedSettings);
      await this.saveNotificationSettings();

      this.analyticsService.track('notification_settings_updated', {
        userId,
        changes: Object.keys(settings),
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  }

  /**
   * 保存通知设置
   */
  private async saveNotificationSettings(): Promise<void> {
    try {
      const settingsObject: { [userId: string]: NotificationSettings } = {};
      this.notificationSettings.forEach((settings, userId) => {
        settingsObject[userId] = settings;
      });
      
      await AsyncStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settingsObject));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  // ===== 复习提醒 =====

  /**
   * 安排复习提醒
   */
  async scheduleReviewReminder(userId: string, keywords: KeywordProgress[]): Promise<void> {
    try {
      if (!this.hasNotificationPermission) return;

      const settings = this.getNotificationSettings(userId);
      if (!settings.enabled || !settings.reviewReminders) return;

      // 计算最佳通知时间
      const optimalTime = await this.calculateOptimalNotificationTime(userId);
      
      // 创建通知内容
      const content = this.createReviewReminderContent(keywords);
      
      // 安排通知
      const notificationId = await this.scheduleNotification(
        userId,
        'review_reminder',
        content,
        optimalTime,
        keywords.map(k => k.keywordId)
      );

      this.analyticsService.track('review_reminder_scheduled', {
        userId,
        keywordsCount: keywords.length,
        scheduledFor: optimalTime,
        notificationId,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error scheduling review reminder:', error);
    }
  }

  /**
   * 创建复习提醒内容
   */
  private createReviewReminderContent(keywords: KeywordProgress[]): NotificationContent {
    const keywordCount = keywords.length;
    
    const titles = [
      '还记得昨天那个故事吗？',
      '复习时间到了！',
      '让记忆更深刻',
      '2分钟巩固学习',
    ];
    
    const bodies = [
      `花2分钟，让${keywordCount}个关键词的记忆更深刻！`,
      `${keywordCount}个关键词等待复习，快速巩固学习成果`,
      `复习${keywordCount}个关键词，保持学习连续性`,
      `简单复习，让学习效果翻倍！`,
    ];

    return {
      title: titles[Math.floor(Math.random() * titles.length)],
      body: bodies[Math.floor(Math.random() * bodies.length)],
      data: {
        type: 'review_reminder',
        keywordIds: keywords.map(k => k.keywordId),
      },
      sound: true,
      badge: keywordCount,
    };
  }

  /**
   * 计算最佳通知时间
   */
  private async calculateOptimalNotificationTime(userId: string): Promise<Date> {
    const settings = this.getNotificationSettings(userId);
    const pattern = this.userActivityPatterns.get(userId);
    
    let targetHour = settings.preferredTime.hour;
    let targetMinute = settings.preferredTime.minute;

    // 如果启用智能时机且有活动模式数据
    if (settings.intelligentTiming && pattern) {
      const bestHours = pattern.bestResponseTimes;
      if (bestHours.length > 0) {
        targetHour = bestHours[0]; // 使用最佳响应时间
      }
    }

    // 检查静默时间
    if (settings.quietHours.enabled) {
      const { startHour, endHour } = settings.quietHours;
      if (this.isInQuietHours(targetHour, startHour, endHour)) {
        targetHour = endHour; // 调整到静默时间结束后
      }
    }

    // 计算明天的目标时间
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(targetHour, targetMinute, 0, 0);

    return tomorrow;
  }

  /**
   * 检查是否在静默时间内
   */
  private isInQuietHours(hour: number, startHour: number, endHour: number): boolean {
    if (startHour <= endHour) {
      return hour >= startHour && hour < endHour;
    } else {
      // 跨越午夜的情况
      return hour >= startHour || hour < endHour;
    }
  }

  /**
   * 安排通知
   */
  private async scheduleNotification(
    userId: string,
    type: NotificationType,
    content: NotificationContent,
    scheduledFor: Date,
    triggerKeywords?: string[]
  ): Promise<string> {
    try {
      const notificationId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 使用Expo Notifications安排通知
      await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: {
          title: content.title,
          body: content.body,
          data: content.data,
          sound: content.sound,
          badge: content.badge,
        },
        trigger: {
          date: scheduledFor,
        },
      });

      // 保存通知记录
      const scheduledNotification: ScheduledNotification = {
        id: notificationId,
        userId,
        type,
        content,
        scheduledFor: scheduledFor.toISOString(),
        triggerKeywords,
        status: 'scheduled',
        opened: false,
        createdAt: new Date().toISOString(),
      };

      this.scheduledNotifications.set(notificationId, scheduledNotification);
      await this.saveScheduledNotifications();

      return notificationId;

    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  /**
   * 保存计划通知
   */
  private async saveScheduledNotifications(): Promise<void> {
    try {
      const notifications = Array.from(this.scheduledNotifications.values());
      await AsyncStorage.setItem(this.SCHEDULED_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving scheduled notifications:', error);
    }
  }

  // ===== 活动模式分析 =====

  /**
   * 更新用户活动模式
   */
  private async updateActivityPatterns(): Promise<void> {
    try {
      // 这里会分析用户的学习活动，更新活动模式
      // 在实际应用中，会收集用户的应用使用数据
      
      const currentHour = new Date().getHours();
      
      // 模拟活动模式更新
      this.userActivityPatterns.forEach((pattern, userId) => {
        // 更新当前小时的活动分数
        const hourData = pattern.activeHours.find(h => h.hour === currentHour);
        if (hourData) {
          hourData.activityScore = Math.min(hourData.activityScore + 0.1, 1);
        }
        
        pattern.lastUpdatedAt = new Date().toISOString();
      });

      // 保存更新的模式
      await this.saveActivityPatterns();

    } catch (error) {
      console.error('Error updating activity patterns:', error);
    }
  }

  /**
   * 保存活动模式
   */
  private async saveActivityPatterns(): Promise<void> {
    try {
      const patterns = Array.from(this.userActivityPatterns.values());
      await AsyncStorage.setItem(this.PATTERNS_KEY, JSON.stringify(patterns));
    } catch (error) {
      console.error('Error saving activity patterns:', error);
    }
  }

  // ===== 通知处理 =====

  /**
   * 处理通知响应
   */
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    try {
      const notificationId = response.notification.request.identifier;
      const notification = this.scheduledNotifications.get(notificationId);
      
      if (notification) {
        notification.opened = true;
        notification.openedAt = new Date().toISOString();
        notification.actionTaken = response.actionIdentifier;
        
        this.scheduledNotifications.set(notificationId, notification);
        this.saveScheduledNotifications();

        this.analyticsService.track('notification_opened', {
          notificationId,
          type: notification.type,
          userId: notification.userId,
          actionTaken: response.actionIdentifier,
          timestamp: Date.now(),
        });
      }

    } catch (error) {
      console.error('Error handling notification response:', error);
    }
  }

  /**
   * 处理前台通知
   */
  private handleNotificationReceived(notification: Notifications.Notification): void {
    try {
      const notificationId = notification.request.identifier;
      const scheduledNotification = this.scheduledNotifications.get(notificationId);
      
      if (scheduledNotification) {
        scheduledNotification.status = 'sent';
        scheduledNotification.sentAt = new Date().toISOString();
        
        this.scheduledNotifications.set(notificationId, scheduledNotification);
        this.saveScheduledNotifications();
      }

    } catch (error) {
      console.error('Error handling notification received:', error);
    }
  }

  // ===== 公共API =====

  /**
   * 获取用户的计划通知
   */
  getUserScheduledNotifications(userId: string): ScheduledNotification[] {
    return Array.from(this.scheduledNotifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
  }

  /**
   * 取消通知
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      
      const notification = this.scheduledNotifications.get(notificationId);
      if (notification) {
        notification.status = 'cancelled';
        this.scheduledNotifications.set(notificationId, notification);
        await this.saveScheduledNotifications();
      }

    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  /**
   * 获取通知权限状态
   */
  hasPermission(): boolean {
    return this.hasNotificationPermission;
  }

  /**
   * 清理过期通知
   */
  async cleanupExpiredNotifications(): Promise<void> {
    try {
      const now = new Date();
      const expiredNotifications: string[] = [];

      this.scheduledNotifications.forEach((notification, id) => {
        const scheduledDate = new Date(notification.scheduledFor);
        // 清理7天前的通知
        if (now.getTime() - scheduledDate.getTime() > 7 * 24 * 60 * 60 * 1000) {
          expiredNotifications.push(id);
        }
      });

      expiredNotifications.forEach(id => {
        this.scheduledNotifications.delete(id);
      });

      if (expiredNotifications.length > 0) {
        await this.saveScheduledNotifications();
      }

    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
    }
  }
}

export default SRSNotificationService;

/**
 * FastReviewSessionService - V2 快速复习会话服务
 * 提供高效的复习体验：2分钟快速复习、自评系统、SM-2算法
 * 支持音频播放、图像选择、智能间隔调整
 */

// 自评结果
export type SelfAssessmentResult =
  | 'instantly_got_it'    // 😎 秒懂
  | 'had_to_think'        // 🤔 想了一下
  | 'forgot';             // 🤯 忘了

// 复习项目
export interface ReviewItem {
  keywordId: string;
  keyword: string;
  audioUrl: string;

  // 选项
  correctImageUrl: string;
  distractorImages: string[]; // 同主题的干扰项

  // SRS数据
  currentInterval: number; // 天数
  easeFactor: number; // 难度因子
  reviewCount: number;

  // 复习结果
  userSelection?: string;
  selfAssessment?: SelfAssessmentResult;
  responseTime?: number; // 毫秒
  isCorrect?: boolean;
}

// 复习会话
export interface ReviewSession {
  sessionId: string;
  userId: string;

  // 会话数据
  items: ReviewItem[];
  currentItemIndex: number;

  // 时间统计
  startedAt: string;
  targetDuration: number; // 目标时长（秒）
  actualDuration?: number;

  // 结果统计
  totalItems: number;
  completedItems: number;
  correctAnswers: number;

  // 自评统计
  instantlyGotIt: number;
  hadToThink: number;
  forgot: number;

  // 状态
  isCompleted: boolean;
  completedAt?: string;
}

class FastReviewSessionService {
  private static instance: FastReviewSessionService;
  private analyticsService = AnalyticsService.getInstance();
  private learningProgressService = LearningProgressService.getInstance();

  // 活跃复习会话
  private activeSessions: Map<string, ReviewSession> = new Map();

  // SM-2算法参数
  private readonly SM2_INITIAL_INTERVAL = 1; // 天
  private readonly SM2_INITIAL_EASE_FACTOR = 2.5;
  private readonly SM2_MIN_EASE_FACTOR = 1.3;

  static getInstance(): FastReviewSessionService {
    if (!FastReviewSessionService.instance) {
      FastReviewSessionService.instance = new FastReviewSessionService();
    }
    return FastReviewSessionService.instance;
  }

  /**
   * 创建复习会话
   */
  async createReviewSession(userId: string, keywords: KeywordProgress[]): Promise<ReviewSession> {
    try {
      const sessionId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 创建复习项目
      const reviewItems = await this.createReviewItems(keywords);

      const session: ReviewSession = {
        sessionId,
        userId,
        items: reviewItems,
        currentItemIndex: 0,
        startedAt: new Date().toISOString(),
        targetDuration: Math.min(reviewItems.length * 15, 120), // 每项15秒，最多2分钟
        totalItems: reviewItems.length,
        completedItems: 0,
        correctAnswers: 0,
        instantlyGotIt: 0,
        hadToThink: 0,
        forgot: 0,
        isCompleted: false,
      };

      this.activeSessions.set(sessionId, session);

      this.analyticsService.track('review_session_created', {
        sessionId,
        userId,
        itemsCount: reviewItems.length,
        targetDuration: session.targetDuration,
        timestamp: Date.now(),
      });

      return session;

    } catch (error) {
      console.error('Error creating review session:', error);
      throw error;
    }
  }

  /**
   * 创建复习项目
   */
  private async createReviewItems(keywords: KeywordProgress[]): Promise<ReviewItem[]> {
    const items: ReviewItem[] = [];

    for (const keyword of keywords) {
      const item: ReviewItem = {
        keywordId: keyword.keywordId,
        keyword: keyword.keyword,
        audioUrl: `https://api.smartalk.app/audio/${keyword.keyword}`,
        correctImageUrl: `https://api.smartalk.app/images/${keyword.keyword}`,
        distractorImages: await this.generateDistractorImages(keyword.keyword),
        currentInterval: this.calculateCurrentInterval(keyword),
        easeFactor: keyword.srsData?.easeFactor || this.SM2_INITIAL_EASE_FACTOR,
        reviewCount: keyword.srsData?.reviewCount || 0,
      };

      items.push(item);
    }

    // 随机打乱顺序
    return this.shuffleArray(items);
  }

  /**
   * 生成干扰项图片
   */
  private async generateDistractorImages(keyword: string): Promise<string[]> {
    // 在实际应用中，这里会从同主题的其他关键词中选择干扰项
    // 现在返回模拟数据
    return [
      `https://api.smartalk.app/images/distractor1_${keyword}`,
      `https://api.smartalk.app/images/distractor2_${keyword}`,
    ];
  }

  /**
   * 计算当前间隔
   */
  private calculateCurrentInterval(keyword: KeywordProgress): number {
    const now = new Date();
    const nextReview = new Date(keyword.srsData.nextReviewAt);
    const daysDiff = Math.floor((now.getTime() - nextReview.getTime()) / (1000 * 60 * 60 * 24));

    return Math.max(daysDiff, this.SM2_INITIAL_INTERVAL);
  }

  /**
   * 随机打乱数组
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * 提交复习答案
   */
  async submitReviewAnswer(
    sessionId: string,
    itemIndex: number,
    selectedImageUrl: string,
    selfAssessment: SelfAssessmentResult,
    responseTime: number
  ): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session || itemIndex >= session.items.length) return;

      const item = session.items[itemIndex];
      const isCorrect = selectedImageUrl === item.correctImageUrl;

      // 更新项目结果
      item.userSelection = selectedImageUrl;
      item.selfAssessment = selfAssessment;
      item.responseTime = responseTime;
      item.isCorrect = isCorrect;

      // 更新会话统计
      session.completedItems++;
      if (isCorrect) {
        session.correctAnswers++;
      }

      // 更新自评统计
      switch (selfAssessment) {
        case 'instantly_got_it':
          session.instantlyGotIt++;
          break;
        case 'had_to_think':
          session.hadToThink++;
          break;
        case 'forgot':
          session.forgot++;
          break;
      }

      // 应用SM-2算法更新间隔
      this.updateSM2Interval(item, selfAssessment);

      // 更新学习进度服务中的SRS数据
      await this.updateKeywordSRSData(session.userId, item);

      this.analyticsService.track('review_answer_submitted', {
        sessionId,
        itemIndex,
        isCorrect,
        selfAssessment,
        responseTime,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error submitting review answer:', error);
    }
  }

  /**
   * 应用SM-2算法更新间隔
   */
  private updateSM2Interval(item: ReviewItem, assessment: SelfAssessmentResult): void {
    let quality: number;

    // 将自评结果转换为SM-2质量分数
    switch (assessment) {
      case 'instantly_got_it':
        quality = 5; // 完美回忆
        break;
      case 'had_to_think':
        quality = 4; // 正确但有犹豫
        break;
      case 'forgot':
        quality = 0; // 完全忘记
        break;
      default:
        quality = 3;
    }

    // SM-2算法实现
    if (quality >= 3) {
      if (item.reviewCount === 0) {
        item.currentInterval = 1;
      } else if (item.reviewCount === 1) {
        item.currentInterval = 6;
      } else {
        item.currentInterval = Math.round(item.currentInterval * item.easeFactor);
      }
    } else {
      item.currentInterval = 1; // 重置间隔
    }

    // 更新难度因子
    item.easeFactor = Math.max(
      this.SM2_MIN_EASE_FACTOR,
      item.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    item.reviewCount++;
  }

  /**
   * 更新关键词SRS数据
   */
  private async updateKeywordSRSData(userId: string, item: ReviewItem): Promise<void> {
    try {
      // 这里会更新LearningProgressService中的SRS数据
      // 计算下次复习时间
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + item.currentInterval);

      // 在实际实现中，会调用LearningProgressService的方法更新SRS数据
      console.log(`Updated SRS for ${item.keyword}: interval=${item.currentInterval}, nextReview=${nextReviewDate.toISOString()}`);

    } catch (error) {
      console.error('Error updating keyword SRS data:', error);
    }
  }

  /**
   * 完成复习会话
   */
  async completeReviewSession(sessionId: string): Promise<ReviewSession> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) throw new Error('Session not found');

      const now = new Date();
      session.isCompleted = true;
      session.completedAt = now.toISOString();
      session.actualDuration = Math.floor(
        (now.getTime() - new Date(session.startedAt).getTime()) / 1000
      );

      this.analyticsService.track('review_session_completed', {
        sessionId,
        userId: session.userId,
        duration: session.actualDuration,
        accuracy: session.correctAnswers / session.totalItems,
        instantlyGotIt: session.instantlyGotIt,
        hadToThink: session.hadToThink,
        forgot: session.forgot,
        timestamp: Date.now(),
      });

      return session;

    } catch (error) {
      console.error('Error completing review session:', error);
      throw error;
    }
  }

  /**
   * 获取复习会话
   */
  getReviewSession(sessionId: string): ReviewSession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  /**
   * 获取当前复习项目
   */
  getCurrentReviewItem(sessionId: string): ReviewItem | null {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.currentItemIndex >= session.items.length) {
      return null;
    }

    return session.items[session.currentItemIndex];
  }

  /**
   * 移动到下一个项目
   */
  moveToNextItem(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;

    session.currentItemIndex++;
    return session.currentItemIndex < session.items.length;
  }

  /**
   * 清理完成的会话
   */
  cleanupCompletedSessions(): void {
    const completedSessions: string[] = [];

    this.activeSessions.forEach((session, sessionId) => {
      if (session.isCompleted) {
        const completedTime = new Date(session.completedAt!).getTime();
        const now = new Date().getTime();

        // 清理1小时前完成的会话
        if (now - completedTime > 60 * 60 * 1000) {
          completedSessions.push(sessionId);
        }
      }
    });

    completedSessions.forEach(sessionId => {
      this.activeSessions.delete(sessionId);
    });
  }
}

export { FastReviewSessionService, SelfAssessmentResult, ReviewItem, ReviewSession };
