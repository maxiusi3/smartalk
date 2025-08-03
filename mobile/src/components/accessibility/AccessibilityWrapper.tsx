import React, { useEffect, useRef, ReactNode } from 'react';
import { View, ViewStyle, AccessibilityRole, AccessibilityState } from 'react-native';
import AccessibilityService from '@/services/AccessibilityService';

interface AccessibilityWrapperProps {
  children: ReactNode;
  
  // 基础无障碍属性
  accessible?: boolean;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: AccessibilityState;
  
  // 自动公告
  announceOnMount?: string;
  announceOnFocus?: string;
  
  // 样式增强
  applyHighContrast?: boolean;
  applyLargeText?: boolean;
  applyExtendedTouchTarget?: boolean;
  applyFocusIndicator?: boolean;
  
  // 动画控制
  respectReduceMotion?: boolean;
  
  // 自定义样式
  style?: ViewStyle;
  highContrastStyle?: ViewStyle;
  largeTextStyle?: ViewStyle;
  extendedTouchStyle?: ViewStyle;
  focusStyle?: ViewStyle;
  
  // 事件处理
  onAccessibilityFocus?: () => void;
  onAccessibilityBlur?: () => void;
  onAccessibilityTap?: () => void;
}

/**
 * AccessibilityWrapper - V2 无障碍包装组件
 * 为任何组件提供完整的无障碍支持
 * 自动应用用户的无障碍偏好设置
 */
const AccessibilityWrapper: React.FC<AccessibilityWrapperProps> = ({
  children,
  accessible = true,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  announceOnMount,
  announceOnFocus,
  applyHighContrast = false,
  applyLargeText = false,
  applyExtendedTouchTarget = false,
  applyFocusIndicator = false,
  respectReduceMotion = false,
  style,
  highContrastStyle,
  largeTextStyle,
  extendedTouchStyle,
  focusStyle,
  onAccessibilityFocus,
  onAccessibilityBlur,
  onAccessibilityTap,
}) => {
  const accessibilityService = AccessibilityService.getInstance();
  const viewRef = useRef<View>(null);
  const hasFocus = useRef<boolean>(false);

  useEffect(() => {
    // 组件挂载时的公告
    if (announceOnMount) {
      accessibilityService.announceForScreenReader(announceOnMount, 'polite');
    }
  }, [announceOnMount]);

  // 获取应用的样式
  const getAppliedStyles = (): ViewStyle => {
    const config = accessibilityService.getAccessibilityConfig();
    if (!config) return style || {};

    let appliedStyles: ViewStyle = { ...style };

    // 高对比度样式
    if (applyHighContrast && config.highContrastMode) {
      appliedStyles = {
        ...appliedStyles,
        ...accessibilityService.getHighContrastStyles(),
        ...highContrastStyle,
      };
    }

    // 大字体样式
    if (applyLargeText && (config.largeTextMode || config.fontSizeMultiplier > 1.0)) {
      const fontMultiplier = config.fontSizeMultiplier;
      appliedStyles = {
        ...appliedStyles,
        fontSize: (appliedStyles.fontSize as number || 16) * fontMultiplier,
        lineHeight: (appliedStyles.lineHeight as number || 24) * fontMultiplier,
        ...largeTextStyle,
      };
    }

    // 扩展触摸目标样式
    if (applyExtendedTouchTarget && config.extendedTouchTargets) {
      appliedStyles = {
        ...appliedStyles,
        ...accessibilityService.getExtendedTouchTargetStyles(),
        ...extendedTouchStyle,
      };
    }

    // 焦点指示器样式
    if (applyFocusIndicator && config.focusIndicators && hasFocus.current) {
      appliedStyles = {
        ...appliedStyles,
        ...accessibilityService.getFocusIndicatorStyles(),
        ...focusStyle,
      };
    }

    return appliedStyles;
  };

  // 处理无障碍焦点事件
  const handleAccessibilityFocus = () => {
    hasFocus.current = true;
    
    if (announceOnFocus) {
      accessibilityService.announceForScreenReader(announceOnFocus, 'polite');
    }
    
    onAccessibilityFocus?.();
    
    // 强制重新渲染以应用焦点样式
    if (applyFocusIndicator) {
      // 触发重新渲染的逻辑
    }
  };

  const handleAccessibilityBlur = () => {
    hasFocus.current = false;
    onAccessibilityBlur?.();
    
    // 强制重新渲染以移除焦点样式
    if (applyFocusIndicator) {
      // 触发重新渲染的逻辑
    }
  };

  const handleAccessibilityTap = () => {
    onAccessibilityTap?.();
  };

  // 检查是否应该减少动画
  const shouldReduceMotion = (): boolean => {
    if (!respectReduceMotion) return false;
    return accessibilityService.shouldReduceMotion();
  };

  return (
    <View
      ref={viewRef}
      style={getAppliedStyles()}
      accessible={accessible}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={accessibilityState}
      onAccessibilityFocus={handleAccessibilityFocus}
      onAccessibilityEscape={handleAccessibilityBlur}
      onAccessibilityTap={handleAccessibilityTap}
    >
      {children}
    </View>
  );
};

export default AccessibilityWrapper;
