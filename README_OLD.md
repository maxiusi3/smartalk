# SmarTalk - 神经沉浸式英语学习平台

[![Build Status](https://github.com/smartalk/smartalk/workflows/CI/badge.svg)](https://github.com/smartalk/smartalk/actions)
[![Coverage Status](https://coveralls.io/repos/github/smartalk/smartalk/badge.svg?branch=main)](https://coveralls.io/github/smartalk/smartalk?branch=main)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 项目概述

SmarTalk 是一个创新的英语学习平台，采用神经沉浸式学习方法，通过故事情境和视频内容帮助用户自然习得英语。

### 🎯 核心特性
- 🧠 **神经沉浸式学习**: 基于神经科学的学习方法
- 📚 **故事化内容**: 通过故事情境学习英语
- 🎬 **视频互动**: 多选项视频内容增强理解
- 📱 **多端支持**: Web、iOS、Android 全平台覆盖
- 📊 **智能分析**: 个性化学习进度追踪

## 🚀 快速开始

### 📋 环境要求
- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **PostgreSQL**: >= 14.0
- **Redis**: >= 7.0 (可选，用于缓存)
- **Git**: 最新版本

### 🔧 开发环境搭建

#### 1. 克隆项目
```bash
git clone https://github.com/smartalk/smartalk.git
cd smartalk
```

#### 2. 安装依赖
```bash
# 安装所有项目依赖
npm install

# 或者分别安装各模块依赖
npm run install:all
```

#### 3. 环境配置
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

#### 4. 数据库设置
```bash
# 启动 PostgreSQL (使用 Docker)
docker-compose up -d postgres redis

# 运行数据库迁移
npm run db:migrate

# 填充测试数据
npm run db:seed
```

#### 5. 启动开发服务器
```bash
# 启动所有服务
npm run dev

# 或者分别启动各服务
npm run dev:backend    # 后端服务 (http://localhost:3001)
npm run dev:web        # Web端 (http://localhost:3000)
npm run dev:mobile     # 移动端 (Metro bundler)
```

### 📱 移动端开发

#### iOS 开发
```bash
# 安装 iOS 依赖
cd mobile && npx pod-install

# 启动 iOS 模拟器
npm run ios
```

#### Android 开发
```bash
# 启动 Android 模拟器
npm run android
```

## 🏗️ 项目架构

### 技术栈
- **后端**: Node.js, Express, Prisma, PostgreSQL
- **前端**: React, Next.js, TypeScript
- **移动端**: React Native, TypeScript
- **数据库**: PostgreSQL, Redis
- **部署**: Docker, AWS/阿里云

### 目录结构
```
smartalk/
├── backend/          # 后端服务
├── mobile/           # 移动端应用
├── web/              # Web端应用
├── shared/           # 共享代码
├── content/          # 内容资源
├── docs/             # 项目文档
├── scripts/          # 构建脚本
└── tests/            # 测试文件
```

## 📚 开发指南

### 🔗 重要链接
- [📖 API 文档](http://localhost:3001/api-docs) - Swagger API 文档
- [🏗️ 架构设计](./docs/architecture/system-architecture.md) - 系统架构说明
- [📝 编码规范](./docs/guides/coding-standards.md) - 代码规范指南
- [🧪 测试指南](./docs/guides/testing-strategy.md) - 测试策略文档
- [🚀 部署指南](./docs/guides/deployment.md) - 部署说明文档

### 🛠️ 开发工具
- [代码审查清单](./docs/guides/code-review-checklist.md)
- [性能优化指南](./docs/guides/performance-guidelines.md)
- [安全开发指南](./docs/guides/security-guidelines.md)

## 🧪 测试

### 运行测试
```bash
# 运行所有测试
npm test

# 运行特定模块测试
npm run test:backend
npm run test:web
npm run test:mobile
npm run test:shared

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行 E2E 测试
npm run test:e2e

# 运行性能测试
npm run test:performance
```

### 测试覆盖率目标
- **后端**: > 80%
- **Web端**: > 75%
- **移动端**: > 70%
- **共享代码**: > 85%

## 📊 监控和分析

### 开发环境监控
- **API 文档**: http://localhost:3001/api-docs
- **性能监控**: http://localhost:3001/api/v1/monitoring/dashboard
- **健康检查**: http://localhost:3001/api/v1/monitoring/health

### 生产环境监控
- **应用监控**: Prometheus + Grafana
- **错误追踪**: Sentry
- **日志分析**: ELK Stack
- **性能监控**: New Relic / DataDog

## 🔧 常用命令

### 开发命令
```bash
# 启动开发环境
npm run dev                 # 启动所有服务
npm run dev:backend        # 仅启动后端
npm run dev:web           # 仅启动Web端
npm run dev:mobile        # 仅启动移动端

# 构建项目
npm run build             # 构建所有项目
npm run build:backend     # 构建后端
npm run build:web         # 构建Web端
npm run build:mobile      # 构建移动端

# 代码质量
npm run lint              # 代码检查
npm run lint:fix          # 自动修复代码问题
npm run format            # 代码格式化
npm run type-check        # TypeScript 类型检查
```

### 数据库命令
```bash
# 数据库迁移
npm run db:migrate        # 运行迁移
npm run db:migrate:reset  # 重置数据库
npm run db:seed           # 填充测试数据
npm run db:studio         # 打开 Prisma Studio

# 数据库备份和恢复
npm run db:backup         # 备份数据库
npm run db:restore        # 恢复数据库
```

### 部署命令
```bash
# Docker 部署
npm run docker:build      # 构建 Docker 镜像
npm run docker:up         # 启动 Docker 容器
npm run docker:down       # 停止 Docker 容器

# 生产部署
npm run deploy:staging    # 部署到测试环境
npm run deploy:production # 部署到生产环境
```

## 🤝 贡献指南

### 开发流程
1. Fork 项目到个人仓库
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 创建 Pull Request

### 代码规范
- 遵循 [编码规范](./docs/guides/coding-standards.md)
- 确保测试覆盖率达标
- 通过所有 CI 检查
- 完成代码审查

### 提交规范
```bash
# 提交消息格式
<type>(<scope>): <description>

# 示例
feat(auth): add user registration
fix(video): resolve playback issue
docs(readme): update installation guide
```

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系我们

- **项目主页**: https://smartalk.app
- **文档站点**: https://docs.smartalk.app
- **问题反馈**: https://github.com/smartalk/smartalk/issues
- **邮箱**: support@smartalk.app

## 🙏 致谢

感谢所有为 SmarTalk 项目做出贡献的开发者和用户！

---

**Happy Coding! 🚀**
