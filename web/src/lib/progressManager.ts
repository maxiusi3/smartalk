// 用户进度管理系统 - 持久化进度跟踪和学习分析
export interface UserProgress {
  userId: string;
  deviceId: string;
  totalStudyTime: number; // 总学习时间（分钟）
  streakDays: number; // 连续学习天数
  lastStudyDate: string; // 最后学习日期
  level: number; // 用户等级
  experience: number; // 经验值
  achievements: Achievement[];
  storyProgress: Map<string, StoryProgress>; // 故事进度
  keywordProgress: Map<string, KeywordProgress>; // 关键词进度
  vtprProgress: Map<string, VTPRProgress>; // vTPR练习进度
  learningStats: LearningStats; // 学习统计
  preferences: UserPreferences; // 用户偏好
  createdAt: string;
  updatedAt: string;
}

export interface StoryProgress {
  storyId: string;
  theme: string;
  status: 'not_started' | 'preview_viewed' | 'clues_collecting' | 'vtpr_training' | 'theater_mode' | 'completed';
  completionPercentage: number;
  timeSpent: number; // 分钟
  keywordsUnlocked: string[];
  vtprScore: number; // 0-100
  magicMomentAchieved: boolean;
  startedAt: string;
  completedAt?: string;
  lastAccessedAt: string;
}

export interface KeywordProgress {
  keywordId: string;
  word: string;
  theme: string;
  status: 'locked' | 'unlocked' | 'learning' | 'mastered';
  attempts: number;
  correctAttempts: number;
  accuracy: number; // 0-100
  timeSpent: number; // 秒
  firstUnlockedAt?: string;
  masteredAt?: string;
  lastPracticedAt?: string;
}

export interface VTPRProgress {
  exerciseId: string;
  keyword: string;
  theme: string;
  attempts: number;
  correctAttempts: number;
  bestScore: number; // 0-100
  averageResponseTime: number; // 毫秒
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completedAt?: string;
  lastAttemptAt?: string;
}

export interface Achievement {
  id: string;
  type: 'story_completion' | 'keyword_mastery' | 'vtpr_excellence' | 'streak' | 'speed' | 'accuracy' | 'exploration';
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  experienceReward: number;
  unlockedAt: string;
  progress?: number; // 0-100 for progressive achievements
  target?: number; // target value for progressive achievements
}

export interface LearningStats {
  totalSessions: number;
  totalTimeSpent: number; // 分钟
  averageSessionTime: number; // 分钟
  storiesCompleted: number;
  keywordsMastered: number;
  vtprExercisesCompleted: number;
  overallAccuracy: number; // 0-100
  averageResponseTime: number; // 毫秒
  favoriteTheme: string;
  weakestTheme: string;
  strongestSkill: string;
  improvementAreas: string[];
  dailyGoalStreak: number;
  weeklyProgress: DailyProgress[];
  monthlyProgress: MonthlyProgress[];
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD
  timeSpent: number; // 分钟
  keywordsLearned: number;
  vtprCompleted: number;
  accuracy: number;
  goalAchieved: boolean;
}

export interface MonthlyProgress {
  month: string; // YYYY-MM
  totalTime: number;
  storiesCompleted: number;
  keywordsMastered: number;
  averageAccuracy: number;
  streakDays: number;
  achievements: number;
}

export interface UserPreferences {
  dailyGoal: number; // 分钟
  reminderTime: string; // HH:MM
  preferredThemes: string[];
  difficultyPreference: 'adaptive' | 'beginner' | 'intermediate' | 'advanced';
  soundEnabled: boolean;
  animationsEnabled: boolean;
  darkMode: boolean;
  language: 'zh-CN' | 'en-US';
}

export interface LearningSession {
  sessionId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration: number; // 分钟
  theme: string;
  activities: SessionActivity[];
  keywordsLearned: string[];
  vtprCompleted: number;
  accuracy: number;
  experienceGained: number;
  achievementsUnlocked: string[];
}

