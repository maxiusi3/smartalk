/**
 * 用户会话管理系统
 * 支持匿名用户的设备识别和进度跟踪
 */

import { supabase } from './supabase';

export interface UserSession {
  deviceId: string;
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  selectedInterestId?: string;
  createdAt: string;
  lastActiveAt: string;
}

export interface LearningProgress {
  userId: string;
  storyId: string;
  keywordId: string;
  isUnlocked: boolean;
  completedAt?: string;
  attempts: number;
  correctAttempts: number;
}

class UserSessionManager {
  private static instance: UserSessionManager;
  private currentSession: UserSession | null = null;
  private readonly DEVICE_ID_KEY = 'smartalk_device_id';
  private readonly SESSION_KEY = 'smartalk_session';

  private constructor() {}

  static getInstance(): UserSessionManager {
    if (!UserSessionManager.instance) {
      UserSessionManager.instance = new UserSessionManager();
    }
    return UserSessionManager.instance;
  }

  /**
   * 生成设备唯一标识符
   */
  private generateDeviceId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 15);
    return `device_${timestamp}_${randomStr}`;
  }

  /**
   * 获取或创建设备ID
   */
  private getDeviceId(): string {
    if (typeof window === 'undefined') return 'server_device';
    
    let deviceId = localStorage.getItem(this.DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = this.generateDeviceId();
      localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  }

  /**
   * 初始化用户会话
   */
  async initializeSession(): Promise<UserSession> {
    if (typeof window === 'undefined') {
      // 服务器端渲染时返回临时会话
      return {
        deviceId: 'server_device',
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString()
      };
    }

    const deviceId = this.getDeviceId();
    
    try {
      // 尝试从数据库获取现有用户资料
      const { data: existingUser, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('device_id', deviceId)
        .single();

      if (existingUser && !error) {
        // 更新最后活跃时间
        await supabase
          .from('user_profiles')
          .update({ updated_at: new Date().toISOString() })
          .eq('device_id', deviceId);

        this.currentSession = {
          deviceId: existingUser.device_id,
          userId: existingUser.id,
          email: existingUser.email,
          firstName: existingUser.first_name,
          lastName: existingUser.last_name,
          selectedInterestId: existingUser.selected_interest_id,
          createdAt: existingUser.created_at,
          lastActiveAt: new Date().toISOString()
        };
      } else {
        // 创建新用户资料
        const { data: newUser, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            device_id: deviceId,
            preferred_language: 'zh-CN'
          })
          .select()
          .single();

        if (createError) {
          console.error('Failed to create user profile:', createError);
          throw createError;
        }

        this.currentSession = {
          deviceId: newUser.device_id,
          userId: newUser.id,
          selectedInterestId: newUser.selected_interest_id,
          createdAt: newUser.created_at,
          lastActiveAt: new Date().toISOString()
        };
      }

      // 保存会话到本地存储
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(this.currentSession));
      
      return this.currentSession;
    } catch (error) {
      console.error('Failed to initialize session:', error);
      
      // 创建离线会话
      this.currentSession = {
        deviceId,
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString()
      };
      
      return this.currentSession;
    }
  }

  /**
   * 获取当前会话
   */
  getCurrentSession(): UserSession | null {
    if (!this.currentSession && typeof window !== 'undefined') {
      const savedSession = localStorage.getItem(this.SESSION_KEY);
      if (savedSession) {
        try {
          this.currentSession = JSON.parse(savedSession);
        } catch (error) {
          console.error('Failed to parse saved session:', error);
        }
      }
    }
    return this.currentSession;
  }

  /**
   * 更新用户兴趣选择
   */
  async updateSelectedInterest(interestId: string): Promise<void> {
    const session = this.getCurrentSession();
    if (!session?.userId) return;

    try {
      await supabase
        .from('user_profiles')
        .update({ selected_interest_id: interestId })
        .eq('id', session.userId);

      // 更新本地会话
      if (this.currentSession) {
        this.currentSession.selectedInterestId = interestId;
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(this.currentSession));
      }
    } catch (error) {
      console.error('Failed to update selected interest:', error);
    }
  }

  /**
   * 保存学习进度
   */
  async saveProgress(
    storyId: string, 
    keywordId: string, 
    isUnlocked: boolean, 
    isCorrect?: boolean
  ): Promise<void> {
    const session = this.getCurrentSession();
    if (!session?.userId) return;

    try {
      // 获取现有进度
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', session.userId)
        .eq('story_id', storyId)
        .eq('keyword_id', keywordId)
        .single();

      const progressData = {
        user_id: session.userId,
        story_id: storyId,
        keyword_id: keywordId,
        is_unlocked: isUnlocked,
        attempts: (existingProgress?.attempts || 0) + 1,
        correct_attempts: existingProgress?.correct_attempts || 0,
        updated_at: new Date().toISOString()
      };

      if (isCorrect) {
        progressData.correct_attempts += 1;
        if (isUnlocked) {
          progressData.completed_at = new Date().toISOString();
        }
      }

      if (existingProgress) {
        // 更新现有进度
        await supabase
          .from('user_progress')
          .update(progressData)
          .eq('id', existingProgress.id);
      } else {
        // 创建新进度记录
        await supabase
          .from('user_progress')
          .insert(progressData);
      }
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  /**
   * 获取用户学习进度
   */
  async getProgress(storyId?: string): Promise<LearningProgress[]> {
    const session = this.getCurrentSession();
    if (!session?.userId) return [];

    try {
      let query = supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', session.userId);

      if (storyId) {
        query = query.eq('story_id', storyId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Failed to get progress:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get progress:', error);
      return [];
    }
  }

  /**
   * 获取学习统计
   */
  async getLearningStats(): Promise<{
    totalKeywords: number;
    unlockedKeywords: number;
    completedStories: number;
    totalAttempts: number;
    accuracy: number;
  }> {
    const session = this.getCurrentSession();
    if (!session?.userId) {
      return {
        totalKeywords: 0,
        unlockedKeywords: 0,
        completedStories: 0,
        totalAttempts: 0,
        accuracy: 0
      };
    }

    try {
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', session.userId);

      if (!progress) {
        return {
          totalKeywords: 0,
          unlockedKeywords: 0,
          completedStories: 0,
          totalAttempts: 0,
          accuracy: 0
        };
      }

      const totalKeywords = progress.length;
      const unlockedKeywords = progress.filter(p => p.is_unlocked).length;
      const completedStories = new Set(
        progress.filter(p => p.completed_at).map(p => p.story_id)
      ).size;
      const totalAttempts = progress.reduce((sum, p) => sum + p.attempts, 0);
      const totalCorrect = progress.reduce((sum, p) => sum + p.correct_attempts, 0);
      const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

      return {
        totalKeywords,
        unlockedKeywords,
        completedStories,
        totalAttempts,
        accuracy: Math.round(accuracy)
      };
    } catch (error) {
      console.error('Failed to get learning stats:', error);
      return {
        totalKeywords: 0,
        unlockedKeywords: 0,
        completedStories: 0,
        totalAttempts: 0,
        accuracy: 0
      };
    }
  }

  /**
   * 记录分析事件
   */
  async trackEvent(eventType: string, eventData: any): Promise<void> {
    const session = this.getCurrentSession();
    if (!session?.userId) return;

    try {
      await supabase
        .from('analytics_events')
        .insert({
          user_id: session.userId,
          event_type: eventType,
          event_data: eventData,
          session_id: session.deviceId,
          page_url: typeof window !== 'undefined' ? window.location.href : '',
          user_agent: typeof window !== 'undefined' ? navigator.userAgent : ''
        });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }
}

// 导出单例实例
export const userSession = UserSessionManager.getInstance();
