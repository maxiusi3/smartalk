/**
 * 健康检查 API 路由
 * 简化版本，不依赖数据库连接以避免构建时的 React Context 错误
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const checks = {
    server: true,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };

  try {
    // 简单的服务器健康检查，不连接数据库
    const isHealthy = true; // 服务器正在运行就是健康的

    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      checks,
      message: 'SmarTalk API is running'
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
