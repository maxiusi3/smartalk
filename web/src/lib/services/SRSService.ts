/**
 * SRSService - 间隔重复系统服务 (Web版本)
 * 移植自 mobile/src/services/SRSService.ts
 * 基于SuperMemo 2算法实现智能复习调度
 */

import { webStorageAdapter } from '../adapters/WebStorageAdapter';
import { webAnalyticsAdapter } from '../adapters/WebAnalyticsAdapter';
import { progressManager } from '../progressManager';
import { performanceMonitor } from '../utils/PerformanceMonitor';

// SRS卡片数据结构
export interface SRSCard {
  id: string;
  keywordId: string;
  word: string;
  translation: string;
  audioUrl: string;
  imageUrl?: string;
  
  // SuperMemo 2 算法参数
  easeFactor: number; // 难度因子 (1.3 - 2.5)
  interval: number; // 复习间隔 (天)
  repetitions: number; // 重复次数
  nextReviewDate: string; // 下次复习日期
  
  // 学习状态
  status: 'new' | 'learning' | 'review' | 'graduated' | 'suspended';
  createdAt: string;
  lastReviewedAt?: string;
  
  // 统计数据
  totalReviews: number;
  correctReviews: number;
  averageResponseTime: number; // 毫秒
  
  // 学习上下文
  learningContext: {
    storyId?: string;
    interest?: string;
    difficulty: number; // 1-5
    priority: number; // 1-10
  };
  
  // 用户反馈
  userFeedback: {
    lastDifficulty?: number; // 1-5 (用户主观难度)
    lastConfidence?: number; // 1-5 (用户信心度)
    notes?: string;
  };
}

// SRS复习会话
export interface SRSReviewSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  
  // 会话配置
  sessionType: 'daily' | 'catch_up' | 'practice' | 'focused';
  targetCards: number;
  maxDuration: number; // 分钟
  
  // 会话结果
  cardsReviewed: number;
  correctAnswers: number;
  averageResponseTime: number;
  
  // 性能指标
  accuracyRate: number;
  completionRate: number;
  engagementScore: number; // 1-100
  
  // 学习效果
  newCards: number;
  reviewCards: number;
  graduatedCards: number;
  
  // 用户状态
  userMood: 'frustrated' | 'neutral' | 'confident' | 'excited';
  sessionQuality: 'poor' | 'average' | 'good' | 'excellent';
}

// SRS评估类型
export type SRSAssessment = 'forgot' | 'hard' | 'good' | 'easy' | 'perfect';

// 复习优先级
export interface ReviewPriority {
  cardId: string;
  priority: number; // 0-100
  reason: 'overdue' | 'new' | 'difficult' | 'important' | 'streak';
  daysOverdue?: number;
}

// SRS统计数据
export interface SRSStatistics {
  totalCards: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;
  graduatedCards: number;
  suspendedCards: number;
  
  // 复习统计
  todayReviews: number;
  weeklyReviews: number;
  monthlyReviews: number;
  
  // 性能统计
  overallAccuracy: number;
  averageResponseTime: number;
  currentStreak: number;
  longestStreak: number;
  
  // 预测数据
  upcomingReviews: {
    today: number;
    tomorrow: number;
    thisWeek: number;
    nextWeek: number;
  };
}

export class SRSService {
  private static instance: SRSService;
  private cards: Map<string, SRSCard> = new Map();
  private sessions: SRSReviewSession[] = [];
  private currentSession: SRSReviewSession | null = null;
  
  // SuperMemo 2 算法常量
  private readonly SM2_INITIAL_EASE_FACTOR = 2.5;
  private readonly SM2_MIN_EASE_FACTOR = 1.3;
  private readonly SM2_MAX_EASE_FACTOR = 2.5;
  private readonly SM2_INITIAL_INTERVAL = 1;
  private readonly SM2_SECOND_INTERVAL = 6;
  
