/**
 * 移动端适配 Hook
 * 提供响应式设计和移动端优化的 React Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { mobileUtils, DeviceInfo } from '../lib/mobileUtils';

export function useMobile() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    // 确保在客户端环境中运行
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenWidth: 1280,
        screenHeight: 720,
        orientation: 'landscape',
        touchSupported: false,
        devicePixelRatio: 1
      };
    }
    return mobileUtils.getDeviceInfo();
  });

  useEffect(() => {
    // 确保在客户端环境中运行
    if (typeof window === 'undefined') return;

    // 初始化设备信息
    setDeviceInfo(mobileUtils.getDeviceInfo());

    // 监听屏幕尺寸变化
    const cleanup = mobileUtils.onResize((newDeviceInfo) => {
      setDeviceInfo(newDeviceInfo);
    });

    return cleanup;
  }, []);

  // 获取响应式样式
  const getResponsiveStyles = useCallback((styles: {
    mobile?: React.CSSProperties;
    tablet?: React.CSSProperties;
    desktop?: React.CSSProperties;
    default?: React.CSSProperties;
  }) => {
    return mobileUtils.getResponsiveStyles(styles);
  }, []);

  // 获取响应式网格列数
  const getGridColumns = useCallback((options: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    default?: number;
  }) => {
    return mobileUtils.getGridColumns(options);
  }, []);

  // 获取响应式字体大小
  const getResponsiveFontSize = useCallback((baseFontSize: number) => {
    return mobileUtils.getResponsiveFontSize(baseFontSize);
  }, []);

  // 获取响应式间距
  const getResponsiveSpacing = useCallback((baseSpacing: number) => {
    return mobileUtils.getResponsiveSpacing(baseSpacing);
  }, []);

  return {
    // 设备信息
    ...deviceInfo,
    
    // 工具方法
    getResponsiveStyles,
    getGridColumns,
    getResponsiveFontSize,
    getResponsiveSpacing,
    
    // 便捷方法（添加客户端检查）
    getSafeAreaStyles: () => typeof window !== 'undefined' ? mobileUtils.getSafeAreaStyles() : {},
    getViewportHeight: () => typeof window !== 'undefined' ? mobileUtils.getViewportHeight() : '100vh',
    getTouchOptimizedStyles: () => typeof window !== 'undefined' ? mobileUtils.getTouchOptimizedStyles() : {},
    getMobileButtonStyles: (baseStyles?: React.CSSProperties) =>
      typeof window !== 'undefined' ? mobileUtils.getMobileButtonStyles(baseStyles) : baseStyles || {},
    getMobileInputStyles: (baseStyles?: React.CSSProperties) =>
      typeof window !== 'undefined' ? mobileUtils.getMobileInputStyles(baseStyles) : baseStyles || {},
    shouldShowMobileNavigation: () => typeof window !== 'undefined' ? mobileUtils.shouldShowMobileNavigation() : false,
    getContainerMaxWidth: () => typeof window !== 'undefined' ? mobileUtils.getContainerMaxWidth() : '1200px'
  };
}

/**
 * 响应式断点 Hook
 */
export function useBreakpoint() {
  const { screenWidth } = useMobile();

  return {
    isMobile: screenWidth < 768,
    isTablet: screenWidth >= 768 && screenWidth < 1024,
    isDesktop: screenWidth >= 1024,
    isLargeDesktop: screenWidth >= 1920,
    screenWidth
  };
}

/**
 * 触摸设备检测 Hook
 */
export function useTouch() {
  const { touchSupported } = useMobile();

  return {
    isTouch: touchSupported,
    getTouchStyles: () => touchSupported ? mobileUtils.getTouchOptimizedStyles() : {}
  };
}

/**
 * 屏幕方向 Hook
 */
export function useOrientation() {
  const { orientation, screenWidth, screenHeight } = useMobile();

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    aspectRatio: screenWidth / screenHeight
  };
}
