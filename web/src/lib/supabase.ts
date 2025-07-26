/**
 * Supabase 客户端配置
 * 用于连接和操作 Supabase 数据库
 */

import { createClient } from '@supabase/supabase-js';

// 环境变量检查
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 数据库表类型定义
export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  preferred_language?: string;
  learning_goals?: string[];
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  thumbnail_url?: string;
  keywords?: string[];
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Interest {
  id: string;
  name: string;
  theme: string;
  description?: string;
  created_at: string;
}

// 数据库操作函数
export const dbOperations = {
  // 获取所有兴趣主题
  async getInterests() {
    const { data, error } = await supabase
      .from('interests')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data as Interest[];
  },

  // 获取故事列表
  async getStories(category?: string) {
    let query = supabase
      .from('stories')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Story[];
  },

  // 获取单个故事
  async getStory(id: string) {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Story;
  },

  // 增加故事观看次数
  async incrementStoryViews(id: string) {
    const { error } = await supabase
      .rpc('increment_story_views', { story_id: id });
    
    if (error) throw error;
  },

  // 创建用户资料
  async createUserProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profile)
      .select()
      .single();
    
    if (error) throw error;
    return data as UserProfile;
  },

  // 获取用户资料
  async getUserProfile(id: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as UserProfile;
  },

  // 更新用户资料
  async updateUserProfile(id: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as UserProfile;
  }
};

// 实时订阅工具
export const subscriptions = {
  // 订阅故事更新
  subscribeToStories(callback: (payload: any) => void) {
    return supabase
      .channel('stories')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'stories' }, 
        callback
      )
      .subscribe();
  },

  // 取消订阅
  unsubscribe(subscription: any) {
    return supabase.removeChannel(subscription);
  }
};

export default supabase;