  // 存储键
  private readonly STORAGE_KEY_CARDS = 'srs_cards';
  private readonly STORAGE_KEY_SESSIONS = 'srs_sessions';
  private readonly STORAGE_KEY_STATISTICS = 'srs_statistics';

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): SRSService {
    if (!SRSService.instance) {
      SRSService.instance = new SRSService();
    }
    return SRSService.instance;
  }

  // ===== 卡片管理 =====

  /**
   * 添加新卡片到SRS队列
   */
  async addCard(
    keywordId: string, 
    word: string, 
    translation: string, 
    audioUrl: string, 
    context?: {
      storyId?: string;
      interest?: string;
      difficulty?: number;
      imageUrl?: string;
    }
  ): Promise<SRSCard> {
    try {
      // 检查是否已存在
      const existingCard = Array.from(this.cards.values()).find(card => card.keywordId === keywordId);
      if (existingCard) {
        return existingCard;
      }

      const card: SRSCard = {
        id: `srs_${keywordId}_${Date.now()}`,
        keywordId,
        word,
        translation,
        audioUrl,
        imageUrl: context?.imageUrl,
        
        // SuperMemo 2 算法初始值
        easeFactor: this.SM2_INITIAL_EASE_FACTOR,
        interval: this.SM2_INITIAL_INTERVAL,
        repetitions: 0,
        nextReviewDate: this.getNextReviewDate(this.SM2_INITIAL_INTERVAL),
        
        status: 'new',
        createdAt: new Date().toISOString(),
        
        totalReviews: 0,
        correctReviews: 0,
        averageResponseTime: 0,
        
        learningContext: {
          storyId: context?.storyId,
          interest: context?.interest,
          difficulty: context?.difficulty || 3,
          priority: 5
        },
        
        userFeedback: {}
      };

      this.cards.set(card.id, card);
      await this.saveToStorage();
      
      // 记录到分析服务
      webAnalyticsAdapter.trackEvent({
        eventName: 'srs_card_added',
        parameters: {
          keyword_id: keywordId,
          word: word,
          difficulty: card.learningContext.difficulty,
          story_id: context?.storyId,
          interest: context?.interest
        }
      });

      return card;
    } catch (error) {
      console.error('Error adding SRS card:', error);
      throw error;
    }
  }

  /**
   * 获取需要复习的卡片
   */
  getDueCards(limit: number = 20): SRSCard[] {
    const now = new Date();
    const dueCards = Array.from(this.cards.values())
      .filter(card => {
        if (card.status === 'suspended') return false;
        const reviewDate = new Date(card.nextReviewDate);
        return reviewDate <= now;
      })
      .sort((a, b) => {
        // 按优先级排序
        const priorityA = this.calculateCardPriority(a);
        const priorityB = this.calculateCardPriority(b);
        return priorityB.priority - priorityA.priority;
      })
      .slice(0, limit);

    return dueCards;
  }

  /**
   * 获取新卡片
   */
  getNewCards(limit: number = 10): SRSCard[] {
    return Array.from(this.cards.values())
      .filter(card => card.status === 'new')
      .sort((a, b) => {
        // 按创建时间和优先级排序
        const priorityDiff = b.learningContext.priority - a.learningContext.priority;
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      })
      .slice(0, limit);
  }

  /**
   * 计算卡片优先级
   */
  private calculateCardPriority(card: SRSCard): ReviewPriority {
    const now = new Date();
    const reviewDate = new Date(card.nextReviewDate);
    const daysOverdue = Math.max(0, Math.ceil((now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    let priority = 50; // 基础优先级
    let reason: ReviewPriority['reason'] = 'new';

    if (daysOverdue > 0) {
      // 过期卡片优先级更高
      priority += Math.min(daysOverdue * 10, 40);
      reason = 'overdue';
    }

    if (card.status === 'new') {
      priority += 20;
      reason = 'new';
    }

    // 困难卡片优先级更高
    if (card.easeFactor < 2.0) {
      priority += 15;
      reason = 'difficult';
    }

    // 重要卡片优先级更高
    if (card.learningContext.priority > 7) {
      priority += 10;
      reason = 'important';
    }

    return {
      cardId: card.id,
      priority: Math.min(priority, 100),
      reason,
      daysOverdue: daysOverdue > 0 ? daysOverdue : undefined
    };
  }

  // ===== SuperMemo 2 算法实现 =====

  /**
   * 处理复习结果，更新卡片状态
   */
  async reviewCard(
    cardId: string, 
    assessment: SRSAssessment, 
    responseTime: number,
    userFeedback?: {
      difficulty?: number;
      confidence?: number;
      notes?: string;
    }
  ): Promise<SRSCard> {
    try {
      const card = this.cards.get(cardId);
      if (!card) {
        throw new Error(`Card not found: ${cardId}`);
      }

      // 开始性能监控
      performanceMonitor.startFocusModeActivation();

      // 更新统计数据
      card.totalReviews++;
      card.lastReviewedAt = new Date().toISOString();
      
      // 更新平均响应时间
      card.averageResponseTime = card.totalReviews === 1 
        ? responseTime 
        : (card.averageResponseTime * (card.totalReviews - 1) + responseTime) / card.totalReviews;

      // 更新用户反馈
      if (userFeedback) {
        card.userFeedback = { ...card.userFeedback, ...userFeedback };
      }

      // SuperMemo 2 算法更新
      this.updateCardWithSM2(card, assessment);

      // 更新当前会话统计
      if (this.currentSession) {
        this.updateSessionStats(assessment === 'forgot' ? false : true, responseTime);
      }

      this.cards.set(cardId, card);
      await this.saveToStorage();

      // 同步到progressManager
      await this.syncToProgressManager(card, assessment);

      // 记录到分析服务
      webAnalyticsAdapter.trackEvent({
        eventName: 'srs_card_reviewed',
        parameters: {
          card_id: cardId,
          keyword_id: card.keywordId,
          assessment: assessment,
          response_time: responseTime,
          new_interval: card.interval,
          ease_factor: card.easeFactor,
          repetitions: card.repetitions,
          status: card.status
        }
      });

      // 结束性能监控
      performanceMonitor.endFocusModeActivation();

      return card;
    } catch (error) {
      console.error('Error reviewing card:', error);
      throw error;
    }
  }

  /**
   * SuperMemo 2 算法更新卡片
   */
  private updateCardWithSM2(card: SRSCard, assessment: SRSAssessment): void {
    // 将评估转换为质量分数 (0-5)
    let quality: number;
    switch (assessment) {
      case 'forgot':
        quality = 0;
        break;
      case 'hard':
        quality = 3;
        break;
      case 'good':
        quality = 4;
        break;
      case 'easy':
        quality = 5;
        break;
      case 'perfect':
        quality = 5;
        break;
      default:
        quality = 3;
    }

    if (quality >= 3) {
      // 正确回答
      card.correctReviews++;
      
      if (card.repetitions === 0) {
        card.interval = this.SM2_INITIAL_INTERVAL;
      } else if (card.repetitions === 1) {
        card.interval = this.SM2_SECOND_INTERVAL;
      } else {
        card.interval = Math.round(card.interval * card.easeFactor);
      }
      
      card.repetitions++;
      
      // 更新状态
      if (card.status === 'new') {
        card.status = 'learning';
      } else if (card.interval >= 21 && card.status === 'learning') {
        card.status = 'review';
      } else if (card.interval >= 120 && card.status === 'review') {
        card.status = 'graduated';
      }
    } else {
      // 错误回答，重置
      card.repetitions = 0;
      card.interval = this.SM2_INITIAL_INTERVAL;
      if (card.status !== 'new') {
        card.status = 'learning';
      }
    }

    // 更新难度因子 (SuperMemo 2 公式)
    const newEaseFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    card.easeFactor = Math.max(this.SM2_MIN_EASE_FACTOR, Math.min(this.SM2_MAX_EASE_FACTOR, newEaseFactor));

    // 设置下次复习日期
    card.nextReviewDate = this.getNextReviewDate(card.interval);
  }

  /**
   * 获取下次复习日期
   */
  private getNextReviewDate(intervalDays: number): string {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + intervalDays);
    // 设置为当天的开始时间
    nextDate.setHours(0, 0, 0, 0);
    return nextDate.toISOString();
  }

  // ===== 会话管理 =====

  /**
   * 开始复习会话
   */
  async startReviewSession(
    userId: string,
    sessionType: SRSReviewSession['sessionType'] = 'daily',
    config?: {
      targetCards?: number;
      maxDuration?: number;
    }
  ): Promise<string> {
    try {
      const session: SRSReviewSession = {
        id: `srs_session_${Date.now()}`,
        userId,
        startTime: new Date().toISOString(),
        sessionType,
        targetCards: config?.targetCards || 20,
        maxDuration: config?.maxDuration || 30,
        
        cardsReviewed: 0,
        correctAnswers: 0,
        averageResponseTime: 0,
        
        accuracyRate: 0,
        completionRate: 0,
        engagementScore: 50,
        
        newCards: 0,
        reviewCards: 0,
        graduatedCards: 0,
        
        userMood: 'neutral',
        sessionQuality: 'average'
      };

      this.currentSession = session;
      this.sessions.push(session);
      
      // 记录会话开始
      webAnalyticsAdapter.trackEvent({
        eventName: 'srs_session_started',
        parameters: {
          session_id: session.id,
          user_id: userId,
          session_type: sessionType,
          target_cards: session.targetCards,
          max_duration: session.maxDuration
        }
      });

      return session.id;
    } catch (error) {
      console.error('Error starting SRS session:', error);
      throw error;
    }
  }

  /**
   * 结束复习会话
   */
  async endReviewSession(): Promise<SRSReviewSession | null> {
    if (!this.currentSession) return null;

    try {
      this.currentSession.endTime = new Date().toISOString();
      
      // 计算会话质量
      this.calculateSessionQuality(this.currentSession);
      
      await this.saveToStorage();
      
      // 记录会话结束
      webAnalyticsAdapter.trackEvent({
        eventName: 'srs_session_completed',
        parameters: {
          session_id: this.currentSession.id,
          cards_reviewed: this.currentSession.cardsReviewed,
          accuracy_rate: this.currentSession.accuracyRate,
          completion_rate: this.currentSession.completionRate,
          session_quality: this.currentSession.sessionQuality,
          duration_minutes: this.getSessionDuration(this.currentSession)
        }
      });

      const completedSession = this.currentSession;
      this.currentSession = null;
      
      return completedSession;
    } catch (error) {
      console.error('Error ending SRS session:', error);
      throw error;
    }
  }

  /**
   * 更新会话统计
   */
  private updateSessionStats(isCorrect: boolean, responseTime: number): void {
    if (!this.currentSession) return;

    this.currentSession.cardsReviewed++;
    if (isCorrect) {
      this.currentSession.correctAnswers++;
    }

    // 更新平均响应时间
    const totalCards = this.currentSession.cardsReviewed;
    this.currentSession.averageResponseTime = 
      (this.currentSession.averageResponseTime * (totalCards - 1) + responseTime) / totalCards;

    // 更新准确率
    this.currentSession.accuracyRate = 
      (this.currentSession.correctAnswers / this.currentSession.cardsReviewed) * 100;

    // 更新完成率
    this.currentSession.completionRate = 
      (this.currentSession.cardsReviewed / this.currentSession.targetCards) * 100;
  }

  /**
   * 计算会话质量
   */
  private calculateSessionQuality(session: SRSReviewSession): void {
    let qualityScore = 0;

    // 准确率权重 40%
    qualityScore += (session.accuracyRate / 100) * 40;

    // 完成率权重 30%
    qualityScore += (session.completionRate / 100) * 30;

    // 响应时间权重 20% (越快越好，但有合理范围)
    const idealResponseTime = 3000; // 3秒
    const responseTimeScore = Math.max(0, 1 - Math.abs(session.averageResponseTime - idealResponseTime) / idealResponseTime);
    qualityScore += responseTimeScore * 20;

    // 参与度权重 10%
    qualityScore += (session.engagementScore / 100) * 10;

    // 确定质量等级
    if (qualityScore >= 80) {
      session.sessionQuality = 'excellent';
    } else if (qualityScore >= 65) {
      session.sessionQuality = 'good';
    } else if (qualityScore >= 40) {
      session.sessionQuality = 'average';
    } else {
      session.sessionQuality = 'poor';
    }
  }

  /**
   * 获取会话持续时间（分钟）
   */
  private getSessionDuration(session: SRSReviewSession): number {
    if (!session.endTime) return 0;
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  }

  // ===== 统计和分析 =====

  /**
   * 获取SRS统计数据
   */
  getSRSStatistics(): SRSStatistics {
    const cards = Array.from(this.cards.values());
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const thisWeekEnd = new Date(today);
    thisWeekEnd.setDate(thisWeekEnd.getDate() + (7 - today.getDay()));
    const nextWeekEnd = new Date(thisWeekEnd);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);

    // 计算各状态卡片数量
    const statusCounts = cards.reduce((acc, card) => {
      acc[card.status] = (acc[card.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 计算复习统计
    const todayReviews = cards.filter(card => {
      const reviewDate = new Date(card.nextReviewDate);
      return reviewDate >= today && reviewDate < tomorrow;
    }).length;

    const thisWeekReviews = cards.filter(card => {
      const reviewDate = new Date(card.nextReviewDate);
      return reviewDate >= today && reviewDate <= thisWeekEnd;
    }).length;

    const nextWeekReviews = cards.filter(card => {
      const reviewDate = new Date(card.nextReviewDate);
      return reviewDate > thisWeekEnd && reviewDate <= nextWeekEnd;
    }).length;

    // 计算性能统计
    const reviewedCards = cards.filter(card => card.totalReviews > 0);
    const overallAccuracy = reviewedCards.length > 0 
      ? reviewedCards.reduce((sum, card) => sum + (card.correctReviews / card.totalReviews), 0) / reviewedCards.length * 100
      : 0;

    const averageResponseTime = reviewedCards.length > 0
      ? reviewedCards.reduce((sum, card) => sum + card.averageResponseTime, 0) / reviewedCards.length
      : 0;

    return {
      totalCards: cards.length,
      newCards: statusCounts['new'] || 0,
      learningCards: statusCounts['learning'] || 0,
      reviewCards: statusCounts['review'] || 0,
      graduatedCards: statusCounts['graduated'] || 0,
      suspendedCards: statusCounts['suspended'] || 0,
      
      todayReviews,
      weeklyReviews: thisWeekReviews,
      monthlyReviews: 0, // TODO: 实现月度统计
      
      overallAccuracy: Math.round(overallAccuracy),
      averageResponseTime: Math.round(averageResponseTime),
      currentStreak: 0, // TODO: 实现连续学习天数
      longestStreak: 0, // TODO: 实现最长连续学习天数
      
      upcomingReviews: {
        today: todayReviews,
        tomorrow: cards.filter(card => {
          const reviewDate = new Date(card.nextReviewDate);
          return reviewDate >= tomorrow && reviewDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
        }).length,
        thisWeek: thisWeekReviews,
        nextWeek: nextWeekReviews
      }
    };
  }

  // ===== 数据同步 =====

  /**
   * 同步到progressManager
   */
  private async syncToProgressManager(card: SRSCard, assessment: SRSAssessment): Promise<void> {
    try {
      // 获取当前SRS统计数据
      const statistics = this.getSRSStatistics();

      // 计算平均间隔
      const allCards = Array.from(this.cards.values());
      const averageInterval = allCards.length > 0
        ? allCards.reduce((sum, c) => sum + c.interval, 0) / allCards.length
        : 0;

      // 同步到progressManager
      await progressManager.updateSRSStats({
        totalCards: statistics.totalCards,
        newCards: statistics.newCards,
        learningCards: statistics.learningCards,
        reviewCards: statistics.reviewCards,
        graduatedCards: statistics.graduatedCards,
        todayReviews: statistics.todayReviews,
        overallAccuracy: statistics.overallAccuracy,
        averageInterval: averageInterval
      });

      console.log('SRS card review synced to progressManager:', {
        cardId: card.id,
        keywordId: card.keywordId,
        assessment,
        interval: card.interval,
        easeFactor: card.easeFactor
      });
    } catch (error) {
      console.warn('Failed to sync SRS data to progressManager:', error);
    }
  }

  // ===== 数据持久化 =====

  /**
   * 保存到本地存储
   */
  private async saveToStorage(): Promise<void> {
    try {
      // 保存卡片数据
      const cardsArray = Array.from(this.cards.entries());
      await webStorageAdapter.setItem(this.STORAGE_KEY_CARDS, JSON.stringify(cardsArray));

      // 保存会话数据
      await webStorageAdapter.setItem(this.STORAGE_KEY_SESSIONS, JSON.stringify(this.sessions));

      // 保存统计数据
      const statistics = this.getSRSStatistics();
      await webStorageAdapter.setItem(this.STORAGE_KEY_STATISTICS, JSON.stringify(statistics));
    } catch (error) {
      console.error('Failed to save SRS data:', error);
    }
  }

  /**
   * 从本地存储加载
   */
  private async loadFromStorage(): Promise<void> {
    try {
      // 加载卡片数据
      const cardsData = await webStorageAdapter.getItem(this.STORAGE_KEY_CARDS);
      if (cardsData) {
        const cardsArray = JSON.parse(cardsData);
        this.cards = new Map(cardsArray);
      }

      // 加载会话数据
      const sessionsData = await webStorageAdapter.getItem(this.STORAGE_KEY_SESSIONS);
      if (sessionsData) {
        this.sessions = JSON.parse(sessionsData);
      }
    } catch (error) {
      console.error('Failed to load SRS data:', error);
    }
  }

  /**
   * 获取所有卡片
   */
  getAllCards(): SRSCard[] {
    return Array.from(this.cards.values());
  }

  /**
   * 获取卡片详情
   */
  getCard(cardId: string): SRSCard | undefined {
    return this.cards.get(cardId);
  }

  /**
   * 获取当前会话
   */
  getCurrentSession(): SRSReviewSession | null {
    return this.currentSession;
  }

  /**
   * 获取会话历史
   */
  getSessionHistory(limit: number = 10): SRSReviewSession[] {
    return this.sessions
      .filter(session => session.endTime)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, limit);
  }
}

// 创建单例实例
export const srsService = SRSService.getInstance();
