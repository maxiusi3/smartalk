import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 支持不同的批量数据格式
    const { events = [], funnelSteps = [], feedbacks = [] } = body

    // 在开发环境中，只记录到控制台
    if (process.env.NODE_ENV === 'development') {
      console.log('Batch Analytics Data:', {
        eventsCount: events.length,
        funnelStepsCount: funnelSteps.length,
        feedbacksCount: feedbacks.length,
        events: events.map((event: any) => ({
          eventName: event.eventName,
          eventType: event.eventType,
          timestamp: new Date(event.timestamp).toISOString()
        }))
      })
    }

    // 在生产环境中，这里可以批量发送到实际的分析服务

    const totalProcessed = events.length + funnelSteps.length + feedbacks.length
    return NextResponse.json({
      success: true,
      processed: {
        events: events.length,
        funnelSteps: funnelSteps.length,
        feedbacks: feedbacks.length,
        total: totalProcessed
      }
    })
  } catch (error) {
    console.error('Analytics batch error:', error)
    return NextResponse.json(
      { error: 'Failed to process batch events' },
      { status: 500 }
    )
  }
}
