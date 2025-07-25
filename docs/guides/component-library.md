# SmarTalk 可复用组件库指南

## 📋 概述

SmarTalk 可复用组件库提供了一套完整的跨平台组件和工具函数，支持 Web、移动端和桌面端应用开发。

## 🎯 设计原则

### 核心原则
1. **一致性**: 所有组件遵循统一的设计语言和交互模式
2. **可复用性**: 组件设计考虑多场景复用，避免重复开发
3. **可扩展性**: 支持主题定制和功能扩展
4. **性能优化**: 组件经过性能优化，支持懒加载和虚拟化
5. **类型安全**: 完整的 TypeScript 类型定义

### 设计目标
- 提高开发效率，减少重复代码
- 确保用户体验的一致性
- 降低维护成本
- 支持快速原型开发

## 📦 组件分类

### UI 基础组件 (10个)
提供最基础的 UI 元素：
- **Button**: 按钮组件，支持多种样式和状态
- **Input**: 输入框组件，支持验证和格式化
- **Modal**: 模态框组件，支持多种尺寸和动画
- **Card**: 卡片组件，用于内容展示
- **Badge**: 徽章组件，用于状态标识
- **Avatar**: 头像组件，支持图片和文字
- **Spinner**: 加载动画组件
- **ProgressBar**: 进度条组件
- **Tooltip**: 提示框组件
- **Dropdown**: 下拉菜单组件

### 表单组件 (7个)
专门用于表单构建：
- **Form**: 表单容器组件
- **FormField**: 表单字段组件
- **Select**: 选择器组件
- **Checkbox**: 复选框组件
- **RadioGroup**: 单选按钮组组件
- **TextArea**: 多行文本输入组件
- **FileUpload**: 文件上传组件

### 布局组件 (6个)
用于页面布局和排版：
- **Container**: 容器组件
- **Grid**: 网格布局组件
- **Flex**: 弹性布局组件
- **Stack**: 堆叠布局组件
- **Spacer**: 间距组件
- **Divider**: 分割线组件

### 导航组件 (4个)
用于页面导航：
- **Navigation**: 导航栏组件
- **Breadcrumb**: 面包屑导航组件
- **Tabs**: 标签页组件
- **Pagination**: 分页组件

### 反馈组件 (4个)
用于用户反馈：
- **Alert**: 警告提示组件
- **Toast**: 轻提示组件
- **Notification**: 通知组件
- **ConfirmDialog**: 确认对话框组件

### 数据展示组件 (5个)
用于数据展示：
- **Table**: 表格组件
- **List**: 列表组件
- **DataGrid**: 数据网格组件
- **Chart**: 图表组件
- **Timeline**: 时间线组件

### 媒体组件 (4个)
用于媒体内容：
- **Image**: 图片组件，支持懒加载
- **Video**: 视频播放组件
- **Audio**: 音频播放组件
- **Gallery**: 图片画廊组件

### 业务组件 (6个)
SmarTalk 特定的业务组件：
- **UserProfile**: 用户资料组件
- **StoryCard**: 故事卡片组件
- **KeywordDisplay**: 关键词展示组件
- **ProgressIndicator**: 学习进度指示器
- **AchievementBadge**: 成就徽章组件
- **LearningPath**: 学习路径组件

## 🛠️ 使用指南

### 安装和导入
```typescript
// 导入单个组件
import { Button, Input, Modal } from '@shared/components';

// 导入所有组件
import * as Components from '@shared/components';

// 导入特定分类的组件
import { Button } from '@shared/components/ui/Button';
import { Form } from '@shared/components/forms/Form';
```

### 基础使用示例
```typescript
import React from 'react';
import { Button, Input, Card, Form } from '@shared/components';

export const ExampleForm: React.FC = () => {
  return (
    <Card>
      <Form onSubmit={handleSubmit}>
        <Input
          label="用户名"
          placeholder="请输入用户名"
          required
        />
        <Input
          label="密码"
          type="password"
          placeholder="请输入密码"
          required
        />
        <Button type="submit" variant="primary">
          登录
        </Button>
      </Form>
    </Card>
  );
};
```

### 主题定制
```typescript
import { initializeComponentLibrary } from '@shared/components';

// 初始化组件库配置
initializeComponentLibrary({
  platform: 'web',
  theme: 'dark',
  locale: 'zh-CN',
  rtl: false,
});
```

## 🎨 主题系统

### 颜色系统
```typescript
export const theme = {
  colors: {
    primary: '#4A90E2',
    secondary: '#7BB3F0',
    success: '#27AE60',
    warning: '#F39C12',
    error: '#E74C3C',
    info: '#3498DB',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      // ... 更多灰度色
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
    },
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
};
```

### 响应式设计
```typescript
export const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
};

// 使用示例
const styles = {
  container: {
    padding: '16px',
    '@media (min-width: 768px)': {
      padding: '24px',
    },
    '@media (min-width: 1024px)': {
      padding: '32px',
    },
  },
};
```

## 🔧 工具函数库

