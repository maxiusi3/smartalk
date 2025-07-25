# SmarTalk 文件命名规范

## 📋 概述

本文档定义了 SmarTalk MVP 项目中所有文件和目录的命名规范，确保代码库的一致性和可维护性。

## 🎯 核心原则

1. **一致性**：同类型文件使用相同的命名模式
2. **可读性**：文件名应清晰表达其功能和用途
3. **可搜索性**：使用描述性名称便于快速定位
4. **层级清晰**：目录结构反映代码组织逻辑

## 📁 目录命名规范

### 根目录结构
```
smartalk-mvp/
├── backend/           # 后端服务
├── mobile/            # 移动端应用
├── web/               # Web端应用
├── content/           # 媒体内容资源
├── docs/              # 项目文档
├── scripts/           # 构建和工具脚本
├── infrastructure/    # 基础设施配置
└── shared/            # 共享代码和配置
```

### 子目录命名
- **kebab-case**：所有目录使用小写字母和连字符
- **功能导向**：目录名反映其包含内容的功能
- **层级合理**：避免过深的嵌套（建议不超过4层）

## 📄 文件命名规范

### React 组件文件
- **格式**：`PascalCase.tsx` 或 `PascalCase.jsx`
- **示例**：
  - `VideoPlayer.tsx`
  - `InterestSelectionScreen.tsx`
  - `OnboardingCarousel.tsx`

### React Hook 文件
- **格式**：`useCamelCase.ts`
- **示例**：
  - `useAppStore.ts`
  - `useVideoPlayer.ts`
  - `useAnalytics.ts`

### 服务类文件
- **格式**：`PascalCaseService.ts`
- **示例**：
  - `ApiService.ts`
  - `AnalyticsService.ts`
  - `ContentCacheService.ts`

### 工具函数文件
- **格式**：`camelCase.ts`
- **示例**：
  - `subtitleParser.ts`
  - `keywordMatcher.ts`
  - `errorHandler.ts`

### 类型定义文件
- **格式**：`camelCase.types.ts`
- **示例**：
  - `api.types.ts`
  - `video.types.ts`
  - `vtpr.types.ts`

### 常量文件
- **格式**：`camelCase.ts` 或 `UPPER_CASE.ts`
- **示例**：
  - `vtpr.ts`
  - `onboarding.ts`
  - `API_ENDPOINTS.ts`

### 测试文件
- **格式**：`原文件名.test.ts` 或 `原文件名.spec.ts`
- **示例**：
  - `VideoPlayer.test.tsx`
  - `ApiService.test.ts`
  - `subtitleParser.spec.ts`

### 配置文件
- **格式**：`kebab-case.config.js` 或 `camelCase.config.js`
- **示例**：
  - `jest.config.js`
  - `metro.config.js`
  - `eslint.config.js`

## 🏗️ 目录结构规范

### 移动端 (mobile/src/)
```
mobile/src/
├── components/        # 可复用组件
│   ├── ui/           # 基础UI组件
│   ├── video/        # 视频相关组件
│   ├── vtpr/         # vTPR学习组件
│   └── onboarding/   # 引导流程组件
├── screens/          # 页面组件
├── services/         # 业务服务
├── store/            # 状态管理
├── utils/            # 工具函数
├── types/            # 类型定义
├── constants/        # 常量定义
├── assets/           # 静态资源
└── navigation/       # 导航配置
```

### 后端 (backend/src/)
```
backend/src/
├── controllers/      # 控制器
├── services/         # 业务服务
├── routes/           # 路由定义
├── middleware/       # 中间件
├── models/           # 数据模型
├── utils/            # 工具函数
├── types/            # 类型定义
├── config/           # 配置文件
└── scripts/          # 脚本文件
```

## 🔧 重命名指南

### 需要重命名的文件类型
1. **不符合PascalCase的组件文件**
2. **不符合camelCase的工具函数文件**
3. **不符合kebab-case的目录名**
4. **缺少类型后缀的类型文件**

### 重命名步骤
1. **备份当前代码**
2. **批量重命名文件**
3. **更新所有导入语句**
4. **更新配置文件中的路径引用**
5. **运行测试确保无破坏性变更**

## ✅ 检查清单

### 新文件创建时
- [ ] 文件名符合对应类型的命名规范
- [ ] 目录结构合理，层级不超过4层
- [ ] 导入路径使用别名（@/）
- [ ] 文件包含适当的类型注解

### 代码审查时
- [ ] 所有新文件遵循命名规范
- [ ] 目录结构清晰合理
- [ ] 导入语句整洁有序
- [ ] 类型定义完整准确

## 🚀 自动化工具

### ESLint 规则
```javascript
// 文件命名检查
"unicorn/filename-case": [
  "error",
  {
    "cases": {
      "camelCase": true,
      "pascalCase": true,
      "kebabCase": true
    }
  }
]
```

### 脚本工具
- `scripts/validate-naming.js` - 验证文件命名规范
- `scripts/rename-files.js` - 批量重命名工具
- `scripts/update-imports.js` - 更新导入路径

## 📚 参考资源

- [React 文件命名最佳实践](https://react.dev/learn/thinking-in-react)
- [TypeScript 项目结构指南](https://www.typescriptlang.org/docs/)
- [Node.js 项目组织规范](https://nodejs.org/en/docs/guides/)

---

**最后更新**: 2024-01-19
**维护者**: SmarTalk 技术团队
