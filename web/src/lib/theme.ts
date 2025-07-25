// SmarTalk 设计系统主题配置
// 基于 SmarTalk_UI_UX_设计规范文档.md

export const theme = {
  colors: {
    // 主色调
    primary: {
      50: '#f0f4ff',
      100: '#e0e9ff',
      200: '#c7d6fe',
      300: '#a5b8fc',
      400: '#8b93f8',
      500: '#7c6df2', // 深蓝色主色
      600: '#6d4de6',
      700: '#5d3dcb',
      800: '#4c32a3',
      900: '#1a237e', // 设计规范中的深蓝色
    },
    
    // 暖橙色
    accent: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#ff6b35', // 设计规范中的暖橙色
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },
    
    // 柔和白
    neutral: {
      50: '#fafafa', // 设计规范中的柔和白
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#757575', // 设计规范中的中性灰
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    
    // 成功绿
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#4caf50', // 设计规范中的成功绿
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    
    // 兴趣主题色
    interests: {
      travel: {
        sky: '#87ceeb',    // 天空蓝
        sunset: '#ff6b35', // 日落橙
      },
      movie: {
        purple: '#6a5acd', // 深紫
        gold: '#ffd700',   // 金色
      },
      workplace: {
        blue: '#4682b4',   // 商务蓝
        silver: '#c0c0c0', // 银色
      }
    }
  },
  
  typography: {
    fontFamily: {
      // Web安全字体替代方案
      sans: [
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'Arial',
        'Noto Sans',
        'sans-serif',
        'Apple Color Emoji',
        'Segoe UI Emoji',
        'Segoe UI Symbol',
        'Noto Color Emoji'
      ],
      chinese: [
        'PingFang SC',
        'Hiragino Sans GB',
        'Microsoft YaHei',
        'WenQuanYi Micro Hei',
        'sans-serif'
      ]
    },
    
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    },
    
    fontWeight: {
      normal: '400',    // Regular
      medium: '500',    // Medium (标题)
      semibold: '600',
      bold: '700',
    }
  },
  
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '0.75rem',  // 12px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
  },
  
  borderRadius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  
  animation: {
    // 情感化设计动画配置
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    }
  }
}

export type Theme = typeof theme
