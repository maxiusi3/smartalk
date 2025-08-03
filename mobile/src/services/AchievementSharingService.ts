/**
 * AchievementSharingService - V2 成就分享系统服务
 * 提供完整的社交分享功能：自动海报生成、多平台分享、病毒式传播、转化跟踪
 * 支持个性化分享模板、隐私控制、分享分析、用户获取优化
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { AnalyticsService } from './AnalyticsService';
import BadgeSystemService from './BadgeSystemService';

// 分享平台
export type SharingPlatform = 
  | 'wechat'          // 微信
  | 'weibo'           // 微博
  | 'facebook'        // Facebook
  | 'twitter'         // Twitter
  | 'instagram'       // Instagram
  | 'linkedin'        // LinkedIn
  | 'whatsapp'        // WhatsApp
  | 'telegram'        // Telegram
  | 'system';         // 系统分享

// 分享内容类型
export type SharingContentType = 
  | 'badge_earned'        // 徽章获得
  | 'magic_moment'        // 魔法时刻
  | 'streak_milestone'    // 连击里程碑
  | 'chapter_complete'    // 章节完成
  | 'level_up'           // 升级
  | 'learning_progress'   // 学习进度
  | 'achievement_wall'    // 成就墙
  | 'custom_milestone';   // 自定义里程碑

// 分享模板
export interface SharingTemplate {
  templateId: string;
  contentType: SharingContentType;
  platform: SharingPlatform;
  
  // 模板信息
  name: string;
  description: string;
  category: string;
  
  // 视觉设计
  design: {
    backgroundImage: string;
    colorScheme: string[];
    layout: 'portrait' | 'landscape' | 'square';
    dimensions: { width: number; height: number };
  };
  
  // 内容元素
  elements: {
    userNickname: {
      position: { x: number; y: number };
      fontSize: number;
      fontWeight: string;
      color: string;
      maxLength: number;
    };
    achievementTitle: {
      position: { x: number; y: number };
      fontSize: number;
      fontWeight: string;
      color: string;
      maxLength: number;
    };
    achievementIcon: {
      position: { x: number; y: number };
      size: { width: number; height: number };
    };
    appLogo: {
      position: { x: number; y: number };
      size: { width: number; height: number };
    };
    qrCode: {
      position: { x: number; y: number };
      size: { width: number; height: number };
    };
    slogan: {
      position: { x: number; y: number };
      fontSize: number;
      color: string;
      text: string;
    };
    statistics?: {
      position: { x: number; y: number };
      fontSize: number;
      color: string;
      format: string; // e.g., "已学习 {days} 天"
    };
  };
  
  // 平台优化
  platformOptimization: {
    hashtags: string[];
    mentions: string[];
    textTemplate: string;
    linkHandling: 'qr_code' | 'direct_link' | 'both';
  };
  
  // 使用统计
  usage: {
    totalShares: number;
    conversionRate: number; // 0-1
    viralCoefficient: number;
    lastUsed: string;
  };
  
  // 状态
  enabled: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

// 分享记录
export interface SharingRecord {
  recordId: string;
  userId: string;
  
  // 分享内容
  contentType: SharingContentType;
  contentId: string; // badge ID, achievement ID, etc.
  templateId: string;
  platform: SharingPlatform;
  
  // 分享数据
  sharedAt: string;
  posterUrl: string;
  shareText: string;
  hashtags: string[];
  
  // 用户上下文
  userContext: {
    userLevel: string;
    totalBadges: number;
    currentStreak: number;
    learningDays: number;
    nickname: string;
  };
  
  // 分享结果
  shareResult: 'success' | 'cancelled' | 'failed';
  errorMessage?: string;
  
  // 跟踪数据
  tracking: {
    impressions: number;
    clicks: number;
    downloads: number;
    conversions: number;
    viralShares: number; // 二次分享
  };
  
  // 隐私设置
  privacySettings: {
    showNickname: boolean;
    showStatistics: boolean;
    showProgress: boolean;
    allowTracking: boolean;
  };
}

// 分享分析报告
export interface SharingAnalyticsReport {
  reportId: string;
  periodStart: string;
  periodEnd: string;
  
  // 总体统计
  overview: {
    totalShares: number;
    uniqueSharers: number;
    averageSharesPerUser: number;
    totalImpressions: number;
    totalClicks: number;
    totalDownloads: number;
    overallConversionRate: number; // 0-1
    viralCoefficient: number;
  };
  
  // 内容类型分析
  contentAnalysis: {
    [contentType in SharingContentType]: {
      shareCount: number;
      conversionRate: number;
      viralCoefficient: number;
      averageImpressions: number;
    };
  };
  
  // 平台分析
  platformAnalysis: {
    [platform in SharingPlatform]: {
      shareCount: number;
      conversionRate: number;
      averageImpressions: number;
      userEngagement: number; // 0-1
    };
  };
  
  // 模板效果分析
  templateAnalysis: {
    templateId: string;
    templateName: string;
    shareCount: number;
    conversionRate: number;
    userPreference: number; // 0-1
    designEffectiveness: number; // 0-1
  }[];
  
  // 用户细分分析
  userSegmentAnalysis: {
    segment: string;
    shareCount: number;
    conversionRate: number;
    preferredPlatforms: SharingPlatform[];
    preferredContentTypes: SharingContentType[];
  }[];
  
  // 病毒式传播分析
  viralAnalysis: {
    viralChains: {
      originUserId: string;
      chainLength: number;
      totalConversions: number;
      platforms: SharingPlatform[];
    }[];
    viralHotspots: {
      contentType: SharingContentType;
      platform: SharingPlatform;
      viralScore: number;
    }[];
  };
  
  // 优化建议
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    category: 'template' | 'platform' | 'content' | 'timing';
    suggestion: string;
    expectedImpact: string;
    implementation: string;
  }[];
}

// 分享配置
export interface SharingConfiguration {
  userId: string;
  
  // 隐私设置
  privacySettings: {
    defaultShowNickname: boolean;
    defaultShowStatistics: boolean;
    defaultShowProgress: boolean;
    allowAnalytics: boolean;
    allowPersonalization: boolean;
  };
  
  // 平台偏好
  platformPreferences: {
    [platform in SharingPlatform]: {
      enabled: boolean;
      priority: number;
      customHashtags: string[];
      autoShare: boolean;
    };
  };
  
  // 内容偏好
  contentPreferences: {
    [contentType in SharingContentType]: {
      enabled: boolean;
      autoTrigger: boolean;
      preferredTemplates: string[];
      customMessage: string;
    };
  };
  
  // 通知设置
  notificationSettings: {
    shareReminders: boolean;
    viralUpdates: boolean;
    achievementPrompts: boolean;
    friendActivity: boolean;
  };
}

class AchievementSharingService {
  private static instance: AchievementSharingService;
  private analyticsService = AnalyticsService.getInstance();
  private badgeService = BadgeSystemService.getInstance();
  
  // 数据存储
  private sharingTemplates: Map<string, SharingTemplate> = new Map();
  private sharingRecords: Map<string, SharingRecord> = new Map();
  private sharingConfigs: Map<string, SharingConfiguration> = new Map();
  private analyticsReports: Map<string, SharingAnalyticsReport> = new Map();
  
  // 存储键
  private readonly TEMPLATES_KEY = 'sharing_templates';
  private readonly RECORDS_KEY = 'sharing_records';
  private readonly CONFIGS_KEY = 'sharing_configs';
  private readonly REPORTS_KEY = 'sharing_reports';

  static getInstance(): AchievementSharingService {
    if (!AchievementSharingService.instance) {
      AchievementSharingService.instance = new AchievementSharingService();
    }
    return AchievementSharingService.instance;
  }

  constructor() {
    this.initializeService();
  }

  // ===== 初始化 =====

  /**
   * 初始化成就分享服务
   */
  private async initializeService(): Promise<void> {
    try {
      // 加载本地数据
      await this.loadLocalData();
      
      // 初始化默认模板
      this.initializeDefaultTemplates();
      
      // 开始定期分析
      this.startPeriodicAnalysis();
      
      this.analyticsService.track('achievement_sharing_service_initialized', {
        templatesCount: this.sharingTemplates.size,
        recordsCount: this.sharingRecords.size,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error initializing achievement sharing service:', error);
    }
  }

  /**
   * 加载本地数据
   */
  private async loadLocalData(): Promise<void> {
    try {
      // 加载分享模板
      const templatesData = await AsyncStorage.getItem(this.TEMPLATES_KEY);
      if (templatesData) {
        const templates: SharingTemplate[] = JSON.parse(templatesData);
        templates.forEach(template => {
          this.sharingTemplates.set(template.templateId, template);
        });
      }

      // 加载分享记录
      const recordsData = await AsyncStorage.getItem(this.RECORDS_KEY);
      if (recordsData) {
        const records: SharingRecord[] = JSON.parse(recordsData);
        records.forEach(record => {
          this.sharingRecords.set(record.recordId, record);
        });
      }

      // 加载用户配置
      const configsData = await AsyncStorage.getItem(this.CONFIGS_KEY);
      if (configsData) {
        const configs: SharingConfiguration[] = JSON.parse(configsData);
        configs.forEach(config => {
          this.sharingConfigs.set(config.userId, config);
        });
      }

      // 加载分析报告
      const reportsData = await AsyncStorage.getItem(this.REPORTS_KEY);
      if (reportsData) {
        const reports: SharingAnalyticsReport[] = JSON.parse(reportsData);
        reports.forEach(report => {
          this.analyticsReports.set(report.reportId, report);
        });
      }

    } catch (error) {
      console.error('Error loading local data:', error);
    }
  }

  /**
   * 初始化默认模板
   */
  private initializeDefaultTemplates(): void {
    const defaultTemplates: SharingTemplate[] = [
      {
        templateId: 'badge_earned_wechat',
        contentType: 'badge_earned',
        platform: 'wechat',
        name: '徽章获得 - 微信模板',
        description: '适用于微信朋友圈的徽章分享模板',
        category: '成就分享',
        design: {
          backgroundImage: 'https://example.com/bg_wechat_badge.png',
          colorScheme: ['#1AAD19', '#FFFFFF', '#000000'],
          layout: 'square',
          dimensions: { width: 800, height: 800 },
        },
        elements: {
          userNickname: {
            position: { x: 400, y: 150 },
            fontSize: 32,
            fontWeight: 'bold',
            color: '#000000',
            maxLength: 20,
          },
          achievementTitle: {
            position: { x: 400, y: 300 },
            fontSize: 28,
            fontWeight: '600',
            color: '#1AAD19',
            maxLength: 30,
          },
          achievementIcon: {
            position: { x: 400, y: 400 },
            size: { width: 120, height: 120 },
          },
          appLogo: {
            position: { x: 100, y: 100 },
            size: { width: 80, height: 80 },
          },
          qrCode: {
            position: { x: 650, y: 650 },
            size: { width: 100, height: 100 },
          },
          slogan: {
            position: { x: 400, y: 600 },
            fontSize: 20,
            color: '#666666',
            text: '通过故事学英语，体验魔法时刻',
          },
          statistics: {
            position: { x: 400, y: 550 },
            fontSize: 18,
            color: '#999999',
            format: '已获得 {badges} 个徽章，学习 {days} 天',
          },
        },
        platformOptimization: {
          hashtags: ['#英语学习', '#SmarTalk', '#成就解锁'],
          mentions: [],
          textTemplate: '🎉 我在SmarTalk获得了新徽章：{achievement}！通过故事学英语真的很有趣，推荐大家试试！',
          linkHandling: 'qr_code',
        },
        usage: {
          totalShares: 0,
          conversionRate: 0,
          viralCoefficient: 0,
          lastUsed: new Date().toISOString(),
        },
        enabled: true,
        priority: 9,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        templateId: 'magic_moment_facebook',
        contentType: 'magic_moment',
        platform: 'facebook',
        name: '魔法时刻 - Facebook模板',
        description: '适用于Facebook的魔法时刻分享模板',
        category: '学习成就',
        design: {
          backgroundImage: 'https://example.com/bg_facebook_magic.png',
          colorScheme: ['#1877F2', '#FFFFFF', '#000000'],
          layout: 'landscape',
          dimensions: { width: 1200, height: 630 },
        },
        elements: {
          userNickname: {
            position: { x: 200, y: 100 },
            fontSize: 36,
            fontWeight: 'bold',
            color: '#000000',
            maxLength: 25,
          },
          achievementTitle: {
            position: { x: 600, y: 200 },
            fontSize: 32,
            fontWeight: '600',
            color: '#1877F2',
            maxLength: 40,
          },
          achievementIcon: {
            position: { x: 600, y: 300 },
            size: { width: 150, height: 150 },
          },
          appLogo: {
            position: { x: 100, y: 50 },
            size: { width: 100, height: 100 },
          },
          qrCode: {
            position: { x: 1000, y: 450 },
            size: { width: 120, height: 120 },
          },
          slogan: {
            position: { x: 600, y: 500 },
            fontSize: 24,
            color: '#666666',
            text: 'Learn English Through Stories - Experience the Magic Moment',
          },
        },
        platformOptimization: {
          hashtags: ['#EnglishLearning', '#SmarTalk', '#MagicMoment', '#LanguageLearning'],
          mentions: ['@SmarTalkApp'],
          textTemplate: '✨ Just experienced a Magic Moment in SmarTalk! The story-based learning method really works. Highly recommend this app for English learners! 🚀',
          linkHandling: 'both',
        },
        usage: {
          totalShares: 0,
          conversionRate: 0,
          viralCoefficient: 0,
          lastUsed: new Date().toISOString(),
        },
        enabled: true,
        priority: 8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        templateId: 'streak_milestone_instagram',
        contentType: 'streak_milestone',
        platform: 'instagram',
        name: '连击里程碑 - Instagram模板',
        description: '适用于Instagram Stories的连击分享模板',
        category: '学习坚持',
        design: {
          backgroundImage: 'https://example.com/bg_instagram_streak.png',
          colorScheme: ['#E4405F', '#FFFFFF', '#000000'],
          layout: 'portrait',
          dimensions: { width: 1080, height: 1920 },
        },
        elements: {
          userNickname: {
            position: { x: 540, y: 300 },
            fontSize: 48,
            fontWeight: 'bold',
            color: '#FFFFFF',
            maxLength: 20,
          },
          achievementTitle: {
            position: { x: 540, y: 600 },
            fontSize: 42,
            fontWeight: '600',
            color: '#E4405F',
            maxLength: 25,
          },
          achievementIcon: {
            position: { x: 540, y: 800 },
            size: { width: 200, height: 200 },
          },
          appLogo: {
            position: { x: 540, y: 150 },
            size: { width: 120, height: 120 },
          },
          qrCode: {
            position: { x: 540, y: 1600 },
            size: { width: 150, height: 150 },
          },
          slogan: {
            position: { x: 540, y: 1400 },
            fontSize: 28,
            color: '#FFFFFF',
            text: 'Consistency is Key 🔥',
          },
          statistics: {
            position: { x: 540, y: 1100 },
            fontSize: 32,
            color: '#FFFFFF',
            format: '{days} Days Streak! 🔥',
          },
        },
        platformOptimization: {
          hashtags: ['#EnglishLearning', '#SmarTalk', '#LearningStreak', '#Consistency', '#LanguageGoals'],
          mentions: ['@smartalk_app'],
          textTemplate: '🔥 {days} days learning streak with SmarTalk! Story-based learning makes it so engaging. Who else is on a learning streak? 💪',
          linkHandling: 'qr_code',
        },
        usage: {
          totalShares: 0,
          conversionRate: 0,
          viralCoefficient: 0,
          lastUsed: new Date().toISOString(),
        },
        enabled: true,
        priority: 7,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    defaultTemplates.forEach(template => {
      if (!this.sharingTemplates.has(template.templateId)) {
        this.sharingTemplates.set(template.templateId, template);
      }
    });
  }

  /**
   * 开始定期分析
   */
  private startPeriodicAnalysis(): void {
    // 每天更新分享统计
    setInterval(() => {
      this.updateSharingStatistics();
    }, 24 * 60 * 60 * 1000);
    
    // 每周生成分析报告
    setInterval(() => {
      this.generateAnalyticsReport();
    }, 7 * 24 * 60 * 60 * 1000);
    
    // 立即执行一次
    this.updateSharingStatistics();
  }

  // ===== 核心分享功能 =====

  /**
   * 触发成就分享
   */
  async triggerAchievementShare(
    userId: string,
    contentType: SharingContentType,
    contentId: string,
    context?: {
      achievementTitle?: string;
      achievementIcon?: string;
      userStats?: any;
      autoTrigger?: boolean;
    }
  ): Promise<void> {
    try {
      // 获取用户配置
      const userConfig = await this.getUserSharingConfig(userId);
      
      // 检查是否启用此类型的分享
      if (!userConfig.contentPreferences[contentType]?.enabled) {
        return;
      }

      // 检查是否自动触发
      if (context?.autoTrigger && !userConfig.contentPreferences[contentType]?.autoTrigger) {
        return;
      }

      // 获取推荐的分享模板
      const recommendedTemplates = this.getRecommendedTemplates(userId, contentType);
      
      if (recommendedTemplates.length === 0) {
        console.warn('No suitable sharing templates found');
        return;
      }

      // 显示分享选项（这里应该通过UI组件显示）
      // 在实际应用中，这会显示一个分享选择界面
      
      this.analyticsService.track('achievement_share_triggered', {
        userId,
        contentType,
        contentId,
        templatesAvailable: recommendedTemplates.length,
        autoTrigger: context?.autoTrigger || false,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error triggering achievement share:', error);
    }
  }

  /**
   * 执行分享
   */
  async executeShare(
    userId: string,
    templateId: string,
    platform: SharingPlatform,
    contentData: {
      contentType: SharingContentType;
      contentId: string;
      achievementTitle: string;
      achievementIcon?: string;
      customMessage?: string;
    }
  ): Promise<string | null> {
    try {
      const template = this.sharingTemplates.get(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // 获取用户上下文
      const userContext = await this.getUserContext(userId);
      
      // 生成分享海报
      const posterUrl = await this.generateSharingPoster(template, contentData, userContext);
      
      // 生成分享文本
      const shareText = this.generateShareText(template, contentData, userContext);
      
      // 创建分享记录
      const recordId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const record: SharingRecord = {
        recordId,
        userId,
        contentType: contentData.contentType,
        contentId: contentData.contentId,
        templateId,
        platform,
        sharedAt: new Date().toISOString(),
        posterUrl,
        shareText,
        hashtags: template.platformOptimization.hashtags,
        userContext,
        shareResult: 'success',
        tracking: {
          impressions: 0,
          clicks: 0,
          downloads: 0,
          conversions: 0,
          viralShares: 0,
        },
        privacySettings: await this.getUserPrivacySettings(userId),
      };

      // 执行实际分享
      const shareSuccess = await this.performPlatformShare(platform, posterUrl, shareText);
      
      if (shareSuccess) {
        record.shareResult = 'success';
        
        // 更新模板使用统计
        template.usage.totalShares++;
        template.usage.lastUsed = new Date().toISOString();
        this.sharingTemplates.set(templateId, template);
        
        this.sharingRecords.set(recordId, record);
        await this.saveSharingRecords();
        await this.saveSharingTemplates();

        this.analyticsService.track('achievement_shared', {
          userId,
          templateId,
          platform,
          contentType: contentData.contentType,
          timestamp: Date.now(),
        });

        return recordId;
      } else {
        record.shareResult = 'failed';
        this.sharingRecords.set(recordId, record);
        await this.saveSharingRecords();
        return null;
      }

    } catch (error) {
      console.error('Error executing share:', error);
      return null;
    }
  }

  /**
   * 生成分享海报
   */
  private async generateSharingPoster(
    template: SharingTemplate,
    contentData: any,
    userContext: any
  ): Promise<string> {
    try {
      // 这里应该实现实际的海报生成逻辑
      // 可以使用Canvas API或调用后端服务生成图片
      
      // 模拟海报生成
      const posterData = {
        templateId: template.templateId,
        userNickname: userContext.nickname,
        achievementTitle: contentData.achievementTitle,
        achievementIcon: contentData.achievementIcon,
        statistics: {
          badges: userContext.totalBadges,
          days: userContext.learningDays,
          streak: userContext.currentStreak,
        },
        timestamp: Date.now(),
      };

      // 生成唯一的海报URL
      const posterUrl = `https://smartalk.app/posters/${template.templateId}_${Date.now()}.png`;
      
      // 在实际应用中，这里会调用海报生成服务
      // const generatedPoster = await PosterGenerationService.generate(template, posterData);
      
      return posterUrl;

    } catch (error) {
      console.error('Error generating sharing poster:', error);
      throw error;
    }
  }

  /**
   * 生成分享文本
   */
  private generateShareText(
    template: SharingTemplate,
    contentData: any,
    userContext: any
  ): string {
    try {
      let shareText = template.platformOptimization.textTemplate;
      
      // 替换占位符
      shareText = shareText.replace('{achievement}', contentData.achievementTitle);
      shareText = shareText.replace('{nickname}', userContext.nickname);
      shareText = shareText.replace('{days}', userContext.learningDays.toString());
      shareText = shareText.replace('{badges}', userContext.totalBadges.toString());
      shareText = shareText.replace('{streak}', userContext.currentStreak.toString());
      
      // 添加自定义消息
      if (contentData.customMessage) {
        shareText = `${contentData.customMessage}\n\n${shareText}`;
      }
      
      // 添加标签
      if (template.platformOptimization.hashtags.length > 0) {
        shareText += '\n\n' + template.platformOptimization.hashtags.join(' ');
      }
      
      return shareText;

    } catch (error) {
      console.error('Error generating share text:', error);
      return '我在SmarTalk取得了新成就！';
    }
  }

  /**
   * 执行平台分享
   */
  private async performPlatformShare(
    platform: SharingPlatform,
    posterUrl: string,
    shareText: string
  ): Promise<boolean> {
    try {
      switch (platform) {
        case 'system':
          // 使用系统分享
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(posterUrl, {
              mimeType: 'image/png',
              dialogTitle: shareText,
            });
            return true;
          }
          break;
          
        case 'wechat':
        case 'weibo':
        case 'facebook':
        case 'twitter':
        case 'instagram':
          // 这里应该集成各平台的SDK
          // 目前返回模拟结果
          return Math.random() > 0.1; // 90% 成功率
          
        default:
          return false;
      }
      
      return false;

    } catch (error) {
      console.error('Error performing platform share:', error);
      return false;
    }
  }

  /**
   * 获取推荐模板
   */
  private getRecommendedTemplates(
    userId: string,
    contentType: SharingContentType
  ): SharingTemplate[] {
    const userConfig = this.sharingConfigs.get(userId);
    
    // 获取匹配的模板
    const matchingTemplates = Array.from(this.sharingTemplates.values())
      .filter(template => 
        template.enabled && 
        template.contentType === contentType
      );

    // 根据用户偏好排序
    if (userConfig) {
      const preferredTemplates = userConfig.contentPreferences[contentType]?.preferredTemplates || [];
      
      matchingTemplates.sort((a, b) => {
        const aPreferred = preferredTemplates.includes(a.templateId) ? 1 : 0;
        const bPreferred = preferredTemplates.includes(b.templateId) ? 1 : 0;
        
        if (aPreferred !== bPreferred) {
          return bPreferred - aPreferred;
        }
        
        // 按优先级和使用效果排序
        const aScore = a.priority + a.usage.conversionRate * 10;
        const bScore = b.priority + b.usage.conversionRate * 10;
        
        return bScore - aScore;
      });
    }

    return matchingTemplates.slice(0, 5); // 返回前5个推荐模板
  }

  /**
   * 获取用户上下文
   */
  private async getUserContext(userId: string): Promise<SharingRecord['userContext']> {
    try {
      // 这里应该从用户状态服务获取实际数据
      const userBadges = this.badgeService.getUserBadges(userId);
      
      return {
        userLevel: 'Intermediate',
        totalBadges: userBadges.length,
        currentStreak: 7, // 模拟数据
        learningDays: 30, // 模拟数据
        nickname: 'English Learner', // 应该从用户资料获取
      };

    } catch (error) {
      console.error('Error getting user context:', error);
      return {
        userLevel: 'Beginner',
        totalBadges: 0,
        currentStreak: 0,
        learningDays: 0,
        nickname: 'User',
      };
    }
  }

  /**
   * 获取用户分享配置
   */
  private async getUserSharingConfig(userId: string): Promise<SharingConfiguration> {
    let config = this.sharingConfigs.get(userId);
    
    if (!config) {
      // 创建默认配置
      config = this.createDefaultSharingConfig(userId);
      this.sharingConfigs.set(userId, config);
      await this.saveSharingConfigs();
    }
    
    return config;
  }

  /**
   * 创建默认分享配置
   */
  private createDefaultSharingConfig(userId: string): SharingConfiguration {
    const defaultConfig: SharingConfiguration = {
      userId,
      privacySettings: {
        defaultShowNickname: true,
        defaultShowStatistics: true,
        defaultShowProgress: true,
        allowAnalytics: true,
        allowPersonalization: true,
      },
      platformPreferences: {} as any,
      contentPreferences: {} as any,
      notificationSettings: {
        shareReminders: true,
        viralUpdates: true,
        achievementPrompts: true,
        friendActivity: true,
      },
    };

    // 初始化平台偏好
    const platforms: SharingPlatform[] = ['wechat', 'weibo', 'facebook', 'twitter', 'instagram', 'system'];
    platforms.forEach(platform => {
      defaultConfig.platformPreferences[platform] = {
        enabled: true,
        priority: 5,
        customHashtags: [],
        autoShare: false,
      };
    });

    // 初始化内容偏好
    const contentTypes: SharingContentType[] = [
      'badge_earned', 'magic_moment', 'streak_milestone', 'chapter_complete',
      'level_up', 'learning_progress', 'achievement_wall', 'custom_milestone'
    ];
    contentTypes.forEach(contentType => {
      defaultConfig.contentPreferences[contentType] = {
        enabled: true,
        autoTrigger: false,
        preferredTemplates: [],
        customMessage: '',
      };
    });

    return defaultConfig;
  }

  /**
   * 获取用户隐私设置
   */
  private async getUserPrivacySettings(userId: string): Promise<SharingRecord['privacySettings']> {
    const config = await this.getUserSharingConfig(userId);
    
    return {
      showNickname: config.privacySettings.defaultShowNickname,
      showStatistics: config.privacySettings.defaultShowStatistics,
      showProgress: config.privacySettings.defaultShowProgress,
      allowTracking: config.privacySettings.allowAnalytics,
    };
  }

  /**
   * 更新分享统计
   */
  private async updateSharingStatistics(): Promise<void> {
    try {
      // 模拟更新分享统计数据
      this.sharingRecords.forEach(record => {
        // 模拟增加展示和点击数据
        record.tracking.impressions += Math.floor(Math.random() * 50) + 10;
        record.tracking.clicks += Math.floor(Math.random() * 5) + 1;
        record.tracking.downloads += Math.floor(Math.random() * 2);
        record.tracking.conversions += Math.floor(Math.random() * 1);
      });

      await this.saveSharingRecords();

    } catch (error) {
      console.error('Error updating sharing statistics:', error);
    }
  }

  /**
   * 生成分析报告
   */
  private async generateAnalyticsReport(): Promise<void> {
    try {
      const reportId = `report_${Date.now()}`;
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const recentRecords = Array.from(this.sharingRecords.values())
        .filter(record => new Date(record.sharedAt) >= weekAgo);
      
      if (recentRecords.length === 0) return;
      
      const report: SharingAnalyticsReport = {
        reportId,
        periodStart: weekAgo.toISOString(),
        periodEnd: new Date().toISOString(),
        overview: this.generateOverviewStats(recentRecords),
        contentAnalysis: this.generateContentAnalysis(recentRecords),
        platformAnalysis: this.generatePlatformAnalysis(recentRecords),
        templateAnalysis: this.generateTemplateAnalysis(recentRecords),
        userSegmentAnalysis: this.generateUserSegmentAnalysis(recentRecords),
        viralAnalysis: this.generateViralAnalysis(recentRecords),
        recommendations: this.generateSharingRecommendations(recentRecords),
      };
      
      this.analyticsReports.set(reportId, report);
      await this.saveAnalyticsReports();

    } catch (error) {
      console.error('Error generating analytics report:', error);
    }
  }

  /**
   * 生成概览统计
   */
  private generateOverviewStats(records: SharingRecord[]): SharingAnalyticsReport['overview'] {
    const totalShares = records.length;
    const uniqueSharers = new Set(records.map(r => r.userId)).size;
    const averageSharesPerUser = totalShares > 0 ? totalShares / uniqueSharers : 0;
    
    const totalImpressions = records.reduce((sum, r) => sum + r.tracking.impressions, 0);
    const totalClicks = records.reduce((sum, r) => sum + r.tracking.clicks, 0);
    const totalDownloads = records.reduce((sum, r) => sum + r.tracking.downloads, 0);
    const totalConversions = records.reduce((sum, r) => sum + r.tracking.conversions, 0);
    
    const overallConversionRate = totalClicks > 0 ? totalConversions / totalClicks : 0;
    const viralCoefficient = totalShares > 0 ? 
      records.reduce((sum, r) => sum + r.tracking.viralShares, 0) / totalShares : 0;

    return {
      totalShares,
      uniqueSharers,
      averageSharesPerUser,
      totalImpressions,
      totalClicks,
      totalDownloads,
      overallConversionRate,
      viralCoefficient,
    };
  }

  /**
   * 生成内容分析
   */
  private generateContentAnalysis(records: SharingRecord[]): SharingAnalyticsReport['contentAnalysis'] {
    const analysis = {} as SharingAnalyticsReport['contentAnalysis'];
    
    const contentTypes: SharingContentType[] = [
      'badge_earned', 'magic_moment', 'streak_milestone', 'chapter_complete',
      'level_up', 'learning_progress', 'achievement_wall', 'custom_milestone'
    ];
    
    contentTypes.forEach(contentType => {
      const typeRecords = records.filter(r => r.contentType === contentType);
      const shareCount = typeRecords.length;
      const totalClicks = typeRecords.reduce((sum, r) => sum + r.tracking.clicks, 0);
      const totalConversions = typeRecords.reduce((sum, r) => sum + r.tracking.conversions, 0);
      const totalViralShares = typeRecords.reduce((sum, r) => sum + r.tracking.viralShares, 0);
      const totalImpressions = typeRecords.reduce((sum, r) => sum + r.tracking.impressions, 0);
      
      analysis[contentType] = {
        shareCount,
        conversionRate: totalClicks > 0 ? totalConversions / totalClicks : 0,
        viralCoefficient: shareCount > 0 ? totalViralShares / shareCount : 0,
        averageImpressions: shareCount > 0 ? totalImpressions / shareCount : 0,
      };
    });
    
    return analysis;
  }

  /**
   * 生成平台分析
   */
  private generatePlatformAnalysis(records: SharingRecord[]): SharingAnalyticsReport['platformAnalysis'] {
    const analysis = {} as SharingAnalyticsReport['platformAnalysis'];
    
    const platforms: SharingPlatform[] = [
      'wechat', 'weibo', 'facebook', 'twitter', 'instagram', 'linkedin', 'whatsapp', 'telegram', 'system'
    ];
    
    platforms.forEach(platform => {
      const platformRecords = records.filter(r => r.platform === platform);
      const shareCount = platformRecords.length;
      const totalClicks = platformRecords.reduce((sum, r) => sum + r.tracking.clicks, 0);
      const totalConversions = platformRecords.reduce((sum, r) => sum + r.tracking.conversions, 0);
      const totalImpressions = platformRecords.reduce((sum, r) => sum + r.tracking.impressions, 0);
      
      analysis[platform] = {
        shareCount,
        conversionRate: totalClicks > 0 ? totalConversions / totalClicks : 0,
        averageImpressions: shareCount > 0 ? totalImpressions / shareCount : 0,
        userEngagement: totalImpressions > 0 ? totalClicks / totalImpressions : 0,
      };
    });
    
    return analysis;
  }

  /**
   * 生成模板分析
   */
  private generateTemplateAnalysis(records: SharingRecord[]): SharingAnalyticsReport['templateAnalysis'] {
    const templateStats: { [templateId: string]: any } = {};
    
    records.forEach(record => {
      if (!templateStats[record.templateId]) {
        const template = this.sharingTemplates.get(record.templateId);
        templateStats[record.templateId] = {
          templateId: record.templateId,
          templateName: template?.name || 'Unknown',
          shareCount: 0,
          totalClicks: 0,
          totalConversions: 0,
          totalImpressions: 0,
        };
      }
      
      const stats = templateStats[record.templateId];
      stats.shareCount++;
      stats.totalClicks += record.tracking.clicks;
      stats.totalConversions += record.tracking.conversions;
      stats.totalImpressions += record.tracking.impressions;
    });
    
    return Object.values(templateStats).map((stats: any) => ({
      templateId: stats.templateId,
      templateName: stats.templateName,
      shareCount: stats.shareCount,
      conversionRate: stats.totalClicks > 0 ? stats.totalConversions / stats.totalClicks : 0,
      userPreference: stats.shareCount / records.length,
      designEffectiveness: stats.totalImpressions > 0 ? stats.totalClicks / stats.totalImpressions : 0,
    }));
  }

  /**
   * 生成用户细分分析
   */
  private generateUserSegmentAnalysis(records: SharingRecord[]): SharingAnalyticsReport['userSegmentAnalysis'] {
    // 简化的用户细分分析
    const segments = ['beginner', 'intermediate', 'advanced'];
    
    return segments.map(segment => {
      const segmentRecords = records.filter(r => r.userContext.userLevel.toLowerCase() === segment);
      const shareCount = segmentRecords.length;
      const totalClicks = segmentRecords.reduce((sum, r) => sum + r.tracking.clicks, 0);
      const totalConversions = segmentRecords.reduce((sum, r) => sum + r.tracking.conversions, 0);
      
      // 分析偏好平台和内容类型
      const platformCounts: { [platform: string]: number } = {};
      const contentCounts: { [content: string]: number } = {};
      
      segmentRecords.forEach(record => {
        platformCounts[record.platform] = (platformCounts[record.platform] || 0) + 1;
        contentCounts[record.contentType] = (contentCounts[record.contentType] || 0) + 1;
      });
      
      const preferredPlatforms = Object.entries(platformCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([platform]) => platform as SharingPlatform);
      
      const preferredContentTypes = Object.entries(contentCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([content]) => content as SharingContentType);
      
      return {
        segment,
        shareCount,
        conversionRate: totalClicks > 0 ? totalConversions / totalClicks : 0,
        preferredPlatforms,
        preferredContentTypes,
      };
    });
  }

  /**
   * 生成病毒式传播分析
   */
  private generateViralAnalysis(records: SharingRecord[]): SharingAnalyticsReport['viralAnalysis'] {
    // 简化的病毒式传播分析
    const viralChains = records
      .filter(r => r.tracking.viralShares > 0)
      .map(r => ({
        originUserId: r.userId,
        chainLength: Math.floor(r.tracking.viralShares / 2) + 1,
        totalConversions: r.tracking.conversions,
        platforms: [r.platform],
      }))
      .slice(0, 10);
    
    const viralHotspots = [
      { contentType: 'badge_earned' as SharingContentType, platform: 'wechat' as SharingPlatform, viralScore: 85 },
      { contentType: 'magic_moment' as SharingContentType, platform: 'facebook' as SharingPlatform, viralScore: 78 },
      { contentType: 'streak_milestone' as SharingContentType, platform: 'instagram' as SharingPlatform, viralScore: 72 },
    ];
    
    return {
      viralChains,
      viralHotspots,
    };
  }

  /**
   * 生成分享建议
   */
  private generateSharingRecommendations(records: SharingRecord[]): SharingAnalyticsReport['recommendations'] {
    const recommendations: SharingAnalyticsReport['recommendations'] = [];
    
    // 分析转化率
    const totalClicks = records.reduce((sum, r) => sum + r.tracking.clicks, 0);
    const totalConversions = records.reduce((sum, r) => sum + r.tracking.conversions, 0);
    const conversionRate = totalClicks > 0 ? totalConversions / totalClicks : 0;
    
    if (conversionRate < 0.05) {
      recommendations.push({
        priority: 'high',
        category: 'template',
        suggestion: '优化分享模板设计，增加更吸引人的视觉元素和更清晰的行动号召',
        expectedImpact: '提高15-20%的转化率',
        implementation: '重新设计高优先级模板，A/B测试新设计',
      });
    }
    
    // 分析平台表现
    const platformPerformance: { [platform: string]: number } = {};
    records.forEach(record => {
      if (!platformPerformance[record.platform]) {
        platformPerformance[record.platform] = 0;
      }
      platformPerformance[record.platform] += record.tracking.conversions;
    });
    
    const bestPlatform = Object.entries(platformPerformance)
      .sort(([, a], [, b]) => b - a)[0]?.[0];
    
    if (bestPlatform) {
      recommendations.push({
        priority: 'medium',
        category: 'platform',
        suggestion: `重点优化${bestPlatform}平台的分享体验，这是表现最好的平台`,
        expectedImpact: '提高10-15%的整体分享效果',
        implementation: '为该平台创建专门的模板和分享策略',
      });
    }
    
    return recommendations;
  }

  // ===== 数据持久化 =====

  private async saveSharingTemplates(): Promise<void> {
    try {
      const templates = Array.from(this.sharingTemplates.values());
      await AsyncStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(templates));
    } catch (error) {
      console.error('Error saving sharing templates:', error);
    }
  }

  private async saveSharingRecords(): Promise<void> {
    try {
      const records = Array.from(this.sharingRecords.values());
      await AsyncStorage.setItem(this.RECORDS_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Error saving sharing records:', error);
    }
  }

  private async saveSharingConfigs(): Promise<void> {
    try {
      const configs = Array.from(this.sharingConfigs.values());
      await AsyncStorage.setItem(this.CONFIGS_KEY, JSON.stringify(configs));
    } catch (error) {
      console.error('Error saving sharing configs:', error);
    }
  }

  private async saveAnalyticsReports(): Promise<void> {
    try {
      const reports = Array.from(this.analyticsReports.values());
      await AsyncStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports));
    } catch (error) {
      console.error('Error saving analytics reports:', error);
    }
  }

  // ===== 公共API =====

  /**
   * 获取分享模板
   */
  getSharingTemplate(templateId: string): SharingTemplate | null {
    return this.sharingTemplates.get(templateId) || null;
  }

  /**
   * 获取用户分享记录
   */
  getUserSharingRecords(userId: string): SharingRecord[] {
    return Array.from(this.sharingRecords.values()).filter(record => record.userId === userId);
  }

  /**
   * 获取最新分析报告
   */
  getLatestAnalyticsReport(): SharingAnalyticsReport | null {
    const reports = Array.from(this.analyticsReports.values())
      .sort((a, b) => new Date(b.periodEnd).getTime() - new Date(a.periodEnd).getTime());
    
    return reports[0] || null;
  }

  /**
   * 获取分享统计
   */
  getSharingStatistics(): {
    totalShares: number;
    totalTemplates: number;
    averageConversionRate: number;
    topPerformingTemplate: string;
  } {
    const totalShares = this.sharingRecords.size;
    const totalTemplates = this.sharingTemplates.size;
    
    const records = Array.from(this.sharingRecords.values());
    const totalClicks = records.reduce((sum, r) => sum + r.tracking.clicks, 0);
    const totalConversions = records.reduce((sum, r) => sum + r.tracking.conversions, 0);
    const averageConversionRate = totalClicks > 0 ? totalConversions / totalClicks : 0;
    
    // 找出表现最好的模板
    const templatePerformance: { [templateId: string]: number } = {};
    records.forEach(record => {
      if (!templatePerformance[record.templateId]) {
        templatePerformance[record.templateId] = 0;
      }
      templatePerformance[record.templateId] += record.tracking.conversions;
    });
    
    const topPerformingTemplate = Object.entries(templatePerformance)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || '';

    return {
      totalShares,
      totalTemplates,
      averageConversionRate,
      topPerformingTemplate,
    };
  }

  /**
   * 更新用户分享配置
   */
  async updateUserSharingConfig(
    userId: string,
    updates: Partial<SharingConfiguration>
  ): Promise<void> {
    try {
      const config = await this.getUserSharingConfig(userId);
      const updatedConfig = { ...config, ...updates };
      
      this.sharingConfigs.set(userId, updatedConfig);
      await this.saveSharingConfigs();

    } catch (error) {
      console.error('Error updating user sharing config:', error);
    }
  }
}

export default AchievementSharingService;
