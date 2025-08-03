-- SmarTalk 数据库初始化脚本
-- 创建所有必需的表和关系

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 创建枚举类型（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'difficulty_level') THEN
        CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'progress_status') THEN
        CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'completed');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'progress_type') THEN
        CREATE TYPE progress_type AS ENUM ('story', 'video', 'keyword');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'achievement_type') THEN
        CREATE TYPE achievement_type AS ENUM ('story_completion', 'keyword_mastery', 'streak', 'time_spent');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'video_type') THEN
        CREATE TYPE video_type AS ENUM ('context', 'option_a', 'option_b');
    END IF;
END$$;

-- 用户表（扩展 Supabase Auth）
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    preferred_language TEXT DEFAULT 'en',
    learning_goals TEXT[] DEFAULT '{}',
    avatar_url TEXT,
    is_email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 故事表
CREATE TABLE IF NOT EXISTS stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty difficulty_level NOT NULL,
    duration INTEGER NOT NULL, -- 预计学习时间（秒）
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 视频表
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type video_type NOT NULL,
    url TEXT NOT NULL,
    duration INTEGER NOT NULL, -- 视频时长（秒）
    thumbnail_url TEXT,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 关键词表
CREATE TABLE IF NOT EXISTS keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    word TEXT NOT NULL UNIQUE,
    definition TEXT NOT NULL,
    pronunciation TEXT,
    audio_url TEXT,
    examples TEXT[] DEFAULT '{}',
    difficulty difficulty_level NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 故事-关键词关联表
CREATE TABLE IF NOT EXISTS story_keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(story_id, keyword_id)
);

-- 用户进度表
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    keyword_id UUID REFERENCES keywords(id) ON DELETE CASCADE,
    type progress_type NOT NULL,
    status progress_status DEFAULT 'not_started',
    score INTEGER CHECK (score >= 0 AND score <= 100),
    time_spent INTEGER DEFAULT 0, -- 学习时间（秒）
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 确保每个用户对每个资源只有一条进度记录
    UNIQUE(user_id, story_id, video_id, keyword_id)
);

-- 成就表
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    type achievement_type NOT NULL,
    criteria JSONB NOT NULL, -- 成就条件
    reward JSONB, -- 奖励内容
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户成就表
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- 创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_stories_category ON stories(category);
CREATE INDEX IF NOT EXISTS idx_stories_difficulty ON stories(difficulty);
CREATE INDEX IF NOT EXISTS idx_videos_story_id ON videos(story_id);
CREATE INDEX IF NOT EXISTS idx_videos_order ON videos(story_id, "order");
CREATE INDEX IF NOT EXISTS idx_keywords_word ON keywords(word);
CREATE INDEX IF NOT EXISTS idx_keywords_category ON keywords(category);
CREATE INDEX IF NOT EXISTS idx_keywords_difficulty ON keywords(difficulty);
CREATE INDEX IF NOT EXISTS idx_story_keywords_story_id ON story_keywords(story_id);
CREATE INDEX IF NOT EXISTS idx_story_keywords_keyword_id ON story_keywords(keyword_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_progress_type ON user_progress(type);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表添加更新时间触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_keywords_updated_at BEFORE UPDATE ON keywords
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 行级安全策略 (RLS)
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_achievements ENABLE ROW LEVEL SECURITY;

-- 删除已存在的策略（如果存在）
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Stories are viewable by everyone" ON stories;
DROP POLICY IF EXISTS "Videos are viewable by everyone" ON videos;
DROP POLICY IF EXISTS "Keywords are viewable by everyone" ON keywords;
DROP POLICY IF EXISTS "Story keywords are viewable by everyone" ON story_keywords;
DROP POLICY IF EXISTS "Achievements are viewable by everyone" ON achievements;

-- 用户只能访问自己的数据
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own progress" ON user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

-- 公共内容表的策略
CREATE POLICY "Stories are viewable by everyone" ON stories
    FOR SELECT USING (true);

CREATE POLICY "Videos are viewable by everyone" ON videos
    FOR SELECT USING (true);

CREATE POLICY "Keywords are viewable by everyone" ON keywords
    FOR SELECT USING (true);

CREATE POLICY "Story keywords are viewable by everyone" ON story_keywords
    FOR SELECT USING (true);

CREATE POLICY "Achievements are viewable by everyone" ON achievements
    FOR SELECT USING (true);
