# SmarTalk 命名规范指南

## 📋 概述

本文档定义了 SmarTalk 项目中文件、目录、组件、函数等的统一命名规范，确保代码的一致性和可维护性。

## 🎯 命名原则

### 核心原则
1. **一致性**: 在整个项目中保持命名风格的一致性
2. **可读性**: 名称应该清晰表达其用途和功能
3. **简洁性**: 避免过长的名称，但不牺牲清晰度
4. **语义化**: 使用有意义的英文单词，避免缩写
5. **可搜索性**: 便于在代码库中搜索和定位

### 语言规范
- **主要语言**: 英文
- **编码**: UTF-8
- **大小写**: 根据类型使用不同的大小写规范
- **分隔符**: 根据上下文使用 `-`、`_` 或 camelCase

## 📁 文件和目录命名

### 目录命名规范

#### 1. 项目根目录
```
smartalk/                 # 项目根目录 - kebab-case
├── backend/              # 后端服务 - kebab-case
├── mobile/               # 移动端应用 - kebab-case
├── web/                  # Web端应用 - kebab-case
├── shared/               # 共享代码 - kebab-case
├── content/              # 内容资源 - kebab-case
├── docs/                 # 文档目录 - kebab-case
├── scripts/              # 脚本目录 - kebab-case
└── tests/                # 测试目录 - kebab-case
```

#### 2. 功能模块目录
```
src/
├── components/           # 组件目录 - kebab-case
│   ├── ui/              # UI组件 - kebab-case
│   ├── business/        # 业务组件 - kebab-case
│   ├── layout/          # 布局组件 - kebab-case
│   └── forms/           # 表单组件 - kebab-case
├── screens/             # 页面目录 - kebab-case
├── services/            # 服务目录 - kebab-case
├── utils/               # 工具目录 - kebab-case
├── hooks/               # Hooks目录 - kebab-case
├── constants/           # 常量目录 - kebab-case
└── types/               # 类型目录 - kebab-case
```

#### 3. 组件子目录
```
components/
├── user-profile/        # 组件目录 - kebab-case
│   ├── UserProfile.tsx  # 主组件 - PascalCase
│   ├── UserProfile.test.tsx
│   ├── UserProfile.types.ts
│   ├── UserProfile.styles.ts
│   └── index.ts
└── story-card/
    ├── StoryCard.tsx
    ├── StoryCard.test.tsx
    ├── StoryCard.types.ts
    └── index.ts
```

### 文件命名规范

#### 1. React 组件文件
```typescript
// ✅ 正确命名
UserProfile.tsx           // 主组件 - PascalCase
StoryCard.tsx            // 业务组件 - PascalCase
Button.tsx               // UI组件 - PascalCase
NavigationBar.tsx        // 复合词组件 - PascalCase

// ❌ 错误命名
userProfile.tsx          // 应该使用 PascalCase
story_card.tsx           // 应该使用 PascalCase
button.component.tsx     // 不需要 .component 后缀
```

#### 2. 工具和服务文件
```typescript
// ✅ 正确命名
userService.ts           // 服务文件 - camelCase
apiClient.ts             // API客户端 - camelCase
dateUtils.ts             // 工具函数 - camelCase
validationHelpers.ts     // 辅助函数 - camelCase

// ❌ 错误命名
UserService.ts           // 应该使用 camelCase
api_client.ts            // 应该使用 camelCase
date-utils.ts            // 应该使用 camelCase
```

#### 3. 类型定义文件
```typescript
// ✅ 正确命名
user.types.ts            // 类型定义 - camelCase + .types
api.types.ts             // API类型 - camelCase + .types
common.types.ts          // 通用类型 - camelCase + .types

// ❌ 错误命名
User.types.ts            // 应该使用 camelCase
userTypes.ts             // 应该使用 .types 后缀
user-types.ts            // 应该使用 camelCase
```

#### 4. 测试文件
```typescript
// ✅ 正确命名
UserProfile.test.tsx     // 组件测试 - PascalCase + .test
userService.test.ts      // 服务测试 - camelCase + .test
apiClient.integration.test.ts  // 集成测试

// ❌ 错误命名
UserProfile.spec.tsx     // 统一使用 .test
user-profile.test.tsx    // 应该使用 PascalCase
```

