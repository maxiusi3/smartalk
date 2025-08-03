/**
 * SRSService - Spaced Repetition System Service
 * 基于SM-2算法的间隔重复系统
 * 实现Ebbinghaus遗忘曲线优化的复习调度
 */

export interface SRSCard {
  id: string;
  keywordId: string;
  word: string;
  translation: string;
  audioUrl: string;
  imageUrl?: string;
  
  // SRS算法参数
  easeFactor: number; // 难度因子 (1.3 - 2.5)
  interval: number; // 复习间隔 (天)
  repetitions: number; // 重复次数
  nextReviewDate: string; // 下次复习日期
  
  // 学习状态
  status: 'new' | 'learning' | 'review' | 'graduated';
  createdAt: string;
  lastReviewedAt?: string;
  
  // 统计数据
  totalReviews: number;
  correctReviews: number;
  averageResponseTime: number; // 毫秒
}

export interface SRSReviewSession {
  id: string;
  startTime: string;
  endTime?: string;
  cardsReviewed: number;
  correctAnswers: number;
  averageResponseTime: number;
  sessionType: 'daily' | 'catch_up' | 'practice';
}

export type SRSAssessment = 'forgot' | 'hard' | 'good' | 'easy';

class SRSService {
  private static instance: SRSService;
  private cards: Map<string, SRSCard> = new Map();
  private sessions: SRSReviewSession[] = [];

  static getInstance(): SRSService {
    if (!SRSService.instance) {
      SRSService.instance = new SRSService();
    }
    return SRSService.instance;
  }

  /**
   * 添加新卡片到SRS队列
   */
  addCard(keywordId: string, word: string, translation: string, audioUrl: string, imageUrl?: string): SRSCard {
    const card: SRSCard = {
      id: `srs_${keywordId}_${Date.now()}`,
      keywordId,
      word,
      translation,
      audioUrl,
      imageUrl,
      
      // SM-2算法初始值
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: this.getNextReviewDate(1),
      
      status: 'new',
      createdAt: new Date().toISOString(),
      
      totalReviews: 0,
      correctReviews: 0,
      averageResponseTime: 0,
    };

    this.cards.set(card.id, card);
    this.saveToStorage();
    
    return card;
  }

  /**
   * 获取今日需要复习的卡片
   */
  getTodayReviewCards(): SRSCard[] {
    const today = new Date().toISOString().split('T')[0];
    const reviewCards: SRSCard[] = [];

    this.cards.forEach(card => {
      const reviewDate = card.nextReviewDate.split('T')[0];
      if (reviewDate <= today) {
        reviewCards.push(card);
      }
    });

    // 按优先级排序：过期时间越长优先级越高
    return reviewCards.sort((a, b) => {
      const aOverdue = this.getDaysOverdue(a.nextReviewDate);
      const bOverdue = this.getDaysOverdue(b.nextReviewDate);
      return bOverdue - aOverdue;
    });
  }

  /**
   * 处理复习结果，更新卡片状态
   */
  reviewCard(cardId: string, assessment: SRSAssessment, responseTime: number): SRSCard {
    const card = this.cards.get(cardId);
    if (!card) {
      throw new Error(`Card not found: ${cardId}`);
    }

    // 更新统计数据
    card.totalReviews++;
    card.lastReviewedAt = new Date().toISOString();
    
    // 更新平均响应时间
    card.averageResponseTime = (card.averageResponseTime * (card.totalReviews - 1) + responseTime) / card.totalReviews;

    // SM-2算法更新
    this.updateCardWithSM2(card, assessment);

    this.cards.set(cardId, card);
    this.saveToStorage();

    return card;
  }

  /**
   * SM-2算法实现
   */
  private updateCardWithSM2(card: SRSCard, assessment: SRSAssessment): void {
    let quality: number;
    
    // 将用户评估转换为SM-2质量分数 (0-5)
    switch (assessment) {
      case 'forgot': quality = 0; break;
      case 'hard': quality = 3; break;
      case 'good': quality = 4; break;
      case 'easy': quality = 5; break;
      default: quality = 3;
    }

    if (quality >= 3) {
      // 正确回答
      card.correctReviews++;
      
      if (card.repetitions === 0) {
        card.interval = 1;
      } else if (card.repetitions === 1) {
        card.interval = 6;
      } else {
        card.interval = Math.round(card.interval * card.easeFactor);
      }
      
      card.repetitions++;
      
      // 更新状态
      if (card.status === 'new') {
        card.status = 'learning';
      } else if (card.interval >= 21 && card.status === 'learning') {
        card.status = 'graduated';
      }
    } else {
      // 错误回答，重置
      card.repetitions = 0;
      card.interval = 1;
      card.status = 'learning';
    }

    // 更新难度因子
    card.easeFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    
    // 限制难度因子范围
    if (card.easeFactor < 1.3) {
      card.easeFactor = 1.3;
    }

    // 设置下次复习日期
    card.nextReviewDate = this.getNextReviewDate(card.interval);
  }

