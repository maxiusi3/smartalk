/**
 * useInternationalization - V2 国际化Hook
 * 提供组件级别的国际化功能
 * 自动处理语言切换、文本翻译、本地化格式
 */

import { useEffect, useCallback, useState } from 'react';
import InternationalizationService, { 
  SupportedLanguage, 
  LanguageInfo, 
  TranslationKeys 
} from '@/services/InternationalizationService';
import { useUserState } from '@/contexts/UserStateContext';

interface InternationalizationState {
  currentLanguage: SupportedLanguage;
  supportedLanguages: LanguageInfo[];
  isRTL: boolean;
  loading: boolean;
  error: string | null;
}

interface TranslationContext {
  count?: number;
  gender?: 'male' | 'female' | 'neutral';
  formality?: 'formal' | 'informal';
  context?: string;
}

/**
 * 国际化Hook
 */
export const useInternationalization = () => {
  const { userProgress } = useUserState();
  const [state, setState] = useState<InternationalizationState>({
    currentLanguage: 'zh-CN',
    supportedLanguages: [],
    isRTL: false,
    loading: false,
    error: null,
  });

  const i18nService = InternationalizationService.getInstance();

  // 初始化
  useEffect(() => {
    const initializeI18n = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const currentLanguage = i18nService.getCurrentLanguage();
        const supportedLanguages = i18nService.getSupportedLanguages();
        const isRTL = i18nService.isRTL();
        
        setState(prev => ({
          ...prev,
          currentLanguage,
          supportedLanguages,
          isRTL,
          loading: false,
        }));
        
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message || '初始化国际化服务失败',
        }));
      }
    };

    initializeI18n();
  }, []);

  // 监听语言变化
  useEffect(() => {
    const handleLanguageChange = (language: SupportedLanguage) => {
      setState(prev => ({
        ...prev,
        currentLanguage: language,
        isRTL: i18nService.isRTL(),
      }));
    };

    i18nService.addLanguageChangeListener(handleLanguageChange);

    return () => {
      i18nService.removeLanguageChangeListener(handleLanguageChange);
    };
  }, []);

  // 切换语言
  const changeLanguage = useCallback(async (language: SupportedLanguage) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      await i18nService.changeLanguage(language);
      
      setState(prev => ({
        ...prev,
        currentLanguage: language,
        isRTL: i18nService.isRTL(),
        loading: false,
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || '切换语言失败',
      }));
      throw error;
    }
  }, []);

  // 翻译文本
  const translate = useCallback((key: string, context?: TranslationContext): string => {
    return i18nService.translate(key, context);
  }, []);

  // 批量翻译
  const translateBatch = useCallback((keys: string[], context?: TranslationContext) => {
    return i18nService.translateBatch(keys, context);
  }, []);

  // 格式化日期
  const formatDate = useCallback((date: Date, format?: string): string => {
    return i18nService.formatDate(date, format);
  }, []);

  // 格式化数字
  const formatNumber = useCallback((number: number, options?: { decimals?: number; currency?: boolean }): string => {
    return i18nService.formatNumber(number, options);
  }, []);

  // 格式化货币
  const formatCurrency = useCallback((amount: number): string => {
    return i18nService.formatCurrency(amount);
  }, []);

  // 获取布局方向样式
  const getLayoutDirectionStyles = useCallback(() => {
    return i18nService.getLayoutDirectionStyles();
  }, []);

  // 预加载语言包
  const preloadLanguage = useCallback(async (language: SupportedLanguage) => {
    try {
      await i18nService.preloadLanguage(language);
    } catch (error) {
      console.error('Error preloading language:', error);
    }
  }, []);

  return {
    // 状态
    ...state,
    
    // 方法
    changeLanguage,
    translate,
    translateBatch,
    formatDate,
    formatNumber,
    formatCurrency,
    getLayoutDirectionStyles,
    preloadLanguage,
    
    // 便捷属性
    t: translate, // 简短别名
    currentLanguageInfo: state.supportedLanguages.find(lang => lang.code === state.currentLanguage),
    textDirection: state.isRTL ? 'rtl' : 'ltr',
    
    // 检查方法
    hasTranslation: i18nService.hasTranslation.bind(i18nService),
    getTranslationCompleteness: i18nService.getTranslationCompleteness.bind(i18nService),
  };
};

/**
 * 翻译Hook - 简化版本
 */
export const useTranslation = () => {
  const { translate, currentLanguage, isRTL } = useInternationalization();
  
  return {
    t: translate,
    language: currentLanguage,
    isRTL,
  };
};

/**
 * 本地化格式Hook
 */
