/**
 * UserStateService - V2 用户状态管理和会话持久化服务
 * 负责用户学习进度、偏好设置、会话状态的持久化存储
 * 支持离线学习和跨设备同步
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalyticsService } from './AnalyticsService';

// 用户学习进度
export interface UserProgress {
  userId: string;
  currentChapterId?: string;
  currentKeywordId?: string;
  completedChapters: string[];
  completedKeywords: string[];
  
  // 学习统计
  totalLearningTime: number; // 分钟
  wordsMastered: number;
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  lastActiveDate: string;
  
  // 成就系统
  achievements: string[];
  totalAquaPoints: number;
  
  // 学习偏好
  preferredDifficulty: 'easy' | 'medium' | 'hard';
  preferredInterests: string[];
  dailyGoalMinutes: number;
  
  // 最后更新时间
  lastUpdated: string;
}

// 会话状态
export interface SessionState {
  sessionId: string;
  userId: string;
  startTime: string;
  lastActivityTime: string;
  
  // 当前学习状态
  currentScreen: string;
  currentChapterId?: string;
  currentKeywordId?: string;
  currentPhase?: 'context_guessing' | 'pronunciation_training' | 'completed';
  
  // 临时数据
  contextGuessingAttempts: number;
  pronunciationAttempts: number;
  sessionProgress: {
    keywordsCompleted: number;
    totalKeywords: number;
    correctAnswers: number;
    totalAnswers: number;
  };
  
  // 错误恢复状态
  focusModeActive: boolean;
  rescueModeActive: boolean;
  
  // 最后更新时间
  lastUpdated: string;
}

// 用户设置
export interface UserSettings {
  userId: string;
  
  // 应用设置
  language: 'zh-CN' | 'en-US';
  theme: 'light' | 'dark' | 'auto';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  
  // 学习设置
  autoPlayAudio: boolean;
  showPronunciationTips: boolean;
  enableSRS: boolean;
  srsNotificationsEnabled: boolean;
  
  // 通知设置
  dailyReminderEnabled: boolean;
  dailyReminderTime: string; // HH:MM format
  streakReminderEnabled: boolean;
  achievementNotificationsEnabled: boolean;
  
  // 隐私设置
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
  
  // 最后更新时间
  lastUpdated: string;
}

class UserStateService {
  private static instance: UserStateService;
  private userProgress: UserProgress | null = null;
  private sessionState: SessionState | null = null;
  private userSettings: UserSettings | null = null;
  
  private analyticsService = AnalyticsService.getInstance();
  
  // 存储键名
  private static readonly STORAGE_KEYS = {
    USER_PROGRESS: 'user_progress',
    SESSION_STATE: 'session_state',
    USER_SETTINGS: 'user_settings',
  };

  static getInstance(): UserStateService {
    if (!UserStateService.instance) {
      UserStateService.instance = new UserStateService();
    }
    return UserStateService.instance;
  }

  // ===== 用户进度管理 =====

  async loadUserProgress(userId: string): Promise<UserProgress> {
    try {
      const stored = await AsyncStorage.getItem(UserStateService.STORAGE_KEYS.USER_PROGRESS);
      
      if (stored) {
        const progress = JSON.parse(stored) as UserProgress;
        if (progress.userId === userId) {
          this.userProgress = progress;
          return progress;
        }
      }
      
      // 创建新的用户进度
      const newProgress: UserProgress = {
        userId,
        completedChapters: [],
        completedKeywords: [],
        totalLearningTime: 0,
        wordsMastered: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalSessions: 0,
        lastActiveDate: new Date().toISOString(),
        achievements: [],
        totalAquaPoints: 0,
        preferredDifficulty: 'medium',
        preferredInterests: [],
        dailyGoalMinutes: 15,
        lastUpdated: new Date().toISOString(),
      };
      
      this.userProgress = newProgress;
      await this.saveUserProgress();
      
      return newProgress;
      
    } catch (error) {
      console.error('Error loading user progress:', error);
      throw error;
    }
  }

  async saveUserProgress(): Promise<void> {
    if (!this.userProgress) return;
    
    try {
      this.userProgress.lastUpdated = new Date().toISOString();
      await AsyncStorage.setItem(
        UserStateService.STORAGE_KEYS.USER_PROGRESS,
        JSON.stringify(this.userProgress)
      );
      
      this.analyticsService.track('user_progress_saved', {
        userId: this.userProgress.userId,
        wordsMastered: this.userProgress.wordsMastered,
        currentStreak: this.userProgress.currentStreak,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error saving user progress:', error);
      throw error;
    }
  }

  async updateUserProgress(updates: Partial<UserProgress>): Promise<void> {
    if (!this.userProgress) return;
    
    this.userProgress = { ...this.userProgress, ...updates };
    await this.saveUserProgress();
  }

  getUserProgress(): UserProgress | null {
    return this.userProgress;
  }

  // ===== 会话状态管理 =====

  async startSession(userId: string, screen: string): Promise<SessionState> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newSession: SessionState = {
      sessionId,
      userId,
      startTime: new Date().toISOString(),
      lastActivityTime: new Date().toISOString(),
      currentScreen: screen,
      contextGuessingAttempts: 0,
      pronunciationAttempts: 0,
      sessionProgress: {
        keywordsCompleted: 0,
        totalKeywords: 0,
        correctAnswers: 0,
        totalAnswers: 0,
      },
      focusModeActive: false,
      rescueModeActive: false,
      lastUpdated: new Date().toISOString(),
    };
    
    this.sessionState = newSession;
    await this.saveSessionState();
    
    this.analyticsService.track('session_started', {
      sessionId,
      userId,
      screen,
      timestamp: Date.now(),
    });
    
    return newSession;
  }

  async updateSessionState(updates: Partial<SessionState>): Promise<void> {
    if (!this.sessionState) return;
    
    this.sessionState = {
      ...this.sessionState,
      ...updates,
      lastActivityTime: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    
    await this.saveSessionState();
  }

  async endSession(): Promise<void> {
    if (!this.sessionState) return;
    
    const sessionDuration = Date.now() - new Date(this.sessionState.startTime).getTime();
    
    this.analyticsService.track('session_ended', {
      sessionId: this.sessionState.sessionId,
      userId: this.sessionState.userId,
      duration: sessionDuration,
      keywordsCompleted: this.sessionState.sessionProgress.keywordsCompleted,
      accuracy: this.sessionState.sessionProgress.totalAnswers > 0 
        ? (this.sessionState.sessionProgress.correctAnswers / this.sessionState.sessionProgress.totalAnswers) * 100 
        : 0,
      timestamp: Date.now(),
    });
    
    // 更新用户进度中的会话统计
    if (this.userProgress) {
      await this.updateUserProgress({
        totalSessions: this.userProgress.totalSessions + 1,
        totalLearningTime: this.userProgress.totalLearningTime + Math.round(sessionDuration / 60000),
        lastActiveDate: new Date().toISOString(),
      });
    }
    
    // 清除会话状态
    this.sessionState = null;
    await AsyncStorage.removeItem(UserStateService.STORAGE_KEYS.SESSION_STATE);
  }

  private async saveSessionState(): Promise<void> {
    if (!this.sessionState) return;
    
    try {
      await AsyncStorage.setItem(
        UserStateService.STORAGE_KEYS.SESSION_STATE,
        JSON.stringify(this.sessionState)
      );
    } catch (error) {
      console.error('Error saving session state:', error);
    }
  }

  async loadSessionState(userId: string): Promise<SessionState | null> {
    try {
      const stored = await AsyncStorage.getItem(UserStateService.STORAGE_KEYS.SESSION_STATE);
      
      if (stored) {
        const session = JSON.parse(stored) as SessionState;
        if (session.userId === userId) {
          this.sessionState = session;
          return session;
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('Error loading session state:', error);
      return null;
    }
  }

  getSessionState(): SessionState | null {
    return this.sessionState;
  }

  // ===== 用户设置管理 =====

  async loadUserSettings(userId: string): Promise<UserSettings> {
    try {
      const stored = await AsyncStorage.getItem(UserStateService.STORAGE_KEYS.USER_SETTINGS);
      
      if (stored) {
        const settings = JSON.parse(stored) as UserSettings;
        if (settings.userId === userId) {
          this.userSettings = settings;
          return settings;
        }
      }
      
      // 创建默认设置
      const defaultSettings: UserSettings = {
        userId,
        language: 'zh-CN',
        theme: 'auto',
        soundEnabled: true,
        vibrationEnabled: true,
        autoPlayAudio: true,
        showPronunciationTips: true,
        enableSRS: true,
        srsNotificationsEnabled: true,
        dailyReminderEnabled: true,
        dailyReminderTime: '19:00',
        streakReminderEnabled: true,
        achievementNotificationsEnabled: true,
        analyticsEnabled: true,
        crashReportingEnabled: true,
        lastUpdated: new Date().toISOString(),
      };
      
      this.userSettings = defaultSettings;
      await this.saveUserSettings();
      
      return defaultSettings;
      
    } catch (error) {
      console.error('Error loading user settings:', error);
      throw error;
    }
  }

  async saveUserSettings(): Promise<void> {
    if (!this.userSettings) return;
    
    try {
      this.userSettings.lastUpdated = new Date().toISOString();
      await AsyncStorage.setItem(
        UserStateService.STORAGE_KEYS.USER_SETTINGS,
        JSON.stringify(this.userSettings)
      );
      
      this.analyticsService.track('user_settings_saved', {
        userId: this.userSettings.userId,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error saving user settings:', error);
      throw error;
    }
  }

  async updateUserSettings(updates: Partial<UserSettings>): Promise<void> {
    if (!this.userSettings) return;
    
    this.userSettings = { ...this.userSettings, ...updates };
    await this.saveUserSettings();
  }

  getUserSettings(): UserSettings | null {
    return this.userSettings;
  }

  // ===== 数据同步和清理 =====

  async clearAllUserData(userId: string): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        UserStateService.STORAGE_KEYS.USER_PROGRESS,
        UserStateService.STORAGE_KEYS.SESSION_STATE,
        UserStateService.STORAGE_KEYS.USER_SETTINGS,
      ]);
      
      this.userProgress = null;
      this.sessionState = null;
      this.userSettings = null;
      
      this.analyticsService.track('user_data_cleared', {
        userId,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error clearing user data:', error);
      throw error;
    }
  }

  async exportUserData(userId: string): Promise<string> {
    try {
      const data = {
        userProgress: this.userProgress,
        userSettings: this.userSettings,
        exportedAt: new Date().toISOString(),
        version: '2.0',
      };
      
      return JSON.stringify(data, null, 2);
      
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }

  // ===== 便捷方法 =====

  async markChapterCompleted(chapterId: string): Promise<void> {
    if (!this.userProgress) return;
    
    if (!this.userProgress.completedChapters.includes(chapterId)) {
      this.userProgress.completedChapters.push(chapterId);
      await this.saveUserProgress();
      
      this.analyticsService.track('chapter_completed', {
        userId: this.userProgress.userId,
        chapterId,
        totalCompleted: this.userProgress.completedChapters.length,
        timestamp: Date.now(),
      });
    }
  }

  async markKeywordMastered(keywordId: string): Promise<void> {
    if (!this.userProgress) return;
    
    if (!this.userProgress.completedKeywords.includes(keywordId)) {
      this.userProgress.completedKeywords.push(keywordId);
      this.userProgress.wordsMastered++;
      await this.saveUserProgress();
      
      this.analyticsService.track('keyword_mastered', {
        userId: this.userProgress.userId,
        keywordId,
        totalMastered: this.userProgress.wordsMastered,
        timestamp: Date.now(),
      });
    }
  }

  async updateStreak(): Promise<void> {
    if (!this.userProgress) return;
    
    const today = new Date().toISOString().split('T')[0];
    const lastActive = new Date(this.userProgress.lastActiveDate).toISOString().split('T')[0];
    
    if (today !== lastActive) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastActive === yesterdayStr) {
        // 连续学习
        this.userProgress.currentStreak++;
        if (this.userProgress.currentStreak > this.userProgress.longestStreak) {
          this.userProgress.longestStreak = this.userProgress.currentStreak;
        }
      } else {
        // 中断了连击
        this.userProgress.currentStreak = 1;
      }
      
      this.userProgress.lastActiveDate = new Date().toISOString();
      await this.saveUserProgress();
      
      this.analyticsService.track('streak_updated', {
        userId: this.userProgress.userId,
        currentStreak: this.userProgress.currentStreak,
        longestStreak: this.userProgress.longestStreak,
        timestamp: Date.now(),
      });
    }
  }
}

export default UserStateService;