  /**
   * 获取下次复习日期
   */
  private getNextReviewDate(intervalDays: number): string {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + intervalDays);
    return nextDate.toISOString();
  }

  /**
   * 计算卡片过期天数
   */
  private getDaysOverdue(reviewDate: string): number {
    const today = new Date();
    const review = new Date(reviewDate);
    const diffTime = today.getTime() - review.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * 开始复习会话
   */
  startReviewSession(sessionType: SRSReviewSession['sessionType'] = 'daily'): string {
    const session: SRSReviewSession = {
      id: `session_${Date.now()}`,
      startTime: new Date().toISOString(),
      cardsReviewed: 0,
      correctAnswers: 0,
      averageResponseTime: 0,
      sessionType,
    };

    this.sessions.push(session);
    return session.id;
  }

  /**
   * 结束复习会话
   */
  endReviewSession(sessionId: string): SRSReviewSession {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    session.endTime = new Date().toISOString();
    this.saveToStorage();
    
    return session;
  }

  /**
   * 获取学习统计
   */
  getStatistics() {
    const totalCards = this.cards.size;
    const newCards = Array.from(this.cards.values()).filter(c => c.status === 'new').length;
    const learningCards = Array.from(this.cards.values()).filter(c => c.status === 'learning').length;
    const graduatedCards = Array.from(this.cards.values()).filter(c => c.status === 'graduated').length;
    
    const todayReviews = this.getTodayReviewCards().length;
    const totalReviews = Array.from(this.cards.values()).reduce((sum, card) => sum + card.totalReviews, 0);
    const correctReviews = Array.from(this.cards.values()).reduce((sum, card) => sum + card.correctReviews, 0);
    const accuracy = totalReviews > 0 ? (correctReviews / totalReviews) * 100 : 0;

    return {
      totalCards,
      newCards,
      learningCards,
      graduatedCards,
      todayReviews,
      totalReviews,
      accuracy: Math.round(accuracy),
      averageEaseFactor: this.getAverageEaseFactor(),
    };
  }

  /**
   * 获取平均难度因子
   */
  private getAverageEaseFactor(): number {
    const cards = Array.from(this.cards.values());
    if (cards.length === 0) return 2.5;
    
    const sum = cards.reduce((total, card) => total + card.easeFactor, 0);
    return Math.round((sum / cards.length) * 100) / 100;
  }

  /**
   * 获取学习日历数据
   */
  getCalendarData(year: number, month: number): { [date: string]: number } {
    const calendarData: { [date: string]: number } = {};
    
    this.sessions.forEach(session => {
      const sessionDate = new Date(session.startTime);
      if (sessionDate.getFullYear() === year && sessionDate.getMonth() === month) {
        const dateKey = sessionDate.toISOString().split('T')[0];
        calendarData[dateKey] = (calendarData[dateKey] || 0) + session.cardsReviewed;
      }
    });

    return calendarData;
  }

  /**
   * 保存到本地存储
   */
  private saveToStorage(): void {
    try {
      const data = {
        cards: Array.from(this.cards.entries()),
        sessions: this.sessions,
        lastUpdated: new Date().toISOString(),
      };
      
      // 在实际应用中，这里会使用AsyncStorage或其他持久化方案
      console.log('SRS data saved:', data);
    } catch (error) {
      console.error('Failed to save SRS data:', error);
    }
  }

  /**
   * 从本地存储加载
   */
  async loadFromStorage(): Promise<void> {
    try {
      // 在实际应用中，这里会从AsyncStorage加载数据
      console.log('Loading SRS data from storage...');
      
      // 模拟加载一些测试数据
      this.addCard('keyword-1', 'coffee', '咖啡', 'https://example.com/audio/coffee.mp3');
      this.addCard('keyword-2', 'please', '请', 'https://example.com/audio/please.mp3');
      
    } catch (error) {
      console.error('Failed to load SRS data:', error);
    }
  }

  /**
   * 重置所有数据（用于测试）
   */
  reset(): void {
    this.cards.clear();
    this.sessions = [];
    this.saveToStorage();
  }
}

export default SRSService;
