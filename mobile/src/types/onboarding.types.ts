// Onboarding流程相关类型定义

export interface OnboardingState {
  isCompleted: boolean;
  currentStep: OnboardingStep;
  selectedInterests: InterestType[];
  hasSkipped: boolean;
}

export type OnboardingStep =
  | 'splash'
  | 'pain-point'
  | 'method-intro'
  | 'carousel'
  | 'interest-selection'
  | 'completed';

export type InterestType = 'travel' | 'movies' | 'workplace';

export interface InterestOption {
  id: InterestType;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  gradient: string[];
  examples: string[];
}

export interface OnboardingPageData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  illustration: string;
  backgroundColor: string;
}

export interface SplashScreenProps {
  onComplete: () => void;
  onSkip?: () => void;
  autoAdvanceDelay?: number;
}

export interface OnboardingCarouselProps {
  onComplete: () => void;
  onSkip: () => void;
  pages: OnboardingPageData[];
}

export interface OnboardingPageProps {
  data: OnboardingPageData;
  isActive: boolean;
  index: number;
}

export interface PageIndicatorProps {
  totalPages: number;
  currentPage: number;
  activeColor?: string;
  inactiveColor?: string;
}

export interface InterestSelectionScreenProps {
  onComplete: (selectedInterests: InterestType[]) => void;
  onSkip: () => void;
  interests: InterestOption[];
  allowMultipleSelection?: boolean;
  minSelections?: number;
  maxSelections?: number;
}

export interface InterestCardProps {
  interest: InterestOption;
  isSelected: boolean;
  onSelect: (interest: InterestType) => void;
  disabled?: boolean;
}

export interface OnboardingNavigationProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
  showPrevious?: boolean;
  nextButtonText?: string;
  skipButtonText?: string;
  isLoading?: boolean;
}

// 动画相关类型
export interface AnimationConfig {
  duration: number;
  delay?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface SplashAnimationProps {
  onAnimationComplete?: () => void;
  config?: AnimationConfig;
}

export interface CarouselAnimationProps {
  direction: 'left' | 'right';
  onAnimationComplete?: () => void;
}

// 状态管理相关类型
export interface OnboardingActions {
  setOnboardingStep: (step: OnboardingStep) => void;
  setSelectedInterests: (interests: InterestType[]) => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
}

// API集成相关类型
export interface CreateUserWithInterestsRequest {
  deviceId: string;
  interests: InterestType[];
  onboardingCompleted: boolean;
}

// 新增组件类型定义
export interface PainPointScreenProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export interface MethodIntroCarouselProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export interface MethodIntroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  illustration: string;
  keyPoints: string[];
  backgroundColor: string;
}

export interface OnboardingAnalyticsEvent {
  eventType: 'onboarding_started' | 'onboarding_completed' | 'onboarding_skipped' | 'interest_selected' | 'pain_point_viewed' | 'method_intro_viewed';
  step?: OnboardingStep;
  selectedInterests?: InterestType[];
  timeSpent?: number;
  skipReason?: string;
}

// 本地存储相关类型
export interface OnboardingStorageData {
  isCompleted: boolean;
  completedAt?: string;
  selectedInterests: InterestType[];
  version: string; // 用于处理onboarding流程的版本更新
}

// 错误处理类型
export interface OnboardingError {
  code: 'NETWORK_ERROR' | 'API_ERROR' | 'STORAGE_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  details?: any;
  step?: OnboardingStep;
}

// 配置类型
export interface OnboardingConfig {
  splashDuration: number;
  enableSkip: boolean;
  requireInterestSelection: boolean;
  minInterestSelections: number;
  maxInterestSelections: number;
  enableAnalytics: boolean;
  autoAdvanceCarousel: boolean;
  carouselAutoAdvanceDelay: number;
}

// 主题和样式相关类型
export interface OnboardingTheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    textSecondary: string;
    accent: string;
    success: string;
    error: string;
  };
  fonts: {
    title: string;
    subtitle: string;
    body: string;
    caption: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

// 响应式设计类型
export interface ScreenDimensions {
  width: number;
  height: number;
  isTablet: boolean;
  isLandscape: boolean;
}

export interface ResponsiveStyles {
  phone: any;
  tablet: any;
  landscape: any;
}
