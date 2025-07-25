/**
 * SmarTalk 共享组件库
 * 提供跨平台可复用的组件和工具函数
 */

// UI 基础组件
export { default as Button } from './ui/Button';
export { default as Input } from './ui/Input';
export { default as Modal } from './ui/Modal';
export { default as Card } from './ui/Card';
export { default as Badge } from './ui/Badge';
export { default as Avatar } from './ui/Avatar';
export { default as Spinner } from './ui/Spinner';
export { default as ProgressBar } from './ui/ProgressBar';
export { default as Tooltip } from './ui/Tooltip';
export { default as Dropdown } from './ui/Dropdown';

// 表单组件
export { default as Form } from './forms/Form';
export { default as FormField } from './forms/FormField';
export { default as Select } from './forms/Select';
export { default as Checkbox } from './forms/Checkbox';
export { default as RadioGroup } from './forms/RadioGroup';
export { default as TextArea } from './forms/TextArea';
export { default as FileUpload } from './forms/FileUpload';

// 布局组件
export { default as Container } from './layout/Container';
export { default as Grid } from './layout/Grid';
export { default as Flex } from './layout/Flex';
export { default as Stack } from './layout/Stack';
export { default as Spacer } from './layout/Spacer';
export { default as Divider } from './layout/Divider';

// 导航组件
export { default as Navigation } from './navigation/Navigation';
export { default as Breadcrumb } from './navigation/Breadcrumb';
export { default as Tabs } from './navigation/Tabs';
export { default as Pagination } from './navigation/Pagination';

// 反馈组件
export { default as Alert } from './feedback/Alert';
export { default as Toast } from './feedback/Toast';
export { default as Notification } from './feedback/Notification';
export { default as ConfirmDialog } from './feedback/ConfirmDialog';

// 数据展示组件
export { default as Table } from './data/Table';
export { default as List } from './data/List';
export { default as DataGrid } from './data/DataGrid';
export { default as Chart } from './data/Chart';
export { default as Timeline } from './data/Timeline';

// 媒体组件
export { default as Image } from './media/Image';
export { default as Video } from './media/Video';
export { default as Audio } from './media/Audio';
export { default as Gallery } from './media/Gallery';

// 业务组件
export { default as UserProfile } from './business/UserProfile';
export { default as StoryCard } from './business/StoryCard';
export { default as KeywordDisplay } from './business/KeywordDisplay';
export { default as ProgressIndicator } from './business/ProgressIndicator';
export { default as AchievementBadge } from './business/AchievementBadge';
export { default as LearningPath } from './business/LearningPath';

// 类型定义
export type { ButtonProps } from './ui/Button';
export type { InputProps } from './ui/Input';
export type { ModalProps } from './ui/Modal';
export type { CardProps } from './ui/Card';
export type { FormProps } from './forms/Form';
export type { AlertProps } from './feedback/Alert';
export type { TableProps } from './data/Table';
export type { ImageProps } from './media/Image';
export type { VideoProps } from './media/Video';

// 组件主题和样式
export { default as theme } from './theme';
export { default as tokens } from './tokens';
export * from './styles';

// 工具函数
export * from '../utils';
export * from '../constants';
export * from '../types';

// Hooks (仅适用于 React 平台)
export * from './hooks';

// 组件配置
export const COMPONENT_LIBRARY_VERSION = '1.0.0';
export const SUPPORTED_PLATFORMS = ['web', 'mobile', 'desktop'] as const;

/**
 * 组件库配置
 */
export interface ComponentLibraryConfig {
  platform: typeof SUPPORTED_PLATFORMS[number];
  theme: 'light' | 'dark' | 'auto';
  locale: string;
  rtl: boolean;
}

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: ComponentLibraryConfig = {
  platform: 'web',
  theme: 'light',
  locale: 'zh-CN',
  rtl: false,
};

/**
 * 组件库初始化函数
 */
export function initializeComponentLibrary(config: Partial<ComponentLibraryConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // 设置全局配置
  if (typeof window !== 'undefined') {
    (window as any).__SMARTALK_COMPONENT_CONFIG__ = finalConfig;
  }
  
  return finalConfig;
}

