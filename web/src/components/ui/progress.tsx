'use client'

import React from 'react'

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
  showLabel?: boolean
  animated?: boolean
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className = '', 
    value, 
    max = 100, 
    size = 'md', 
    variant = 'default',
    showLabel = false,
    animated = false,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    const sizeStyles = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4'
    }
    
    const variantStyles = {
      default: 'bg-blue-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500'
    }
    
    return (
      <div className="w-full">
        {showLabel && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">进度</span>
            <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
          </div>
        )}
        <div
          ref={ref}
          className={`
            w-full bg-gray-200 rounded-full overflow-hidden
            ${sizeStyles[size]}
            ${className}
          `}
          {...props}
        >
          <div
            className={`
              h-full rounded-full transition-all duration-300 ease-out
              ${variantStyles[variant]}
              ${animated ? 'animate-pulse' : ''}
            `}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)

Progress.displayName = 'Progress'

export { Progress }
export type { ProgressProps }