export interface SessionActivity {
  type: 'story_preview' | 'clue_collection' | 'vtpr_training' | 'theater_mode';
  startTime: string;
  endTime: string;
  duration: number; // 秒
  success: boolean;
  details: Record<string, any>;
}

class ProgressManager {
  private userProgress: UserProgress | null = null;
  private currentSession: LearningSession | null = null;
  private storageKey = 'smartalk_user_progress';
  private sessionKey = 'smartalk_current_session';

  constructor() {
    this.loadProgress();
  }

  // 初始化用户进度
  async initializeUser(deviceId: string): Promise<UserProgress> {
    const userId = `user_${deviceId}_${Date.now()}`;
    const now = new Date().toISOString();

    const initialProgress: UserProgress = {
      userId,
      deviceId,
      totalStudyTime: 0,
      streakDays: 0,
      lastStudyDate: '',
      level: 1,
      experience: 0,
      achievements: [],
      storyProgress: new Map(),
      keywordProgress: new Map(),
      vtprProgress: new Map(),
      learningStats: {
        totalSessions: 0,
        totalTimeSpent: 0,
        averageSessionTime: 0,
        storiesCompleted: 0,
        keywordsMastered: 0,
        vtprExercisesCompleted: 0,
        overallAccuracy: 0,
        averageResponseTime: 0,
        favoriteTheme: '',
        weakestTheme: '',
        strongestSkill: '',
        improvementAreas: [],
        dailyGoalStreak: 0,
        weeklyProgress: [],
        monthlyProgress: []
      },
      preferences: {
        dailyGoal: 30, // 30分钟默认目标
        reminderTime: '19:00',
        preferredThemes: [],
        difficultyPreference: 'adaptive',
        soundEnabled: true,
        animationsEnabled: true,
        darkMode: false,
        language: 'zh-CN'
      },
      createdAt: now,
      updatedAt: now
    };

    this.userProgress = initialProgress;
    await this.saveProgress();
    return initialProgress;
  }

