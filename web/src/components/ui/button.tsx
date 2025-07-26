'use client'

import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
    const getButtonStyles = () => {
      const baseStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '0.5rem',
        fontWeight: '500',
        cursor: 'pointer',
        border: 'none',
        transition: 'all 0.2s'
      }

      const sizeStyles = {
        sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
        md: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
        lg: { padding: '1rem 2rem', fontSize: '1.125rem' }
      }

      const variantStyles = {
        primary: { background: '#2563eb', color: 'white' },
        secondary: { background: '#f3f4f6', color: '#1f2937' },
        outline: { background: 'transparent', color: '#374151', border: '1px solid #d1d5db' },
        ghost: { background: 'transparent', color: '#374151' }
      }

      return {
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant]
      }
    }

    return (
      <button
        style={getButtonStyles()}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
export type { ButtonProps }
