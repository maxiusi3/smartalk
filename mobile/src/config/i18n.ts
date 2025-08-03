/**
 * i18n.ts - V2 国际化配置文件
 * 定义支持的语言、默认翻译和配置选项
 */

import { SupportedLanguage, TranslationKeys } from '@/services/InternationalizationService';

// 默认语言
export const DEFAULT_LANGUAGE: SupportedLanguage = 'zh-CN';

// 回退语言
export const FALLBACK_LANGUAGE: SupportedLanguage = 'en-US';

// 支持的语言代码
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  'zh-CN',
  'zh-TW', 
  'en-US',
  'en-GB',
  'ja-JP',
  'ko-KR',
  'es-ES',
  'fr-FR',
  'de-DE',
  'pt-BR',
  'ru-RU',
  'ar-SA',
];

// 完整的中文翻译
export const CHINESE_TRANSLATIONS: TranslationKeys = {
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
  ui: {
    welcome: '欢迎',
    login: '登录',
    register: '注册',
    logout: '退出登录',
    profile: '个人资料',
    achievements: '成就',
    statistics: '统计',
    feedback: '反馈',
    support: '支持',
  },
  errors: {
    networkError: '网络连接错误，请检查网络设置',
    serverError: '服务器错误，请稍后重试',
    authError: '身份验证失败，请重新登录',
    validationError: '输入信息有误，请检查后重试',
    unknownError: '未知错误，请联系客服',
  },
  accessibility: {
    screenReaderEnabled: '屏幕阅读器已启用',
    highContrastMode: '高对比度模式',
    largeTextMode: '大字体模式',
    voiceControl: '语音控制',
    hapticFeedback: '触觉反馈',
  },
};

// 完整的英文翻译
export const ENGLISH_TRANSLATIONS: TranslationKeys = {
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
  ui: {
    welcome: 'Welcome',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    profile: 'Profile',
    achievements: 'Achievements',
    statistics: 'Statistics',
    feedback: 'Feedback',
    support: 'Support',
  },
  errors: {
    networkError: 'Network connection error, please check your network settings',
    serverError: 'Server error, please try again later',
    authError: 'Authentication failed, please login again',
    validationError: 'Invalid input, please check and try again',
    unknownError: 'Unknown error, please contact support',
  },
  accessibility: {
    screenReaderEnabled: 'Screen Reader Enabled',
    highContrastMode: 'High Contrast Mode',
    largeTextMode: 'Large Text Mode',
    voiceControl: 'Voice Control',
    hapticFeedback: 'Haptic Feedback',
  },
};

// 繁体中文翻译
export const TRADITIONAL_CHINESE_TRANSLATIONS: Partial<TranslationKeys> = {
  common: {
    ok: '確定',
    cancel: '取消',
    confirm: '確認',
    delete: '刪除',
    edit: '編輯',
    save: '儲存',
    loading: '載入中...',
    error: '錯誤',
    success: '成功',
    retry: '重試',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    close: '關閉',
    settings: '設定',
    help: '說明',
    about: '關於',
  },
  navigation: {
    home: '首頁',
    learning: '學習',
    progress: '進度',
    profile: '個人',
    settings: '設定',
  },
  learning: {
    startLearning: '開始學習',
    continueStudy: '繼續學習',
    contextGuessing: '情景猜義',
    pronunciation: '發音練習',
    focusMode: '專注模式',
    rescueMode: '救援模式',
    completed: '已完成',
    score: '分數',
    accuracy: '準確度',
    fluency: '流利度',
    completeness: '完整度',
    prosody: '韻律',
  },
};

// 英式英语翻译（部分差异）
export const BRITISH_ENGLISH_TRANSLATIONS: Partial<TranslationKeys> = {
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
  // 其他部分与美式英语相同，这里只展示差异部分
};

// 翻译映射
export const TRANSLATION_MAP: { [key in SupportedLanguage]?: Partial<TranslationKeys> } = {
  'zh-CN': CHINESE_TRANSLATIONS,
  'zh-TW': TRADITIONAL_CHINESE_TRANSLATIONS,
  'en-US': ENGLISH_TRANSLATIONS,
  'en-GB': BRITISH_ENGLISH_TRANSLATIONS,
  // 其他语言的翻译将在未来添加
};

// 语言特定配置
export const LANGUAGE_CONFIGS = {
  'zh-CN': {
    dateFormat: 'YYYY年MM月DD日',
    timeFormat: 'HH:mm',
    numberFormat: '1,234.56',
    currency: 'CNY',
    currencySymbol: '¥',
    rtl: false,
  },
  'zh-TW': {
    dateFormat: 'YYYY年MM月DD日',
    timeFormat: 'HH:mm',
    numberFormat: '1,234.56',
    currency: 'TWD',
    currencySymbol: 'NT$',
    rtl: false,
  },
  'en-US': {
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'h:mm A',
    numberFormat: '1,234.56',
    currency: 'USD',
    currencySymbol: '$',
    rtl: false,
  },
  'en-GB': {
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    numberFormat: '1,234.56',
    currency: 'GBP',
    currencySymbol: '£',
    rtl: false,
  },
  'ja-JP': {
    dateFormat: 'YYYY年MM月DD日',
    timeFormat: 'HH:mm',
    numberFormat: '1,234',
    currency: 'JPY',
    currencySymbol: '¥',
    rtl: false,
  },
  'ko-KR': {
    dateFormat: 'YYYY년 MM월 DD일',
    timeFormat: 'HH:mm',
    numberFormat: '1,234',
    currency: 'KRW',
    currencySymbol: '₩',
    rtl: false,
  },
  'ar-SA': {
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    numberFormat: '1٬234٫56',
    currency: 'SAR',
    currencySymbol: 'ر.س',
    rtl: true,
  },
} as const;