  // 加载用户进度
  private loadProgress(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 转换 Map 对象
        parsed.storyProgress = new Map(parsed.storyProgress || []);
        parsed.keywordProgress = new Map(parsed.keywordProgress || []);
        parsed.vtprProgress = new Map(parsed.vtprProgress || []);
        this.userProgress = parsed;
      }
    } catch (error) {
      console.error('Failed to load user progress:', error);
    }
  }

  // 保存用户进度
  private async saveProgress(): Promise<void> {
    if (typeof window === 'undefined' || !this.userProgress) return;

    try {
      // 转换 Map 对象为数组以便序列化
      const toSave = {
        ...this.userProgress,
        storyProgress: Array.from(this.userProgress.storyProgress.entries()),
        keywordProgress: Array.from(this.userProgress.keywordProgress.entries()),
        vtprProgress: Array.from(this.userProgress.vtprProgress.entries()),
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(this.storageKey, JSON.stringify(toSave));

      // TODO: 同步到云端
      // await this.syncToCloud(toSave);
    } catch (error) {
      console.error('Failed to save user progress:', error);
    }
  }

  // 获取用户进度
  getUserProgress(): UserProgress | null {
    return this.userProgress;
  }

  // 开始学习会话
  startSession(theme: string): LearningSession {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    this.currentSession = {
      sessionId,
      userId: this.userProgress?.userId || 'anonymous',
      startTime: now,
      duration: 0,
      theme,
      activities: [],
      keywordsLearned: [],
      vtprCompleted: 0,
      accuracy: 0,
      experienceGained: 0,
      achievementsUnlocked: []
    };

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(this.sessionKey, JSON.stringify(this.currentSession));
    }

    return this.currentSession;
  }

  // 结束学习会话
  async endSession(): Promise<LearningSession | null> {
    if (!this.currentSession) return null;

    const now = new Date().toISOString();
    const startTime = new Date(this.currentSession.startTime);
    const endTime = new Date(now);
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60); // 分钟

    this.currentSession.endTime = now;
    this.currentSession.duration = duration;

    // 更新用户总体进度
    if (this.userProgress) {
      this.userProgress.totalStudyTime += duration;
      this.userProgress.learningStats.totalSessions += 1;
      this.userProgress.learningStats.totalTimeSpent += duration;
      this.userProgress.learningStats.averageSessionTime = 
        this.userProgress.learningStats.totalTimeSpent / this.userProgress.learningStats.totalSessions;

      // 更新连续学习天数
      this.updateStreakDays();

      // 更新每日进度
      this.updateDailyProgress(duration);

      // 检查成就
      await this.checkAchievements();

      await this.saveProgress();
    }

    const session = this.currentSession;
    this.currentSession = null;

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.sessionKey);
    }

    return session;
  }

  // 更新连续学习天数
  private updateStreakDays(): void {
    if (!this.userProgress) return;

    const today = new Date().toISOString().split('T')[0];
    const lastStudyDate = this.userProgress.lastStudyDate;

    if (!lastStudyDate) {
      // 第一次学习
      this.userProgress.streakDays = 1;
    } else {
      const lastDate = new Date(lastStudyDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // 连续学习
        this.userProgress.streakDays += 1;
      } else if (diffDays > 1) {
        // 中断了，重新开始
        this.userProgress.streakDays = 1;
      }
      // diffDays === 0 表示今天已经学习过，不更新
    }

    this.userProgress.lastStudyDate = today;
  }

  // 更新每日进度
  private updateDailyProgress(sessionDuration: number): void {
    if (!this.userProgress) return;

    const today = new Date().toISOString().split('T')[0];
    const weeklyProgress = this.userProgress.learningStats.weeklyProgress;

    let todayProgress = weeklyProgress.find(p => p.date === today);
    if (!todayProgress) {
      todayProgress = {
        date: today,
        timeSpent: 0,
        keywordsLearned: 0,
        vtprCompleted: 0,
        accuracy: 0,
        goalAchieved: false
      };
      weeklyProgress.push(todayProgress);
    }

    todayProgress.timeSpent += sessionDuration;
    todayProgress.goalAchieved = todayProgress.timeSpent >= this.userProgress.preferences.dailyGoal;

    // 只保留最近7天的数据
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    this.userProgress.learningStats.weeklyProgress = weeklyProgress.filter(
      p => new Date(p.date) >= sevenDaysAgo
    );
  }

  // 检查成就
  private async checkAchievements(): Promise<void> {
    if (!this.userProgress) return;

    const newAchievements: Achievement[] = [];

    // 检查连续学习成就
    if (this.userProgress.streakDays >= 7 && !this.hasAchievement('streak_7')) {
      newAchievements.push({
        id: 'streak_7',
        type: 'streak',
        title: '坚持不懈',
        description: '连续学习7天',
        icon: '🔥',
        rarity: 'common',
        experienceReward: 100,
        unlockedAt: new Date().toISOString()
      });
    }

    // 检查学习时长成就
    if (this.userProgress.totalStudyTime >= 60 && !this.hasAchievement('time_60')) {
      newAchievements.push({
        id: 'time_60',
        type: 'exploration',
        title: '学习达人',
        description: '累计学习60分钟',
        icon: '⏰',
        rarity: 'common',
        experienceReward: 50,
        unlockedAt: new Date().toISOString()
      });
    }

    // 添加新成就
    for (const achievement of newAchievements) {
      this.userProgress.achievements.push(achievement);
      this.userProgress.experience += achievement.experienceReward;
      
      // 检查是否升级
      this.checkLevelUp();
    }
  }

  // 检查是否有特定成就
  private hasAchievement(achievementId: string): boolean {
    return this.userProgress?.achievements.some(a => a.id === achievementId) || false;
  }

  // 检查升级
  private checkLevelUp(): void {
    if (!this.userProgress) return;

    const experienceForNextLevel = this.userProgress.level * 100; // 简单的升级公式
    if (this.userProgress.experience >= experienceForNextLevel) {
      this.userProgress.level += 1;
      // 可以在这里触发升级庆祝
    }
  }

  // 获取当前会话
  getCurrentSession(): LearningSession | null {
    return this.currentSession;
  }

  // 记录故事进度
  async updateStoryProgress(storyId: string, theme: string, status: StoryProgress['status']): Promise<void> {
    if (!this.userProgress) return;

    let progress = this.userProgress.storyProgress.get(storyId);
    if (!progress) {
      progress = {
        storyId,
        theme,
        status: 'not_started',
        completionPercentage: 0,
        timeSpent: 0,
        keywordsUnlocked: [],
        vtprScore: 0,
        magicMomentAchieved: false,
        startedAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString()
      };
    }

    progress.status = status;
    progress.lastAccessedAt = new Date().toISOString();

    // 更新完成百分比
    const statusProgress = {
      'not_started': 0,
      'preview_viewed': 20,
      'clues_collecting': 40,
      'vtpr_training': 60,
      'theater_mode': 80,
      'completed': 100
    };
    progress.completionPercentage = statusProgress[status];

    if (status === 'completed' && !progress.completedAt) {
      progress.completedAt = new Date().toISOString();
      this.userProgress.learningStats.storiesCompleted += 1;
    }

    this.userProgress.storyProgress.set(storyId, progress);
    await this.saveProgress();
  }

  // 记录关键词进度
  async updateKeywordProgress(keywordId: string, word: string, theme: string, correct: boolean): Promise<void> {
    if (!this.userProgress) return;

    let progress = this.userProgress.keywordProgress.get(keywordId);
    if (!progress) {
      progress = {
        keywordId,
        word,
        theme,
        status: 'unlocked',
        attempts: 0,
        correctAttempts: 0,
        accuracy: 0,
        timeSpent: 0,
        firstUnlockedAt: new Date().toISOString(),
        lastPracticedAt: new Date().toISOString()
      };
    }

    progress.attempts += 1;
    if (correct) {
      progress.correctAttempts += 1;
    }
    progress.accuracy = (progress.correctAttempts / progress.attempts) * 100;
    progress.lastPracticedAt = new Date().toISOString();

    // 检查是否掌握（准确率 >= 80% 且尝试次数 >= 3）
    if (progress.accuracy >= 80 && progress.attempts >= 3 && progress.status !== 'mastered') {
      progress.status = 'mastered';
      progress.masteredAt = new Date().toISOString();
      this.userProgress.learningStats.keywordsMastered += 1;
    }

    this.userProgress.keywordProgress.set(keywordId, progress);
    await this.saveProgress();
  }

  // 获取学习统计
  getLearningStats(): LearningStats | null {
    return this.userProgress?.learningStats || null;
  }

  // 获取成就列表
  getAchievements(): Achievement[] {
    return this.userProgress?.achievements || [];
  }

  // 获取故事进度
  getStoryProgress(storyId: string): StoryProgress | null {
    return this.userProgress?.storyProgress.get(storyId) || null;
  }

  // 获取所有故事进度
  getAllStoryProgress(): StoryProgress[] {
    return this.userProgress ? Array.from(this.userProgress.storyProgress.values()) : [];
  }

  // 获取关键词进度
  getKeywordProgress(keywordId: string): KeywordProgress | null {
    return this.userProgress?.keywordProgress.get(keywordId) || null;
  }

  // 获取主题统计
  getThemeStats(theme: string): { completed: number; total: number; accuracy: number } {
    if (!this.userProgress) return { completed: 0, total: 0, accuracy: 0 };

    const storyProgress = Array.from(this.userProgress.storyProgress.values()).filter(p => p.theme === theme);
    const keywordProgress = Array.from(this.userProgress.keywordProgress.values()).filter(p => p.theme === theme);

    const completedStories = storyProgress.filter(p => p.status === 'completed').length;
    const masteredKeywords = keywordProgress.filter(p => p.status === 'mastered').length;
    const totalAttempts = keywordProgress.reduce((sum, p) => sum + p.attempts, 0);
    const correctAttempts = keywordProgress.reduce((sum, p) => sum + p.correctAttempts, 0);

    return {
      completed: completedStories + masteredKeywords,
      total: storyProgress.length + keywordProgress.length,
      accuracy: totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0
    };
  }
}

// 导出单例实例
export const progressManager = new ProgressManager();
