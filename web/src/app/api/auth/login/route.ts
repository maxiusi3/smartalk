/**
 * 用户登录 API 路由
 * 简化版本，返回模拟响应以避免构建时的 React Context 错误
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 验证输入
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 });
    }

    // 模拟登录逻辑
    if (email === 'demo@smartalk.app' && password === 'demo123') {
      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: 'demo-user-id',
            email: 'demo@smartalk.app',
            name: 'Demo User'
          },
          session: {
            access_token: 'demo-access-token',
            refresh_token: 'demo-refresh-token'
          }
        }
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
