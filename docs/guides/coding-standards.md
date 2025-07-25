# SmarTalk 编码规范指南

## 📋 概述

本文档定义了 SmarTalk 项目的编码规范和最佳实践，确保代码质量和团队协作效率。

## 🎯 编码原则

### 核心原则
1. **可读性优先**: 代码应该易于理解和维护
2. **一致性**: 保持代码风格的统一性
3. **简洁性**: 避免不必要的复杂性
4. **可测试性**: 编写易于测试的代码
5. **性能意识**: 考虑代码的性能影响

### SOLID 原则
- **S** - 单一职责原则 (Single Responsibility)
- **O** - 开闭原则 (Open/Closed)
- **L** - 里氏替换原则 (Liskov Substitution)
- **I** - 接口隔离原则 (Interface Segregation)
- **D** - 依赖倒置原则 (Dependency Inversion)

## 📝 命名规范

### 通用命名规则
- 使用有意义的名称
- 避免缩写和简写
- 使用英文命名
- 避免误导性名称

### 变量命名

#### JavaScript/TypeScript
```typescript
// ✅ 好的命名
const userAge = 25;
const isUserLoggedIn = true;
const userProfileData = {};
const MAX_RETRY_COUNT = 3;

// ❌ 避免的命名
const a = 25;
const flag = true;
const data = {};
const MAX = 3;
```

#### 命名约定
- **变量**: camelCase
- **常量**: SCREAMING_SNAKE_CASE
- **函数**: camelCase
- **类**: PascalCase
- **接口**: PascalCase (以 I 开头可选)
- **类型**: PascalCase
- **枚举**: PascalCase

### 函数命名

```typescript
// ✅ 动词开头，描述功能
function getUserById(id: string) {}
function validateEmail(email: string) {}
function calculateTotalPrice(items: Item[]) {}

// ✅ 布尔值返回函数
function isUserActive(user: User) {}
function hasPermission(user: User, permission: string) {}
function canEditPost(user: User, post: Post) {}

// ❌ 避免的命名
function user(id: string) {}
function email(email: string) {}
function total(items: Item[]) {}
```

### 组件命名

```typescript
// ✅ React 组件 - PascalCase
const UserProfile = () => {};
const NavigationBar = () => {};
const StoryCard = () => {};

// ✅ 文件命名 - PascalCase
UserProfile.tsx
NavigationBar.tsx
StoryCard.tsx

// ✅ 目录命名 - kebab-case
user-profile/
navigation-bar/
story-card/
```

## 📁 文件和目录结构

### 目录命名
- 使用 kebab-case
- 描述性名称
- 避免过深的嵌套

### 文件命名
- 组件文件: PascalCase.tsx
- 工具文件: camelCase.ts
- 测试文件: fileName.test.ts
- 类型文件: fileName.types.ts
- 常量文件: fileName.constants.ts

### 目录结构示例
```
src/
├── components/
│   ├── ui/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.types.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── business/
├── hooks/
│   ├── useAuth.ts
│   ├── useLocalStorage.ts
│   └── index.ts
├── utils/
│   ├── validation.ts
│   ├── formatting.ts
│   └── index.ts
└── types/
    ├── user.types.ts
    ├── story.types.ts
    └── index.ts
```

## 💬 注释规范

### JSDoc 注释

```typescript
/**
 * 计算用户学习进度百分比
 * @param completedKeywords - 已完成的关键词数量
 * @param totalKeywords - 总关键词数量
 * @returns 进度百分比 (0-100)
 * @throws {Error} 当总关键词数量为0时抛出错误
 * @example
 * ```typescript
 * const progress = calculateProgress(5, 10);
 * console.log(progress); // 50
 * ```
 */
function calculateProgress(
  completedKeywords: number,
  totalKeywords: number
): number {
  if (totalKeywords === 0) {
    throw new Error('Total keywords cannot be zero');
  }
  return Math.round((completedKeywords / totalKeywords) * 100);
}
```

### 行内注释

```typescript
// ✅ 解释复杂逻辑
const adjustedScore = baseScore * 1.2; // 应用20%的难度加成

// ✅ 解释业务规则
if (user.level === 'beginner' && story.difficulty === 'advanced') {
  // 初学者不能访问高级故事
  return false;
}

// ❌ 避免显而易见的注释
const userName = user.name; // 获取用户名称
```

### TODO 注释

```typescript
// TODO: 实现缓存机制以提高性能
// FIXME: 修复在 iOS 上的显示问题
// HACK: 临时解决方案，需要重构
// NOTE: 这个函数依赖于外部 API 的响应格式
```

## 🧩 组件设计规范

### React 组件结构

```typescript
import React, { useState, useEffect } from 'react';
import { ComponentProps } from './Component.types';
import { COMPONENT_CONSTANTS } from './Component.constants';
import styles from './Component.module.css';

/**
 * 组件描述
 */
const Component: React.FC<ComponentProps> = ({
  prop1,
  prop2,
  onAction,
  ...restProps
}) => {
  // 1. Hooks
  const [state, setState] = useState(initialState);
  
  // 2. 副作用
  useEffect(() => {
    // 副作用逻辑
  }, [dependencies]);
  
  // 3. 事件处理函数
  const handleClick = (event: React.MouseEvent) => {
    // 处理逻辑
    onAction?.(event);
  };
  
  // 4. 渲染逻辑
  const renderContent = () => {
    if (condition) {
      return <div>Conditional content</div>;
    }
    return <div>Default content</div>;
  };
  
  // 5. 主渲染
  return (
    <div className={styles.container} {...restProps}>
      {renderContent()}
    </div>
  );
};

export default Component;
```

### 组件 Props 设计

