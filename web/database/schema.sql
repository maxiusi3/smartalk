-- SmarTalk 数据库架构
-- 基于 MVP 需求创建完整的数据库结构

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 兴趣主题表
CREATE TABLE IF NOT EXISTS interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    theme TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 故事/剧集表
CREATE TABLE IF NOT EXISTS stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    duration INTEGER NOT NULL, -- 秒数
    thumbnail_url TEXT,
    video_url TEXT,
    subtitle_url TEXT,
    keywords TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    interest_id UUID REFERENCES interests(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 关键词/词汇表
CREATE TABLE IF NOT EXISTS keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    word TEXT NOT NULL,
    translation TEXT NOT NULL,
    pronunciation TEXT,
    audio_url TEXT,
    example_sentence TEXT,
    story_id UUID REFERENCES stories(id),
    timestamp_start INTEGER, -- 在视频中的开始时间（秒）
    timestamp_end INTEGER,   -- 在视频中的结束时间（秒）
    difficulty_level INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VTPR 练习视频片段表
CREATE TABLE IF NOT EXISTS keyword_video_clips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword_id UUID REFERENCES keywords(id),
    video_url TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL, -- 是否为正确答案
    description TEXT,
    thumbnail_url TEXT,
    duration INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户资料表（匿名用户支持）
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id TEXT UNIQUE, -- 用于匿名用户识别
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    preferred_language TEXT DEFAULT 'zh-CN',
    learning_goals TEXT[] DEFAULT '{}',
    avatar_url TEXT,
    selected_interest_id UUID REFERENCES interests(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户学习进度表
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id),
    story_id UUID REFERENCES stories(id),
    keyword_id UUID REFERENCES keywords(id),
    is_unlocked BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    attempts INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, story_id, keyword_id)
);

-- 分析事件表
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id),
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    session_id TEXT,
    page_url TEXT,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_stories_interest_id ON stories(interest_id);
CREATE INDEX IF NOT EXISTS idx_stories_category ON stories(category);
CREATE INDEX IF NOT EXISTS idx_keywords_story_id ON keywords(story_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_story ON user_progress(user_id, story_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加更新时间触发器
CREATE TRIGGER update_interests_updated_at BEFORE UPDATE ON interests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建 RPC 函数用于增加故事观看次数
CREATE OR REPLACE FUNCTION increment_story_views(story_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE stories 
    SET view_count = view_count + 1 
    WHERE id = story_id;
END;
$$ LANGUAGE plpgsql;
