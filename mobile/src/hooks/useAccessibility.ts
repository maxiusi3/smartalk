/**
 * useAccessibility - V2 无障碍功能Hook
 * 提供组件级别的无障碍功能支持
 * 自动处理屏幕阅读器、高对比度、字体缩放等功能
 */

import { useEffect, useCallback, useState } from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import AccessibilityService, { AccessibilityConfig } from '@/services/AccessibilityService';
import { useUserState } from '@/contexts/UserStateContext';

interface AccessibilityHelpers {
  // 公告功能
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  announcePageChange: (pageName: string, description?: string) => void;
  announceButtonAction: (buttonName: string, action: string) => void;
  announceProgressUpdate: (current: number, total: number, context: string) => void;
  
  // 样式辅助
  getHighContrastStyles: () => ViewStyle;
  getFontSizeMultiplier: () => number;
  getColorBlindnessColor: (originalColor: string) => string;
  getExtendedTouchTargetStyles: () => ViewStyle;
  getFocusIndicatorStyles: () => ViewStyle;
  
  // 状态检查
  shouldReduceMotion: () => boolean;
  isScreenReaderEnabled: () => boolean;
  isHighContrastEnabled: () => boolean;
  isLargeTextEnabled: () => boolean;
  
  // 语音控制
  handleVoiceCommand: (command: string) => string | null;
  getAvailableVoiceCommands: () => any[];
  
  // 反馈系统
  provideHapticFeedback: (type: 'success' | 'warning' | 'error') => void;
  provideVisualFeedback: (message: string) => void;
}

interface AccessibilityState {
  config: AccessibilityConfig | null;
  isLoading: boolean;
  systemStatus: {
    screenReaderEnabled: boolean;
    reduceMotionEnabled: boolean;
    systemFontScale: number;
  };
}

/**
 * 无障碍功能Hook
 */
export const useAccessibility = () => {
  const { userProgress } = useUserState();
  const [accessibilityState, setAccessibilityState] = useState<AccessibilityState>({
    config: null,
    isLoading: true,
    systemStatus: {
      screenReaderEnabled: false,
      reduceMotionEnabled: false,
      systemFontScale: 1.0,
    },
  });

  const accessibilityService = AccessibilityService.getInstance();

  // 加载无障碍配置
  useEffect(() => {
    const loadConfig = async () => {
      if (!userProgress?.userId) return;
      
      try {
        setAccessibilityState(prev => ({ ...prev, isLoading: true }));
        
        const [config, systemStatus] = await Promise.all([
          accessibilityService.loadAccessibilityConfig(userProgress.userId),
          accessibilityService.getSystemAccessibilityStatus(),
        ]);
        
        setAccessibilityState({
          config,
          isLoading: false,
          systemStatus,
        });
        
      } catch (error) {
        console.error('Error loading accessibility config:', error);
        setAccessibilityState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadConfig();
  }, [userProgress?.userId]);

  // 无障碍辅助函数
  const helpers: AccessibilityHelpers = {
    // 公告功能
    announce: useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
      accessibilityService.announceForScreenReader(message, priority);
    }, []),

    announcePageChange: useCallback((pageName: string, description?: string) => {
      accessibilityService.announcePageChange(pageName, description);
    }, []),

    announceButtonAction: useCallback((buttonName: string, action: string) => {
      accessibilityService.announceButtonAction(buttonName, action);
    }, []),

    announceProgressUpdate: useCallback((current: number, total: number, context: string) => {
      accessibilityService.announceProgressUpdate(current, total, context);
    }, []),

    // 样式辅助
    getHighContrastStyles: useCallback(() => {
      return accessibilityService.getHighContrastStyles();
    }, []),

    getFontSizeMultiplier: useCallback(() => {
      return accessibilityService.getFontSizeMultiplier();
    }, []),

    getColorBlindnessColor: useCallback((originalColor: string) => {
      return accessibilityService.getColorBlindnessStyles(originalColor);
    }, []),

    getExtendedTouchTargetStyles: useCallback(() => {
      return accessibilityService.getExtendedTouchTargetStyles();
    }, []),

    getFocusIndicatorStyles: useCallback(() => {
      return accessibilityService.getFocusIndicatorStyles();
    }, []),

    // 状态检查
    shouldReduceMotion: useCallback(() => {
      return accessibilityService.shouldReduceMotion();
    }, []),

    isScreenReaderEnabled: useCallback(() => {
      return accessibilityState.config?.screenReaderEnabled || accessibilityState.systemStatus.screenReaderEnabled;
    }, [accessibilityState]),

    isHighContrastEnabled: useCallback(() => {
      return accessibilityState.config?.highContrastMode || false;
    }, [accessibilityState]),

    isLargeTextEnabled: useCallback(() => {
      return accessibilityState.config?.largeTextMode || (accessibilityState.config?.fontSizeMultiplier || 1.0) > 1.0;
    }, [accessibilityState]),

    // 语音控制
    handleVoiceCommand: useCallback((command: string) => {
      return accessibilityService.handleVoiceCommand(command);
    }, []),

    getAvailableVoiceCommands: useCallback(() => {
      return accessibilityService.getAvailableVoiceCommands();
    }, []),

    // 反馈系统
    provideHapticFeedback: useCallback((type: 'success' | 'warning' | 'error') => {
      if (!accessibilityState.config?.hapticFeedback) return;
      
      // 在实际应用中，这里会触发不同类型的触觉反馈
      console.log(`Haptic feedback: ${type}`);
    }, [accessibilityState]),

    provideVisualFeedback: useCallback((message: string) => {
      if (!accessibilityState.config?.visualIndicators) return;
      
      // 在实际应用中，这里会显示视觉反馈
      console.log(`Visual feedback: ${message}`);
    }, [accessibilityState]),
  };

  return {
    // 状态
    config: accessibilityState.config,
    isLoading: accessibilityState.isLoading,
    systemStatus: accessibilityState.systemStatus,
    
    // 辅助函数
    ...helpers,
  };
};

