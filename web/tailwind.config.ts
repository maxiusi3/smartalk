import type { Config } from 'tailwindcss'
import { theme } from './src/lib/theme'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // SmarTalk 主题色彩
        primary: theme.colors.primary,
        accent: theme.colors.accent,
        neutral: theme.colors.neutral,
        success: theme.colors.success,
        
        // 兴趣主题色
        'travel-sky': theme.colors.interests.travel.sky,
        'travel-sunset': theme.colors.interests.travel.sunset,
        'movie-purple': theme.colors.interests.movie.purple,
        'movie-gold': theme.colors.interests.movie.gold,
        'workplace-blue': theme.colors.interests.workplace.blue,
        'workplace-silver': theme.colors.interests.workplace.silver,
      },
      
      fontFamily: {
        sans: theme.typography.fontFamily.sans,
        chinese: theme.typography.fontFamily.chinese,
      },
      
      fontSize: theme.typography.fontSize,
      fontWeight: theme.typography.fontWeight,
      
      spacing: {
        xs: theme.spacing.xs,
        sm: theme.spacing.sm,
        md: theme.spacing.md,
        lg: theme.spacing.lg,
        xl: theme.spacing.xl,
        '2xl': theme.spacing['2xl'],
        '3xl': theme.spacing['3xl'],
      },
      
      borderRadius: theme.borderRadius,
      
      boxShadow: theme.shadows,
      
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
          '40%, 43%': { transform: 'translate3d(0,-8px,0)' },
          '70%': { transform: 'translate3d(0,-4px,0)' },
          '90%': { transform: 'translate3d(0,-2px,0)' },
        },
      },
      
      transitionDuration: {
        fast: theme.animation.duration.fast,
        normal: theme.animation.duration.normal,
        slow: theme.animation.duration.slow,
      },
      
      transitionTimingFunction: {
        'ease': theme.animation.easing.ease,
        'ease-in': theme.animation.easing.easeIn,
        'ease-out': theme.animation.easing.easeOut,
        'ease-in-out': theme.animation.easing.easeInOut,
      },
    },
  },
  plugins: [],
}

export default config
