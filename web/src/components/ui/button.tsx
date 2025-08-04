'use client'

import React from 'react';
import { colors, spacing, borderRadius, shadows, typography, animations } from '../../styles/design-system';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  children,
  className = '',
  style = {},
  ...props
}) => {
  // 变体样式
  const getVariantStyles = () => {
    const styles = {
      primary: {
        background: colors.gradients.primary,
        color: colors.white,
        border: 'none',
        boxShadow: shadows.md,
      },
      secondary: {
        background: colors.gradients.glass,
        color: colors.gray[700],
        border: `1px solid ${colors.gray[200]}`,
        backdropFilter: 'blur(10px)',
      },
      success: {
        background: colors.gradients.success,
        color: colors.white,
        border: 'none',
      },
      warning: {
        background: colors.gradients.warning,
        color: colors.white,
        border: 'none',
      },
      error: {
        background: colors.gradients.error,
        color: colors.white,
        border: 'none',
      },
      ghost: {
        background: 'transparent',
        color: colors.gray[700],
        border: 'none',
      },
      outline: {
        background: 'transparent',
        color: colors.primary[600],
        border: `2px solid ${colors.primary[600]}`,
      },
    };
    return styles[variant];
  };

  // 尺寸样式
  const getSizeStyles = () => {
    const styles = {
      sm: {
        padding: `${spacing[2]} ${spacing[3]}`,
        fontSize: typography.fontSize.sm,
        borderRadius: borderRadius.md,
      },
      md: {
        padding: `${spacing[3]} ${spacing[4]}`,
        fontSize: typography.fontSize.base,
        borderRadius: borderRadius.lg,
      },
      lg: {
        padding: `${spacing[4]} ${spacing[6]}`,
        fontSize: typography.fontSize.lg,
        borderRadius: borderRadius.xl,
      },
      xl: {
        padding: `${spacing[5]} ${spacing[8]}`,
        fontSize: typography.fontSize.xl,
        borderRadius: borderRadius['2xl'],
      },
    };
    return styles[size];
  };

  // 基础样式
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    fontFamily: typography.fontFamily.sans.join(', '),
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.none,
    textDecoration: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: `all ${animations.duration[200]} ${animations.easing.inOut}`,
    outline: 'none',
    position: 'relative',
    overflow: 'hidden',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled || loading ? 0.6 : 1,
    ...getSizeStyles(),
    ...getVariantStyles(),
    ...style,
  };

  // 合并悬停样式到基础样式中
  const buttonStyles: React.CSSProperties = {
    ...baseStyles,
    ':hover': disabled || loading ? {} : {
      transform: 'translateY(-1px)',
      boxShadow: shadows.lg,
    },
    ':active': disabled || loading ? {} : {
      transform: 'translateY(0)',
    },
    ':focus': {
      boxShadow: shadows.focus,
    },
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .modern-button:hover:not(:disabled) {
            transform: translateY(-1px) !important;
            box-shadow: ${shadows.lg} !important;
          }
          .modern-button:active:not(:disabled) {
            transform: translateY(0) !important;
          }
          .modern-button:focus {
            box-shadow: ${shadows.focus} !important;
          }
        `
      }} />

      <button
        className={`modern-button ${className}`}
        style={baseStyles}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div style={{
            width: '1em',
            height: '1em',
            border: '2px solid transparent',
            borderTop: '2px solid currentColor',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
        )}

        {!loading && icon && iconPosition === 'left' && (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {icon}
          </span>
        )}

        {!loading && <span>{children}</span>}

        {!loading && icon && iconPosition === 'right' && (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {icon}
          </span>
        )}
      </button>
    </>
  );
};

export default Button;
