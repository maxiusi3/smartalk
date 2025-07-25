import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { queryType, params } = await request.json()
    
    // 在开发环境中，返回模拟数据
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Query:', { queryType, params })
      
      // 返回模拟的分析数据
      const mockData = {
        user_engagement: {
          totalUsers: 150,
          activeUsers: 89,
          avgSessionDuration: 245000,
          bounceRate: 0.23
        },
        conversion_funnel: {
          steps: [
            { step: 'story_preview', users: 100, conversionRate: 1.0 },
            { step: 'clue_collection', users: 78, conversionRate: 0.78 },
            { step: 'magic_moment', users: 45, conversionRate: 0.58 },
            { step: 'completion', users: 32, conversionRate: 0.71 }
          ]
        },
        user_feedback: {
          averageRating: 4.2,
          totalFeedbacks: 67,
          sentimentDistribution: {
            positive: 0.65,
            neutral: 0.25,
            negative: 0.10
          }
        }
      }
      
      return NextResponse.json(mockData[queryType as keyof typeof mockData] || {})
    }
    
    // 在生产环境中，这里可以查询实际的分析数据
    
    return NextResponse.json({})
  } catch (error) {
    console.error('Analytics query error:', error)
    return NextResponse.json(
      { error: 'Failed to process analytics query' },
      { status: 500 }
    )
  }
}
