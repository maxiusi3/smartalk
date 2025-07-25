import { OnboardingPageData, InterestOption, OnboardingConfig } from '@/types/onboarding.types';

// Onboarding配置
export const ONBOARDING_CONFIG: OnboardingConfig = {
  splashDuration: 2500, // 2.5秒
  enableSkip: true,
  requireInterestSelection: true,
  minInterestSelections: 1,
  maxInterestSelections: 3,
  enableAnalytics: true,
  autoAdvanceCarousel: false,
  carouselAutoAdvanceDelay: 5000,
};

// Onboarding页面数据
export const ONBOARDING_PAGES: OnboardingPageData[] = [
  {
    id: 'real-context',
    title: '在真实场景中探索',
    subtitle: '沉浸式英语体验',
    description: '通过经典影视剧，在自然语境中发现英语的魅力，告别死记硬背的传统方式',
    illustration: '🎬',
    backgroundColor: '#667eea',
  },
  {
    id: 'personalized',
    title: '为你量身定制',
    subtitle: '个性化故事内容',
    description: '根据你的兴趣爱好，AI智能推荐最适合的故事内容，让探索变得有趣',
    illustration: '🎯',
    backgroundColor: '#764ba2',
  },
  {
    id: 'smart-memory',
    title: '智能线索发现',
    subtitle: 'AI辅助探索',
    description: 'AI识别关键线索，在语境中自然记忆，探索效果事半功倍',
    illustration: '🧠',
    backgroundColor: '#f093fb',
  },
];

// 兴趣选项数据
export const INTEREST_OPTIONS: InterestOption[] = [
  {
    id: 'travel',
    title: '旅行探索',
    subtitle: '环游世界',
    description: '机场对话、酒店入住、景点介绍，让你的旅行更加自信',
    icon: '✈️',
    color: '#4facfe',
    gradient: ['#4facfe', '#00f2fe'],
    examples: [
      '机场办理登机手续',
      '酒店前台沟通',
      '问路和导航',
      '餐厅点餐对话',
      '购物砍价技巧'
    ],
  },
  {
    id: 'movies',
    title: '影视娱乐',
    subtitle: '文化内涵',
    description: '经典对白、情感表达、文化内涵，感受英语的魅力',
    icon: '🎭',
    color: '#a8edea',
    gradient: ['#a8edea', '#fed6e3'],
    examples: [
      '经典电影对白',
      '情感表达方式',
      '幽默和笑话',
      '文化背景知识',
      '日常生活场景'
    ],
  },
  {
    id: 'workplace',
    title: '职场商务',
    subtitle: '专业提升',
    description: '会议讨论、邮件沟通、商务谈判，提升职场竞争力',
    icon: '💼',
    color: '#ffecd2',
    gradient: ['#ffecd2', '#fcb69f'],
    examples: [
      '商务会议发言',
      '邮件写作技巧',
      '电话会议沟通',
      '项目汇报演示',
      '团队协作交流'
    ],
  },
];

// 文案常量
export const ONBOARDING_TEXTS = {
  splash: {
    title: 'SmarTalk',
    subtitle: '在追剧中发现英语',
    description: '告别死记硬背，让探索变成一种享受',
  },
  carousel: {
    skip: '跳过',
    next: '下一步',
    getStarted: '开始体验',
  },
  interestSelection: {
    title: '选择你感兴趣的主题',
    subtitle: '我们将为你推荐相关的故事内容',
    selectHint: '请至少选择一个主题',
    continue: '继续',
    skip: '稍后设置',
  },
  common: {
    loading: '加载中...',
    error: '出现错误，请重试',
    retry: '重试',
    back: '返回',
    next: '下一步',
    skip: '跳过',
    done: '完成',
  },
};

// 动画配置
export const ANIMATION_CONFIG = {
  splash: {
    duration: 1000,
    delay: 500,
    easing: 'ease-out' as const,
  },
  carousel: {
    duration: 300,
    easing: 'ease-in-out' as const,
  },
  card: {
    duration: 200,
    easing: 'ease-out' as const,
  },
  transition: {
    duration: 250,
    easing: 'ease-in-out' as const,
  },
};

// 样式常量
export const ONBOARDING_STYLES = {
  colors: {
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#f093fb',
    background: '#ffffff',
    backgroundDark: '#1a1a1a',
    text: '#333333',
    textSecondary: '#666666',
    textLight: '#ffffff',
    border: '#e0e0e0',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
  },
  fonts: {
    title: {
      fontSize: 28,
      fontWeight: 'bold' as const,
      lineHeight: 36,
    },
    subtitle: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal' as const,
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: 'normal' as const,
      lineHeight: 20,
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

// 响应式断点
export const BREAKPOINTS = {
  phone: 0,
  tablet: 768,
  desktop: 1024,
};

// 设备类型检测
export const getDeviceType = (width: number) => {
  if (width >= BREAKPOINTS.tablet) {
    return 'tablet';
  }
  return 'phone';
};

// 屏幕方向检测
export const getOrientation = (width: number, height: number) => {
  return width > height ? 'landscape' : 'portrait';
};
