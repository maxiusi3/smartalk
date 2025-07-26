/**
 * Next.js 中间件 - 处理认证和路由保护
 * 使用 Supabase Auth 进行用户认证验证
 */

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 需要认证的路由
const PROTECTED_ROUTES = [
  '/dashboard',
  '/learn',
  '/profile',
  '/settings',
  '/api/user',
  '/api/progress',
  '/api/achievements'
];

// 认证相关路由
const AUTH_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password'
];

// 公开的 API 路由
const PUBLIC_API_ROUTES = [
  '/api/health',
  '/api/stories',
  '/api/auth'
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // 获取当前路径
  const pathname = req.nextUrl.pathname;

  try {
    // 获取用户会话
    const {
      data: { session },
      error
    } = await supabase.auth.getSession();

    // 如果获取会话时出错，记录错误但不阻止请求
    if (error) {
      console.error('Middleware auth error:', error);
    }

    // 检查是否为受保护的路由
    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
      pathname.startsWith(route)
    );

    // 检查是否为认证路由
    const isAuthRoute = AUTH_ROUTES.some(route => 
      pathname.startsWith(route)
    );

    // 检查是否为公开 API 路由
    const isPublicApiRoute = PUBLIC_API_ROUTES.some(route => 
      pathname.startsWith(route)
    );

    // 如果是公开 API 路由，直接通过
    if (isPublicApiRoute) {
      return res;
    }

    // 如果是受保护的路由但用户未登录，重定向到登录页
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL('/auth/login', req.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // 如果是认证路由但用户已登录，重定向到仪表板
    if (isAuthRoute && session) {
      const redirectTo = req.nextUrl.searchParams.get('redirectTo');
      const redirectUrl = new URL(redirectTo || '/dashboard', req.url);
      return NextResponse.redirect(redirectUrl);
    }

    // API 路由的认证检查
    if (pathname.startsWith('/api/') && !isPublicApiRoute) {
      if (!session) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // 添加安全头
    const response = NextResponse.next();
    
    // 设置安全头
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // 在生产环境中启用 HSTS
    if (process.env.NODE_ENV === 'production') {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }

    // 设置 CSP 头（内容安全策略）
    const cspHeader = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https:",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ');

    response.headers.set('Content-Security-Policy', cspHeader);

    return response;

  } catch (error) {
    console.error('Middleware error:', error);
    
    // 如果中间件出错，允许请求继续但记录错误
    return res;
  }
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化文件)
     * - favicon.ico (网站图标)
     * - public 文件夹中的文件
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
