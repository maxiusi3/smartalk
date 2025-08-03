/**
 * SupportAnalyticsService - V2 支持分析和响应系统服务
 * 提供完整的用户支持分析：反馈分类、优先级管理、自动响应、趋势分析
 * 支持工单跟踪、用户满意度监控、产品改进建议
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalyticsService } from './AnalyticsService';

// 反馈类型
export type FeedbackType =
  | 'bug_report'          // 错误报告
  | 'feature_request'     // 功能请求
  | 'user_experience'     // 用户体验
  | 'content_issue'       // 内容问题
  | 'technical_support'   // 技术支持
  | 'account_issue'       // 账户问题
  | 'payment_issue'       // 支付问题
  | 'general_inquiry'     // 一般咨询
  | 'compliment'          // 表扬
  | 'complaint';          // 投诉

// 为了避免循环引用，将FeedbackType作为字符串联合类型
const FeedbackType = {
  bug_report: 'bug_report' as const,
  feature_request: 'feature_request' as const,
  user_experience: 'user_experience' as const,
  content_issue: 'content_issue' as const,
  technical_support: 'technical_support' as const,
  account_issue: 'account_issue' as const,
  payment_issue: 'payment_issue' as const,
  general_inquiry: 'general_inquiry' as const,
  compliment: 'compliment' as const,
  complaint: 'complaint' as const,
};

// 优先级级别
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

// 支持工单状态
export type TicketStatus = 
  | 'new'           // 新建
  | 'assigned'      // 已分配
  | 'in_progress'   // 处理中
  | 'waiting_user'  // 等待用户
  | 'resolved'      // 已解决
  | 'closed';       // 已关闭

// 用户反馈
export interface UserFeedback {
  feedbackId: string;
  userId: string;
  
  // 反馈内容
  type: FeedbackType;
  title: string;
  description: string;
  category: string;
  
  // 分类信息
  priority: PriorityLevel;
  tags: string[];
  
  // 上下文信息
  userContext: {
    appVersion: string;
    deviceInfo: string;
    userLevel: string;
    lastActivity: string;
    currentChapter?: string;
  };
  
  // 附件信息
  attachments: {
    screenshots: string[];
    logs: string[];
    recordings?: string[];
  };
  
  // 时间信息
  submittedAt: string;
  updatedAt: string;
  
  // 处理状态
  status: TicketStatus;
  assignedTo?: string;
  
  // 自动分析结果
  autoAnalysis: {
    sentiment: 'positive' | 'neutral' | 'negative';
    confidence: number;
    suggestedCategory: FeedbackType;
    suggestedPriority: PriorityLevel;
    similarIssues: string[];
    autoResponse?: string;
  };
}

// 支持工单
export interface SupportTicket {
  ticketId: string;
  feedbackId: string;
  userId: string;
  
  // 工单信息
  subject: string;
  description: string;
  priority: PriorityLevel;
  status: TicketStatus;
  
  // 分配信息
  assignedTo?: string;
  assignedAt?: string;
  
  // 沟通历史
  communications: TicketCommunication[];
  
  // 解决信息
  resolution?: {
    solution: string;
    resolvedBy: string;
    resolvedAt: string;
    resolutionTime: number; // minutes
    userSatisfaction?: number; // 1-5
  };
  
  // 时间跟踪
  createdAt: string;
  updatedAt: string;
  firstResponseAt?: string;
  
  // 标签和分类
  tags: string[];
  internalNotes: string[];
}

// 工单沟通记录
export interface TicketCommunication {
  communicationId: string;
  ticketId: string;
  
  // 沟通内容
  message: string;
  sender: 'user' | 'support' | 'system';
  senderName: string;
  
  // 沟通类型
  type: 'message' | 'status_update' | 'internal_note' | 'auto_response';
  
  // 附件
  attachments: string[];
  
  // 时间信息
  sentAt: string;
  readAt?: string;
}

// 自动响应规则
export interface AutoResponseRule {
  ruleId: string;
  name: string;
  description: string;
  
  // 触发条件
  triggers: {
    feedbackTypes: FeedbackType[];
    keywords: string[];
    sentimentThreshold?: number;
    priorityLevels: PriorityLevel[];
  };
  
  // 响应内容
  response: {
    template: string;
    variables: { [key: string]: string };
    escalationRequired: boolean;
    followUpActions: string[];
  };
  
  // 规则配置
  enabled: boolean;
  priority: number;
  
  // 统计信息
  usage: {
    totalTriggers: number;
    successfulResponses: number;
    userSatisfaction: number;
    lastUsed: string;
  };
}

// 支持分析报告
export interface SupportAnalyticsReport {
  reportId: string;
  periodStart: string;
  periodEnd: string;
  
  // 总体统计
  overview: {
    totalFeedback: number;
    totalTickets: number;
    resolvedTickets: number;
    averageResolutionTime: number; // hours
    userSatisfactionScore: number; // 1-5
  };
  
  // 反馈分析
  feedbackAnalysis: {
    typeDistribution: { [type in FeedbackType]: number };
    priorityDistribution: { [priority in PriorityLevel]: number };
    sentimentDistribution: { positive: number; neutral: number; negative: number };
    topCategories: { category: string; count: number }[];
    topTags: { tag: string; count: number }[];
  };
  
  // 趋势分析
  trends: {
    feedbackVolumeTrend: { date: string; count: number }[];
    resolutionTimeTrend: { date: string; averageHours: number }[];
    satisfactionTrend: { date: string; score: number }[];
    commonIssuesTrend: { issue: string; trend: 'increasing' | 'stable' | 'decreasing' }[];
  };
  
  // 产品改进建议
  productImprovements: {
    highImpactIssues: { issue: string; impact: number; frequency: number }[];
    featureRequests: { feature: string; votes: number; priority: number }[];
    userExperienceIssues: { issue: string; severity: number; affectedUsers: number }[];
    contentImprovements: { content: string; feedback: string; priority: number }[];
  };
}

class SupportAnalyticsService {
  private static instance: SupportAnalyticsService;
  private analyticsService = AnalyticsService.getInstance();
  
  // 数据存储
  private userFeedback: Map<string, UserFeedback> = new Map();
  private supportTickets: Map<string, SupportTicket> = new Map();
  private autoResponseRules: Map<string, AutoResponseRule> = new Map();
  
  // 分析缓存
  private analyticsReports: Map<string, SupportAnalyticsReport> = new Map();
  
  // 存储键
  private readonly FEEDBACK_KEY = 'user_feedback';
  private readonly TICKETS_KEY = 'support_tickets';
  private readonly AUTO_RULES_KEY = 'auto_response_rules';
  private readonly REPORTS_KEY = 'analytics_reports';

  static getInstance(): SupportAnalyticsService {
    if (!SupportAnalyticsService.instance) {
      SupportAnalyticsService.instance = new SupportAnalyticsService();
    }
    return SupportAnalyticsService.instance;
  }

  constructor() {
    this.initializeService();
  }

  // ===== 初始化 =====

  /**
   * 初始化支持分析服务
   */
  private async initializeService(): Promise<void> {
    try {
      // 加载本地数据
      await this.loadLocalData();
      
      // 初始化自动响应规则
      this.initializeAutoResponseRules();
      
      // 开始定期分析
      this.startPeriodicAnalysis();
      
      this.analyticsService.track('support_analytics_service_initialized', {
        feedbackCount: this.userFeedback.size,
        ticketsCount: this.supportTickets.size,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error initializing support analytics service:', error);
    }
  }

  /**
   * 加载本地数据
   */
  private async loadLocalData(): Promise<void> {
    try {
      // 加载用户反馈
      const feedbackData = await AsyncStorage.getItem(this.FEEDBACK_KEY);
      if (feedbackData) {
        const feedback: UserFeedback[] = JSON.parse(feedbackData);
        feedback.forEach(item => {
          this.userFeedback.set(item.feedbackId, item);
        });
      }

      // 加载支持工单
      const ticketsData = await AsyncStorage.getItem(this.TICKETS_KEY);
      if (ticketsData) {
        const tickets: SupportTicket[] = JSON.parse(ticketsData);
        tickets.forEach(ticket => {
          this.supportTickets.set(ticket.ticketId, ticket);
        });
      }

      // 加载自动响应规则
      const rulesData = await AsyncStorage.getItem(this.AUTO_RULES_KEY);
      if (rulesData) {
        const rules: AutoResponseRule[] = JSON.parse(rulesData);
        rules.forEach(rule => {
          this.autoResponseRules.set(rule.ruleId, rule);
        });
      }

      // 加载分析报告
      const reportsData = await AsyncStorage.getItem(this.REPORTS_KEY);
      if (reportsData) {
        const reports: SupportAnalyticsReport[] = JSON.parse(reportsData);
        reports.forEach(report => {
          this.analyticsReports.set(report.reportId, report);
        });
      }

    } catch (error) {
      console.error('Error loading local data:', error);
    }
  }

  /**
   * 初始化自动响应规则
   */
  private initializeAutoResponseRules(): void {
    const defaultRules: AutoResponseRule[] = [
      {
        ruleId: 'welcome_response',
        name: '欢迎响应',
        description: '对新用户反馈的自动欢迎响应',
        triggers: {
          feedbackTypes: ['general_inquiry', 'compliment'],
          keywords: ['hello', 'hi', '你好', '感谢'],
          priorityLevels: ['low', 'medium'],
        },
        response: {
          template: '感谢您的反馈！我们很高兴听到您的声音。我们的团队会仔细审阅您的建议。',
          variables: {},
          escalationRequired: false,
          followUpActions: ['tag_as_positive', 'track_satisfaction'],
        },
        enabled: true,
        priority: 1,
        usage: {
          totalTriggers: 0,
          successfulResponses: 0,
          userSatisfaction: 0,
          lastUsed: new Date().toISOString(),
        },
      },
      {
        ruleId: 'bug_report_response',
        name: '错误报告响应',
        description: '对错误报告的自动确认响应',
        triggers: {
          feedbackTypes: ['bug_report', 'technical_support'],
          keywords: ['bug', 'error', '错误', '问题', 'crash'],
          priorityLevels: ['medium', 'high', 'critical'],
        },
        response: {
          template: '感谢您报告这个问题！我们已经收到您的错误报告，技术团队会优先处理。预计在24小时内给您回复。',
          variables: {},
          escalationRequired: true,
          followUpActions: ['create_ticket', 'assign_to_tech_team', 'set_high_priority'],
        },
        enabled: true,
        priority: 2,
        usage: {
          totalTriggers: 0,
          successfulResponses: 0,
          userSatisfaction: 0,
          lastUsed: new Date().toISOString(),
        },
      },
      {
        ruleId: 'feature_request_response',
        name: '功能请求响应',
        description: '对功能请求的自动确认响应',
        triggers: {
          feedbackTypes: ['feature_request'],
          keywords: ['feature', 'request', '功能', '建议', '希望'],
          priorityLevels: ['low', 'medium'],
        },
        response: {
          template: '感谢您的功能建议！我们会将您的想法转达给产品团队。优秀的建议可能会在未来的版本中实现。',
          variables: {},
          escalationRequired: false,
          followUpActions: ['tag_as_feature_request', 'add_to_roadmap_consideration'],
        },
        enabled: true,
        priority: 3,
        usage: {
          totalTriggers: 0,
          successfulResponses: 0,
          userSatisfaction: 0,
          lastUsed: new Date().toISOString(),
        },
      },
    ];

    defaultRules.forEach(rule => {
      if (!this.autoResponseRules.has(rule.ruleId)) {
        this.autoResponseRules.set(rule.ruleId, rule);
      }
    });
  }

  /**
   * 开始定期分析
   */
  private startPeriodicAnalysis(): void {
    // 每小时生成分析报告
    setInterval(() => {
      this.generateAnalyticsReport();
    }, 60 * 60 * 1000);
    
    // 每天清理过期数据
    setInterval(() => {
      this.cleanupExpiredData();
    }, 24 * 60 * 60 * 1000);
    
    // 立即生成一次报告
    this.generateAnalyticsReport();
  }

  // ===== 反馈处理 =====

  /**
   * 提交用户反馈
   */
  async submitFeedback(
    userId: string,
    type: FeedbackType,
    title: string,
    description: string,
    attachments?: { screenshots?: string[]; logs?: string[] }
  ): Promise<string> {
    try {
      const feedbackId = `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 自动分析反馈
      const autoAnalysis = await this.analyzeUserFeedback(type, title, description);
      
      const feedback: UserFeedback = {
        feedbackId,
        userId,
        type,
        title,
        description,
        category: this.categorizeFeedback(type, title, description),
        priority: autoAnalysis.suggestedPriority,
        tags: this.extractTags(title, description),
        userContext: await this.getUserContext(userId),
        attachments: {
          screenshots: attachments?.screenshots || [],
          logs: attachments?.logs || [],
        },
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'new',
        autoAnalysis,
      };

      this.userFeedback.set(feedbackId, feedback);
      await this.saveFeedback();

      // 检查自动响应
      await this.checkAutoResponse(feedback);

      // 创建支持工单（如果需要）
      if (this.shouldCreateTicket(feedback)) {
        await this.createSupportTicket(feedback);
      }

      this.analyticsService.track('user_feedback_submitted', {
        feedbackId,
        userId,
        type,
        priority: feedback.priority,
        timestamp: Date.now(),
      });

      return feedbackId;

    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }

  /**
   * 分析用户反馈
   */
  private async analyzeUserFeedback(
    type: FeedbackType,
    title: string,
    description: string
  ): Promise<UserFeedback['autoAnalysis']> {
    try {
      // 情感分析
      const sentiment = this.analyzeSentiment(title + ' ' + description);
      
      // 优先级建议
      const suggestedPriority = this.suggestPriority(type, title, description);
      
      // 相似问题查找
      const similarIssues = this.findSimilarIssues(title, description);
      
      // 自动响应生成
      const autoResponse = await this.generateAutoResponse(type, title, description);

      return {
        sentiment: sentiment.label,
        confidence: sentiment.confidence,
        suggestedCategory: type,
        suggestedPriority,
        similarIssues,
        autoResponse,
      };

    } catch (error) {
      console.error('Error analyzing feedback:', error);
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        suggestedCategory: type,
        suggestedPriority: 'medium',
        similarIssues: [],
      };
    }
  }

  /**
   * 情感分析
   */
  private analyzeSentiment(text: string): { label: 'positive' | 'neutral' | 'negative'; confidence: number } {
    const positiveWords = ['好', '棒', '喜欢', '满意', '完美', '优秀', 'good', 'great', 'love', 'perfect', 'excellent'];
    const negativeWords = ['差', '烂', '讨厌', '失望', '糟糕', '问题', 'bad', 'terrible', 'hate', 'disappointed', 'awful', 'problem', 'issue'];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveScore = 0;
    let negativeScore = 0;
    
    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) positiveScore++;
      if (negativeWords.some(nw => word.includes(nw))) negativeScore++;
    });
    
    const totalScore = positiveScore + negativeScore;
    if (totalScore === 0) {
      return { label: 'neutral', confidence: 0.5 };
    }
    
    if (positiveScore > negativeScore) {
      return { label: 'positive', confidence: positiveScore / totalScore };
    } else if (negativeScore > positiveScore) {
      return { label: 'negative', confidence: negativeScore / totalScore };
    } else {
      return { label: 'neutral', confidence: 0.5 };
    }
  }

  /**
   * 建议优先级
   */
  private suggestPriority(type: FeedbackType, title: string, description: string): PriorityLevel {
    const criticalKeywords = ['crash', '崩溃', 'cannot', '无法', 'broken', '坏了'];
    const highKeywords = ['bug', 'error', '错误', '问题', 'slow', '慢'];
    const lowKeywords = ['suggestion', '建议', 'nice', '不错'];
    
    const text = (title + ' ' + description).toLowerCase();
    
    if (type === 'bug_report' && criticalKeywords.some(kw => text.includes(kw))) {
      return 'critical';
    } else if (['bug_report', 'technical_support'].includes(type) || highKeywords.some(kw => text.includes(kw))) {
      return 'high';
    } else if (['feature_request', 'compliment'].includes(type) || lowKeywords.some(kw => text.includes(kw))) {
      return 'low';
    } else {
      return 'medium';
    }
  }

  /**
   * 分类反馈
   */
  private categorizeFeedback(type: FeedbackType, title: string, description: string): string {
    const categoryMap: { [key in FeedbackType]: string } = {
      bug_report: '错误报告',
      feature_request: '功能请求',
      user_experience: '用户体验',
      content_issue: '内容问题',
      technical_support: '技术支持',
      account_issue: '账户问题',
      payment_issue: '支付问题',
      general_inquiry: '一般咨询',
      compliment: '用户表扬',
      complaint: '用户投诉',
    };
    
    return categoryMap[type];
  }

  /**
   * 提取标签
   */
  private extractTags(title: string, description: string): string[] {
    const text = (title + ' ' + description).toLowerCase();
    const tags: string[] = [];
    
    // 功能相关标签
    if (text.includes('srs') || text.includes('复习')) tags.push('SRS');
    if (text.includes('badge') || text.includes('徽章')) tags.push('徽章系统');
    if (text.includes('audio') || text.includes('音频')) tags.push('音频');
    if (text.includes('video') || text.includes('视频')) tags.push('视频');
    if (text.includes('notification') || text.includes('通知')) tags.push('通知');
    
    // 平台相关标签
    if (text.includes('ios')) tags.push('iOS');
    if (text.includes('android')) tags.push('Android');
    
    // 紧急程度标签
    if (text.includes('urgent') || text.includes('紧急')) tags.push('紧急');
    if (text.includes('crash') || text.includes('崩溃')) tags.push('崩溃');
    
    return tags;
  }

  /**
   * 获取用户上下文
   */
  private async getUserContext(userId: string): Promise<UserFeedback['userContext']> {
    // 这里应该从用户状态服务获取实际数据
    return {
      appVersion: '2.0.0',
      deviceInfo: 'iOS 17.0',
      userLevel: 'Intermediate',
      lastActivity: new Date().toISOString(),
      currentChapter: 'Chapter 3',
    };
  }

  /**
   * 查找相似问题
   */
  private findSimilarIssues(title: string, description: string): string[] {
    const similarIssues: string[] = [];
    const searchText = (title + ' ' + description).toLowerCase();
    
    // 简化的相似性检查
    this.userFeedback.forEach(feedback => {
      const feedbackText = (feedback.title + ' ' + feedback.description).toLowerCase();
      const commonWords = this.getCommonWords(searchText, feedbackText);
      
      if (commonWords.length >= 2) {
        similarIssues.push(feedback.feedbackId);
      }
    });
    
    return similarIssues.slice(0, 5); // 最多返回5个相似问题
  }

  /**
   * 获取共同词汇
   */
  private getCommonWords(text1: string, text2: string): string[] {
    const words1 = text1.split(/\s+/).filter(w => w.length > 2);
    const words2 = text2.split(/\s+/).filter(w => w.length > 2);
    
    return words1.filter(word => words2.includes(word));
  }

  /**
   * 生成自动响应
   */
  private async generateAutoResponse(type: FeedbackType, title: string, description: string): Promise<string | undefined> {
    const matchingRules = Array.from(this.autoResponseRules.values())
      .filter(rule => rule.enabled && rule.triggers.feedbackTypes.includes(type))
      .sort((a, b) => b.priority - a.priority);
    
    for (const rule of matchingRules) {
      if (this.ruleMatches(rule, type, title, description)) {
        // 更新规则使用统计
        rule.usage.totalTriggers++;
        rule.usage.lastUsed = new Date().toISOString();
        
        return rule.response.template;
      }
    }
    
    return undefined;
  }

  /**
   * 检查规则匹配
   */
  private ruleMatches(rule: AutoResponseRule, type: FeedbackType, title: string, description: string): boolean {
    const text = (title + ' ' + description).toLowerCase();
    
    // 检查关键词匹配
    const hasKeyword = rule.triggers.keywords.length === 0 || 
      rule.triggers.keywords.some(keyword => text.includes(keyword.toLowerCase()));
    
    return hasKeyword;
  }

  /**
   * 检查自动响应
   */
  private async checkAutoResponse(feedback: UserFeedback): Promise<void> {
    if (feedback.autoAnalysis.autoResponse) {
      // 这里可以发送自动响应给用户
      // 在实际应用中，这会通过通知系统或邮件系统发送
      
      this.analyticsService.track('auto_response_sent', {
        feedbackId: feedback.feedbackId,
        userId: feedback.userId,
        responseType: 'auto',
        timestamp: Date.now(),
      });
    }
  }

  /**
   * 判断是否需要创建工单
   */
  private shouldCreateTicket(feedback: UserFeedback): boolean {
    const ticketRequiredTypes: FeedbackType[] = [
      'bug_report', 'technical_support', 'account_issue', 'payment_issue', 'complaint'
    ];
    
    return ticketRequiredTypes.includes(feedback.type) || 
           feedback.priority === 'high' || 
           feedback.priority === 'critical';
  }

  /**
   * 创建支持工单
   */
  private async createSupportTicket(feedback: UserFeedback): Promise<string> {
    try {
      const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const ticket: SupportTicket = {
        ticketId,
        feedbackId: feedback.feedbackId,
        userId: feedback.userId,
        subject: feedback.title,
        description: feedback.description,
        priority: feedback.priority,
        status: 'new',
        communications: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: feedback.tags,
        internalNotes: [],
      };

      this.supportTickets.set(ticketId, ticket);
      await this.saveTickets();

      // 更新反馈状态
      feedback.status = 'assigned';
      feedback.updatedAt = new Date().toISOString();
      this.userFeedback.set(feedback.feedbackId, feedback);
      await this.saveFeedback();

      this.analyticsService.track('support_ticket_created', {
        ticketId,
        feedbackId: feedback.feedbackId,
        priority: ticket.priority,
        timestamp: Date.now(),
      });

      return ticketId;

    } catch (error) {
      console.error('Error creating support ticket:', error);
      throw error;
    }
  }

  // ===== 分析报告生成 =====

  /**
   * 生成分析报告
   */
  private async generateAnalyticsReport(): Promise<void> {
    try {
      const reportId = `report_${Date.now()}`;
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const report: SupportAnalyticsReport = {
        reportId,
        periodStart: weekAgo.toISOString(),
        periodEnd: now.toISOString(),
        overview: this.generateOverviewStats(weekAgo, now),
        feedbackAnalysis: this.generateFeedbackAnalysis(weekAgo, now),
        trends: this.generateTrendAnalysis(weekAgo, now),
        productImprovements: this.generateProductImprovements(weekAgo, now),
      };

      this.analyticsReports.set(reportId, report);
      await this.saveReports();

    } catch (error) {
      console.error('Error generating analytics report:', error);
    }
  }

  /**
   * 生成概览统计
   */
  private generateOverviewStats(startDate: Date, endDate: Date): SupportAnalyticsReport['overview'] {
    const periodFeedback = Array.from(this.userFeedback.values())
      .filter(f => new Date(f.submittedAt) >= startDate && new Date(f.submittedAt) <= endDate);
    
    const periodTickets = Array.from(this.supportTickets.values())
      .filter(t => new Date(t.createdAt) >= startDate && new Date(t.createdAt) <= endDate);
    
    const resolvedTickets = periodTickets.filter(t => t.status === 'resolved' || t.status === 'closed');
    
    const totalResolutionTime = resolvedTickets.reduce((sum, ticket) => {
      if (ticket.resolution) {
        return sum + ticket.resolution.resolutionTime;
      }
      return sum;
    }, 0);
    
    const averageResolutionTime = resolvedTickets.length > 0 ? 
      totalResolutionTime / resolvedTickets.length / 60 : 0; // convert to hours
    
    const satisfactionScores = resolvedTickets
      .map(t => t.resolution?.userSatisfaction)
      .filter(s => s !== undefined) as number[];
    
    const averageSatisfaction = satisfactionScores.length > 0 ?
      satisfactionScores.reduce((sum, score) => sum + score, 0) / satisfactionScores.length : 0;

    return {
      totalFeedback: periodFeedback.length,
      totalTickets: periodTickets.length,
      resolvedTickets: resolvedTickets.length,
      averageResolutionTime: averageResolutionTime,
      userSatisfactionScore: averageSatisfaction,
    };
  }

  /**
   * 生成反馈分析
   */
  private generateFeedbackAnalysis(startDate: Date, endDate: Date): SupportAnalyticsReport['feedbackAnalysis'] {
    const periodFeedback = Array.from(this.userFeedback.values())
      .filter(f => new Date(f.submittedAt) >= startDate && new Date(f.submittedAt) <= endDate);

    // 类型分布
    const typeDistribution = {} as { [type in FeedbackType]: number };
    Object.values(FeedbackType).forEach(type => {
      typeDistribution[type] = 0;
    });
    
    // 优先级分布
    const priorityDistribution = {} as { [priority in PriorityLevel]: number };
    ['low', 'medium', 'high', 'critical'].forEach(priority => {
      priorityDistribution[priority as PriorityLevel] = 0;
    });
    
    // 情感分布
    const sentimentDistribution = { positive: 0, neutral: 0, negative: 0 };
    
    periodFeedback.forEach(feedback => {
      typeDistribution[feedback.type]++;
      priorityDistribution[feedback.priority]++;
      sentimentDistribution[feedback.autoAnalysis.sentiment]++;
    });

    // 热门分类和标签
    const categoryCount: { [category: string]: number } = {};
    const tagCount: { [tag: string]: number } = {};
    
    periodFeedback.forEach(feedback => {
      categoryCount[feedback.category] = (categoryCount[feedback.category] || 0) + 1;
      feedback.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    
    const topCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));
    
    const topTags = Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    return {
      typeDistribution,
      priorityDistribution,
      sentimentDistribution,
      topCategories,
      topTags,
    };
  }

  /**
   * 生成趋势分析
   */
  private generateTrendAnalysis(startDate: Date, endDate: Date): SupportAnalyticsReport['trends'] {
    // 简化的趋势分析，实际应用中会更复杂
    const feedbackVolumeTrend = this.generateDailyTrend(startDate, endDate, 'feedback');
    const resolutionTimeTrend = this.generateDailyTrend(startDate, endDate, 'resolution');
    const satisfactionTrend = this.generateDailyTrend(startDate, endDate, 'satisfaction');
    
    return {
      feedbackVolumeTrend,
      resolutionTimeTrend,
      satisfactionTrend,
      commonIssuesTrend: [
        { issue: '音频播放问题', trend: 'decreasing' },
        { issue: 'SRS通知问题', trend: 'stable' },
        { issue: '徽章显示错误', trend: 'increasing' },
      ],
    };
  }

  /**
   * 生成每日趋势
   */
  private generateDailyTrend(startDate: Date, endDate: Date, type: string): any[] {
    const trend = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      if (type === 'feedback') {
        const count = Array.from(this.userFeedback.values())
          .filter(f => f.submittedAt.startsWith(dateStr)).length;
        trend.push({ date: dateStr, count });
      } else if (type === 'resolution') {
        const avgHours = 2 + Math.random() * 4; // 模拟数据
        trend.push({ date: dateStr, averageHours: avgHours });
      } else if (type === 'satisfaction') {
        const score = 3.5 + Math.random() * 1.5; // 模拟数据
        trend.push({ date: dateStr, score });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return trend;
  }

  /**
   * 生成产品改进建议
   */
  private generateProductImprovements(startDate: Date, endDate: Date): SupportAnalyticsReport['productImprovements'] {
    const periodFeedback = Array.from(this.userFeedback.values())
      .filter(f => new Date(f.submittedAt) >= startDate && new Date(f.submittedAt) <= endDate);

    // 高影响问题
    const issueImpact: { [issue: string]: { impact: number; frequency: number } } = {};
    
    periodFeedback.forEach(feedback => {
      if (feedback.type === 'bug_report' || feedback.type === 'user_experience') {
        const issue = feedback.title;
        if (!issueImpact[issue]) {
          issueImpact[issue] = { impact: 0, frequency: 0 };
        }
        issueImpact[issue].frequency++;
        issueImpact[issue].impact += feedback.priority === 'critical' ? 4 : 
                                     feedback.priority === 'high' ? 3 :
                                     feedback.priority === 'medium' ? 2 : 1;
      }
    });

    const highImpactIssues = Object.entries(issueImpact)
      .sort(([, a], [, b]) => (b.impact * b.frequency) - (a.impact * a.frequency))
      .slice(0, 5)
      .map(([issue, data]) => ({ issue, ...data }));

    // 功能请求
    const featureRequests = periodFeedback
      .filter(f => f.type === 'feature_request')
      .reduce((acc, feedback) => {
        const feature = feedback.title;
        const existing = acc.find(f => f.feature === feature);
        if (existing) {
          existing.votes++;
        } else {
          acc.push({ feature, votes: 1, priority: 1 });
        }
        return acc;
      }, [] as { feature: string; votes: number; priority: number }[])
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 5);

    return {
      highImpactIssues,
      featureRequests,
      userExperienceIssues: [
        { issue: '复习界面响应慢', severity: 3, affectedUsers: 15 },
        { issue: '通知时机不准确', severity: 2, affectedUsers: 8 },
      ],
      contentImprovements: [
        { content: '商务英语内容', feedback: '需要更多实用场景', priority: 2 },
        { content: '发音练习', feedback: '希望增加口型指导', priority: 1 },
      ],
    };
  }

  /**
   * 清理过期数据
   */
  private cleanupExpiredData(): void {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // 清理过期反馈（保留30天）
    const expiredFeedback = Array.from(this.userFeedback.entries())
      .filter(([, feedback]) => new Date(feedback.submittedAt) < thirtyDaysAgo);
    
    expiredFeedback.forEach(([feedbackId]) => {
      this.userFeedback.delete(feedbackId);
    });
    
    // 清理过期报告（保留7天）
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const expiredReports = Array.from(this.analyticsReports.entries())
      .filter(([, report]) => new Date(report.periodEnd) < sevenDaysAgo);
    
    expiredReports.forEach(([reportId]) => {
      this.analyticsReports.delete(reportId);
    });
  }

  // ===== 数据持久化 =====

  private async saveFeedback(): Promise<void> {
    try {
      const feedback = Array.from(this.userFeedback.values());
      await AsyncStorage.setItem(this.FEEDBACK_KEY, JSON.stringify(feedback));
    } catch (error) {
      console.error('Error saving feedback:', error);
    }
  }

  private async saveTickets(): Promise<void> {
    try {
      const tickets = Array.from(this.supportTickets.values());
      await AsyncStorage.setItem(this.TICKETS_KEY, JSON.stringify(tickets));
    } catch (error) {
      console.error('Error saving tickets:', error);
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
   * 获取用户反馈
   */
  getUserFeedback(feedbackId: string): UserFeedback | null {
    return this.userFeedback.get(feedbackId) || null;
  }

  /**
   * 获取用户的所有反馈
   */
  getUserFeedbackList(userId: string): UserFeedback[] {
    return Array.from(this.userFeedback.values()).filter(f => f.userId === userId);
  }

  /**
   * 获取支持工单
   */
  getSupportTicket(ticketId: string): SupportTicket | null {
    return this.supportTickets.get(ticketId) || null;
  }

  /**
   * 获取最新分析报告
   */
  getLatestAnalyticsReport(): SupportAnalyticsReport | null {
    const reports = Array.from(this.analyticsReports.values())
      .sort((a, b) => new Date(b.periodEnd).getTime() - new Date(a.periodEnd).getTime());
    
    return reports[0] || null;
  }

  /**
   * 获取支持统计
   */
  getSupportStatistics(): {
    totalFeedback: number;
    openTickets: number;
    averageResponseTime: number;
    userSatisfaction: number;
  } {
    const openTickets = Array.from(this.supportTickets.values())
      .filter(t => ['new', 'assigned', 'in_progress'].includes(t.status));
    
    const resolvedTickets = Array.from(this.supportTickets.values())
      .filter(t => t.status === 'resolved' && t.resolution);
    
    const avgResponseTime = resolvedTickets.length > 0 ?
      resolvedTickets.reduce((sum, t) => sum + (t.resolution?.resolutionTime || 0), 0) / resolvedTickets.length / 60 : 0;
    
    const satisfactionScores = resolvedTickets
      .map(t => t.resolution?.userSatisfaction)
      .filter(s => s !== undefined) as number[];
    
    const avgSatisfaction = satisfactionScores.length > 0 ?
      satisfactionScores.reduce((sum, score) => sum + score, 0) / satisfactionScores.length : 0;

    return {
      totalFeedback: this.userFeedback.size,
      openTickets: openTickets.length,
      averageResponseTime: avgResponseTime,
      userSatisfaction: avgSatisfaction,
    };
  }
}

export default SupportAnalyticsService;
