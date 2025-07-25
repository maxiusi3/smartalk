'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // 这里可以将错误信息发送到错误报告服务
    if (typeof window !== 'undefined') {
      // 发送错误到分析服务
      try {
        // 可以集成错误跟踪服务，如 Sentry
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack
        })
      } catch (reportError) {
        console.error('Failed to report error:', reportError)
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 默认错误UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="max-w-md mx-auto text-center p-6">
            <div className="text-6xl mb-4">😵</div>
            <h1 className="text-2xl font-bold text-neutral-800 mb-4">
              哎呀，出了点问题
            </h1>
            <p className="text-neutral-600 mb-6">
              应用遇到了一个意外错误。请尝试刷新页面，或者联系我们的技术支持。
            </p>
            
            <div className="space-y-4">
              <Button 
                onClick={this.handleReset}
                className="w-full"
              >
                重试
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full"
              >
                刷新页面
              </Button>
            </div>

            {/* 开发环境下显示错误详情 */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-neutral-500 hover:text-neutral-700">
                  错误详情 (仅开发环境显示)
                </summary>
                <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded text-xs">
                  <div className="font-mono text-red-800">
                    <div className="font-bold">错误信息:</div>
                    <div className="mb-2">{this.state.error.message}</div>
                    
                    <div className="font-bold">错误堆栈:</div>
                    <pre className="whitespace-pre-wrap text-xs">
                      {this.state.error.stack}
                    </pre>
                    
                    {this.state.errorInfo && (
                      <>
                        <div className="font-bold mt-2">组件堆栈:</div>
                        <pre className="whitespace-pre-wrap text-xs">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </>
                    )}
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

// 函数式错误边界Hook (React 18+)
export function useErrorHandler() {
  return (error: Error, errorInfo: ErrorInfo) => {
    console.error('Unhandled error:', error, errorInfo)
    
    // 这里可以发送错误到分析服务
    if (typeof window !== 'undefined') {
      try {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      } catch (reportError) {
        console.error('Failed to report error:', reportError)
      }
    }
  }
}

// 简化的错误边界组件，用于特定场景
export function SimpleErrorBoundary({ 
  children, 
  message = "出现了一个错误" 
}: { 
  children: ReactNode
  message?: string 
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-neutral-600">{message}</p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}
