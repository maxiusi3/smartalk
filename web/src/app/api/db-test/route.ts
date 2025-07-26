/**
 * 数据库连接测试 API 路由
 * 测试 Supabase 数据库连接和基本查询功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // 在构建时跳过数据库连接测试
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
      return NextResponse.json({
        status: 'skipped',
        message: 'Database test skipped during build',
        timestamp: new Date().toISOString()
      });
    }

    // 检查环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        status: 'error',
        message: 'Supabase configuration missing',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey
        }
      }, { status: 500 });
    }

    // 创建 Supabase 客户端
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 首先尝试创建 interests 表（如果不存在）
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS interests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        theme TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 尝试创建表
    const { error: createError } = await supabase.rpc('exec', { sql: createTableSQL });

    // 如果 RPC 不可用，尝试插入一些测试数据
    if (createError) {
      console.log('Could not create table via RPC, trying direct insert...');
    }

    // 插入测试数据
    const { error: insertError } = await supabase
      .from('interests')
      .upsert([
        { id: '550e8400-e29b-41d4-a716-446655440001', name: '旅行英语', theme: 'travel', description: '学习旅行中常用的英语表达' },
        { id: '550e8400-e29b-41d4-a716-446655440002', name: '电影对话', theme: 'movie', description: '通过经典电影对话学习自然的英语表达' },
        { id: '550e8400-e29b-41d4-a716-446655440003', name: '职场沟通', theme: 'workplace', description: '掌握职场环境中的专业英语沟通技巧' }
      ], { onConflict: 'id' });

    // 测试数据库连接 - 查询 interests 表
    const { data, error } = await supabase
      .from('interests')
      .select('id, name, theme, description')
      .limit(5);

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Database query failed',
        error: error.message,
        details: {
          createError: createError?.message,
          insertError: insertError?.message,
          queryError: error
        }
      }, { status: 500 });
    }

    // 测试成功
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      data: {
        connectionTest: 'passed',
        recordCount: data?.length || 0,
        sampleData: data,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Database test error:', error);

    return NextResponse.json({
      status: 'error',
      message: 'Database test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
