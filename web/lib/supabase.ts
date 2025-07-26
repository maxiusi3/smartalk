/**
 * Supabase 客户端配置
 * 用于前端和 API 路由的数据库连接
 */

import { createClient } from '@supabase/supabase-js';

// 环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

// 客户端 Supabase 实例（用于前端）
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// 服务端 Supabase 实例（用于 API 路由）
export const createSupabaseServerClient = () => {
  // 对于 API 路由，我们使用服务角色密钥
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// 管理员 Supabase 实例（用于服务端操作）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// 数据库类型定义
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          preferred_language: string;
          learning_goals: string[];
          avatar_url?: string;
          is_email_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          preferred_language?: string;
          learning_goals?: string[];
          avatar_url?: string;
          is_email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          preferred_language?: string;
          learning_goals?: string[];
          avatar_url?: string;
          is_email_verified?: boolean;
          updated_at?: string;
        };
      };
      stories: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          duration: number;
          thumbnail_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category: string;
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          duration: number;
          thumbnail_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: string;
          difficulty?: 'beginner' | 'intermediate' | 'advanced';
          duration?: number;
          thumbnail_url?: string;
          updated_at?: string;
        };
      };
      videos: {
        Row: {
          id: string;
          story_id: string;
          title: string;
          description?: string;
          type: 'context' | 'option_a' | 'option_b';
          url: string;
          duration: number;
          thumbnail_url?: string;
          order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          title: string;
          description?: string;
          type: 'context' | 'option_a' | 'option_b';
          url: string;
          duration: number;
          thumbnail_url?: string;
          order: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          title?: string;
          description?: string;
          type?: 'context' | 'option_a' | 'option_b';
          url?: string;
          duration?: number;
          thumbnail_url?: string;
          order?: number;
          updated_at?: string;
        };
      };
      keywords: {
        Row: {
          id: string;
          word: string;
          definition: string;
          pronunciation?: string;
          audio_url?: string;
          examples: string[];
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          word: string;
          definition: string;
          pronunciation?: string;
          audio_url?: string;
          examples: string[];
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          category: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          word?: string;
          definition?: string;
          pronunciation?: string;
          audio_url?: string;
          examples?: string[];
          difficulty?: 'beginner' | 'intermediate' | 'advanced';
          category?: string;
          updated_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          story_id?: string;
          video_id?: string;
          keyword_id?: string;
          type: 'story' | 'video' | 'keyword';
          status: 'not_started' | 'in_progress' | 'completed';
          score?: number;
          time_spent: number;
          completed_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          story_id?: string;
          video_id?: string;
          keyword_id?: string;
          type: 'story' | 'video' | 'keyword';
          status?: 'not_started' | 'in_progress' | 'completed';
          score?: number;
          time_spent?: number;
          completed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          story_id?: string;
          video_id?: string;
          keyword_id?: string;
          type?: 'story' | 'video' | 'keyword';
          status?: 'not_started' | 'in_progress' | 'completed';
          score?: number;
          time_spent?: number;
          completed_at?: string;
          updated_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          title: string;
          description: string;
          icon: string;
          type: 'story_completion' | 'keyword_mastery' | 'streak' | 'time_spent';
          criteria: Record<string, any>;
          reward?: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          icon: string;
          type: 'story_completion' | 'keyword_mastery' | 'streak' | 'time_spent';
          criteria: Record<string, any>;
          reward?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          icon?: string;
          type?: 'story_completion' | 'keyword_mastery' | 'streak' | 'time_spent';
          criteria?: Record<string, any>;
          reward?: Record<string, any>;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      difficulty_level: 'beginner' | 'intermediate' | 'advanced';
      progress_status: 'not_started' | 'in_progress' | 'completed';
      progress_type: 'story' | 'video' | 'keyword';
      achievement_type: 'story_completion' | 'keyword_mastery' | 'streak' | 'time_spent';
      video_type: 'context' | 'option_a' | 'option_b';
    };
  };
}

// 类型化的 Supabase 客户端
export type TypedSupabaseClient = ReturnType<typeof createSupabaseServerClient>;

// 工具函数
export const getUser = async (supabase: TypedSupabaseClient) => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const requireAuth = async (supabase: TypedSupabaseClient) => {
  const user = await getUser(supabase);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
};

// 缓存工具函数
export const withCache = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> => {
  if (typeof window !== 'undefined') {
    // 客户端缓存
    const cached = sessionStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < ttl * 1000) {
        return data;
      }
    }
  }

  const data = await fetcher();

  if (typeof window !== 'undefined') {
    sessionStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  }

  return data;
};

// 实时订阅工具
export const createRealtimeSubscription = (
  table: string,
  callback: (payload: any) => void,
  filter?: string
) => {
  return supabase
    .channel(`public:${table}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
        filter: filter
      },
      callback
    )
    .subscribe();
};