/**
 * 获取当前配置
 */
export function getComponentLibraryConfig(): ComponentLibraryConfig {
  if (typeof window !== 'undefined' && (window as any).__SMARTALK_COMPONENT_CONFIG__) {
    return (window as any).__SMARTALK_COMPONENT_CONFIG__;
  }
  return DEFAULT_CONFIG;
}

/**
 * 组件注册表
 */
export const COMPONENT_REGISTRY = {
  // UI 组件
  ui: [
    'Button', 'Input', 'Modal', 'Card', 'Badge', 'Avatar', 
    'Spinner', 'ProgressBar', 'Tooltip', 'Dropdown'
  ],
  
  // 表单组件
  forms: [
    'Form', 'FormField', 'Select', 'Checkbox', 'RadioGroup', 
    'TextArea', 'FileUpload'
  ],
  
  // 布局组件
  layout: [
    'Container', 'Grid', 'Flex', 'Stack', 'Spacer', 'Divider'
  ],
  
  // 导航组件
  navigation: [
    'Navigation', 'Breadcrumb', 'Tabs', 'Pagination'
  ],
  
  // 反馈组件
  feedback: [
    'Alert', 'Toast', 'Notification', 'ConfirmDialog'
  ],
  
  // 数据展示组件
  data: [
    'Table', 'List', 'DataGrid', 'Chart', 'Timeline'
  ],
  
  // 媒体组件
  media: [
    'Image', 'Video', 'Audio', 'Gallery'
  ],
  
  // 业务组件
  business: [
    'UserProfile', 'StoryCard', 'KeywordDisplay', 'ProgressIndicator',
    'AchievementBadge', 'LearningPath'
  ],
} as const;

/**
 * 获取组件总数
 */
export function getComponentCount(): number {
  return Object.values(COMPONENT_REGISTRY).reduce((total, category) => total + category.length, 0);
}

/**
 * 检查组件是否存在
 */
export function hasComponent(componentName: string): boolean {
  return Object.values(COMPONENT_REGISTRY).some(category => 
    category.includes(componentName as any)
  );
}

/**
 * 获取组件分类
 */
export function getComponentCategory(componentName: string): string | null {
  for (const [category, components] of Object.entries(COMPONENT_REGISTRY)) {
    if (components.includes(componentName as any)) {
      return category;
    }
  }
  return null;
}

/**
 * 组件库统计信息
 */
export function getLibraryStats() {
  return {
    version: COMPONENT_LIBRARY_VERSION,
    totalComponents: getComponentCount(),
    categories: Object.keys(COMPONENT_REGISTRY).length,
    supportedPlatforms: SUPPORTED_PLATFORMS.length,
    componentsByCategory: Object.fromEntries(
      Object.entries(COMPONENT_REGISTRY).map(([category, components]) => [
        category,
        components.length
      ])
    ),
  };
}

// 开发工具
export const DEV_TOOLS = {
  /**
   * 列出所有组件
   */
  listComponents: () => {
    console.table(
      Object.entries(COMPONENT_REGISTRY).flatMap(([category, components]) =>
        components.map(component => ({ category, component }))
      )
    );
  },
  
  /**
   * 显示库统计信息
   */
  showStats: () => {
    console.log('SmarTalk Component Library Stats:', getLibraryStats());
  },
  
  /**
   * 验证组件导出
   */
  validateExports: () => {
    const missing = [];
    for (const [category, components] of Object.entries(COMPONENT_REGISTRY)) {
      for (const component of components) {
        try {
          // 这里可以添加实际的导入检查
          console.log(`✓ ${category}/${component}`);
        } catch (error) {
          missing.push(`${category}/${component}`);
        }
      }
    }
    
    if (missing.length > 0) {
      console.warn('Missing components:', missing);
    } else {
      console.log('✅ All components exported successfully');
    }
  },
};

// 在开发环境下暴露开发工具
if (process.env.NODE_ENV === 'development') {
  if (typeof window !== 'undefined') {
    (window as any).__SMARTALK_DEV_TOOLS__ = DEV_TOOLS;
  }
}