```typescript
// ✅ 明确的 Props 接口
interface ButtonProps {
  /** 按钮文本 */
  children: React.ReactNode;
  /** 按钮变体 */
  variant?: 'primary' | 'secondary' | 'danger';
  /** 按钮大小 */
  size?: 'small' | 'medium' | 'large';
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 点击事件处理函数 */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** 额外的 CSS 类名 */
  className?: string;
}

// ✅ 默认值
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  ...props
}) => {
  // 组件实现
};
```

## 🔧 函数设计规范

### 函数长度和复杂度
- 单个函数不超过 50 行
- 圈复杂度不超过 10
- 参数数量不超过 5 个

### 纯函数优先

```typescript
// ✅ 纯函数 - 可预测，易测试
function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// ❌ 有副作用的函数
let globalCounter = 0;
function incrementCounter(): number {
  return ++globalCounter; // 修改全局状态
}
```

### 错误处理

```typescript
// ✅ 明确的错误处理
async function fetchUserData(userId: string): Promise<User> {
  try {
    const response = await api.get(`/users/${userId}`);
    
    if (!response.data) {
      throw new Error('User data not found');
    }
    
    return response.data;
  } catch (error) {
    logger.error('Failed to fetch user data', { userId, error });
    throw new Error(`Failed to fetch user data: ${error.message}`);
  }
}

// ✅ 类型安全的错误处理
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

async function safeApiCall<T>(
  apiCall: () => Promise<T>
): Promise<Result<T>> {
  try {
    const data = await apiCall();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

## 📊 类型定义规范

### TypeScript 类型

```typescript
// ✅ 明确的类型定义
interface User {
  readonly id: string;
  email: string;
  profile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  interests: Interest[];
  level: SkillLevel;
}

// ✅ 联合类型
type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
type Interest = 'travel' | 'movie' | 'workplace' | 'daily_life';

// ✅ 泛型类型
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

// ✅ 工具类型
type CreateUserRequest = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateUserRequest = Partial<Pick<User, 'email' | 'profile'>>;
```

### 枚举使用

```typescript
// ✅ 字符串枚举
enum VideoType {
  CONTEXT = 'context',
  OPTION_A = 'option_a',
  OPTION_B = 'option_b',
  OPTION_C = 'option_c',
  OPTION_D = 'option_d',
  EXPLANATION = 'explanation',
}

// ✅ 常量断言 (推荐)
const VIDEO_TYPES = {
  CONTEXT: 'context',
  OPTION_A: 'option_a',
  OPTION_B: 'option_b',
  OPTION_C: 'option_c',
  OPTION_D: 'option_d',
  EXPLANATION: 'explanation',
} as const;

type VideoType = typeof VIDEO_TYPES[keyof typeof VIDEO_TYPES];
```

## 🎨 样式规范

### CSS 类命名 (BEM)

```css
/* ✅ BEM 命名规范 */
.story-card { /* Block */ }
.story-card__title { /* Element */ }
.story-card__description { /* Element */ }
.story-card--featured { /* Modifier */ }
.story-card__title--large { /* Element + Modifier */ }

/* ✅ 实际示例 */
.user-profile { }
.user-profile__avatar { }
.user-profile__name { }
.user-profile__bio { }
.user-profile--compact { }
```

### CSS-in-JS (Styled Components)

```typescript
// ✅ 组件样式
const StyledButton = styled.button<{ variant: string }>`
  padding: ${({ theme }) => theme.spacing.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background-color: ${({ variant, theme }) => 
    variant === 'primary' ? theme.colors.primary : theme.colors.secondary
  };
  
  &:hover {
    opacity: 0.8;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
```

## 🧪 测试规范

### 测试文件命名
- 单元测试: `Component.test.tsx`
- 集成测试: `Component.integration.test.tsx`
- E2E 测试: `Component.e2e.test.tsx`

### 测试结构

```typescript
describe('UserProfile Component', () => {
  // 测试数据准备
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  };

  beforeEach(() => {
    // 每个测试前的准备工作
  });

  afterEach(() => {
    // 每个测试后的清理工作
  });

  describe('Rendering', () => {
    it('should render user name correctly', () => {
      // 测试实现
    });

    it('should render user email correctly', () => {
      // 测试实现
    });
  });

  describe('Interactions', () => {
    it('should call onEdit when edit button is clicked', () => {
      // 测试实现
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing user data gracefully', () => {
      // 测试实现
    });
  });
});
```

## 📦 导入导出规范

### 导入顺序

```typescript
// 1. React 相关
import React, { useState, useEffect } from 'react';

// 2. 第三方库
import axios from 'axios';
import { format } from 'date-fns';

// 3. 内部模块 (绝对路径)
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks';
import { User } from '@/types';

// 4. 相对路径导入
import { ComponentProps } from './Component.types';
import { CONSTANTS } from './Component.constants';
import styles from './Component.module.css';
```

### 导出规范

```typescript
// ✅ 命名导出 (推荐)
export const Button = () => {};
export const Input = () => {};

// ✅ 默认导出 (组件主文件)
const UserProfile = () => {};
export default UserProfile;

// ✅ 重新导出
export { Button } from './Button';
export { Input } from './Input';
export type { ButtonProps } from './Button';
```

## 🔍 代码审查清单

### 提交前检查
- [ ] 代码符合命名规范
- [ ] 函数和组件职责单一
- [ ] 添加了必要的注释
- [ ] 类型定义完整
- [ ] 测试覆盖充分
- [ ] 无 console.log 等调试代码
- [ ] 性能考虑充分
- [ ] 错误处理完善

### 审查重点
- [ ] 代码可读性
- [ ] 逻辑正确性
- [ ] 性能影响
- [ ] 安全考虑
- [ ] 测试质量
- [ ] 文档完整性

---

**注意**: 本规范应随项目发展持续完善，团队成员应定期讨论和更新编码标准。