#### 5. 样式文件
```css
/* ✅ 正确命名 */
UserProfile.module.css   /* CSS Modules - PascalCase */
UserProfile.styles.ts    /* Styled Components - PascalCase */
global.css               /* 全局样式 - camelCase */

/* ❌ 错误命名 */
userProfile.css          /* 应该使用 PascalCase */
user-profile.module.css  /* 应该使用 PascalCase */
```

#### 6. 配置文件
```javascript
// ✅ 正确命名
package.json             // 标准配置文件
tsconfig.json            // TypeScript配置
.eslintrc.js             // ESLint配置
jest.config.js           // Jest配置
next.config.js           // Next.js配置

// ❌ 错误命名
Package.json             // 应该使用小写
tsConfig.json            // 应该使用小写
eslint.config.js         // 应该使用标准名称
```

## 🧩 代码命名规范

### 变量和函数命名

#### 1. 变量命名
```typescript
// ✅ 正确命名
const userName = 'john';              // camelCase
const isUserLoggedIn = true;          // 布尔值 - is/has/can 前缀
const MAX_RETRY_COUNT = 3;            // 常量 - SCREAMING_SNAKE_CASE
const userProfileData = {};           // 对象 - camelCase

// ❌ 错误命名
const user_name = 'john';             // 应该使用 camelCase
const UserName = 'john';              // 应该使用 camelCase
const loggedIn = true;                // 布尔值应该有前缀
const maxRetryCount = 3;              // 常量应该大写
```

#### 2. 函数命名
```typescript
// ✅ 正确命名
function getUserById(id: string) {}   // 动词开头 - camelCase
function validateEmail(email: string) {} // 动词开头
function isUserActive(user: User) {}  // 布尔返回值 - is/has/can
function handleButtonClick() {}       // 事件处理 - handle前缀

// ❌ 错误命名
function user(id: string) {}          // 应该是动词开头
function GetUserById(id: string) {}   // 应该使用 camelCase
function userActive(user: User) {}    // 布尔返回值应该有前缀
function buttonClick() {}             // 事件处理应该有handle前缀
```

#### 3. 类和接口命名
```typescript
// ✅ 正确命名
class UserService {}                  // 类 - PascalCase
interface User {}                     // 接口 - PascalCase
interface UserProfile {}              // 接口 - PascalCase
type ApiResponse<T> = {};             // 类型 - PascalCase

// ❌ 错误命名
class userService {}                  // 应该使用 PascalCase
interface IUser {}                    // 不需要 I 前缀
interface user_profile {}             // 应该使用 PascalCase
```

#### 4. 枚举命名
```typescript
// ✅ 正确命名
enum UserRole {                       // 枚举 - PascalCase
  ADMIN = 'admin',                    // 枚举值 - SCREAMING_SNAKE_CASE
  USER = 'user',
  GUEST = 'guest',
}

enum VideoType {
  CONTEXT = 'context',
  OPTION_A = 'option_a',
  OPTION_B = 'option_b',
}

// ❌ 错误命名
enum userRole {}                      // 应该使用 PascalCase
enum UserRole {
  Admin = 'admin',                    // 应该使用 SCREAMING_SNAKE_CASE
  User = 'user',
}
```

### React 组件命名

#### 1. 组件命名
```typescript
// ✅ 正确命名
const UserProfile = () => {};         // 函数组件 - PascalCase
const StoryCard = () => {};           // 业务组件 - PascalCase
const Button = () => {};              // UI组件 - PascalCase
const NavigationBar = () => {};       // 复合词 - PascalCase

// ❌ 错误命名
const userProfile = () => {};         // 应该使用 PascalCase
const storycard = () => {};           // 应该使用 PascalCase
const buttonComponent = () => {};     // 不需要 Component 后缀
```

#### 2. Props 接口命名
```typescript
// ✅ 正确命名
interface ButtonProps {}              // Props接口 - PascalCase + Props
interface UserProfileProps {}         // 组件Props - PascalCase + Props
interface StoryCardProps {}           // 业务组件Props

// ❌ 错误命名
interface ButtonProperties {}         // 应该使用 Props 后缀
interface IButtonProps {}             // 不需要 I 前缀
interface buttonProps {}              // 应该使用 PascalCase
```

#### 3. Hook 命名
```typescript
// ✅ 正确命名
const useAuth = () => {};             // 自定义Hook - use前缀 + camelCase
const useLocalStorage = () => {};     // 工具Hook
const useUserProfile = () => {};      // 业务Hook

// ❌ 错误命名
const authHook = () => {};            // 应该使用 use 前缀
const UseAuth = () => {};             // 应该使用 camelCase
const use_auth = () => {};            // 应该使用 camelCase
```

