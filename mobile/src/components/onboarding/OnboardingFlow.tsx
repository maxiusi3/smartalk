import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { useAppStore } from '@/store/useAppStore';
import { ApiService } from '@/services/ApiService';
import { InterestType } from '@/types/onboarding.types';
import { ONBOARDING_PAGES, INTEREST_OPTIONS } from '@/constants/onboarding';
import SplashScreen from './SplashScreen';
import PainPointScreen from './PainPointScreen';
import MethodIntroCarousel from './MethodIntroCarousel';
import OnboardingCarousel from './OnboardingCarousel';
import InterestSelectionScreen from './InterestSelectionScreen';

interface OnboardingFlowProps {
  onComplete: () => void;
}

/**
 * OnboardingFlow组件
 * 管理整个onboarding流程的主控制器
 */
const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const {
    onboarding,
    setOnboardingStep,
    setSelectedInterests,
    completeOnboarding,
    skipOnboarding,
    setUser,
    deviceId,
    setDeviceId,
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 初始化设备ID
    initializeDeviceId();
  }, []);

  /**
   * 初始化设备ID
   */
  const initializeDeviceId = async () => {
    try {
      if (!deviceId) {
        const id = await DeviceInfo.getUniqueId();
        setDeviceId(id);
      }
    } catch (error) {
      console.error('Failed to get device ID:', error);
    }
  };

  /**
   * 处理SplashScreen完成
   */
  const handleSplashComplete = () => {
    setOnboardingStep('pain-point');
  };

  /**
   * 处理PainPointScreen完成
   */
  const handlePainPointComplete = () => {
    setOnboardingStep('method-intro');
  };

  /**
   * 处理MethodIntroCarousel完成
   */
  const handleMethodIntroComplete = () => {
    setOnboardingStep('carousel');
  };

  /**
   * 处理OnboardingCarousel完成
   */
  const handleCarouselComplete = () => {
    setOnboardingStep('interest-selection');
  };

  /**
   * 处理兴趣选择完成
   */
  const handleInterestSelectionComplete = async (selectedInterests: InterestType[]) => {
    setIsLoading(true);
    try {
      // 保存选择的兴趣
      setSelectedInterests(selectedInterests);

      // 创建匿名用户
      if (deviceId) {
        const response = await ApiService.createAnonymousUser({
          deviceId,
        });

        if (response.success && response.data) {
          setUser(response.data.user);
        }
      }

      // 完成onboarding
      completeOnboarding();
      onComplete();
    } catch (error) {
      console.error('Onboarding completion error:', error);
      Alert.alert(
        '创建用户失败',
        '网络连接异常，请检查网络后重试',
        [
          { text: '重试', onPress: () => handleInterestSelectionComplete(selectedInterests) },
          { text: '跳过', onPress: handleSkipOnboarding },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 处理跳过onboarding
   */
  const handleSkipOnboarding = async () => {
    setIsLoading(true);
    try {
      // 尝试创建匿名用户（即使跳过也需要用户身份）
      if (deviceId) {
        try {
          const response = await ApiService.createAnonymousUser({
            deviceId,
          });

          if (response.success && response.data) {
            setUser(response.data.user);
          }
        } catch (error) {
          console.warn('Failed to create user during skip:', error);
          // 跳过时如果创建用户失败，不阻止流程继续
        }
      }

      skipOnboarding();
      onComplete();
    } catch (error) {
      console.error('Skip onboarding error:', error);
      // 即使出错也要完成跳过流程
      skipOnboarding();
      onComplete();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 处理从carousel跳过
   */
  const handleCarouselSkip = () => {
    Alert.alert(
      '跳过引导',
      '确定要跳过产品介绍吗？您可以直接开始使用应用',
      [
        { text: '取消', style: 'cancel' },
        { text: '确认跳过', onPress: handleSkipOnboarding },
      ]
    );
  };

  /**
   * 处理从兴趣选择跳过
   */
  const handleInterestSelectionSkip = () => {
    handleSkipOnboarding();
  };

  // 根据当前步骤渲染对应组件
  const renderCurrentStep = () => {
    switch (onboarding.currentStep) {
      case 'splash':
        return (
          <SplashScreen
            onComplete={handleSplashComplete}
            autoAdvanceDelay={2500}
          />
        );

      case 'pain-point':
        return (
          <PainPointScreen
            onComplete={handlePainPointComplete}
            onSkip={handleSkipOnboarding}
          />
        );

      case 'method-intro':
        return (
          <MethodIntroCarousel
            onComplete={handleMethodIntroComplete}
            onSkip={handleSkipOnboarding}
          />
        );

      case 'carousel':
        return (
          <OnboardingCarousel
            pages={ONBOARDING_PAGES}
            onComplete={handleCarouselComplete}
            onSkip={handleCarouselSkip}
          />
        );

      case 'interest-selection':
        return (
          <InterestSelectionScreen
            interests={INTEREST_OPTIONS}
            onComplete={handleInterestSelectionComplete}
            onSkip={handleInterestSelectionSkip}
            allowMultipleSelection={true}
            minSelections={1}
            maxSelections={3}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderCurrentStep()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default OnboardingFlow;
