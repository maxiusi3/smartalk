/**
 * 用户进度 API 路由
 * 处理学习进度的获取、保存和统计
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // 在构建时跳过数据库连接
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
      return NextResponse.json({
        status: 'skipped',
        message: 'Progress API skipped during build',
        timestamp: new Date().toISOString()
      });
    }

    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const storyId = searchParams.get('storyId');

    if (!deviceId) {
      return NextResponse.json({
        status: 'error',
        message: 'Device ID is required'
      }, { status: 400 });
    }

    // 检查环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        status: 'error',
        message: 'Supabase configuration missing'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 获取用户ID
    const { data: user } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('device_id', deviceId)
      .single();

    if (!user) {
      return NextResponse.json({
        status: 'error',
        message: 'User not found'
      }, { status: 404 });
    }

    // 构建查询
    let query = supabase
      .from('user_progress')
      .select(`
        *,
        keywords:keyword_id (
          word,
          translation,
          pronunciation
        )
      `)
      .eq('user_id', user.id);

    if (storyId) {
      query = query.eq('story_id', storyId);
    }

    const { data: progress, error } = await query;

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Failed to fetch progress',
        error: error.message
      }, { status: 500 });
    }

    // 获取所有故事
    const { data: stories } = await supabase
      .from('stories')
      .select('*');

    // 计算统计信息
    const stats = {
      totalKeywords: stories?.length || 0,
 unlockedKeywords: progress?.filter(p => p.is_unlocked).length || 0,
      completedStories: new Set(
        progress?.filter(p => p.completed_at).map(p => p.story_id) || []
      ).size,
      totalAttempts: progress?.reduce((sum, p) => sum + p.attempts, 0) || 0,
      totalCorrect: progress?.reduce((sum, p) => sum + p.correct_attempts, 0) || 0,
      accuracy: 0
    };

    stats.accuracy = stats.totalAttempts > 0 
      ? Math.round((stats.totalCorrect / stats.totalAttempts) * 100) 
      : 0;

    return NextResponse.json({
      status: 'success',
      data: {
        progress: progress || [],
        stats,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Progress API error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 在构建时跳过数据库连接
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
      return NextResponse.json({
        status: 'skipped',
        message: 'Progress API skipped during build',
        timestamp: new Date().toISOString()
      });
    }

    const body = await request.json();
    const { deviceId, storyId, keywordId, isUnlocked, isCorrect } = body;

    if (!deviceId || !storyId || !keywordId) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing required fields: deviceId, storyId, keywordId'
      }, { status: 400 });
    }

    // 检查环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        status: 'error',
        message: 'Supabase configuration missing'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 获取用户ID
    const { data: user } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('device_id', deviceId)
      .single();

    if (!user) {
      return NextResponse.json({
        status: 'error',
        message: 'User not found'
      }, { status: 404 });
    }

    // 获取现有进度
    const { data: existingProgress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('story_id', storyId)
      .eq('keyword_id', keywordId)
      .single();

    const progressData: any = {
      user_id: user.id,
      story_id: storyId,
      keyword_id: keywordId,
      is_unlocked: isUnlocked || false,
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

    let result;
    if (existingProgress) {
      // 更新现有进度
      result = await supabase
        .from('user_progress')
        .update(progressData)
        .eq('id', existingProgress.id)
        .select()
        .single();
    } else {
      // 创建新进度记录
      result = await supabase
        .from('user_progress')
        .insert(progressData)
        .select()
        .single();
    }

    if (result.error) {
      return NextResponse.json({
        status: 'error',
        message: 'Failed to save progress',
        error: result.error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'success',
      data: result.data,
      message: 'Progress saved successfully'
    });

  } catch (error) {
    console.error('Progress save error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const storyId = searchParams.get('storyId');

    if (!deviceId) {
      return NextResponse.json({
        status: 'error',
        message: 'Device ID is required'
      }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        status: 'error',
        message: 'Supabase configuration missing'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 获取用户ID
    const { data: user } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('device_id', deviceId)
      .single();

    if (!user) {
      return NextResponse.json({
        status: 'error',
        message: 'User not found'
      }, { status: 404 });
    }

    // 构建删除查询
    let deleteQuery = supabase
      .from('user_progress')
      .delete()
      .eq('user_id', user.id);

    if (storyId) {
      deleteQuery = deleteQuery.eq('story_id', storyId);
    }

    const { error } = await deleteQuery;

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Failed to reset progress',
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'success',
      message: storyId 
        ? `Progress reset for story ${storyId}` 
        : 'All progress reset successfully'
    });

  } catch (error) {
    console.error('Progress reset error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
