/**
 * 故事列表 API 路由
 * 支持分页、搜索和过滤
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabase';
import { 
  createPaginatedResponse,
  createErrorResponse,
  normalizePaginationParams,
  normalizeSortParams 
} from '../../../../lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    // 解析查询参数
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const searchQuery = searchParams.get('q');
    const rawPage = searchParams.get('page');
    const rawLimit = searchParams.get('limit');
    const rawSort = searchParams.get('sort');
    const rawOrder = searchParams.get('order');

    // 标准化分页参数
    const { page, limit } = normalizePaginationParams(rawPage, rawLimit, 50);
    const { sort, order } = normalizeSortParams(
      rawSort,
      rawOrder,
      ['title', 'created_at', 'difficulty', 'duration']
    );

    // 构建查询
    let query = supabase
      .from('stories')
      .select(`
        id,
        title,
        description,
        category,
        difficulty,
        duration,
        thumbnail_url,
        keywords,
        view_count,
        created_at,
        updated_at
      `, { count: 'exact' })
      .eq('is_published', true);

    // 应用过滤条件
    if (category) {
      query = query.eq('category', category);
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    // 应用排序
    if (sort) {
      query = query.order(sort, { ascending: order === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // 应用分页
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // 执行查询
    const { data: stories, error, count } = await query;

    if (error) {
      console.error('Stories query error:', error);
      return NextResponse.json(
        createErrorResponse('Failed to fetch stories'),
        { status: 500 }
      );
    }

    // 转换数据格式
    const formattedStories = stories?.map(story => ({
      id: story.id,
      title: story.title,
      description: story.description,
      category: story.category,
      difficulty: story.difficulty,
      duration: story.duration,
      thumbnailUrl: story.thumbnail_url,
      keywords: story.keywords || [],
      viewCount: story.view_count,
      createdAt: story.created_at,
      updatedAt: story.updated_at,
    })) || [];

    // 返回分页响应
    return NextResponse.json(
      createPaginatedResponse(
        formattedStories,
        page,
        limit,
        count || 0
      ),
      { status: 200 }
    );
  } catch (error) {
    console.error('Stories API error:', error);
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Unknown error'),
      { status: 500 }
    );
  }
}