## 📦 模块和包命名

### NPM 包命名
```json
{
  "name": "@smartalk/shared",         // 作用域包 - kebab-case
  "name": "@smartalk/ui-components",  // 多词包名 - kebab-case
  "name": "@smartalk/api-client"      // API客户端包
}
```

### 模块导出命名
```typescript
// ✅ 正确命名
export const userService = {};       // 默认导出 - camelCase
export const UserProfile = () => {}; // 组件导出 - PascalCase
export type { User, UserProfile };   // 类型导出 - PascalCase

// ❌ 错误命名
export const UserService = {};       // 服务应该使用 camelCase
export const userProfile = () => {}; // 组件应该使用 PascalCase
```

## 🗂️ 数据库命名规范

### 表名命名
```sql
-- ✅ 正确命名
users                    -- 表名 - snake_case 复数
user_profiles           -- 关联表 - snake_case 复数
story_keywords          -- 多词表名 - snake_case

-- ❌ 错误命名
User                    -- 应该使用小写
userProfiles           -- 应该使用 snake_case
storyKeyword           -- 应该使用复数
```

### 字段名命名
```sql
-- ✅ 正确命名
id                      -- 主键 - 简短
user_id                 -- 外键 - snake_case + _id
first_name              -- 字段 - snake_case
created_at              -- 时间戳 - snake_case + _at
is_active               -- 布尔值 - is_ 前缀

-- ❌ 错误命名
userId                  -- 应该使用 snake_case
firstName               -- 应该使用 snake_case
createdAt               -- 应该使用 snake_case
active                  -- 布尔值应该有前缀
```

## 🔧 工具和脚本

### 自动化重命名脚本
```bash
#!/bin/bash
# 文件重命名脚本示例

# 将 camelCase 组件文件重命名为 PascalCase
find . -name "*.tsx" -type f | while read file; do
  dir=$(dirname "$file")
  base=$(basename "$file" .tsx)
  
  # 转换为 PascalCase
  new_name=$(echo "$base" | sed 's/^./\U&/')
  
  if [ "$base" != "$new_name" ]; then
    mv "$file" "$dir/$new_name.tsx"
    echo "Renamed: $base.tsx -> $new_name.tsx"
  fi
done
```

### ESLint 规则配置
```javascript
// .eslintrc.js
module.exports = {
  rules: {
    // 强制组件名使用 PascalCase
    'react/jsx-pascal-case': 'error',
    
    // 强制文件名与组件名一致
    'react/jsx-filename-extension': [
      'error',
      { extensions: ['.tsx'] }
    ],
    
    // 强制 Hook 命名规范
    'react-hooks/rules-of-hooks': 'error',
    
    // 强制变量命名规范
    'camelcase': ['error', { 
      properties: 'never',
      ignoreDestructuring: true 
    }],
  }
};
```

## 📋 检查清单

### 文件命名检查
- [ ] 组件文件使用 PascalCase
- [ ] 工具文件使用 camelCase
- [ ] 目录使用 kebab-case
- [ ] 测试文件有 .test 后缀
- [ ] 类型文件有 .types 后缀

### 代码命名检查
- [ ] 变量使用 camelCase
- [ ] 常量使用 SCREAMING_SNAKE_CASE
- [ ] 函数使用 camelCase，动词开头
- [ ] 类和接口使用 PascalCase
- [ ] 布尔值有 is/has/can 前缀

### 组件命名检查
- [ ] React 组件使用 PascalCase
- [ ] Props 接口有 Props 后缀
- [ ] Hook 有 use 前缀
- [ ] 事件处理函数有 handle 前缀

## 🔄 迁移指南

### 现有项目迁移步骤
1. **备份代码**: 确保代码已提交到版本控制
2. **批量重命名**: 使用脚本批量重命名文件
3. **更新导入**: 更新所有导入语句
4. **测试验证**: 确保重命名后功能正常
5. **文档更新**: 更新相关文档

### 团队协作
- **代码审查**: 在 PR 中检查命名规范
- **自动化检查**: 配置 ESLint 规则
- **团队培训**: 确保团队成员了解规范
- **持续改进**: 根据实际使用情况调整规范

---

**注意**: 本命名规范应该在团队中保持一致，并随项目发展持续完善。
