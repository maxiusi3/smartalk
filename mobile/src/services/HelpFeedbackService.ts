/**
 * HelpFeedbackService - V2 帮助和反馈服务
 * 提供完整的用户支持系统：帮助文档、FAQ、反馈收集、问题报告
 * 集成智能客服、学习指导和用户反馈分析
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalyticsService } from './AnalyticsService';
import UserStateService from './UserStateService';
import AccessibilityService from './AccessibilityService';

// 帮助内容类型
export interface HelpContent {
  id: string;
  category: HelpCategory;
  title: string;
  content: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lastUpdated: string;
  viewCount: number;
  helpfulness: number; // 1-5星评分
  relatedTopics: string[];
  videoUrl?: string;
  images?: string[];
}

// 帮助分类
export type HelpCategory = 
  | 'getting_started'
  | 'learning_methods'
  | 'technical_issues'
  | 'account_settings'
  | 'accessibility'
  | 'troubleshooting'
  | 'features'
  | 'pronunciation'
  | 'progress_tracking';

// FAQ项目
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: HelpCategory;
  popularity: number;
  lastUpdated: string;
  relatedQuestions: string[];
}

// 反馈类型
export type FeedbackType = 
  | 'bug_report'
  | 'feature_request'
  | 'content_feedback'
  | 'user_experience'
  | 'accessibility_issue'
  | 'performance_issue'
  | 'general_feedback';

// 反馈项目
export interface FeedbackItem {
  id: string;
  type: FeedbackType;
  title: string;
  description: string;
  category: HelpCategory;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'submitted' | 'reviewing' | 'in_progress' | 'resolved' | 'closed';
  userId: string;
  userEmail?: string;
  deviceInfo: DeviceInfo;
  appVersion: string;
  screenshots?: string[];
  logs?: string[];
  createdAt: string;
  updatedAt: string;
  adminResponse?: string;
  resolution?: string;
}

// 设备信息
interface DeviceInfo {
  platform: 'ios' | 'android';
  osVersion: string;
  deviceModel: string;
  appVersion: string;
  buildNumber: string;
  screenSize: { width: number; height: number };
  locale: string;
}

// 智能建议
interface SmartSuggestion {
  type: 'help_article' | 'faq' | 'tutorial' | 'contact_support';
  title: string;
  description: string;
  actionUrl?: string;
  confidence: number; // 0-1
}

// 用户反馈统计
interface FeedbackStats {
  totalSubmitted: number;
  byType: { [key in FeedbackType]: number };
  byStatus: { [key: string]: number };
  averageResponseTime: number; // 小时
  satisfactionScore: number; // 1-5
  commonIssues: string[];
}

class HelpFeedbackService {
  private static instance: HelpFeedbackService;
  private analyticsService = AnalyticsService.getInstance();
  private userStateService = UserStateService.getInstance();
  private accessibilityService = AccessibilityService.getInstance();
  
  // 缓存
  private helpContentCache: Map<string, HelpContent> = new Map();
  private faqCache: Map<string, FAQItem> = new Map();
  private userFeedbackCache: Map<string, FeedbackItem[]> = new Map();
  
  // 存储键
  private static readonly HELP_CACHE_KEY = 'help_content_cache';
  private static readonly FAQ_CACHE_KEY = 'faq_cache';
  private static readonly FEEDBACK_CACHE_KEY = 'user_feedback_cache';

  static getInstance(): HelpFeedbackService {
    if (!HelpFeedbackService.instance) {
      HelpFeedbackService.instance = new HelpFeedbackService();
    }
    return HelpFeedbackService.instance;
  }

  // ===== 帮助内容管理 =====

  /**
   * 获取帮助内容列表
   */
  async getHelpContent(category?: HelpCategory): Promise<HelpContent[]> {
    try {
      // 从缓存获取
      const cached = await this.getCachedHelpContent();
      let content = Array.from(cached.values());
      
      // 按分类筛选
      if (category) {
        content = content.filter(item => item.category === category);
      }
      
      // 按热度和更新时间排序
      content.sort((a, b) => {
        const scoreA = a.helpfulness * 0.7 + a.viewCount * 0.3;
        const scoreB = b.helpfulness * 0.7 + b.viewCount * 0.3;
        return scoreB - scoreA;
      });
      
      this.analyticsService.track('help_content_viewed', {
        category,
        contentCount: content.length,
        timestamp: Date.now(),
      });
      
      return content;
      
    } catch (error) {
      console.error('Error getting help content:', error);
      return [];
    }
  }

  /**
   * 获取单个帮助内容
   */
  async getHelpContentById(id: string): Promise<HelpContent | null> {
    try {
      const cached = await this.getCachedHelpContent();
      const content = cached.get(id);
      
      if (content) {
        // 增加查看次数
        content.viewCount++;
        await this.updateHelpContentCache(cached);
        
        this.analyticsService.track('help_article_viewed', {
          articleId: id,
          title: content.title,
          category: content.category,
          timestamp: Date.now(),
        });
      }
      
      return content || null;
      
    } catch (error) {
      console.error('Error getting help content by id:', error);
      return null;
    }
  }

  /**
   * 搜索帮助内容
   */
  async searchHelpContent(query: string): Promise<HelpContent[]> {
    try {
      const cached = await this.getCachedHelpContent();
      const allContent = Array.from(cached.values());
      
      const searchTerms = query.toLowerCase().split(' ');
      
      const results = allContent.filter(content => {
        const searchText = `${content.title} ${content.content} ${content.tags.join(' ')}`.toLowerCase();
        return searchTerms.some(term => searchText.includes(term));
      });
      
      // 按相关性排序
      results.sort((a, b) => {
        const relevanceA = this.calculateRelevance(a, searchTerms);
        const relevanceB = this.calculateRelevance(b, searchTerms);
        return relevanceB - relevanceA;
      });
      
      this.analyticsService.track('help_content_searched', {
        query,
        resultCount: results.length,
        timestamp: Date.now(),
      });
      
      return results;
      
    } catch (error) {
      console.error('Error searching help content:', error);
      return [];
    }
  }

  /**
   * 评价帮助内容
   */
  async rateHelpContent(id: string, rating: number): Promise<void> {
    try {
      const cached = await this.getCachedHelpContent();
      const content = cached.get(id);
      
      if (content) {
        // 简化的评分更新逻辑
        content.helpfulness = (content.helpfulness + rating) / 2;
        await this.updateHelpContentCache(cached);
        
        this.analyticsService.track('help_content_rated', {
          articleId: id,
          rating,
          newHelpfulness: content.helpfulness,
          timestamp: Date.now(),
        });
      }
      
    } catch (error) {
      console.error('Error rating help content:', error);
    }
  }

  // ===== FAQ管理 =====

  /**
   * 获取FAQ列表
   */
  async getFAQs(category?: HelpCategory): Promise<FAQItem[]> {
    try {
      const cached = await this.getCachedFAQs();
      let faqs = Array.from(cached.values());
      
      if (category) {
        faqs = faqs.filter(faq => faq.category === category);
      }
      
      // 按热度排序
      faqs.sort((a, b) => b.popularity - a.popularity);
      
      this.analyticsService.track('faq_viewed', {
        category,
        faqCount: faqs.length,
        timestamp: Date.now(),
      });
      
      return faqs;
      
    } catch (error) {
      console.error('Error getting FAQs:', error);
      return [];
    }
  }

  /**
   * 搜索FAQ
   */
  async searchFAQs(query: string): Promise<FAQItem[]> {
    try {
      const cached = await this.getCachedFAQs();
      const allFAQs = Array.from(cached.values());
      
      const searchTerms = query.toLowerCase().split(' ');
      
      const results = allFAQs.filter(faq => {
        const searchText = `${faq.question} ${faq.answer}`.toLowerCase();
        return searchTerms.some(term => searchText.includes(term));
      });
      
      results.sort((a, b) => b.popularity - a.popularity);
      
      this.analyticsService.track('faq_searched', {
        query,
        resultCount: results.length,
        timestamp: Date.now(),
      });
      
      return results;
      
    } catch (error) {
      console.error('Error searching FAQs:', error);
      return [];
    }
  }

  // ===== 反馈管理 =====

  /**
   * 提交反馈
   */
  async submitFeedback(feedback: Omit<FeedbackItem, 'id' | 'createdAt' | 'updatedAt' | 'deviceInfo' | 'appVersion'>): Promise<string> {
    try {
      const deviceInfo = await this.getDeviceInfo();
      const feedbackId = `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const feedbackItem: FeedbackItem = {
        ...feedback,
        id: feedbackId,
        deviceInfo,
        appVersion: '2.0.0', // 从应用配置获取
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // 保存到本地缓存
      await this.saveFeedbackToCache(feedbackItem);
      
      // 发送到服务器（模拟）
      await this.sendFeedbackToServer(feedbackItem);
      
      this.analyticsService.track('feedback_submitted', {
        feedbackId,
        type: feedback.type,
        category: feedback.category,
        priority: feedback.priority,
        timestamp: Date.now(),
      });
      
      // 无障碍反馈
      this.accessibilityService.announceForScreenReader('反馈已成功提交', 'assertive');
      
      return feedbackId;
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }

  /**
   * 获取用户反馈历史
   */
  async getUserFeedback(userId: string): Promise<FeedbackItem[]> {
    try {
      const cached = this.userFeedbackCache.get(userId) || [];
      
      // 按创建时间倒序排列
      cached.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      this.analyticsService.track('user_feedback_history_viewed', {
        userId,
        feedbackCount: cached.length,
        timestamp: Date.now(),
      });
      
      return cached;
      
    } catch (error) {
      console.error('Error getting user feedback:', error);
      return [];
    }
  }

  /**
   * 获取反馈统计
   */
  async getFeedbackStats(userId?: string): Promise<FeedbackStats> {
    try {
      const allFeedback = userId 
        ? this.userFeedbackCache.get(userId) || []
        : Array.from(this.userFeedbackCache.values()).flat();
      
      const stats: FeedbackStats = {
        totalSubmitted: allFeedback.length,
        byType: {} as { [key in FeedbackType]: number },
        byStatus: {},
        averageResponseTime: 24, // 模拟数据
        satisfactionScore: 4.2, // 模拟数据
        commonIssues: ['登录问题', '音频播放', '进度同步', '发音评估'],
      };
      
      // 统计各类型数量
      Object.values(allFeedback).forEach(feedback => {
        stats.byType[feedback.type] = (stats.byType[feedback.type] || 0) + 1;
        stats.byStatus[feedback.status] = (stats.byStatus[feedback.status] || 0) + 1;
      });
      
      return stats;
      
    } catch (error) {
      console.error('Error getting feedback stats:', error);
      return {
        totalSubmitted: 0,
        byType: {} as { [key in FeedbackType]: number },
        byStatus: {},
        averageResponseTime: 0,
        satisfactionScore: 0,
        commonIssues: [],
      };
    }
  }

  // ===== 智能建议 =====

  /**
   * 获取智能帮助建议
   */
  async getSmartSuggestions(context: string, userIssue?: string): Promise<SmartSuggestion[]> {
    try {
      const suggestions: SmartSuggestion[] = [];
      
      // 基于上下文的建议
      if (context.includes('login') || context.includes('登录')) {
        suggestions.push({
          type: 'help_article',
          title: '登录问题解决指南',
          description: '解决常见的登录和账户问题',
          confidence: 0.9,
        });
      }
      
      if (context.includes('pronunciation') || context.includes('发音')) {
        suggestions.push({
          type: 'tutorial',
          title: '发音训练教程',
          description: '学习如何使用发音评估功能',
          confidence: 0.8,
        });
      }
      
      if (context.includes('progress') || context.includes('进度')) {
        suggestions.push({
          type: 'faq',
          title: '学习进度常见问题',
          description: '了解进度追踪和数据同步',
          confidence: 0.7,
        });
      }
      
      // 通用建议
      suggestions.push({
        type: 'contact_support',
        title: '联系客服',
        description: '如果问题仍未解决，请联系我们的客服团队',
        confidence: 0.5,
      });
      
      // 按置信度排序
      suggestions.sort((a, b) => b.confidence - a.confidence);
      
      this.analyticsService.track('smart_suggestions_generated', {
        context,
        suggestionCount: suggestions.length,
        timestamp: Date.now(),
      });
      
      return suggestions;
      
    } catch (error) {
      console.error('Error getting smart suggestions:', error);
      return [];
    }
  }

  // ===== 私有方法 =====

  private async getCachedHelpContent(): Promise<Map<string, HelpContent>> {
    if (this.helpContentCache.size === 0) {
      await this.loadHelpContentCache();
    }
    return this.helpContentCache;
  }

  private async getCachedFAQs(): Promise<Map<string, FAQItem>> {
    if (this.faqCache.size === 0) {
      await this.loadFAQCache();
    }
    return this.faqCache;
  }

  private async loadHelpContentCache(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(HelpFeedbackService.HELP_CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached) as HelpContent[];
        data.forEach(item => this.helpContentCache.set(item.id, item));
      } else {
        // 加载默认帮助内容
        await this.loadDefaultHelpContent();
      }
    } catch (error) {
      console.error('Error loading help content cache:', error);
      await this.loadDefaultHelpContent();
    }
  }

  private async loadFAQCache(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(HelpFeedbackService.FAQ_CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached) as FAQItem[];
        data.forEach(item => this.faqCache.set(item.id, item));
      } else {
        // 加载默认FAQ
        await this.loadDefaultFAQs();
      }
    } catch (error) {
      console.error('Error loading FAQ cache:', error);
      await this.loadDefaultFAQs();
    }
  }

  private async loadDefaultHelpContent(): Promise<void> {
    const defaultContent: HelpContent[] = [
      {
        id: 'getting_started_001',
        category: 'getting_started',
        title: '如何开始学习',
        content: '欢迎使用SmarTalk！首先完成水平测试，然后选择适合的学习主题开始您的英语学习之旅。',
        tags: ['新手', '开始', '水平测试'],
        difficulty: 'beginner',
        lastUpdated: new Date().toISOString(),
        viewCount: 0,
        helpfulness: 4.5,
        relatedTopics: ['placement_test', 'learning_path'],
      },
      {
        id: 'pronunciation_001',
        category: 'pronunciation',
        title: '发音评估使用指南',
        content: '发音评估功能帮助您改善英语发音。点击录音按钮，清晰地朗读单词或句子，系统会给出评分和改进建议。',
        tags: ['发音', '评估', '录音'],
        difficulty: 'intermediate',
        lastUpdated: new Date().toISOString(),
        viewCount: 0,
        helpfulness: 4.3,
        relatedTopics: ['rescue_mode', 'speaking_tips'],
      },
      {
        id: 'accessibility_001',
        category: 'accessibility',
        title: '无障碍功能设置',
        content: 'SmarTalk支持完整的无障碍功能，包括屏幕阅读器、高对比度模式、字体大小调整等。在设置中可以根据需要启用相应功能。',
        tags: ['无障碍', '屏幕阅读器', '高对比度'],
        difficulty: 'beginner',
        lastUpdated: new Date().toISOString(),
        viewCount: 0,
        helpfulness: 4.7,
        relatedTopics: ['settings', 'voice_control'],
      },
    ];
    
    defaultContent.forEach(item => this.helpContentCache.set(item.id, item));
    await this.updateHelpContentCache(this.helpContentCache);
  }

  private async loadDefaultFAQs(): Promise<void> {
    const defaultFAQs: FAQItem[] = [
      {
        id: 'faq_001',
        question: '如何重置学习进度？',
        answer: '在个人中心的设置页面中，找到"重置进度"选项。请注意，此操作不可撤销。',
        category: 'account_settings',
        popularity: 85,
        lastUpdated: new Date().toISOString(),
        relatedQuestions: ['faq_002', 'faq_003'],
      },
      {
        id: 'faq_002',
        question: '为什么音频无法播放？',
        answer: '请检查设备音量设置，确保网络连接正常。如果问题持续，请尝试重启应用。',
        category: 'technical_issues',
        popularity: 92,
        lastUpdated: new Date().toISOString(),
        relatedQuestions: ['faq_001', 'faq_004'],
      },
      {
        id: 'faq_003',
        question: '如何启用语音控制？',
        answer: '在无障碍设置中启用"语音命令"功能，然后可以使用"返回"、"开始学习"等语音命令控制应用。',
        category: 'accessibility',
        popularity: 67,
        lastUpdated: new Date().toISOString(),
        relatedQuestions: ['faq_001', 'faq_002'],
      },
    ];
    
    defaultFAQs.forEach(item => this.faqCache.set(item.id, item));
    await this.updateFAQCache(this.faqCache);
  }

  private async updateHelpContentCache(cache: Map<string, HelpContent>): Promise<void> {
    try {
      const data = Array.from(cache.values());
      await AsyncStorage.setItem(HelpFeedbackService.HELP_CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error updating help content cache:', error);
    }
  }

  private async updateFAQCache(cache: Map<string, FAQItem>): Promise<void> {
    try {
      const data = Array.from(cache.values());
      await AsyncStorage.setItem(HelpFeedbackService.FAQ_CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error updating FAQ cache:', error);
    }
  }

  private calculateRelevance(content: HelpContent, searchTerms: string[]): number {
    let relevance = 0;
    const searchText = `${content.title} ${content.content} ${content.tags.join(' ')}`.toLowerCase();
    
    searchTerms.forEach(term => {
      if (content.title.toLowerCase().includes(term)) relevance += 3;
      if (content.tags.some(tag => tag.toLowerCase().includes(term))) relevance += 2;
      if (content.content.toLowerCase().includes(term)) relevance += 1;
    });
    
    return relevance;
  }

  private async getDeviceInfo(): Promise<DeviceInfo> {
    // 模拟设备信息获取
    return {
      platform: 'ios',
      osVersion: '17.0',
      deviceModel: 'iPhone 15',
      appVersion: '2.0.0',
      buildNumber: '100',
      screenSize: { width: 393, height: 852 },
      locale: 'zh-CN',
    };
  }

  private async saveFeedbackToCache(feedback: FeedbackItem): Promise<void> {
    try {
      const userFeedback = this.userFeedbackCache.get(feedback.userId) || [];
      userFeedback.push(feedback);
      this.userFeedbackCache.set(feedback.userId, userFeedback);
      
      // 保存到本地存储
      await AsyncStorage.setItem(
        `${HelpFeedbackService.FEEDBACK_CACHE_KEY}_${feedback.userId}`,
        JSON.stringify(userFeedback)
      );
    } catch (error) {
      console.error('Error saving feedback to cache:', error);
    }
  }

  private async sendFeedbackToServer(feedback: FeedbackItem): Promise<void> {
    // 模拟发送到服务器
    console.log('Sending feedback to server:', feedback.id);
    
    // 在实际应用中，这里会发送HTTP请求到服务器
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // ===== 公共API =====

  /**
   * 获取帮助分类列表
   */
  getHelpCategories(): { category: HelpCategory; name: string; description: string }[] {
    return [
      { category: 'getting_started', name: '快速开始', description: '新用户入门指南' },
      { category: 'learning_methods', name: '学习方法', description: '高效学习技巧' },
      { category: 'pronunciation', name: '发音训练', description: '发音评估和改进' },
      { category: 'features', name: '功能介绍', description: '应用功能详解' },
      { category: 'accessibility', name: '无障碍功能', description: '无障碍设置和使用' },
      { category: 'technical_issues', name: '技术问题', description: '常见技术问题解决' },
      { category: 'account_settings', name: '账户设置', description: '账户管理和设置' },
      { category: 'troubleshooting', name: '故障排除', description: '问题诊断和解决' },
      { category: 'progress_tracking', name: '进度追踪', description: '学习进度管理' },
    ];
  }

  /**
   * 获取反馈类型列表
   */
  getFeedbackTypes(): { type: FeedbackType; name: string; description: string }[] {
    return [
      { type: 'bug_report', name: '错误报告', description: '报告应用中的错误或异常' },
      { type: 'feature_request', name: '功能建议', description: '建议新功能或改进' },
      { type: 'content_feedback', name: '内容反馈', description: '对学习内容的意见' },
      { type: 'user_experience', name: '用户体验', description: '界面和交互体验反馈' },
      { type: 'accessibility_issue', name: '无障碍问题', description: '无障碍功能相关问题' },
      { type: 'performance_issue', name: '性能问题', description: '应用性能和速度问题' },
      { type: 'general_feedback', name: '一般反馈', description: '其他意见和建议' },
    ];
  }

  /**
   * 清理缓存
   */
  async clearCache(): Promise<void> {
    try {
      this.helpContentCache.clear();
      this.faqCache.clear();
      this.userFeedbackCache.clear();
      
      await Promise.all([
        AsyncStorage.removeItem(HelpFeedbackService.HELP_CACHE_KEY),
        AsyncStorage.removeItem(HelpFeedbackService.FAQ_CACHE_KEY),
      ]);
      
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

export default HelpFeedbackService;
