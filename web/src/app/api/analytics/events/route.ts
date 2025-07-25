import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler, validateRequest, createSuccessResponse, APIError, checkRateLimit, getClientIP } from '@/lib/api-error-handler'

async function handlePOST(request: NextRequest) {
  // 速率限制检查
  const clientIP = getClientIP(request)
  if (!checkRateLimit(`analytics_events_${clientIP}`, 100, 60000)) {
    throw new APIError('请求过于频繁，请稍后再试', 429, 'RATE_LIMIT_EXCEEDED')
  }

  // 验证请求数据
  const event = await validateRequest(request)

  // 基本数据验证
  if (!event.eventName || !event.eventType) {
    throw new APIError('缺少必需的事件数据', 400, 'MISSING_REQUIRED_FIELDS')
  }

  // 在开发环境中，只记录到控制台
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics Event:', {
      eventName: event.eventName,
      eventType: event.eventType,
      timestamp: new Date(event.timestamp).toISOString(),
      userId: event.userId,
      sessionId: event.sessionId,
      properties: event.properties
    })
  }

  // 在生产环境中，这里可以发送到实际的分析服务
  // 例如：Google Analytics, Mixpanel, 自定义数据库等

  return createSuccessResponse({ eventId: `evt_${Date.now()}` }, '事件记录成功')
}

export const POST = withErrorHandler(handlePOST)
