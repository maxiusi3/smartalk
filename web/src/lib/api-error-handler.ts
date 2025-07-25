import { NextRequest, NextResponse } from 'next/server'

// API错误类型定义
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// 常见错误类型
export const API_ERRORS = {
  VALIDATION_ERROR: { code: 'VALIDATION_ERROR', statusCode: 400 },
  UNAUTHORIZED: { code: 'UNAUTHORIZED', statusCode: 401 },
  FORBIDDEN: { code: 'FORBIDDEN', statusCode: 403 },
  NOT_FOUND: { code: 'NOT_FOUND', statusCode: 404 },
  RATE_LIMIT: { code: 'RATE_LIMIT', statusCode: 429 },
  INTERNAL_ERROR: { code: 'INTERNAL_ERROR', statusCode: 500 },
  SERVICE_UNAVAILABLE: { code: 'SERVICE_UNAVAILABLE', statusCode: 503 }
} as const

// API错误处理中间件
export function withErrorHandler(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(req)
    } catch (error) {
      console.error('API Error:', error)

      // 如果是自定义API错误
      if (error instanceof APIError) {
        return NextResponse.json(
          {
            error: {
              message: error.message,
              code: error.code,
              details: error.details
            }
          },
          { status: error.statusCode }
        )
      }

      // 处理验证错误
      if (error instanceof Error && error.name === 'ValidationError') {
        return NextResponse.json(
          {
            error: {
              message: '请求数据验证失败',
              code: 'VALIDATION_ERROR',
              details: error.message
            }
          },
          { status: 400 }
        )
      }

      // 处理JSON解析错误
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        return NextResponse.json(
          {
            error: {
              message: '请求数据格式错误',
              code: 'INVALID_JSON'
            }
          },
          { status: 400 }
        )
      }

      // 默认内部服务器错误
      return NextResponse.json(
        {
          error: {
            message: '服务器内部错误',
            code: 'INTERNAL_ERROR',
            ...(process.env.NODE_ENV === 'development' && {
              details: error instanceof Error ? error.message : String(error)
            })
          }
        },
        { status: 500 }
      )
    }
  }
}

// 请求验证辅助函数
export async function validateRequest(req: NextRequest, schema?: any) {
  try {
    const body = await req.json()
    
    // 如果提供了schema，进行验证
    if (schema) {
      // 这里可以集成像 Zod 这样的验证库
      // const result = schema.parse(body)
      // return result
    }
    
    return body
  } catch (error) {
    throw new APIError('请求数据格式错误', 400, 'INVALID_REQUEST_BODY')
  }
}

// 响应格式化辅助函数
export function createSuccessResponse(data: any, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    message
  })
}

export function createErrorResponse(
  message: string, 
  statusCode: number = 500, 
  code?: string, 
  details?: any
) {
  return NextResponse.json(
    {
      error: {
        message,
        code,
        details
      }
    },
    { status: statusCode }
  )
}

// 速率限制辅助函数
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 100, 
  windowMs: number = 60000
): boolean {
  const now = Date.now()
  const windowStart = now - windowMs
  
  const current = rateLimitMap.get(identifier)
  
  if (!current || current.resetTime < windowStart) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now })
    return true
  }
  
  if (current.count >= maxRequests) {
    return false
  }
  
  current.count++
  return true
}

// 清理过期的速率限制记录
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < now - 60000) {
      rateLimitMap.delete(key)
    }
  }
}, 60000)

// 获取客户端IP地址
export function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

// 日志记录辅助函数
export function logAPIRequest(req: NextRequest, response?: NextResponse, error?: Error) {
  const timestamp = new Date().toISOString()
  const method = req.method
  const url = req.url
  const ip = getClientIP(req)
  const userAgent = req.headers.get('user-agent') || 'unknown'
  
  const logData = {
    timestamp,
    method,
    url,
    ip,
    userAgent,
    status: response?.status,
    error: error?.message
  }
  
  if (error) {
    console.error('API Request Error:', logData)
  } else {
    console.log('API Request:', logData)
  }
}
