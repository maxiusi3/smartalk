# SmarTalk Mobile App

SmarTalk MVP移动应用，基于React Native + TypeScript构建。

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- React Native CLI
- Android Studio (Android开发)
- Xcode (iOS开发，仅macOS)

### 安装依赖

```bash
npm install
```

### iOS开发

```bash
# 安装iOS依赖
cd ios && pod install && cd ..

# 启动iOS模拟器
npm run ios
```

### Android开发

```bash
# 启动Android模拟器
npm run android
```

### 开发服务器

```bash
# 启动Metro bundler
npm start
```

## 📁 项目结构

```
mobile/
├── src/
│   ├── components/          # 可复用组件
│   ├── screens/             # 屏幕组件
│   ├── navigation/          # 导航配置
│   ├── services/            # API服务
│   ├── store/               # Zustand状态管理
│   ├── types/               # TypeScript类型定义
│   ├── utils/               # 工具函数
│   └── App.tsx              # 应用入口
├── assets/                  # 静态资源
├── android/                 # Android原生代码
├── ios/                     # iOS原生代码
└── index.js                 # React Native入口
```

## 🛠️ 开发工具

### 代码检查

```bash
# 运行ESLint
npm run lint

# 自动修复代码问题
npm run lint:fix
```

### TypeScript检查

```bash
# 类型检查
npm run typecheck
```

### 测试

```bash
# 运行测试
npm test

# 监听模式
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

## 📱 功能特性

### 已实现功能

- ✅ 用户引导流程
- ✅ 兴趣选择
- ✅ 主界面导航
- ✅ 学习进度跟踪
- ✅ 设置管理
- ✅ API服务集成
- ✅ 状态管理（Zustand）
- ✅ 本地存储

### 开发中功能

- 🔄 视频播放器
- 🔄 词汇墙界面
- 🔄 vTPR练习
- 🔄 音频播放
- 🔄 离线缓存

### 计划功能

- 📋 推送通知
- 📋 社交分享
- 📋 学习统计
- 📋 成就系统

## 🔧 配置说明

### API配置

API服务会根据环境自动选择：
- 开发环境：`http://localhost:3001/api/v1`
- 生产环境：`https://api.smartalk.app/api/v1`

### 状态管理

使用Zustand进行状态管理，支持：
- 用户状态持久化
- 学习进度同步
- 应用设置保存

### 导航结构

```
App
├── Onboarding (首次启动)
├── InterestSelection (兴趣选择)
├── MainTabs
│   ├── Home (首页)
│   ├── Progress (进度)
│   └── Settings (设置)
└── Learning (学习模式)
```

## 🧪 测试策略

### 单元测试
- 组件渲染测试
- 状态管理测试
- API服务测试

### 集成测试
- 导航流程测试
- 用户交互测试
- 数据流测试

### E2E测试
- 完整用户流程
- 跨平台兼容性
- 性能测试

## 📦 构建和发布

### Android构建

```bash
# 生成APK
npm run build:android

# 生成AAB (Google Play)
cd android && ./gradlew bundleRelease
```

### iOS构建

```bash
# 生成Archive
npm run build:ios
```

## 🔍 调试技巧

### React Native调试

```bash
# 清除缓存
npm run reset-cache

# 清理项目
npm run clean
```

### 日志查看

```bash
# Android日志
npx react-native log-android

# iOS日志
npx react-native log-ios
```

## 📚 相关文档

- [React Native官方文档](https://reactnative.dev/)
- [TypeScript文档](https://www.typescriptlang.org/)
- [Zustand状态管理](https://github.com/pmndrs/zustand)
- [React Navigation](https://reactnavigation.org/)

## 🤝 开发规范

### 代码风格
- 使用TypeScript严格模式
- 遵循ESLint规则
- 组件使用函数式写法
- 使用Hooks进行状态管理

### 提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建工具或辅助工具的变动

## 📄 许可证

MIT License
