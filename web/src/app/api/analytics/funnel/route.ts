import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const funnelStep = await request.json()
    
    // 在开发环境中，只记录到控制台
    if (process.env.NODE_ENV === 'development') {
      console.log('Funnel Step:', {
        step: funnelStep.step,
        stepIndex: funnelStep.stepIndex,
        success: funnelStep.success,
        timestamp: new Date(funnelStep.timestamp).toISOString(),
        metadata: funnelStep.metadata
      })
    }
    
    // 在生产环境中，这里可以发送到实际的分析服务
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics funnel error:', error)
    return NextResponse.json(
      { error: 'Failed to process funnel step' },
      { status: 500 }
    )
  }
}
