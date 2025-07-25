import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const activation = await request.json()
    
    // 在开发环境中，只记录到控制台
    if (process.env.NODE_ENV === 'development') {
      console.log('User Activation:', {
        userId: activation.userId,
        activationType: activation.activationType,
        timestamp: new Date(activation.timestamp).toISOString(),
        metadata: activation.metadata
      })
    }
    
    // 在生产环境中，这里可以发送到实际的分析服务
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics activation error:', error)
    return NextResponse.json(
      { error: 'Failed to process activation event' },
      { status: 500 }
    )
  }
}
