/**
 * LearningProgressService - V2 学习进度状态管理服务
 * 提供完整的学习进度跟踪：关键词级别粒度、会话恢复、智能导航
 * 支持本地存储、云端同步、进度验证和数据保护
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalyticsService } from './AnalyticsService';
import UserStateService from './UserStateService';
import ContentManagementService, { ContentTheme } from './ContentManagementService';

// 学习状态
export type LearningStatus = 
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'mastered'
  | 'needs_review';

// 学习模式
export type LearningMode = 
  | 'context_guessing'
  | 'focus_mode'
  | 'pronunciation'
  | 'rescue_mode'
  | 'theater_mode';

// 关键词进度
export interface KeywordProgress {
  keywordId: string;
  keyword: string;
  status: LearningStatus;
  
  // 学习统计
  attempts: number;
  correctAttempts: number;
  accuracy: number; // 0-1
  
  // 时间统计
  totalTimeSpent: number; // seconds
  lastAttemptAt: string;
  firstLearnedAt?: string;
  masteredAt?: string;
  
  // 模式统计
  modeUsage: {
    [key in LearningMode]: {
      attempts: number;
      successRate: number;
      averageTime: number;
    };
  };
  
  // SRS数据
  srsData: {
    level: number; // 0-8 (SRS级别)
    nextReviewAt: string;
    reviewCount: number;
    consecutiveCorrect: number;
    lastReviewResult: 'correct' | 'incorrect' | 'partial';
  };
}

// 故事进度
export interface StoryProgress {
  storyId: string;
  themeId: string;
  status: LearningStatus;
  
  // 关键词进度
  keywords: KeywordProgress[];
  completedKeywords: number;
  totalKeywords: number;
  progressPercentage: number; // 0-100
  
  // 学习统计
  totalTimeSpent: number; // seconds
  sessionsCount: number;
  averageSessionTime: number;
  
  // 时间戳
  startedAt: string;
  lastAccessedAt: string;
  completedAt?: string;
  
  // 当前会话状态
  currentSession?: {
    sessionId: string;
    startedAt: string;
    currentKeywordIndex: number;
    mode: LearningMode;
    isActive: boolean;
  };
}

// 主题进度
export interface ThemeProgress {
  themeId: string;
  theme: ContentTheme;
  status: LearningStatus;
  
  // 故事进度
  stories: StoryProgress[];
  completedStories: number;
  totalStories: number;
  progressPercentage: number;
  
  // 统计数据
  totalTimeSpent: number;
  totalKeywordsLearned: number;
  averageAccuracy: number;
  
  // 时间戳
  startedAt: string;
  lastAccessedAt: string;
  completedAt?: string;
}

// 整体学习进度
export interface OverallProgress {
  userId: string;
  
  // 主题进度
  themes: ThemeProgress[];
  
  // 整体统计
  totalTimeSpent: number; // seconds
  totalKeywordsLearned: number;
  totalStoriesCompleted: number;
  overallAccuracy: number;
  currentStreak: number; // 连续学习天数
  longestStreak: number;
  
  // 学习偏好
  preferredLearningTime: string; // 'morning' | 'afternoon' | 'evening' | 'night'
  averageSessionLength: number; // minutes
  preferredModes: LearningMode[];
  
  // 成就数据
  achievements: {
    id: string;
    unlockedAt: string;
    progress: number; // 0-1
  }[];
  
  // 时间戳
  createdAt: string;
  lastUpdatedAt: string;
  lastSyncedAt?: string;
}

// 会话恢复数据
export interface SessionRecoveryData {
  sessionId: string;
  userId: string;
  
  // 会话状态
  storyId: string;
  themeId: string;
  currentKeywordIndex: number;
  mode: LearningMode;
  
  // 进度快照
  progressSnapshot: {
    completedKeywords: string[];
    currentKeyword: string;
    attempts: number;
    startTime: string;
  };
  
  // 恢复信息
  canRecover: boolean;
  recoveryExpiresAt: string;
  createdAt: string;
}

// 学习会话
export interface LearningSession {
  sessionId: string;
  userId: string;
  storyId: string;
  themeId: string;
  
  // 会话数据
  startedAt: string;
  endedAt?: string;
  duration: number; // seconds
  isCompleted: boolean;
  
  // 学习数据
  keywordsAttempted: string[];
  keywordsCompleted: string[];
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  
  // 模式使用
  modesUsed: LearningMode[];
  primaryMode: LearningMode;
  
  // 中断信息
  wasInterrupted: boolean;
  interruptionReason?: 'user_exit' | 'app_background' | 'system_interrupt';
  recoveryData?: SessionRecoveryData;
}

class LearningProgressService {
  private static instance: LearningProgressService;
  private analyticsService = AnalyticsService.getInstance();
  private userStateService = UserStateService.getInstance();
  private contentService = ContentManagementService.getInstance();
  
  // 进度数据缓存
  private progressCache: Map<string, OverallProgress> = new Map();
  private sessionCache: Map<string, LearningSession> = new Map();
  
  // 当前活跃会话
  private activeSession: LearningSession | null = null;
  private autoSaveInterval: NodeJS.Timeout | null = null;
  
  // 存储键
  private readonly PROGRESS_KEY = 'learning_progress';
  private readonly SESSION_KEY = 'learning_sessions';
  private readonly RECOVERY_KEY = 'session_recovery';

  static getInstance(): LearningProgressService {
    if (!LearningProgressService.instance) {
      LearningProgressService.instance = new LearningProgressService();
    }
    return LearningProgressService.instance;
  }

  constructor() {
    this.initializeService();
  }

  // ===== 初始化 =====

  /**
   * 初始化学习进度服务
   */
  private async initializeService(): Promise<void> {
    try {
      // 加载本地进度数据
      await this.loadProgressFromStorage();
      
      // 检查会话恢复
      await this.checkSessionRecovery();
      
      // 开始自动保存
      this.startAutoSave();
      
      this.analyticsService.track('learning_progress_service_initialized', {
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error initializing learning progress service:', error);
    }
  }

  /**
   * 从本地存储加载进度数据
   */
  private async loadProgressFromStorage(): Promise<void> {
    try {
      const progressData = await AsyncStorage.getItem(this.PROGRESS_KEY);
      if (progressData) {
        const progress: OverallProgress = JSON.parse(progressData);
        this.progressCache.set(progress.userId, progress);
      }

      const sessionsData = await AsyncStorage.getItem(this.SESSION_KEY);
      if (sessionsData) {
        const sessions: LearningSession[] = JSON.parse(sessionsData);
        sessions.forEach(session => {
          this.sessionCache.set(session.sessionId, session);
        });
      }

    } catch (error) {
      console.error('Error loading progress from storage:', error);
    }
  }

  /**
   * 检查会话恢复
   */
  private async checkSessionRecovery(): Promise<void> {
    try {
      const recoveryData = await AsyncStorage.getItem(this.RECOVERY_KEY);
      if (recoveryData) {
        const recovery: SessionRecoveryData = JSON.parse(recoveryData);
        
        // 检查恢复数据是否过期
        const now = new Date();
        const expiresAt = new Date(recovery.recoveryExpiresAt);
        
        if (now < expiresAt && recovery.canRecover) {
          // 可以恢复会话
          this.analyticsService.track('session_recovery_available', {
            sessionId: recovery.sessionId,
            userId: recovery.userId,
            storyId: recovery.storyId,
            timestamp: Date.now(),
          });
        } else {
          // 清理过期的恢复数据
          await AsyncStorage.removeItem(this.RECOVERY_KEY);
        }
      }
    } catch (error) {
      console.error('Error checking session recovery:', error);
    }
  }

  /**
   * 开始自动保存
   */
  private startAutoSave(): void {
    this.autoSaveInterval = setInterval(() => {
      this.saveProgressToStorage();
    }, 30000); // 每30秒自动保存
  }

  // ===== 进度管理 =====

  /**
   * 获取用户整体进度
   */
  async getUserProgress(userId: string): Promise<OverallProgress | null> {
    try {
      // 先从缓存获取
      let progress = this.progressCache.get(userId);
      
      if (!progress) {
        // 创建新的进度记录
        progress = await this.createNewProgress(userId);
        this.progressCache.set(userId, progress);
      }

      return progress;

    } catch (error) {
      console.error('Error getting user progress:', error);
      return null;
    }
  }

  /**
   * 创建新的进度记录
   */
  private async createNewProgress(userId: string): Promise<OverallProgress> {
    const now = new Date().toISOString();
    
    const progress: OverallProgress = {
      userId,
      themes: [],
      totalTimeSpent: 0,
      totalKeywordsLearned: 0,
      totalStoriesCompleted: 0,
      overallAccuracy: 0,
      currentStreak: 0,
      longestStreak: 0,
      preferredLearningTime: 'evening',
      averageSessionLength: 15,
      preferredModes: ['context_guessing'],
      achievements: [],
      createdAt: now,
      lastUpdatedAt: now,
    };

    return progress;
  }

  /**
   * 获取主题进度
   */
  getThemeProgress(userId: string, themeId: string): ThemeProgress | null {
    const progress = this.progressCache.get(userId);
    if (!progress) return null;

    return progress.themes.find(theme => theme.themeId === themeId) || null;
  }

  /**
   * 获取故事进度
   */
  getStoryProgress(userId: string, storyId: string): StoryProgress | null {
    const progress = this.progressCache.get(userId);
    if (!progress) return null;

    for (const theme of progress.themes) {
      const story = theme.stories.find(s => s.storyId === storyId);
      if (story) return story;
    }

    return null;
  }

  /**
   * 开始新的学习会话
   */
  async startLearningSession(
    userId: string,
    storyId: string,
    themeId: string,
    mode: LearningMode
  ): Promise<LearningSession> {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      const session: LearningSession = {
        sessionId,
        userId,
        storyId,
        themeId,
        startedAt: now,
        duration: 0,
        isCompleted: false,
        keywordsAttempted: [],
        keywordsCompleted: [],
        totalAttempts: 0,
        correctAttempts: 0,
        accuracy: 0,
        modesUsed: [mode],
        primaryMode: mode,
        wasInterrupted: false,
      };

      this.activeSession = session;
      this.sessionCache.set(sessionId, session);

      // 更新故事进度中的当前会话
      await this.updateStoryCurrentSession(userId, storyId, {
        sessionId,
        startedAt: now,
        currentKeywordIndex: 0,
        mode,
        isActive: true,
      });

      this.analyticsService.track('learning_session_started', {
        sessionId,
        userId,
        storyId,
        themeId,
        mode,
        timestamp: Date.now(),
      });

      return session;

    } catch (error) {
      console.error('Error starting learning session:', error);
      throw error;
    }
  }

  /**
   * 更新关键词进度
   */
  async updateKeywordProgress(
    userId: string,
    storyId: string,
    keywordId: string,
    isCorrect: boolean,
    mode: LearningMode,
    timeSpent: number
  ): Promise<void> {
    try {
      const progress = await this.getUserProgress(userId);
      if (!progress) return;

      // 找到对应的故事和关键词
      let targetStory: StoryProgress | null = null;
      let targetKeyword: KeywordProgress | null = null;

      for (const theme of progress.themes) {
        const story = theme.stories.find(s => s.storyId === storyId);
        if (story) {
          targetStory = story;
          targetKeyword = story.keywords.find(k => k.keywordId === keywordId) || null;
          break;
        }
      }

      if (!targetStory || !targetKeyword) {
        console.warn('Story or keyword not found for progress update');
        return;
      }

      // 更新关键词进度
      const now = new Date().toISOString();
      targetKeyword.attempts++;
      if (isCorrect) {
        targetKeyword.correctAttempts++;
      }
      targetKeyword.accuracy = targetKeyword.correctAttempts / targetKeyword.attempts;
      targetKeyword.totalTimeSpent += timeSpent;
      targetKeyword.lastAttemptAt = now;

      // 更新模式使用统计
      if (!targetKeyword.modeUsage[mode]) {
        targetKeyword.modeUsage[mode] = {
          attempts: 0,
          successRate: 0,
          averageTime: 0,
        };
      }
      
      const modeStats = targetKeyword.modeUsage[mode];
      modeStats.attempts++;
      modeStats.successRate = (modeStats.successRate * (modeStats.attempts - 1) + (isCorrect ? 1 : 0)) / modeStats.attempts;
      modeStats.averageTime = (modeStats.averageTime * (modeStats.attempts - 1) + timeSpent) / modeStats.attempts;

      // 更新学习状态
      if (isCorrect && targetKeyword.status === 'not_started') {
        targetKeyword.status = 'in_progress';
        targetKeyword.firstLearnedAt = now;
      }

      // 检查是否达到完成条件
      if (targetKeyword.accuracy >= 0.8 && targetKeyword.attempts >= 3) {
        targetKeyword.status = 'completed';
      }

      // 更新SRS数据
      this.updateSRSData(targetKeyword, isCorrect);

      // 更新故事进度
      this.updateStoryProgress(targetStory);

      // 更新活跃会话
      if (this.activeSession && this.activeSession.storyId === storyId) {
        this.activeSession.keywordsAttempted.push(keywordId);
        if (isCorrect) {
          this.activeSession.keywordsCompleted.push(keywordId);
        }
        this.activeSession.totalAttempts++;
        if (isCorrect) {
          this.activeSession.correctAttempts++;
        }
        this.activeSession.accuracy = this.activeSession.correctAttempts / this.activeSession.totalAttempts;
        this.activeSession.duration = Math.floor((Date.now() - new Date(this.activeSession.startedAt).getTime()) / 1000);
      }

      // 保存进度
      progress.lastUpdatedAt = now;
      this.progressCache.set(userId, progress);
      await this.saveProgressToStorage();

      this.analyticsService.track('keyword_progress_updated', {
        userId,
        storyId,
        keywordId,
        isCorrect,
        mode,
        accuracy: targetKeyword.accuracy,
        attempts: targetKeyword.attempts,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error updating keyword progress:', error);
    }
  }

  /**
   * 更新SRS数据
   */
  private updateSRSData(keyword: KeywordProgress, isCorrect: boolean): void {
    const srs = keyword.srsData;
    srs.reviewCount++;
    srs.lastReviewResult = isCorrect ? 'correct' : 'incorrect';

    if (isCorrect) {
      srs.consecutiveCorrect++;
      // SRS级别提升逻辑
      if (srs.consecutiveCorrect >= 2) {
        srs.level = Math.min(srs.level + 1, 8);
        srs.consecutiveCorrect = 0;
      }
    } else {
      srs.consecutiveCorrect = 0;
      // SRS级别降低逻辑
      srs.level = Math.max(srs.level - 1, 0);
    }

    // 计算下次复习时间
    const intervals = [0, 4, 8, 24, 48, 168, 336, 720, 1440]; // 小时
    const nextReviewHours = intervals[srs.level] || 1440;
    srs.nextReviewAt = new Date(Date.now() + nextReviewHours * 60 * 60 * 1000).toISOString();
  }

  /**
   * 更新故事进度
   */
  private updateStoryProgress(story: StoryProgress): void {
    const completedKeywords = story.keywords.filter(k => k.status === 'completed').length;
    story.completedKeywords = completedKeywords;
    story.progressPercentage = (completedKeywords / story.totalKeywords) * 100;
    
    if (completedKeywords === story.totalKeywords) {
      story.status = 'completed';
      story.completedAt = new Date().toISOString();
    } else if (completedKeywords > 0) {
      story.status = 'in_progress';
    }

    story.lastAccessedAt = new Date().toISOString();
  }

  /**
   * 更新故事当前会话
   */
  private async updateStoryCurrentSession(
    userId: string,
    storyId: string,
    sessionData: StoryProgress['currentSession']
  ): Promise<void> {
    const progress = await this.getUserProgress(userId);
    if (!progress) return;

    for (const theme of progress.themes) {
      const story = theme.stories.find(s => s.storyId === storyId);
      if (story) {
        story.currentSession = sessionData;
        break;
      }
    }
  }

  /**
   * 结束学习会话
   */
  async endLearningSession(sessionId: string, reason: 'completed' | 'user_exit' | 'interrupted'): Promise<void> {
    try {
      const session = this.sessionCache.get(sessionId);
      if (!session) return;

      const now = new Date().toISOString();
      session.endedAt = now;
      session.duration = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000);
      session.isCompleted = reason === 'completed';
      session.wasInterrupted = reason === 'interrupted';

      if (reason === 'interrupted') {
        // 创建会话恢复数据
        await this.createSessionRecovery(session);
      } else {
        // 清理会话恢复数据
        await AsyncStorage.removeItem(this.RECOVERY_KEY);
      }

      // 清理当前会话状态
      if (this.activeSession?.sessionId === sessionId) {
        this.activeSession = null;
      }

      // 更新故事的当前会话状态
      await this.updateStoryCurrentSession(session.userId, session.storyId, undefined);

      this.analyticsService.track('learning_session_ended', {
        sessionId,
        userId: session.userId,
        duration: session.duration,
        reason,
        accuracy: session.accuracy,
        keywordsCompleted: session.keywordsCompleted.length,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error ending learning session:', error);
    }
  }

  /**
   * 创建会话恢复数据
   */
  private async createSessionRecovery(session: LearningSession): Promise<void> {
    try {
      const recoveryData: SessionRecoveryData = {
        sessionId: session.sessionId,
        userId: session.userId,
        storyId: session.storyId,
        themeId: session.themeId,
        currentKeywordIndex: session.keywordsAttempted.length,
        mode: session.primaryMode,
        progressSnapshot: {
          completedKeywords: session.keywordsCompleted,
          currentKeyword: session.keywordsAttempted[session.keywordsAttempted.length - 1] || '',
          attempts: session.totalAttempts,
          startTime: session.startedAt,
        },
        canRecover: true,
        recoveryExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24小时后过期
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(this.RECOVERY_KEY, JSON.stringify(recoveryData));

    } catch (error) {
      console.error('Error creating session recovery:', error);
    }
  }

  // ===== 会话恢复 =====

  /**
   * 获取会话恢复数据
   */
  async getSessionRecoveryData(): Promise<SessionRecoveryData | null> {
    try {
      const recoveryData = await AsyncStorage.getItem(this.RECOVERY_KEY);
      if (!recoveryData) return null;

      const recovery: SessionRecoveryData = JSON.parse(recoveryData);
      
      // 检查是否过期
      const now = new Date();
      const expiresAt = new Date(recovery.recoveryExpiresAt);
      
      if (now >= expiresAt || !recovery.canRecover) {
        await AsyncStorage.removeItem(this.RECOVERY_KEY);
        return null;
      }

      return recovery;

    } catch (error) {
      console.error('Error getting session recovery data:', error);
      return null;
    }
  }

  /**
   * 恢复学习会话
   */
  async recoverLearningSession(recoveryData: SessionRecoveryData): Promise<LearningSession> {
    try {
      // 创建新的会话继续学习
      const newSession = await this.startLearningSession(
        recoveryData.userId,
        recoveryData.storyId,
        recoveryData.themeId,
        recoveryData.mode
      );

      // 恢复进度快照
      newSession.keywordsAttempted = [...recoveryData.progressSnapshot.completedKeywords];
      newSession.keywordsCompleted = [...recoveryData.progressSnapshot.completedKeywords];
      newSession.totalAttempts = recoveryData.progressSnapshot.attempts;

      // 清理恢复数据
      await AsyncStorage.removeItem(this.RECOVERY_KEY);

      this.analyticsService.track('learning_session_recovered', {
        originalSessionId: recoveryData.sessionId,
        newSessionId: newSession.sessionId,
        userId: recoveryData.userId,
        storyId: recoveryData.storyId,
        timestamp: Date.now(),
      });

      return newSession;

    } catch (error) {
      console.error('Error recovering learning session:', error);
      throw error;
    }
  }

  // ===== 数据持久化 =====

  /**
   * 保存进度到本地存储
   */
  private async saveProgressToStorage(): Promise<void> {
    try {
      // 保存进度数据
      const progressArray = Array.from(this.progressCache.values());
      if (progressArray.length > 0) {
        await AsyncStorage.setItem(this.PROGRESS_KEY, JSON.stringify(progressArray[0]));
      }

      // 保存会话数据
      const sessionsArray = Array.from(this.sessionCache.values());
      await AsyncStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionsArray));

    } catch (error) {
      console.error('Error saving progress to storage:', error);
    }
  }

  /**
   * 验证进度数据完整性
   */
  validateProgressData(progress: OverallProgress): boolean {
    try {
      // 基本字段验证
      if (!progress.userId || !progress.createdAt || !progress.lastUpdatedAt) {
        return false;
      }

      // 主题数据验证
      for (const theme of progress.themes) {
        if (!theme.themeId || !theme.stories) {
          return false;
        }

        // 故事数据验证
        for (const story of theme.stories) {
          if (!story.storyId || !story.keywords) {
            return false;
          }

          // 关键词数据验证
          for (const keyword of story.keywords) {
            if (!keyword.keywordId || !keyword.srsData) {
              return false;
            }
          }
        }
      }

      return true;

    } catch (error) {
      console.error('Error validating progress data:', error);
      return false;
    }
  }

  // ===== 公共API =====

  /**
   * 获取当前活跃会话
   */
  getActiveSession(): LearningSession | null {
    return this.activeSession;
  }

  /**
   * 获取学习统计
   */
  getLearningStats(userId: string): {
    totalTimeSpent: number;
    totalKeywordsLearned: number;
    overallAccuracy: number;
    currentStreak: number;
    sessionsThisWeek: number;
  } | null {
    const progress = this.progressCache.get(userId);
    if (!progress) return null;

    // 计算本周会话数
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const sessionsThisWeek = Array.from(this.sessionCache.values()).filter(
      session => session.userId === userId && new Date(session.startedAt) > oneWeekAgo
    ).length;

    return {
      totalTimeSpent: progress.totalTimeSpent,
      totalKeywordsLearned: progress.totalKeywordsLearned,
      overallAccuracy: progress.overallAccuracy,
      currentStreak: progress.currentStreak,
      sessionsThisWeek,
    };
  }

  /**
   * 获取需要复习的关键词
   */
  getKeywordsForReview(userId: string): KeywordProgress[] {
    const progress = this.progressCache.get(userId);
    if (!progress) return [];

    const now = new Date();
    const reviewKeywords: KeywordProgress[] = [];

    for (const theme of progress.themes) {
      for (const story of theme.stories) {
        for (const keyword of story.keywords) {
          const nextReview = new Date(keyword.srsData.nextReviewAt);
          if (now >= nextReview && keyword.status !== 'not_started') {
            reviewKeywords.push(keyword);
          }
        }
      }
    }

    return reviewKeywords.sort((a, b) => 
      new Date(a.srsData.nextReviewAt).getTime() - new Date(b.srsData.nextReviewAt).getTime()
    );
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }

    // 保存最后的进度
    this.saveProgressToStorage();
  }
}

export default LearningProgressService;
