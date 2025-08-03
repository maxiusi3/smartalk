/**
 * InternationalizationService - V2 国际化服务
 * 提供完整的多语言支持系统：语言切换、文本翻译、本地化适配
 * 支持动态语言包加载、RTL布局、区域化格式
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalyticsService } from './AnalyticsService';
import UserStateService from './UserStateService';
import AccessibilityService from './AccessibilityService';

// 支持的语言
export type SupportedLanguage = 
  | 'zh-CN'  // 简体中文
  | 'zh-TW'  // 繁体中文
  | 'en-US'  // 美式英语
  | 'en-GB'  // 英式英语
  | 'ja-JP'  // 日语
  | 'ko-KR'  // 韩语
  | 'es-ES'  // 西班牙语
  | 'fr-FR'  // 法语
  | 'de-DE'  // 德语
  | 'pt-BR'  // 巴西葡萄牙语
  | 'ru-RU'  // 俄语
  | 'ar-SA'; // 阿拉伯语

// 语言信息
export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean; // 是否从右到左
  region: string;
  currency: string;
  dateFormat: string;
  numberFormat: string;
  enabled: boolean; // 是否启用
  completeness: number; // 翻译完成度 0-100
}

// 翻译键值对
export interface TranslationKeys {
  // 通用
  common: {
    ok: string;
    cancel: string;
    confirm: string;
    delete: string;
    edit: string;
    save: string;
    loading: string;
    error: string;
    success: string;
    retry: string;
    back: string;
    next: string;
    previous: string;
    close: string;
    settings: string;
    help: string;
    about: string;
  };
  
  // 导航
  navigation: {
    home: string;
    learning: string;
    progress: string;
    profile: string;
    settings: string;
  };
  
  // 学习相关
  learning: {
    startLearning: string;
    continueStudy: string;
    contextGuessing: string;
    pronunciation: string;
    focusMode: string;
    rescueMode: string;
    completed: string;
    score: string;
    accuracy: string;
    fluency: string;
    completeness: string;
    prosody: string;
  };
  
  // 用户界面
  ui: {
    welcome: string;
    login: string;
    register: string;
    logout: string;
    profile: string;
    achievements: string;
    statistics: string;
    feedback: string;
    support: string;
  };
  
  // 错误消息
  errors: {
    networkError: string;
    serverError: string;
    authError: string;
    validationError: string;
    unknownError: string;
  };
  
  // 无障碍
  accessibility: {
    screenReaderEnabled: string;
    highContrastMode: string;
    largeTextMode: string;
    voiceControl: string;
    hapticFeedback: string;
  };
}

// 本地化配置
interface LocalizationConfig {
  language: SupportedLanguage;
  region: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  rtl: boolean;
  fallbackLanguage: SupportedLanguage;
}

// 翻译上下文
interface TranslationContext {
  count?: number;
  gender?: 'male' | 'female' | 'neutral';
  formality?: 'formal' | 'informal';
  context?: string;
}

class InternationalizationService {
  private static instance: InternationalizationService;
  private analyticsService = AnalyticsService.getInstance();
  private userStateService = UserStateService.getInstance();
  private accessibilityService = AccessibilityService.getInstance();
  
  // 当前语言设置
  private currentLanguage: SupportedLanguage = 'zh-CN';
  private currentConfig: LocalizationConfig | null = null;
  
  // 翻译缓存
  private translationCache: Map<SupportedLanguage, Partial<TranslationKeys>> = new Map();
  private loadingPromises: Map<SupportedLanguage, Promise<void>> = new Map();
  
  // 语言变化监听器
  private languageChangeListeners: ((language: SupportedLanguage) => void)[] = [];
  
  // 存储键
  private static readonly LANGUAGE_STORAGE_KEY = 'selected_language';
  private static readonly CONFIG_STORAGE_KEY = 'localization_config';

  static getInstance(): InternationalizationService {
    if (!InternationalizationService.instance) {
      InternationalizationService.instance = new InternationalizationService();
    }
    return InternationalizationService.instance;
  }

  constructor() {
    this.initializeService();
  }

  // ===== 初始化 =====

  /**
   * 初始化国际化服务
   */
  private async initializeService(): Promise<void> {
    try {
      // 加载保存的语言设置
      const savedLanguage = await AsyncStorage.getItem(InternationalizationService.LANGUAGE_STORAGE_KEY);
      const savedConfig = await AsyncStorage.getItem(InternationalizationService.CONFIG_STORAGE_KEY);
      
      if (savedLanguage && this.isSupportedLanguage(savedLanguage)) {
        this.currentLanguage = savedLanguage as SupportedLanguage;
      } else {
        // 检测系统语言
        this.currentLanguage = this.detectSystemLanguage();
      }
      
      if (savedConfig) {
        this.currentConfig = JSON.parse(savedConfig);
      } else {
        this.currentConfig = this.createDefaultConfig(this.currentLanguage);
      }
      
      // 加载当前语言的翻译
      await this.loadTranslations(this.currentLanguage);
      
      this.analyticsService.track('i18n_service_initialized', {
        language: this.currentLanguage,
        region: this.currentConfig.region,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error initializing internationalization service:', error);
      // 使用默认设置
      this.currentLanguage = 'zh-CN';
      this.currentConfig = this.createDefaultConfig(this.currentLanguage);
    }
  }

  /**
   * 检测系统语言
   */
  private detectSystemLanguage(): SupportedLanguage {
    // 在实际应用中，这里会检测设备的系统语言
    // 简化实现，返回中文
    return 'zh-CN';
  }

  /**
   * 创建默认配置
   */
  private createDefaultConfig(language: SupportedLanguage): LocalizationConfig {
    const languageInfo = this.getLanguageInfo(language);
    
    return {
      language,
      region: languageInfo.region,
      currency: languageInfo.currency,
      dateFormat: languageInfo.dateFormat,
      timeFormat: '24h',
      numberFormat: languageInfo.numberFormat,
      rtl: languageInfo.rtl,
      fallbackLanguage: 'en-US',
    };
  }

  // ===== 语言管理 =====

  /**
   * 获取支持的语言列表
   */
  getSupportedLanguages(): LanguageInfo[] {
    return [
      {
        code: 'zh-CN',
        name: 'Chinese (Simplified)',
        nativeName: '简体中文',
        flag: '🇨🇳',
        rtl: false,
        region: 'CN',
        currency: 'CNY',
        dateFormat: 'YYYY-MM-DD',
        numberFormat: '1,234.56',
        enabled: true,
        completeness: 100,
      },
      {
        code: 'zh-TW',
        name: 'Chinese (Traditional)',
        nativeName: '繁體中文',
        flag: '🇹🇼',
        rtl: false,
        region: 'TW',
        currency: 'TWD',
        dateFormat: 'YYYY-MM-DD',
        numberFormat: '1,234.56',
        enabled: true,
        completeness: 95,
      },
      {
        code: 'en-US',
        name: 'English (US)',
        nativeName: 'English (US)',
        flag: '🇺🇸',
        rtl: false,
        region: 'US',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        numberFormat: '1,234.56',
        enabled: true,
        completeness: 100,
      },
      {
        code: 'en-GB',
        name: 'English (UK)',
        nativeName: 'English (UK)',
        flag: '🇬🇧',
        rtl: false,
        region: 'GB',
        currency: 'GBP',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: '1,234.56',
        enabled: true,
        completeness: 90,
      },
      {
        code: 'ja-JP',
        name: 'Japanese',
        nativeName: '日本語',
        flag: '🇯🇵',
        rtl: false,
        region: 'JP',
        currency: 'JPY',
        dateFormat: 'YYYY/MM/DD',
        numberFormat: '1,234',
        enabled: false, // 未来支持
        completeness: 0,
      },
      {
        code: 'ko-KR',
        name: 'Korean',
        nativeName: '한국어',
        flag: '🇰🇷',
        rtl: false,
        region: 'KR',
        currency: 'KRW',
        dateFormat: 'YYYY-MM-DD',
        numberFormat: '1,234',
        enabled: false, // 未来支持
        completeness: 0,
      },
      {
        code: 'ar-SA',
        name: 'Arabic',
        nativeName: 'العربية',
        flag: '🇸🇦',
        rtl: true,
        region: 'SA',
        currency: 'SAR',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: '1٬234٫56',
        enabled: false, // 未来支持
        completeness: 0,
      },
    ];
  }

  /**
   * 获取语言信息
   */
  getLanguageInfo(language: SupportedLanguage): LanguageInfo {
    const languages = this.getSupportedLanguages();
    return languages.find(lang => lang.code === language) || languages[0];
  }

  /**
   * 切换语言
   */
  async changeLanguage(language: SupportedLanguage): Promise<void> {
    if (!this.isSupportedLanguage(language)) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const languageInfo = this.getLanguageInfo(language);
    if (!languageInfo.enabled) {
      throw new Error(`Language not enabled: ${language}`);
    }

    try {
      // 加载新语言的翻译
      await this.loadTranslations(language);
      
      // 更新当前语言
      const oldLanguage = this.currentLanguage;
      this.currentLanguage = language;
      
      // 更新配置
      this.currentConfig = this.createDefaultConfig(language);
      
      // 保存设置
      await Promise.all([
        AsyncStorage.setItem(InternationalizationService.LANGUAGE_STORAGE_KEY, language),
        AsyncStorage.setItem(InternationalizationService.CONFIG_STORAGE_KEY, JSON.stringify(this.currentConfig)),
      ]);
      
      // 通知监听器
      this.notifyLanguageChange(language);
      
      // 无障碍公告
      this.accessibilityService.announceForScreenReader(
        `语言已切换到${languageInfo.nativeName}`,
        'assertive'
      );
      
      this.analyticsService.track('language_changed', {
        oldLanguage,
        newLanguage: language,
        languageName: languageInfo.nativeName,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error changing language:', error);
      throw error;
    }
  }

  /**
   * 获取当前语言
   */
  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * 获取当前配置
   */
  getCurrentConfig(): LocalizationConfig | null {
    return this.currentConfig;
  }

  // ===== 翻译功能 =====

  /**
   * 翻译文本
   */
  translate(key: string, context?: TranslationContext): string {
    try {
      const translations = this.translationCache.get(this.currentLanguage);
      if (!translations) {
        return this.getFallbackTranslation(key, context);
      }
      
      const value = this.getNestedValue(translations, key);
      if (!value) {
        return this.getFallbackTranslation(key, context);
      }
      
      // 处理复数形式
      if (context?.count !== undefined && typeof value === 'object') {
        return this.handlePluralization(value, context.count);
      }
      
      // 处理变量替换
      if (typeof value === 'string' && context) {
        return this.replaceVariables(value, context);
      }
      
      return typeof value === 'string' ? value : key;
      
    } catch (error) {
      console.error('Error translating key:', key, error);
      return key;
    }
  }

  /**
   * 批量翻译
   */
  translateBatch(keys: string[], context?: TranslationContext): { [key: string]: string } {
    const result: { [key: string]: string } = {};
    
    keys.forEach(key => {
      result[key] = this.translate(key, context);
    });
    
    return result;
  }

  /**
   * 检查翻译是否存在
   */
  hasTranslation(key: string): boolean {
    const translations = this.translationCache.get(this.currentLanguage);
    if (!translations) return false;
    
    return !!this.getNestedValue(translations, key);
  }

  // ===== 本地化格式 =====

  /**
   * 格式化日期
   */
  formatDate(date: Date, format?: string): string {
    if (!this.currentConfig) return date.toLocaleDateString();
    
    const formatString = format || this.currentConfig.dateFormat;
    
    // 简化的日期格式化
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return formatString
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day);
  }

  /**
   * 格式化数字
   */
  formatNumber(number: number, options?: { decimals?: number; currency?: boolean }): string {
    if (!this.currentConfig) return number.toString();
    
    const decimals = options?.decimals ?? 2;
    const useCurrency = options?.currency ?? false;
    
    // 简化的数字格式化
    let formatted = number.toFixed(decimals);
    
    // 添加千位分隔符
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    formatted = parts.join('.');
    
    if (useCurrency && this.currentConfig.currency) {
      formatted = `${this.getCurrencySymbol()} ${formatted}`;
    }
    
    return formatted;
  }

  /**
   * 格式化货币
   */
  formatCurrency(amount: number): string {
    return this.formatNumber(amount, { currency: true });
  }

  /**
   * 获取货币符号
   */
  getCurrencySymbol(): string {
    if (!this.currentConfig) return '$';
    
    const currencySymbols: { [key: string]: string } = {
      'CNY': '¥',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'KRW': '₩',
    };
    
    return currencySymbols[this.currentConfig.currency] || this.currentConfig.currency;
  }

  // ===== RTL支持 =====

  /**
   * 检查是否为RTL语言
   */
  isRTL(): boolean {
    return this.currentConfig?.rtl || false;
  }

  /**
   * 获取文本方向
   */
  getTextDirection(): 'ltr' | 'rtl' {
    return this.isRTL() ? 'rtl' : 'ltr';
  }

  /**
   * 获取布局方向样式
   */
  getLayoutDirectionStyles() {
    if (!this.isRTL()) return {};
    
    return {
      flexDirection: 'row-reverse' as const,
      textAlign: 'right' as const,
      writingDirection: 'rtl' as const,
    };
  }

  // ===== 私有方法 =====

  private isSupportedLanguage(language: string): boolean {
    const supportedLanguages = this.getSupportedLanguages().map(lang => lang.code);
    return supportedLanguages.includes(language as SupportedLanguage);
  }

  private async loadTranslations(language: SupportedLanguage): Promise<void> {
    // 检查是否已经在加载
    if (this.loadingPromises.has(language)) {
      return this.loadingPromises.get(language);
    }
    
    // 检查缓存
    if (this.translationCache.has(language)) {
      return;
    }
    
    const loadingPromise = this.doLoadTranslations(language);
    this.loadingPromises.set(language, loadingPromise);
    
    try {
      await loadingPromise;
    } finally {
      this.loadingPromises.delete(language);
    }
  }

  private async doLoadTranslations(language: SupportedLanguage): Promise<void> {
    try {
      // 在实际应用中，这里会从服务器或本地文件加载翻译
      const translations = await this.getDefaultTranslations(language);
      this.translationCache.set(language, translations);
      
    } catch (error) {
      console.error('Error loading translations for', language, error);
      // 使用空翻译对象
      this.translationCache.set(language, {});
    }
  }

  private async getDefaultTranslations(language: SupportedLanguage): Promise<Partial<TranslationKeys>> {
    // 模拟异步加载
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 返回默认翻译（简化实现）
    if (language === 'zh-CN') {
      return {
        common: {
          ok: '确定',
          cancel: '取消',
          confirm: '确认',
          delete: '删除',
          edit: '编辑',
          save: '保存',
          loading: '加载中...',
          error: '错误',
          success: '成功',
          retry: '重试',
          back: '返回',
          next: '下一步',
          previous: '上一步',
          close: '关闭',
          settings: '设置',
          help: '帮助',
          about: '关于',
        },
        navigation: {
          home: '首页',
          learning: '学习',
          progress: '进度',
          profile: '个人',
          settings: '设置',
        },
        learning: {
          startLearning: '开始学习',
          continueStudy: '继续学习',
          contextGuessing: '情景猜义',
          pronunciation: '发音练习',
          focusMode: '专注模式',
          rescueMode: '救援模式',
          completed: '已完成',
          score: '分数',
          accuracy: '准确度',
          fluency: '流利度',
          completeness: '完整度',
          prosody: '韵律',
        },
      };
    } else if (language === 'en-US') {
      return {
        common: {
          ok: 'OK',
          cancel: 'Cancel',
          confirm: 'Confirm',
          delete: 'Delete',
          edit: 'Edit',
          save: 'Save',
          loading: 'Loading...',
          error: 'Error',
          success: 'Success',
          retry: 'Retry',
          back: 'Back',
          next: 'Next',
          previous: 'Previous',
          close: 'Close',
          settings: 'Settings',
          help: 'Help',
          about: 'About',
        },
        navigation: {
          home: 'Home',
          learning: 'Learning',
          progress: 'Progress',
          profile: 'Profile',
          settings: 'Settings',
        },
        learning: {
          startLearning: 'Start Learning',
          continueStudy: 'Continue Study',
          contextGuessing: 'Context Guessing',
          pronunciation: 'Pronunciation',
          focusMode: 'Focus Mode',
          rescueMode: 'Rescue Mode',
          completed: 'Completed',
          score: 'Score',
          accuracy: 'Accuracy',
          fluency: 'Fluency',
          completeness: 'Completeness',
          prosody: 'Prosody',
        },
      };
    }
    
    return {};
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private getFallbackTranslation(key: string, context?: TranslationContext): string {
    // 尝试使用回退语言
    if (this.currentConfig?.fallbackLanguage && this.currentConfig.fallbackLanguage !== this.currentLanguage) {
      const fallbackTranslations = this.translationCache.get(this.currentConfig.fallbackLanguage);
      if (fallbackTranslations) {
        const value = this.getNestedValue(fallbackTranslations, key);
        if (value && typeof value === 'string') {
          return value;
        }
      }
    }
    
    // 返回键名作为最后的回退
    return key;
  }

  private handlePluralization(value: any, count: number): string {
    // 简化的复数处理
    if (typeof value === 'object' && value.one && value.other) {
      return count === 1 ? value.one : value.other;
    }
    return String(value);
  }

  private replaceVariables(text: string, context: TranslationContext): string {
    let result = text;
    
    if (context.count !== undefined) {
      result = result.replace(/\{\{count\}\}/g, String(context.count));
    }
    
    return result;
  }

  private notifyLanguageChange(language: SupportedLanguage): void {
    this.languageChangeListeners.forEach(listener => {
      try {
        listener(language);
      } catch (error) {
        console.error('Error in language change listener:', error);
      }
    });
  }

  // ===== 公共API =====

  /**
   * 添加语言变化监听器
   */
  addLanguageChangeListener(listener: (language: SupportedLanguage) => void): void {
    this.languageChangeListeners.push(listener);
  }

  /**
   * 移除语言变化监听器
   */
  removeLanguageChangeListener(listener: (language: SupportedLanguage) => void): void {
    const index = this.languageChangeListeners.indexOf(listener);
    if (index > -1) {
      this.languageChangeListeners.splice(index, 1);
    }
  }

  /**
   * 预加载语言包
   */
  async preloadLanguage(language: SupportedLanguage): Promise<void> {
    await this.loadTranslations(language);
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.translationCache.clear();
    this.loadingPromises.clear();
  }

  /**
   * 获取翻译完成度
   */
  getTranslationCompleteness(language: SupportedLanguage): number {
    const languageInfo = this.getLanguageInfo(language);
    return languageInfo.completeness;
  }
}

export default InternationalizationService;
