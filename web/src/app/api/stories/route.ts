/**
 * 故事列表 API 路由
 * 简化版本，返回模拟数据以避免构建时的 React Context 错误
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 解析查询参数
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const searchQuery = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // 返回模拟数据
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
        description: 'Master professional English for job interviews',
        category: 'business',
        difficulty: 'intermediate',
        duration: 450,
        thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        keywords: ['interview', 'professional', 'confident'],
        viewCount: 89,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    // 简单的过滤
    let filteredStories = mockStories;
    if (category) {
      filteredStories = filteredStories.filter(story => story.category === category);
    }
    if (difficulty) {
      filteredStories = filteredStories.filter(story => story.difficulty === difficulty);
    }
    if (searchQuery) {
      filteredStories = filteredStories.filter(story =>
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 简单的分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedStories = filteredStories.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedStories,
      pagination: {
        page,
        limit,
        total: filteredStories.length,
        totalPages: Math.ceil(filteredStories.length / limit)
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Stories API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
