/**
 * 用户登录 API 路由
 * 使用 Supabase Auth 进行身份验证
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../../lib/supabase';
import { createSuccessResponse, createErrorResponse } from '../../../../../lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        createErrorResponse('Email and password are required'),
        { status: 400 }
      );
    }

    // 创建 Supabase 客户端
    const supabase = createSupabaseServerClient();

    // 使用 Supabase Auth 登录
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        createErrorResponse('Invalid email or password'),
        { status: 401 }
      );
    }

    // 获取用户详细信息
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      // 如果用户资料不存在，创建一个
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          first_name: data.user.user_metadata?.first_name || '',
          last_name: data.user.user_metadata?.last_name || '',
          preferred_language: 'en',
          learning_goals: [],
        })
        .select()
        .single();

      if (createError) {
        return NextResponse.json(
          createErrorResponse('Failed to create user profile'),
          { status: 500 }
        );
      }

      // 返回登录成功响应
      return NextResponse.json(
        createSuccessResponse({
          user: {
            id: newProfile.id,
            email: newProfile.email,
            firstName: newProfile.first_name,
            lastName: newProfile.last_name,
            preferredLanguage: newProfile.preferred_language,
            learningGoals: newProfile.learning_goals,
            avatar: newProfile.avatar_url,
            createdAt: newProfile.created_at,
            updatedAt: newProfile.updated_at,
          },
          tokens: {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresIn: data.session.expires_in || 3600,
          },
        }),
        { status: 200 }
      );
    }

    // 返回登录成功响应
    return NextResponse.json(
      createSuccessResponse({
        user: {
          id: userProfile.id,
          email: userProfile.email,
          firstName: userProfile.first_name,
          lastName: userProfile.last_name,
          preferredLanguage: userProfile.preferred_language,
          learningGoals: userProfile.learning_goals,
          avatar: userProfile.avatar_url,
          createdAt: userProfile.created_at,
          updatedAt: userProfile.updated_at,
        },
        tokens: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresIn: data.session.expires_in || 3600,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Unknown error'),
      { status: 500 }
    );
  }
}
