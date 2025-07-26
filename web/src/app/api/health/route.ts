/**
 * 健康检查 API 路由
 * 用于验证应用和数据库连接状态
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabase';

export async function GET(request: NextRequest) {
  const checks = {
    database: false,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  };

  try {
    // 检查数据库连接
    const supabase = createSupabaseServerClient();
    
    // 简单的数据库连接测试
    const { error: dbError } = await supabase
      .from('stories')
      .select('id')
      .limit(1);
    
    checks.database = !dbError;

    const isHealthy = checks.database;
    
    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      checks,
    }, {
      status: isHealthy ? 200 : 503
    });
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      checks,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, {
      status: 503
    });
  }
}
