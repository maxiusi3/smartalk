/**
 * 故事列表 API 路由
 * 完全静态版本，不使用任何动态特性以避免构建错误
 */

import { NextResponse } from 'next/server';

// 完全静态的 API 路由
export async function GET() {
  try {
    // 返回静态模拟数据，不使用任何查询参数
    const mockStories = [
      {
        id: '1',
        title: 'Coffee Shop English',
        description: 'Learn everyday English at a coffee shop',
        category: 'daily-life',
        difficulty: 'beginner',
        duration: 300,
        thumbnailUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
        keywords: ['order', 'coffee', 'polite'],
        viewCount: 150,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Job Interview Success',
        description: 'Master professional English for interviews',
        category: 'business',
        difficulty: 'intermediate',
        duration: 450,
        thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        keywords: ['interview', 'professional', 'confidence'],
        viewCount: 89,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    // 直接返回所有故事，不进行任何过滤或分页
    return NextResponse.json({
      success: true,
      data: mockStories,
      total: mockStories.length
    }, { status: 200 });
  } catch (error) {
    console.error('Stories API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
