import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { PageIndicatorProps } from '@/types/onboarding.types';
import { ONBOARDING_STYLES, ANIMATION_CONFIG } from '@/constants/onboarding';

/**
 * PageIndicator组件
 * 显示当前页面位置的指示器
 */
const PageIndicator: React.FC<PageIndicatorProps> = ({
  totalPages,
  currentPage,
  activeColor = ONBOARDING_STYLES.colors.primary,
  inactiveColor = ONBOARDING_STYLES.colors.border,
  onPagePress,
}) => {
  const animatedValues = useRef(
    Array.from({ length: totalPages }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // 更新指示器动画
    animatedValues.forEach((animValue, index) => {
      Animated.timing(animValue, {
        toValue: index === currentPage ? 1 : 0,
        duration: ANIMATION_CONFIG.transition.duration,
        useNativeDriver: false,
      }).start();
    });
  }, [currentPage, animatedValues]);

  /**
   * 处理指示器点击
   */
  const handlePress = (index: number) => {
    if (onPagePress) {
      onPagePress(index);
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: totalPages }, (_, index) => {
        const animatedValue = animatedValues[index];
        
        return (
          <TouchableOpacity
            key={index}
            style={styles.indicatorContainer}
            onPress={() => handlePress(index)}
            activeOpacity={0.7}
          >
            <Animated.View
              style={[
                styles.indicator,
                {
                  backgroundColor: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [inactiveColor, activeColor],
                  }),
                  transform: [
                    {
                      scaleX: animatedValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 2],
                      }),
                    },
                  ],
                },
              ]}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorContainer: {
    paddingHorizontal: ONBOARDING_STYLES.spacing.xs,
    paddingVertical: ONBOARDING_STYLES.spacing.sm,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default PageIndicator;
