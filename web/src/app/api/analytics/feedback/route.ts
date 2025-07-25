import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const feedback = await request.json()
    
    // 在开发环境中，只记录到控制台
    if (process.env.NODE_ENV === 'development') {
      console.log('User Feedback:', {
        userId: feedback.userId,
        feedbackType: feedback.feedbackType,
        rating: feedback.rating,
        comment: feedback.comment,
        timestamp: new Date(feedback.timestamp).toISOString(),
        metadata: feedback.metadata
      })
    }
    
    // 在生产环境中，这里可以发送到实际的分析服务
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics feedback error:', error)
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    )
  }
}
