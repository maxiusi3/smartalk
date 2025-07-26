/**
 * 数据库连接测试 API 路由
 * 测试 Supabase 数据库连接和基本查询功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
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

    // 测试数据库连接 - 查询一个简单的表
    const { data, error } = await supabase
      .from('interests')
      .select('id, name, theme')
      .limit(5);

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Database query failed',
        error: error.message,
        details: error
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
