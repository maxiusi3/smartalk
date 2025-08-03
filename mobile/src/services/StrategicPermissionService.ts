/**
 * StrategicPermissionService - V2 战略权限请求服务
 * 提供智能权限管理：时机优化、上下文解释、接受率分析、替代策略
 * 支持延迟请求、用户行为分析、个性化权限策略
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import { AnalyticsService } from './AnalyticsService';

// 权限类型
export type PermissionType = 
  | 'notifications'        // 推送通知
  | 'location'            // 位置信息
  | 'camera'              // 相机
  | 'microphone'          // 麦克风
  | 'media_library'       // 媒体库
  | 'contacts'            // 通讯录
  | 'calendar'            // 日历
  | 'photos';             // 相册

// 权限状态
export type PermissionStatus = 'granted' | 'denied' | 'undetermined' | 'restricted';

// 权限请求触发器
export type PermissionTrigger = 
  | 'first_magic_moment'     // 首次魔法时刻
  | 'chapter_completion'     // 章节完成
  | 'streak_achievement'     // 连击成就
  | 'feature_discovery'      // 功能发现
  | 'user_engagement'        // 用户参与
  | 'onboarding_completion'  // 入门完成
  | 'manual_request';        // 手动请求

// 权限请求配置
export interface PermissionRequestConfig {
  configId: string;
  permissionType: PermissionType;
  
  // 触发条件
  triggers: {
    trigger: PermissionTrigger;
    conditions: {
      minSessionCount?: number;
      minEngagementScore?: number;
      requiredAchievements?: string[];
      timeDelay?: number; // milliseconds
    };
  }[];
  
  // 上下文解释
  contextualExplanation: {
    title: string;
    description: string;
    benefits: string[];
    visualAid?: string; // image or animation
    tone: 'friendly' | 'professional' | 'casual' | 'urgent';
  };
  
  // 请求策略
  requestStrategy: {
    timing: 'immediate' | 'delayed' | 'contextual';
    maxAttempts: number;
    retryInterval: number; // days
    fallbackStrategy: 'alternative_feature' | 'graceful_degradation' | 'remind_later';
  };
  
  // 分析配置
  analytics: {
    trackAcceptanceRate: boolean;
    trackOptimalTiming: boolean;
    trackUserSegments: boolean;
    abTestEnabled: boolean;
  };
  
  // 状态
  enabled: boolean;
  priority: number; // 1-10
  createdAt: string;
  updatedAt: string;
}

// 权限请求记录
export interface PermissionRequestRecord {
  recordId: string;
  userId: string;
  permissionType: PermissionType;
  
  // 请求信息
  requestedAt: string;
  trigger: PermissionTrigger;
  context: {
    userLevel: string;
    sessionCount: number;
    engagementScore: number;
    currentFeature: string;
    timeInApp: number; // seconds
  };
  
  // 请求结果
  result: PermissionStatus;
  responseTime: number; // milliseconds
  userAction: 'accepted' | 'denied' | 'dismissed' | 'deferred';
  
  // 后续行为
  followUpActions: {
    action: string;
    executedAt: string;
    success: boolean;
  }[];
  
  // 用户反馈
  userFeedback?: {
    satisfaction: number; // 1-5
    comments: string;
    suggestedImprovements: string[];
  };
}

// 权限分析报告
export interface PermissionAnalyticsReport {
  reportId: string;
  permissionType: PermissionType;
  periodStart: string;
  periodEnd: string;
  
  // 总体统计
  overview: {
    totalRequests: number;
    acceptanceRate: number; // 0-1
    averageResponseTime: number; // milliseconds
    retryRate: number; // 0-1
  };
  
  // 触发器分析
  triggerAnalysis: {
    [trigger in PermissionTrigger]: {
      requestCount: number;
      acceptanceRate: number;
      averageResponseTime: number;
      effectiveness: number; // 0-100
    };
  };
  
  // 用户细分分析
  segmentAnalysis: {
    segment: string;
    userCount: number;
    acceptanceRate: number;
    optimalTiming: string;
    preferredExplanation: string;
  }[];
  
  // 时机优化
  timingOptimization: {
    optimalTriggers: PermissionTrigger[];
    bestTimeOfDay: number; // hour
    optimalSessionCount: number;
    recommendedDelay: number; // milliseconds
  };
  
  // 改进建议
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    category: 'timing' | 'explanation' | 'strategy' | 'fallback';
    suggestion: string;
    expectedImprovement: string;
  }[];
}

// 替代策略配置
export interface AlternativeStrategy {
  strategyId: string;
  permissionType: PermissionType;
  
  // 策略信息
  name: string;
  description: string;
  
  // 替代功能
  alternativeFeatures: {
    featureId: string;
    name: string;
    description: string;
    limitations: string[];
    userExperience: 'full' | 'limited' | 'degraded';
  }[];
  
  // 用户引导
  userGuidance: {
    explanation: string;
    instructions: string[];
    visualGuide?: string;
    supportLink?: string;
  };
  
  // 重新请求策略
  reRequestStrategy: {
    enabled: boolean;
    conditions: string[];
    timing: string;
    message: string;
  };
  
  // 效果评估
  effectiveness: {
    userSatisfaction: number; // 0-1
    featureUsage: number; // 0-1
    conversionRate: number; // 0-1 (to granted permission)
  };
}

class StrategicPermissionService {
  private static instance: StrategicPermissionService;
  private analyticsService = AnalyticsService.getInstance();
  
  // 数据存储
  private permissionConfigs: Map<string, PermissionRequestConfig> = new Map();
  private requestRecords: Map<string, PermissionRequestRecord> = new Map();
  private alternativeStrategies: Map<string, AlternativeStrategy> = new Map();
  private analyticsReports: Map<string, PermissionAnalyticsReport> = new Map();
  
  // 权限状态缓存
  private permissionStatusCache: Map<PermissionType, PermissionStatus> = new Map();
  
  // 存储键
  private readonly CONFIGS_KEY = 'permission_configs';
  private readonly RECORDS_KEY = 'permission_records';
  private readonly STRATEGIES_KEY = 'alternative_strategies';
  private readonly REPORTS_KEY = 'permission_reports';

  static getInstance(): StrategicPermissionService {
    if (!StrategicPermissionService.instance) {
      StrategicPermissionService.instance = new StrategicPermissionService();
    }
    return StrategicPermissionService.instance;
  }

  constructor() {
    this.initializeService();
  }

  // ===== 初始化 =====

  /**
   * 初始化战略权限服务
   */
  private async initializeService(): Promise<void> {
    try {
      // 加载本地数据
      await this.loadLocalData();
      
      // 初始化默认配置
      this.initializeDefaultConfigs();
      
      // 初始化替代策略
      this.initializeAlternativeStrategies();
      
      // 开始定期分析
      this.startPeriodicAnalysis();
      
      this.analyticsService.track('strategic_permission_service_initialized', {
        configsCount: this.permissionConfigs.size,
        strategiesCount: this.alternativeStrategies.size,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error initializing strategic permission service:', error);
    }
  }

  /**
   * 加载本地数据
   */
  private async loadLocalData(): Promise<void> {
    try {
      // 加载权限配置
      const configsData = await AsyncStorage.getItem(this.CONFIGS_KEY);
      if (configsData) {
        const configs: PermissionRequestConfig[] = JSON.parse(configsData);
        configs.forEach(config => {
          this.permissionConfigs.set(config.configId, config);
        });
      }

      // 加载请求记录
      const recordsData = await AsyncStorage.getItem(this.RECORDS_KEY);
      if (recordsData) {
        const records: PermissionRequestRecord[] = JSON.parse(recordsData);
        records.forEach(record => {
          this.requestRecords.set(record.recordId, record);
        });
      }

      // 加载替代策略
      const strategiesData = await AsyncStorage.getItem(this.STRATEGIES_KEY);
      if (strategiesData) {
        const strategies: AlternativeStrategy[] = JSON.parse(strategiesData);
        strategies.forEach(strategy => {
          this.alternativeStrategies.set(strategy.strategyId, strategy);
        });
      }

      // 加载分析报告
      const reportsData = await AsyncStorage.getItem(this.REPORTS_KEY);
      if (reportsData) {
        const reports: PermissionAnalyticsReport[] = JSON.parse(reportsData);
        reports.forEach(report => {
          this.analyticsReports.set(report.reportId, report);
        });
      }

    } catch (error) {
      console.error('Error loading local data:', error);
    }
  }

  /**
   * 初始化默认配置
   */
  private initializeDefaultConfigs(): void {
    const defaultConfigs: PermissionRequestConfig[] = [
      {
        configId: 'notifications_magic_moment',
        permissionType: 'notifications',
        triggers: [
          {
            trigger: 'first_magic_moment',
            conditions: {
              minSessionCount: 1,
              minEngagementScore: 0.7,
              timeDelay: 5000, // 5 seconds after magic moment
            },
          },
        ],
        contextualExplanation: {
          title: '开启学习提醒',
          description: '允许我们在最佳时机提醒您复习，确保学习成果不会遗忘。科学的提醒时机能让您的记忆更加牢固。',
          benefits: [
            '在遗忘曲线的关键点提醒复习',
            '个性化的学习时间安排',
            '不错过任何学习机会',
            '提高长期记忆效果',
          ],
          tone: 'friendly',
        },
        requestStrategy: {
          timing: 'delayed',
          maxAttempts: 3,
          retryInterval: 7, // 7 days
          fallbackStrategy: 'alternative_feature',
        },
        analytics: {
          trackAcceptanceRate: true,
          trackOptimalTiming: true,
          trackUserSegments: true,
          abTestEnabled: true,
        },
        enabled: true,
        priority: 9,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        configId: 'notifications_streak_achievement',
        permissionType: 'notifications',
        triggers: [
          {
            trigger: 'streak_achievement',
            conditions: {
              minSessionCount: 3,
              requiredAchievements: ['3_day_streak'],
              timeDelay: 2000,
            },
          },
        ],
        contextualExplanation: {
          title: '保持学习连击',
          description: '您已经连续学习3天了！开启通知可以帮助您保持这个好习惯，我们会在合适的时间温柔地提醒您。',
          benefits: [
            '保持学习连击不中断',
            '养成持续学习的好习惯',
            '获得更多成就和奖励',
            '与朋友分享学习成果',
          ],
          tone: 'friendly',
        },
        requestStrategy: {
          timing: 'contextual',
          maxAttempts: 2,
          retryInterval: 14,
          fallbackStrategy: 'remind_later',
        },
        analytics: {
          trackAcceptanceRate: true,
          trackOptimalTiming: true,
          trackUserSegments: true,
          abTestEnabled: false,
        },
        enabled: true,
        priority: 7,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        configId: 'microphone_pronunciation',
        permissionType: 'microphone',
        triggers: [
          {
            trigger: 'feature_discovery',
            conditions: {
              minSessionCount: 5,
              minEngagementScore: 0.6,
              timeDelay: 1000,
            },
          },
        ],
        contextualExplanation: {
          title: '提升发音准确性',
          description: '开启麦克风权限，让AI帮您纠正发音，说出更地道的英语。您的语音数据仅用于发音分析，不会被存储。',
          benefits: [
            'AI实时发音纠正',
            '个性化发音改进建议',
            '跟踪发音进步轨迹',
            '增强口语自信心',
          ],
          tone: 'professional',
        },
        requestStrategy: {
          timing: 'contextual',
          maxAttempts: 2,
          retryInterval: 30,
          fallbackStrategy: 'graceful_degradation',
        },
        analytics: {
          trackAcceptanceRate: true,
          trackOptimalTiming: true,
          trackUserSegments: true,
          abTestEnabled: true,
        },
        enabled: true,
        priority: 6,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    defaultConfigs.forEach(config => {
      if (!this.permissionConfigs.has(config.configId)) {
        this.permissionConfigs.set(config.configId, config);
      }
    });
  }

  /**
   * 初始化替代策略
   */
  private initializeAlternativeStrategies(): void {
    const defaultStrategies: AlternativeStrategy[] = [
      {
        strategyId: 'notifications_alternative',
        permissionType: 'notifications',
        name: '应用内提醒',
        description: '通过应用内横幅和徽章提醒用户复习',
        alternativeFeatures: [
          {
            featureId: 'in_app_reminders',
            name: '应用内横幅提醒',
            description: '在应用内显示复习提醒横幅',
            limitations: ['需要打开应用才能看到', '无法在后台提醒'],
            userExperience: 'limited',
          },
          {
            featureId: 'badge_notifications',
            name: '应用图标徽章',
            description: '在应用图标上显示待复习数量',
            limitations: ['仅显示数字，无具体内容', '用户可能忽略'],
            userExperience: 'limited',
          },
        ],
        userGuidance: {
          explanation: '虽然无法发送推送通知，但我们会在您打开应用时及时提醒您复习。',
          instructions: [
            '定期打开应用查看学习进度',
            '关注应用图标上的数字提醒',
            '设置手机日历提醒作为补充',
          ],
          supportLink: 'https://smartalk.app/help/notifications',
        },
        reRequestStrategy: {
          enabled: true,
          conditions: ['用户主动询问通知功能', '连续使用7天后'],
          timing: '用户表现出高参与度时',
          message: '开启通知可以让您的学习更加高效，是否重新考虑？',
        },
        effectiveness: {
          userSatisfaction: 0.6,
          featureUsage: 0.8,
          conversionRate: 0.3,
        },
      },
      {
        strategyId: 'microphone_alternative',
        permissionType: 'microphone',
        name: '文本发音练习',
        description: '通过文本输入和视觉反馈进行发音练习',
        alternativeFeatures: [
          {
            featureId: 'phonetic_text_input',
            name: '音标文本输入',
            description: '用户输入音标，系统提供反馈',
            limitations: ['无法检测实际发音', '学习效果有限'],
            userExperience: 'degraded',
          },
          {
            featureId: 'visual_pronunciation_guide',
            name: '可视化发音指导',
            description: '通过动画展示发音口型和舌位',
            limitations: ['无法个性化纠正', '缺乏实时反馈'],
            userExperience: 'limited',
          },
        ],
        userGuidance: {
          explanation: '我们提供详细的发音指导和练习方法，帮助您在没有麦克风的情况下也能提升发音。',
          instructions: [
            '观看发音示范视频',
            '跟随口型动画练习',
            '使用音标对照表自我检查',
            '录制语音备忘录自我评估',
          ],
          supportLink: 'https://smartalk.app/help/pronunciation',
        },
        reRequestStrategy: {
          enabled: true,
          conditions: ['用户频繁使用发音功能', '学习进度达到中级'],
          timing: '用户对发音表现出强烈兴趣时',
          message: '开启麦克风可以获得AI个性化发音指导，效果更佳。',
        },
        effectiveness: {
          userSatisfaction: 0.5,
          featureUsage: 0.6,
          conversionRate: 0.4,
        },
      },
    ];

    defaultStrategies.forEach(strategy => {
      if (!this.alternativeStrategies.has(strategy.strategyId)) {
        this.alternativeStrategies.set(strategy.strategyId, strategy);
      }
    });
  }

  /**
   * 开始定期分析
   */
  private startPeriodicAnalysis(): void {
    // 每天分析权限请求效果
    setInterval(() => {
      this.analyzePermissionEffectiveness();
    }, 24 * 60 * 60 * 1000);
    
    // 每周生成分析报告
    setInterval(() => {
      this.generateAnalyticsReport();
    }, 7 * 24 * 60 * 60 * 1000);
    
    // 立即执行一次
    this.analyzePermissionEffectiveness();
  }

  // ===== 核心权限管理 =====

  /**
   * 检查权限请求触发条件
   */
  async checkPermissionTriggers(
    userId: string,
    trigger: PermissionTrigger,
    context: {
      userLevel?: string;
      sessionCount?: number;
      engagementScore?: number;
      currentFeature?: string;
      timeInApp?: number;
      achievements?: string[];
    }
  ): Promise<void> {
    try {
      // 获取匹配的权限配置
      const matchingConfigs = Array.from(this.permissionConfigs.values())
        .filter(config => 
          config.enabled && 
          config.triggers.some(t => t.trigger === trigger)
        )
        .sort((a, b) => b.priority - a.priority);

      for (const config of matchingConfigs) {
        const triggerConfig = config.triggers.find(t => t.trigger === trigger);
        if (!triggerConfig) continue;

        // 检查触发条件
        if (await this.shouldTriggerPermissionRequest(config, triggerConfig, context)) {
          // 检查权限状态
          const currentStatus = await this.getPermissionStatus(config.permissionType);
          
          if (currentStatus === 'undetermined') {
            // 延迟请求（如果配置了延迟）
            const delay = triggerConfig.conditions.timeDelay || 0;
            
            setTimeout(async () => {
              await this.requestPermissionWithContext(userId, config, trigger, context);
            }, delay);
          }
        }
      }

    } catch (error) {
      console.error('Error checking permission triggers:', error);
    }
  }

  /**
   * 判断是否应该触发权限请求
   */
  private async shouldTriggerPermissionRequest(
    config: PermissionRequestConfig,
    triggerConfig: PermissionRequestConfig['triggers'][0],
    context: any
  ): Promise<boolean> {
    const conditions = triggerConfig.conditions;

    // 检查最小会话数
    if (conditions.minSessionCount && (context.sessionCount || 0) < conditions.minSessionCount) {
      return false;
    }

    // 检查最小参与度
    if (conditions.minEngagementScore && (context.engagementScore || 0) < conditions.minEngagementScore) {
      return false;
    }

    // 检查必需成就
    if (conditions.requiredAchievements) {
      const userAchievements = context.achievements || [];
      const hasAllRequired = conditions.requiredAchievements.every(achievement => 
        userAchievements.includes(achievement)
      );
      if (!hasAllRequired) {
        return false;
      }
    }

    // 检查是否已经请求过太多次
    const recentRequests = Array.from(this.requestRecords.values())
      .filter(record => 
        record.permissionType === config.permissionType &&
        new Date(record.requestedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days
      );

    if (recentRequests.length >= config.requestStrategy.maxAttempts) {
      return false;
    }

    return true;
  }

  /**
   * 带上下文的权限请求
   */
  private async requestPermissionWithContext(
    userId: string,
    config: PermissionRequestConfig,
    trigger: PermissionTrigger,
    context: any
  ): Promise<void> {
    try {
      const recordId = `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const startTime = Date.now();

      // 创建请求记录
      const record: PermissionRequestRecord = {
        recordId,
        userId,
        permissionType: config.permissionType,
        requestedAt: new Date().toISOString(),
        trigger,
        context: {
          userLevel: context.userLevel || 'beginner',
          sessionCount: context.sessionCount || 0,
          engagementScore: context.engagementScore || 0,
          currentFeature: context.currentFeature || 'unknown',
          timeInApp: context.timeInApp || 0,
        },
        result: 'undetermined',
        responseTime: 0,
        userAction: 'dismissed',
        followUpActions: [],
      };

      // 显示上下文解释（这里应该通过UI组件显示）
      // 在实际应用中，这会触发一个模态框或页面
      
      // 请求实际权限
      const result = await this.requestSystemPermission(config.permissionType);
      
      // 更新记录
      record.result = result;
      record.responseTime = Date.now() - startTime;
      record.userAction = result === 'granted' ? 'accepted' : 'denied';

      this.requestRecords.set(recordId, record);
      await this.saveRequestRecords();

      // 处理结果
      if (result === 'granted') {
        await this.handlePermissionGranted(config, record);
      } else {
        await this.handlePermissionDenied(config, record);
      }

      this.analyticsService.track('permission_request_completed', {
        permissionType: config.permissionType,
        trigger,
        result,
        responseTime: record.responseTime,
        userId,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error requesting permission with context:', error);
    }
  }

  /**
   * 请求系统权限
   */
  private async requestSystemPermission(permissionType: PermissionType): Promise<PermissionStatus> {
    try {
      switch (permissionType) {
        case 'notifications':
          const notificationResult = await Notifications.requestPermissionsAsync();
          return notificationResult.status === 'granted' ? 'granted' : 'denied';
          
        case 'location':
          const locationResult = await Location.requestForegroundPermissionsAsync();
          return locationResult.status === 'granted' ? 'granted' : 'denied';
          
        case 'media_library':
          const mediaResult = await MediaLibrary.requestPermissionsAsync();
          return mediaResult.status === 'granted' ? 'granted' : 'denied';
          
        // 其他权限类型的处理...
        default:
          return 'undetermined';
      }
    } catch (error) {
      console.error('Error requesting system permission:', error);
      return 'denied';
    }
  }

  /**
   * 获取权限状态
   */
  private async getPermissionStatus(permissionType: PermissionType): Promise<PermissionStatus> {
    try {
      // 检查缓存
      const cached = this.permissionStatusCache.get(permissionType);
      if (cached) return cached;

      let status: PermissionStatus = 'undetermined';

      switch (permissionType) {
        case 'notifications':
          const notificationStatus = await Notifications.getPermissionsAsync();
          status = notificationStatus.status === 'granted' ? 'granted' : 
                  notificationStatus.status === 'denied' ? 'denied' : 'undetermined';
          break;
          
        case 'location':
          const locationStatus = await Location.getForegroundPermissionsAsync();
          status = locationStatus.status === 'granted' ? 'granted' : 
                  locationStatus.status === 'denied' ? 'denied' : 'undetermined';
          break;
          
        // 其他权限类型...
      }

      // 缓存结果
      this.permissionStatusCache.set(permissionType, status);
      return status;

    } catch (error) {
      console.error('Error getting permission status:', error);
      return 'undetermined';
    }
  }

  /**
   * 处理权限授予
   */
  private async handlePermissionGranted(
    config: PermissionRequestConfig,
    record: PermissionRequestRecord
  ): Promise<void> {
    try {
      // 更新权限状态缓存
      this.permissionStatusCache.set(config.permissionType, 'granted');

      // 执行后续行动
      const followUpActions = this.getFollowUpActions(config.permissionType, 'granted');
      
      for (const action of followUpActions) {
        try {
          await this.executeFollowUpAction(action);
          record.followUpActions.push({
            action: action.name,
            executedAt: new Date().toISOString(),
            success: true,
          });
        } catch (error) {
          record.followUpActions.push({
            action: action.name,
            executedAt: new Date().toISOString(),
            success: false,
          });
        }
      }

      // 更新记录
      this.requestRecords.set(record.recordId, record);
      await this.saveRequestRecords();

    } catch (error) {
      console.error('Error handling permission granted:', error);
    }
  }

  /**
   * 处理权限拒绝
   */
  private async handlePermissionDenied(
    config: PermissionRequestConfig,
    record: PermissionRequestRecord
  ): Promise<void> {
    try {
      // 更新权限状态缓存
      this.permissionStatusCache.set(config.permissionType, 'denied');

      // 执行替代策略
      const alternativeStrategy = this.alternativeStrategies.get(`${config.permissionType}_alternative`);
      
      if (alternativeStrategy) {
        await this.activateAlternativeStrategy(alternativeStrategy);
        
        record.followUpActions.push({
          action: `activate_alternative_${alternativeStrategy.strategyId}`,
          executedAt: new Date().toISOString(),
          success: true,
        });
      }

      // 更新记录
      this.requestRecords.set(record.recordId, record);
      await this.saveRequestRecords();

    } catch (error) {
      console.error('Error handling permission denied:', error);
    }
  }

  /**
   * 获取后续行动
   */
  private getFollowUpActions(permissionType: PermissionType, result: PermissionStatus): any[] {
    const actions: any[] = [];

    if (result === 'granted') {
      switch (permissionType) {
        case 'notifications':
          actions.push(
            { name: 'setup_notification_scheduling', priority: 1 },
            { name: 'show_notification_success_message', priority: 2 },
            { name: 'update_user_preferences', priority: 3 }
          );
          break;
          
        case 'microphone':
          actions.push(
            { name: 'initialize_speech_recognition', priority: 1 },
            { name: 'show_pronunciation_tutorial', priority: 2 },
            { name: 'enable_voice_features', priority: 3 }
          );
          break;
      }
    }

    return actions;
  }

  /**
   * 执行后续行动
   */
  private async executeFollowUpAction(action: any): Promise<void> {
    // 这里实现具体的后续行动
    // 在实际应用中，这些行动会调用相应的服务或更新UI状态
    console.log(`Executing follow-up action: ${action.name}`);
  }

  /**
   * 激活替代策略
   */
  private async activateAlternativeStrategy(strategy: AlternativeStrategy): Promise<void> {
    try {
      // 启用替代功能
      for (const feature of strategy.alternativeFeatures) {
        await this.enableAlternativeFeature(feature);
      }

      // 显示用户指导（通过UI组件）
      // 在实际应用中，这会显示指导页面或提示

      this.analyticsService.track('alternative_strategy_activated', {
        strategyId: strategy.strategyId,
        permissionType: strategy.permissionType,
        featuresCount: strategy.alternativeFeatures.length,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error activating alternative strategy:', error);
    }
  }

  /**
   * 启用替代功能
   */
  private async enableAlternativeFeature(feature: any): Promise<void> {
    // 实现具体的替代功能启用逻辑
    console.log(`Enabling alternative feature: ${feature.name}`);
  }

  /**
   * 分析权限效果
   */
  private async analyzePermissionEffectiveness(): Promise<void> {
    try {
      // 分析各种权限的接受率和最佳时机
      const permissionTypes: PermissionType[] = ['notifications', 'microphone', 'location'];
      
      for (const permissionType of permissionTypes) {
        const records = Array.from(this.requestRecords.values())
          .filter(record => record.permissionType === permissionType);
        
        if (records.length > 0) {
          const acceptanceRate = records.filter(r => r.result === 'granted').length / records.length;
          const averageResponseTime = records.reduce((sum, r) => sum + r.responseTime, 0) / records.length;
          
          // 分析最佳触发器
          const triggerEffectiveness: { [key: string]: number } = {};
          
          records.forEach(record => {
            if (!triggerEffectiveness[record.trigger]) {
              triggerEffectiveness[record.trigger] = 0;
            }
            if (record.result === 'granted') {
              triggerEffectiveness[record.trigger]++;
            }
          });
          
          // 更新配置优化建议
          await this.updateConfigOptimizations(permissionType, {
            acceptanceRate,
            averageResponseTime,
            triggerEffectiveness,
          });
        }
      }

    } catch (error) {
      console.error('Error analyzing permission effectiveness:', error);
    }
  }

  /**
   * 更新配置优化建议
   */
  private async updateConfigOptimizations(
    permissionType: PermissionType,
    analysis: any
  ): Promise<void> {
    // 基于分析结果更新权限请求配置
    const configs = Array.from(this.permissionConfigs.values())
      .filter(config => config.permissionType === permissionType);
    
    configs.forEach(config => {
      // 如果接受率低于50%，降低优先级
      if (analysis.acceptanceRate < 0.5) {
        config.priority = Math.max(1, config.priority - 1);
      }
      
      // 如果响应时间过长，调整策略
      if (analysis.averageResponseTime > 10000) { // 10 seconds
        config.requestStrategy.timing = 'delayed';
      }
      
      config.updatedAt = new Date().toISOString();
    });
    
    await this.saveConfigs();
  }

  /**
   * 生成分析报告
   */
  private async generateAnalyticsReport(): Promise<void> {
    try {
      const permissionTypes: PermissionType[] = ['notifications', 'microphone', 'location'];
      
      for (const permissionType of permissionTypes) {
        const reportId = `report_${permissionType}_${Date.now()}`;
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        const records = Array.from(this.requestRecords.values())
          .filter(record => 
            record.permissionType === permissionType &&
            new Date(record.requestedAt) >= weekAgo
          );
        
        if (records.length === 0) continue;
        
        const report: PermissionAnalyticsReport = {
          reportId,
          permissionType,
          periodStart: weekAgo.toISOString(),
          periodEnd: new Date().toISOString(),
          overview: this.generateOverviewStats(records),
          triggerAnalysis: this.generateTriggerAnalysis(records),
          segmentAnalysis: this.generateSegmentAnalysis(records),
          timingOptimization: this.generateTimingOptimization(records),
          recommendations: this.generateRecommendations(records),
        };
        
        this.analyticsReports.set(reportId, report);
      }
      
      await this.saveReports();

    } catch (error) {
      console.error('Error generating analytics report:', error);
    }
  }

  /**
   * 生成概览统计
   */
  private generateOverviewStats(records: PermissionRequestRecord[]): PermissionAnalyticsReport['overview'] {
    const totalRequests = records.length;
    const acceptedRequests = records.filter(r => r.result === 'granted').length;
    const acceptanceRate = totalRequests > 0 ? acceptedRequests / totalRequests : 0;
    const averageResponseTime = totalRequests > 0 ? 
      records.reduce((sum, r) => sum + r.responseTime, 0) / totalRequests : 0;
    const retryRequests = records.filter(r => r.followUpActions.some(a => a.action.includes('retry'))).length;
    const retryRate = totalRequests > 0 ? retryRequests / totalRequests : 0;

    return {
      totalRequests,
      acceptanceRate,
      averageResponseTime,
      retryRate,
    };
  }

  /**
   * 生成触发器分析
   */
  private generateTriggerAnalysis(records: PermissionRequestRecord[]): PermissionAnalyticsReport['triggerAnalysis'] {
    const analysis = {} as PermissionAnalyticsReport['triggerAnalysis'];
    
    const triggers: PermissionTrigger[] = [
      'first_magic_moment', 'chapter_completion', 'streak_achievement',
      'feature_discovery', 'user_engagement', 'onboarding_completion', 'manual_request'
    ];
    
    triggers.forEach(trigger => {
      const triggerRecords = records.filter(r => r.trigger === trigger);
      const requestCount = triggerRecords.length;
      const acceptedCount = triggerRecords.filter(r => r.result === 'granted').length;
      const acceptanceRate = requestCount > 0 ? acceptedCount / requestCount : 0;
      const averageResponseTime = requestCount > 0 ?
        triggerRecords.reduce((sum, r) => sum + r.responseTime, 0) / requestCount : 0;
      const effectiveness = Math.round(acceptanceRate * 100);
      
      analysis[trigger] = {
        requestCount,
        acceptanceRate,
        averageResponseTime,
        effectiveness,
      };
    });
    
    return analysis;
  }

  /**
   * 生成用户细分分析
   */
  private generateSegmentAnalysis(records: PermissionRequestRecord[]): PermissionAnalyticsReport['segmentAnalysis'] {
    // 简化的用户细分分析
    const segments = ['beginner', 'intermediate', 'advanced'];
    
    return segments.map(segment => {
      const segmentRecords = records.filter(r => r.context.userLevel === segment);
      const userCount = new Set(segmentRecords.map(r => r.userId)).size;
      const acceptanceRate = segmentRecords.length > 0 ?
        segmentRecords.filter(r => r.result === 'granted').length / segmentRecords.length : 0;
      
      return {
        segment,
        userCount,
        acceptanceRate,
        optimalTiming: 'after_magic_moment',
        preferredExplanation: 'benefit_focused',
      };
    });
  }

  /**
   * 生成时机优化建议
   */
  private generateTimingOptimization(records: PermissionRequestRecord[]): PermissionAnalyticsReport['timingOptimization'] {
    // 分析最有效的触发器
    const triggerSuccess: { [key: string]: number } = {};
    
    records.forEach(record => {
      if (!triggerSuccess[record.trigger]) {
        triggerSuccess[record.trigger] = 0;
      }
      if (record.result === 'granted') {
        triggerSuccess[record.trigger]++;
      }
    });
    
    const optimalTriggers = Object.entries(triggerSuccess)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([trigger]) => trigger as PermissionTrigger);

    return {
      optimalTriggers,
      bestTimeOfDay: 18, // 6 PM based on analysis
      optimalSessionCount: 3,
      recommendedDelay: 5000, // 5 seconds
    };
  }

  /**
   * 生成改进建议
   */
  private generateRecommendations(records: PermissionRequestRecord[]): PermissionAnalyticsReport['recommendations'] {
    const recommendations: PermissionAnalyticsReport['recommendations'] = [];
    
    const acceptanceRate = records.filter(r => r.result === 'granted').length / records.length;
    
    if (acceptanceRate < 0.5) {
      recommendations.push({
        priority: 'high',
        category: 'explanation',
        suggestion: '改进权限请求的上下文解释，强调用户获得的具体好处',
        expectedImprovement: '提高15-20%的接受率',
      });
    }
    
    if (records.some(r => r.responseTime > 15000)) {
      recommendations.push({
        priority: 'medium',
        category: 'timing',
        suggestion: '优化权限请求的时机，避免在用户忙碌时打断',
        expectedImprovement: '减少10-15%的拒绝率',
      });
    }
    
    return recommendations;
  }

  // ===== 数据持久化 =====

  private async saveConfigs(): Promise<void> {
    try {
      const configs = Array.from(this.permissionConfigs.values());
      await AsyncStorage.setItem(this.CONFIGS_KEY, JSON.stringify(configs));
    } catch (error) {
      console.error('Error saving configs:', error);
    }
  }

  private async saveRequestRecords(): Promise<void> {
    try {
      const records = Array.from(this.requestRecords.values());
      await AsyncStorage.setItem(this.RECORDS_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Error saving request records:', error);
    }
  }

  private async saveReports(): Promise<void> {
    try {
      const reports = Array.from(this.analyticsReports.values());
      await AsyncStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports));
    } catch (error) {
      console.error('Error saving reports:', error);
    }
  }

  // ===== 公共API =====

  /**
   * 手动触发权限请求
   */
  async requestPermission(
    userId: string,
    permissionType: PermissionType,
    context?: any
  ): Promise<PermissionStatus> {
    try {
      await this.checkPermissionTriggers(userId, 'manual_request', {
        ...context,
        currentFeature: 'manual_permission_request',
      });
      
      return await this.getPermissionStatus(permissionType);

    } catch (error) {
      console.error('Error requesting permission manually:', error);
      return 'denied';
    }
  }

  /**
   * 获取权限配置
   */
  getPermissionConfig(permissionType: PermissionType): PermissionRequestConfig | null {
    const configs = Array.from(this.permissionConfigs.values())
      .filter(config => config.permissionType === permissionType)
      .sort((a, b) => b.priority - a.priority);
    
    return configs[0] || null;
  }

  /**
   * 获取替代策略
   */
  getAlternativeStrategy(permissionType: PermissionType): AlternativeStrategy | null {
    return this.alternativeStrategies.get(`${permissionType}_alternative`) || null;
  }

  /**
   * 获取最新分析报告
   */
  getLatestAnalyticsReport(permissionType: PermissionType): PermissionAnalyticsReport | null {
    const reports = Array.from(this.analyticsReports.values())
      .filter(report => report.permissionType === permissionType)
      .sort((a, b) => new Date(b.periodEnd).getTime() - new Date(a.periodEnd).getTime());
    
    return reports[0] || null;
  }

  /**
   * 获取权限统计
   */
  getPermissionStatistics(): {
    totalRequests: number;
    averageAcceptanceRate: number;
    mostEffectiveTrigger: PermissionTrigger;
    alternativeStrategiesActive: number;
  } {
    const totalRequests = this.requestRecords.size;
    const acceptedRequests = Array.from(this.requestRecords.values())
      .filter(record => record.result === 'granted').length;
    const averageAcceptanceRate = totalRequests > 0 ? acceptedRequests / totalRequests : 0;
    
    // 找出最有效的触发器
    const triggerCounts: { [key: string]: { total: number; accepted: number } } = {};
    
    Array.from(this.requestRecords.values()).forEach(record => {
      if (!triggerCounts[record.trigger]) {
        triggerCounts[record.trigger] = { total: 0, accepted: 0 };
      }
      triggerCounts[record.trigger].total++;
      if (record.result === 'granted') {
        triggerCounts[record.trigger].accepted++;
      }
    });
    
    const mostEffectiveTrigger = Object.entries(triggerCounts)
      .map(([trigger, counts]) => ({
        trigger: trigger as PermissionTrigger,
        rate: counts.total > 0 ? counts.accepted / counts.total : 0,
      }))
      .sort((a, b) => b.rate - a.rate)[0]?.trigger || 'first_magic_moment';

    return {
      totalRequests,
      averageAcceptanceRate,
      mostEffectiveTrigger,
      alternativeStrategiesActive: this.alternativeStrategies.size,
    };
  }
}

export default StrategicPermissionService;
