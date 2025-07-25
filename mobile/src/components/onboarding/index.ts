// Onboarding组件导出文件

export { default as OnboardingFlow } from './OnboardingFlow';
export { default as SplashScreen } from './SplashScreen';
export { default as PainPointScreen } from './PainPointScreen';
export { default as MethodIntroCarousel } from './MethodIntroCarousel';
export { default as OnboardingCarousel } from './OnboardingCarousel';
export { default as OnboardingPage } from './OnboardingPage';
export { default as PageIndicator } from './PageIndicator';
export { default as InterestSelectionScreen } from './InterestSelectionScreen';
export { default as InterestCard } from './InterestCard';

// 重新导出类型
export type {
  OnboardingState,
  OnboardingStep,
  InterestType,
  InterestOption,
  OnboardingPageData,
  SplashScreenProps,
  OnboardingCarouselProps,
  OnboardingPageProps,
  PageIndicatorProps,
  InterestSelectionScreenProps,
  InterestCardProps,
  OnboardingNavigationProps,
  OnboardingActions,
  OnboardingConfig,
  OnboardingError,
} from '@/types/onboarding.types';
