'use client'

import React from 'react';
import { colors, spacing, borderRadius, shadows, typography, animations } from '../../styles/design-system';

export interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  children: React.ReactNode;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const ModernCard: React.FC<ModernCardProps> = ({
  variant = 'default',
  padding = 'md',
  hover = false,
  children,
  className = '',
  style = {},
  ...props
}) => {
  // 变体样式
  const getVariantStyles = () => {
    const styles = {
      default: {
        background: colors.white,
        border: `1px solid ${colors.gray[200]}`,
        boxShadow: shadows.sm,
      },
      glass: {
        background: colors.gradients.glass,
        border: `1px solid ${colors.gray[200]}`,
        backdropFilter: 'blur(10px)',
        boxShadow: shadows.md,
      },
      elevated: {
        background: colors.white,
        border: 'none',
        boxShadow: shadows.lg,
      },
      outlined: {
        background: 'transparent',
        border: `2px solid ${colors.gray[300]}`,
        boxShadow: 'none',
      },
    };
    return styles[variant];
  };

  // 内边距样式
  const getPaddingStyles = () => {
    const styles = {
      none: { padding: '0' },
      sm: { padding: spacing[3] },
      md: { padding: spacing[4] },
      lg: { padding: spacing[6] },
      xl: { padding: spacing[8] },
    };
    return styles[padding];
  };

  const baseStyles: React.CSSProperties = {
    borderRadius: borderRadius.xl,
    transition: `all ${animations.duration[200]} ${animations.easing.inOut}`,
    position: 'relative',
    overflow: 'hidden',
    ...getVariantStyles(),
    ...getPaddingStyles(),
    ...style,
  };

  return (
    <>
      <style jsx>{`
        .modern-card:hover {
          transform: ${hover ? 'translateY(-2px)' : 'none'};
          box-shadow: ${hover ? shadows.xl : 'inherit'};
        }
      `}</style>
      
      <div
        className={`modern-card ${className}`}
        style={baseStyles}
        {...props}
      >
        {children}
      </div>
    </>
  );
};

const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  style = {},
  ...props
}) => {
  const headerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[2],
    marginBottom: spacing[4],
    ...style,
  };

  return (
    <div
      className={`card-header ${className}`}
      style={headerStyles}
      {...props}
    >
      {children}
    </div>
  );
};

const CardTitle: React.FC<CardTitleProps> = ({
  as: Component = 'h3',
  children,
  className = '',
  style = {},
  ...props
}) => {
  const titleStyles: React.CSSProperties = {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.tight,
    color: colors.gray[900],
    margin: 0,
    ...style,
  };

  return (
    <Component
      className={`card-title ${className}`}
      style={titleStyles}
      {...props}
    >
      {children}
    </Component>
  );
};

const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  className = '',
  style = {},
  ...props
}) => {
  const descriptionStyles: React.CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    lineHeight: typography.lineHeight.relaxed,
    margin: 0,
    ...style,
  };

  return (
    <p
      className={`card-description ${className}`}
      style={descriptionStyles}
      {...props}
    >
      {children}
    </p>
  );
};

const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
  style = {},
  ...props
}) => {
  const contentStyles: React.CSSProperties = {
    flex: 1,
    ...style,
  };

  return (
    <div
      className={`card-content ${className}`}
      style={contentStyles}
      {...props}
    >
      {children}
    </div>
  );
};

const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
  style = {},
  ...props
}) => {
  const footerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTop: `1px solid ${colors.gray[200]}`,
    ...style,
  };

  return (
    <div
      className={`card-footer ${className}`}
      style={footerStyles}
      {...props}
    >
      {children}
    </div>
  );
};

export { ModernCard, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