// 语言检测正则表达式
export const LANGUAGE_DETECTION_PATTERNS = {
  'zh-CN': /[\u4e00-\u9fff]/,
  'zh-TW': /[\u4e00-\u9fff]/,
  'en-US': /^[a-zA-Z\s.,!?'"()-]+$/,
  'en-GB': /^[a-zA-Z\s.,!?'"()-]+$/,
  'ja-JP': /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]/,
  'ko-KR': /[\uac00-\ud7af]/,
  'ar-SA': /[\u0600-\u06ff]/,
};

// 复数规则
export const PLURALIZATION_RULES = {
  'zh-CN': (count: number) => 'other', // 中文没有复数形式
  'zh-TW': (count: number) => 'other', // 繁体中文没有复数形式
  'en-US': (count: number) => count === 1 ? 'one' : 'other',
  'en-GB': (count: number) => count === 1 ? 'one' : 'other',
  'ja-JP': (count: number) => 'other', // 日语没有复数形式
  'ko-KR': (count: number) => 'other', // 韩语没有复数形式
  'ar-SA': (count: number) => {
    // 阿拉伯语复数规则较复杂，这里简化处理
    if (count === 0) return 'zero';
    if (count === 1) return 'one';
    if (count === 2) return 'two';
    if (count >= 3 && count <= 10) return 'few';
    if (count >= 11 && count <= 99) return 'many';
    return 'other';
  },
};

// 文本方向配置
export const TEXT_DIRECTION_CONFIG = {
  RTL_LANGUAGES: ['ar-SA'] as SupportedLanguage[],
  LTR_LANGUAGES: [
    'zh-CN', 'zh-TW', 'en-US', 'en-GB', 
    'ja-JP', 'ko-KR', 'es-ES', 'fr-FR', 
    'de-DE', 'pt-BR', 'ru-RU'
  ] as SupportedLanguage[],
};

// 字体配置
export const FONT_CONFIGS = {
  'zh-CN': {
    fontFamily: 'PingFang SC',
    fallbackFonts: ['Helvetica Neue', 'Arial'],
  },
  'zh-TW': {
    fontFamily: 'PingFang TC',
    fallbackFonts: ['Helvetica Neue', 'Arial'],
  },
  'en-US': {
    fontFamily: 'San Francisco',
    fallbackFonts: ['Helvetica Neue', 'Arial'],
  },
  'en-GB': {
    fontFamily: 'San Francisco',
    fallbackFonts: ['Helvetica Neue', 'Arial'],
  },
  'ja-JP': {
    fontFamily: 'Hiragino Sans',
    fallbackFonts: ['Yu Gothic', 'Meiryo'],
  },
  'ko-KR': {
    fontFamily: 'Apple SD Gothic Neo',
    fallbackFonts: ['Malgun Gothic', 'Dotum'],
  },
  'ar-SA': {
    fontFamily: 'Geeza Pro',
    fallbackFonts: ['Arabic Typesetting', 'Tahoma'],
  },
};

// 导出工具函数
export const i18nUtils = {
  /**
   * 检查是否为RTL语言
   */
  isRTLLanguage: (language: SupportedLanguage): boolean => {
    return TEXT_DIRECTION_CONFIG.RTL_LANGUAGES.includes(language);
  },

  /**
   * 获取语言的复数规则
   */
  getPluralRule: (language: SupportedLanguage, count: number): string => {
    const rule = PLURALIZATION_RULES[language];
    return rule ? rule(count) : 'other';
  },

  /**
   * 获取语言配置
   */
  getLanguageConfig: (language: SupportedLanguage) => {
    return LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS['en-US'];
  },

  /**
   * 检测文本语言
   */
  detectLanguage: (text: string): SupportedLanguage | null => {
    for (const [language, pattern] of Object.entries(LANGUAGE_DETECTION_PATTERNS)) {
      if (pattern.test(text)) {
        return language as SupportedLanguage;
      }
    }
    return null;
  },

  /**
   * 获取字体配置
   */
  getFontConfig: (language: SupportedLanguage) => {
    return FONT_CONFIGS[language] || FONT_CONFIGS['en-US'];
  },
};

export default {
  DEFAULT_LANGUAGE,
  FALLBACK_LANGUAGE,
  SUPPORTED_LANGUAGES,
  TRANSLATION_MAP,
  LANGUAGE_CONFIGS,
  i18nUtils,
};