### 字符串工具
```typescript
import { capitalize, camelCase, kebabCase } from '@shared/utils';

capitalize('hello world'); // 'Hello world'
camelCase('hello-world'); // 'helloWorld'
kebabCase('HelloWorld'); // 'hello-world'
```

### 数组工具
```typescript
import { unique, groupBy, sortBy } from '@shared/utils';

unique([1, 2, 2, 3]); // [1, 2, 3]
groupBy(users, 'role'); // { admin: [...], user: [...] }
sortBy(users, 'name', 'asc'); // 按名称升序排列
```

### 异步工具
```typescript
import { debounce, throttle, retry } from '@shared/utils';

const debouncedSearch = debounce(searchFunction, 300);
const throttledScroll = throttle(scrollHandler, 100);

// 重试机制
await retry(apiCall, 3, 1000);
```

### 验证工具
```typescript
import { isEmail, isUrl, isStrongPassword } from '@shared/utils';

isEmail('user@example.com'); // true
isUrl('https://example.com'); // true
isStrongPassword('MyPassword123!'); // true
```

## 📱 跨平台支持

### Web 平台
```typescript
// Web 特定的组件使用
import { Button } from '@shared/components/ui/Button';

<Button onClick={handleClick}>
  点击我
</Button>
```

### React Native 平台
```typescript
// React Native 特定的组件使用
import { Button } from '@shared/components/ui/Button';

<Button onPress={handlePress}>
  点击我
</Button>
```

### 平台检测
```typescript
import { isMobile, isTablet, isDesktop } from '@shared/utils';

if (isMobile()) {
  // 移动端特定逻辑
} else if (isTablet()) {
  // 平板特定逻辑
} else {
  // 桌面端特定逻辑
}
```

## 🧪 测试支持

### 组件测试
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@shared/components';

describe('Button Component', () => {
  it('should render button text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 工具函数测试
```typescript
import { formatFileSize, debounce } from '@shared/utils';

describe('Utility Functions', () => {
  it('should format file size correctly', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1048576)).toBe('1 MB');
  });

  it('should debounce function calls', (done) => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);
    
    debouncedFn();
    debouncedFn();
    debouncedFn();
    
    setTimeout(() => {
      expect(mockFn).toHaveBeenCalledTimes(1);
      done();
    }, 150);
  });
});
```

## 📊 性能优化

### 懒加载
```typescript
import { LazyLoad } from '@shared/components/utils/LazyLoad';

<LazyLoad>
  <ExpensiveComponent />
</LazyLoad>
```

### 虚拟化列表
```typescript
import { VirtualList } from '@shared/components/utils/VirtualList';

<VirtualList
  items={largeDataSet}
  itemHeight={50}
  renderItem={({ item, index }) => (
    <div key={index}>{item.name}</div>
  )}
/>
```

### 无限滚动
```typescript
import { InfiniteScroll } from '@shared/components/utils/InfiniteScroll';

<InfiniteScroll
  hasMore={hasMore}
  loadMore={loadMore}
  loader={<Spinner />}
>
  {items.map(item => (
    <ItemComponent key={item.id} item={item} />
  ))}
</InfiniteScroll>
```

## 🔍 开发工具

### 组件浏览器
在开发环境中，可以使用内置的开发工具：

```typescript
// 在浏览器控制台中
__SMARTALK_DEV_TOOLS__.listComponents(); // 列出所有组件
__SMARTALK_DEV_TOOLS__.showStats(); // 显示统计信息
__SMARTALK_DEV_TOOLS__.validateExports(); // 验证组件导出
```

### 组件文档生成
```bash
# 生成组件文档
npm run docs:generate

# 启动文档服务器
npm run docs:serve
```

## 📈 统计信息

### 当前组件库规模
- **总组件数**: 46个
- **组件分类**: 8个
- **工具函数**: 50+个
- **支持平台**: 3个 (Web, Mobile, Desktop)
- **TypeScript 覆盖率**: 100%

### 组件分布
- UI 基础组件: 10个 (22%)
- 表单组件: 7个 (15%)
- 布局组件: 6个 (13%)
- 业务组件: 6个 (13%)
- 数据展示组件: 5个 (11%)
- 导航组件: 4个 (9%)
- 反馈组件: 4个 (9%)
- 媒体组件: 4个 (9%)

## 🚀 最佳实践

### 组件设计原则
1. **单一职责**: 每个组件只负责一个功能
2. **可组合性**: 组件可以组合使用
3. **可配置性**: 通过 props 控制组件行为
4. **可访问性**: 支持键盘导航和屏幕阅读器
5. **性能优化**: 避免不必要的重渲染

### 命名规范
- 组件名使用 PascalCase: `UserProfile`
- Props 使用 camelCase: `onClick`, `isVisible`
- 事件处理函数使用 handle 前缀: `handleClick`
- 布尔值 props 使用 is/has/can 前缀: `isLoading`, `hasError`

### 文档要求
- 每个组件都应有完整的 TypeScript 类型定义
- 提供使用示例和 API 文档
- 包含可访问性说明
- 说明浏览器兼容性

---

**注意**: 组件库持续演进中，建议定期查看更新日志了解最新变化。
