import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { OnboardingCarouselProps } from '@/types/onboarding.types';
import { ONBOARDING_TEXTS, ONBOARDING_STYLES } from '@/constants/onboarding';
import OnboardingPage from './OnboardingPage';
import PageIndicator from './PageIndicator';

const { width } = Dimensions.get('window');

/**
 * OnboardingCarousel组件
 * 展示产品特性和学习方法的轮播组件
 */
const OnboardingCarousel: React.FC<OnboardingCarouselProps> = ({
  onComplete,
  onSkip,
  pages,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  /**
   * 处理页面滚动
   */
  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / width);
    setCurrentPage(pageIndex);
  };

  /**
   * 跳转到下一页
   */
  const goToNextPage = () => {
    if (currentPage < pages.length - 1) {
      const nextPage = currentPage + 1;
      scrollViewRef.current?.scrollTo({
        x: nextPage * width,
        animated: true,
      });
      setCurrentPage(nextPage);
    } else {
      onComplete();
    }
  };

  /**
   * 跳转到上一页
   */
  const goToPreviousPage = () => {
    if (currentPage > 0) {
      const prevPage = currentPage - 1;
      scrollViewRef.current?.scrollTo({
        x: prevPage * width,
        animated: true,
      });
      setCurrentPage(prevPage);
    }
  };

  /**
   * 跳转到指定页面
   */
  const goToPage = (pageIndex: number) => {
    scrollViewRef.current?.scrollTo({
      x: pageIndex * width,
      animated: true,
    });
    setCurrentPage(pageIndex);
  };

  const isLastPage = currentPage === pages.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* 跳过按钮 */}
      <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
        <Text style={styles.skipText}>{ONBOARDING_TEXTS.carousel.skip}</Text>
      </TouchableOpacity>

      {/* 页面内容 */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {pages.map((page, index) => (
          <OnboardingPage
            key={page.id}
            data={page}
            isActive={index === currentPage}
            index={index}
          />
        ))}
      </ScrollView>

      {/* 底部控制区域 */}
      <View style={styles.bottomContainer}>
        {/* 页面指示器 */}
        <PageIndicator
          totalPages={pages.length}
          currentPage={currentPage}
          onPagePress={goToPage}
        />

        {/* 导航按钮 */}
        <View style={styles.navigationContainer}>
          {/* 返回按钮 */}
          {currentPage > 0 && (
            <TouchableOpacity
              style={[styles.navButton, styles.backButton]}
              onPress={goToPreviousPage}
            >
              <Text style={styles.backButtonText}>{ONBOARDING_TEXTS.common.back}</Text>
            </TouchableOpacity>
          )}

          {/* 下一步/开始体验按钮 */}
          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={goToNextPage}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.nextButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.nextButtonText}>
                {isLastPage ? ONBOARDING_TEXTS.carousel.getStarted : ONBOARDING_TEXTS.carousel.next}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ONBOARDING_STYLES.colors.background,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: ONBOARDING_STYLES.borderRadius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  skipText: {
    color: ONBOARDING_STYLES.colors.textSecondary,
    fontSize: ONBOARDING_STYLES.fonts.caption.fontSize,
    fontWeight: ONBOARDING_STYLES.fonts.caption.fontWeight,
  },
  scrollView: {
    flex: 1,
  },
  bottomContainer: {
    paddingHorizontal: ONBOARDING_STYLES.spacing.lg,
    paddingBottom: 50,
    paddingTop: ONBOARDING_STYLES.spacing.lg,
    backgroundColor: ONBOARDING_STYLES.colors.background,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: ONBOARDING_STYLES.spacing.lg,
  },
  navButton: {
    paddingHorizontal: ONBOARDING_STYLES.spacing.lg,
    paddingVertical: ONBOARDING_STYLES.spacing.md,
    borderRadius: ONBOARDING_STYLES.borderRadius.lg,
    minWidth: 100,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: ONBOARDING_STYLES.colors.border,
  },
  backButtonText: {
    color: ONBOARDING_STYLES.colors.textSecondary,
    fontSize: ONBOARDING_STYLES.fonts.button.fontSize,
    fontWeight: ONBOARDING_STYLES.fonts.button.fontWeight,
  },
  nextButton: {
    flex: 1,
    marginLeft: ONBOARDING_STYLES.spacing.md,
    ...ONBOARDING_STYLES.shadows.small,
  },
  nextButtonGradient: {
    paddingHorizontal: ONBOARDING_STYLES.spacing.lg,
    paddingVertical: ONBOARDING_STYLES.spacing.md,
    borderRadius: ONBOARDING_STYLES.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: ONBOARDING_STYLES.colors.textLight,
    fontSize: ONBOARDING_STYLES.fonts.button.fontSize,
    fontWeight: ONBOARDING_STYLES.fonts.button.fontWeight,
  },
});

export default OnboardingCarousel;