/**
 * 无障碍样式Hook
 */
export const useAccessibilityStyles = () => {
  const { config } = useAccessibility();
  
  const getAccessibleTextStyle = useCallback((baseStyle: TextStyle = {}): TextStyle => {
    if (!config) return baseStyle;
    
    let accessibleStyle: TextStyle = { ...baseStyle };
    
    // 字体大小调整
    if (config.fontSizeMultiplier > 1.0) {
      accessibleStyle.fontSize = (baseStyle.fontSize || 16) * config.fontSizeMultiplier;
      accessibleStyle.lineHeight = (baseStyle.lineHeight || 24) * config.fontSizeMultiplier;
    }
    
    // 高对比度调整
    if (config.highContrastMode) {
      accessibleStyle.color = '#FFFFFF';
    }
    
    return accessibleStyle;
  }, [config]);
  
  const getAccessibleViewStyle = useCallback((baseStyle: ViewStyle = {}): ViewStyle => {
    if (!config) return baseStyle;
    
    let accessibleStyle: ViewStyle = { ...baseStyle };
    
    // 高对比度背景
    if (config.highContrastMode) {
      accessibleStyle.backgroundColor = '#000000';
      accessibleStyle.borderColor = '#FFFFFF';
    }
    
    // 扩展触摸目标
    if (config.extendedTouchTargets) {
      accessibleStyle.minWidth = Math.max(accessibleStyle.minWidth as number || 0, 48);
      accessibleStyle.minHeight = Math.max(accessibleStyle.minHeight as number || 0, 48);
      accessibleStyle.padding = Math.max(accessibleStyle.padding as number || 0, 12);
    }
    
    return accessibleStyle;
  }, [config]);
  
  const getAccessibleButtonStyle = useCallback((baseStyle: ViewStyle = {}, isPressed: boolean = false): ViewStyle => {
    if (!config) return baseStyle;
    
    let buttonStyle = getAccessibleViewStyle(baseStyle);
    
    // 焦点指示器
    if (config.focusIndicators && isPressed) {
      buttonStyle = {
        ...buttonStyle,
        borderWidth: 2,
        borderColor: '#3b82f6',
        borderStyle: 'solid',
      };
    }
    
    return buttonStyle;
  }, [config, getAccessibleViewStyle]);
  
  return {
    getAccessibleTextStyle,
    getAccessibleViewStyle,
    getAccessibleButtonStyle,
  };
};

/**
 * 屏幕阅读器专用Hook
 */
export const useScreenReader = () => {
  const { announce, announcePageChange, announceButtonAction, announceProgressUpdate, isScreenReaderEnabled } = useAccessibility();
  
  const announceWithDelay = useCallback((message: string, delay: number = 500) => {
    if (!isScreenReaderEnabled()) return;
    
    setTimeout(() => {
      announce(message);
    }, delay);
  }, [announce, isScreenReaderEnabled]);
  
  const announceList = useCallback((items: string[], context: string) => {
    if (!isScreenReaderEnabled()) return;
    
    const message = `${context}，共${items.length}项：${items.join('，')}`;
    announce(message);
  }, [announce, isScreenReaderEnabled]);
  
  const announceError = useCallback((error: string) => {
    if (!isScreenReaderEnabled()) return;
    
    announce(`错误：${error}`, 'assertive');
  }, [announce, isScreenReaderEnabled]);
  
  const announceSuccess = useCallback((message: string) => {
    if (!isScreenReaderEnabled()) return;
    
    announce(`成功：${message}`, 'assertive');
  }, [announce, isScreenReaderEnabled]);
  
  return {
    announce,
    announcePageChange,
    announceButtonAction,
    announceProgressUpdate,
    announceWithDelay,
    announceList,
    announceError,
    announceSuccess,
    isEnabled: isScreenReaderEnabled,
  };
};

/**
 * 语音控制Hook
 */
export const useVoiceControl = () => {
  const { handleVoiceCommand, getAvailableVoiceCommands, config } = useAccessibility();
  const [isListening, setIsListening] = useState(false);
  
  const startListening = useCallback(() => {
    if (!config?.voiceCommandsEnabled) return;
    
    setIsListening(true);
    // 在实际应用中，这里会启动语音识别
    console.log('Voice control listening started');
  }, [config]);
  
  const stopListening = useCallback(() => {
    setIsListening(false);
    // 在实际应用中，这里会停止语音识别
    console.log('Voice control listening stopped');
  }, []);
  
  const processVoiceInput = useCallback((input: string) => {
    if (!config?.voiceCommandsEnabled) return null;
    
    return handleVoiceCommand(input);
  }, [config, handleVoiceCommand]);
  
  return {
    isListening,
    startListening,
    stopListening,
    processVoiceInput,
    availableCommands: getAvailableVoiceCommands(),
    isEnabled: config?.voiceCommandsEnabled || false,
  };
};

export default useAccessibility;