export const useLocalization = () => {
  const i18nService = InternationalizationService.getInstance();
  
  const formatDate = useCallback((date: Date, format?: string): string => {
    return i18nService.formatDate(date, format);
  }, []);

  const formatNumber = useCallback((number: number, options?: { decimals?: number; currency?: boolean }): string => {
    return i18nService.formatNumber(number, options);
  }, []);

  const formatCurrency = useCallback((amount: number): string => {
    return i18nService.formatCurrency(amount);
  }, []);

  const formatPercentage = useCallback((value: number, decimals: number = 1): string => {
    return `${(value * 100).toFixed(decimals)}%`;
  }, []);

  const formatDuration = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  }, []);

  return {
    formatDate,
    formatNumber,
    formatCurrency,
    formatPercentage,
    formatDuration,
  };
};

/**
 * RTL布局Hook
 */
export const useRTL = () => {
  const { isRTL, getLayoutDirectionStyles } = useInternationalization();
  
  const getFlexDirection = useCallback((direction: 'row' | 'column' = 'row') => {
    if (direction === 'column') return 'column';
    return isRTL ? 'row-reverse' : 'row';
  }, [isRTL]);

  const getTextAlign = useCallback((align: 'left' | 'center' | 'right' = 'left') => {
    if (align === 'center') return 'center';
    if (align === 'left') return isRTL ? 'right' : 'left';
    if (align === 'right') return isRTL ? 'left' : 'right';
    return align;
  }, [isRTL]);

  const getMarginDirection = useCallback((side: 'left' | 'right') => {
    if (side === 'left') return isRTL ? 'marginRight' : 'marginLeft';
    if (side === 'right') return isRTL ? 'marginLeft' : 'marginRight';
    return side;
  }, [isRTL]);

  const getPaddingDirection = useCallback((side: 'left' | 'right') => {
    if (side === 'left') return isRTL ? 'paddingRight' : 'paddingLeft';
    if (side === 'right') return isRTL ? 'paddingLeft' : 'paddingRight';
    return side;
  }, [isRTL]);

  return {
    isRTL,
    textDirection: isRTL ? 'rtl' : 'ltr',
    getLayoutDirectionStyles,
    getFlexDirection,
    getTextAlign,
    getMarginDirection,
    getPaddingDirection,
  };
};

/**
 * 语言选择Hook
 */
export const useLanguageSelector = () => {
  const { supportedLanguages, currentLanguage, changeLanguage, loading } = useInternationalization();
  
  const enabledLanguages = supportedLanguages.filter(lang => lang.enabled);
  
  const selectLanguage = useCallback(async (language: SupportedLanguage) => {
    try {
      await changeLanguage(language);
    } catch (error) {
      console.error('Error selecting language:', error);
      throw error;
    }
  }, [changeLanguage]);

  const getLanguageProgress = useCallback((language: SupportedLanguage) => {
    const languageInfo = supportedLanguages.find(lang => lang.code === language);
    return languageInfo?.completeness || 0;
  }, [supportedLanguages]);

  return {
    availableLanguages: enabledLanguages,
    currentLanguage,
    selectLanguage,
    getLanguageProgress,
    isChanging: loading,
  };
};

/**
 * 翻译键类型安全Hook
 */
export const useTypedTranslation = () => {
  const { translate } = useInternationalization();
  
  // 类型安全的翻译方法
  const t = useCallback(<K extends keyof TranslationKeys>(
    section: K,
    key: keyof TranslationKeys[K],
    context?: TranslationContext
  ): string => {
    return translate(`${String(section)}.${String(key)}`, context);
  }, [translate]);

  // 常用翻译的便捷方法
  const common = useCallback((key: keyof TranslationKeys['common'], context?: TranslationContext) => {
    return t('common', key, context);
  }, [t]);

  const navigation = useCallback((key: keyof TranslationKeys['navigation'], context?: TranslationContext) => {
    return t('navigation', key, context);
  }, [t]);

  const learning = useCallback((key: keyof TranslationKeys['learning'], context?: TranslationContext) => {
    return t('learning', key, context);
  }, [t]);

  const ui = useCallback((key: keyof TranslationKeys['ui'], context?: TranslationContext) => {
    return t('ui', key, context);
  }, [t]);

  const errors = useCallback((key: keyof TranslationKeys['errors'], context?: TranslationContext) => {
    return t('errors', key, context);
  }, [t]);

  const accessibility = useCallback((key: keyof TranslationKeys['accessibility'], context?: TranslationContext) => {
    return t('accessibility', key, context);
  }, [t]);

  return {
    t,
    common,
    navigation,
    learning,
    ui,
    errors,
    accessibility,
  };
};

export default useInternationalization;
