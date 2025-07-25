# SmarTalk 新人入职指南

欢迎加入 SmarTalk 团队！🎉 本指南将帮助你快速了解项目并开始贡献代码。

## 📋 入职检查清单

### 第一天 - 环境搭建
- [ ] 获取项目访问权限
- [ ] 克隆代码仓库
- [ ] 搭建本地开发环境
- [ ] 运行项目并验证功能
- [ ] 阅读项目文档

### 第一周 - 熟悉项目
- [ ] 了解项目架构和技术栈
- [ ] 阅读编码规范和开发流程
- [ ] 完成第一个小任务
- [ ] 参与代码审查
- [ ] 熟悉团队协作工具

### 第一个月 - 深入开发
- [ ] 独立完成功能开发
- [ ] 编写和维护测试
- [ ] 参与技术讨论和决策
- [ ] 优化现有代码
- [ ] 贡献文档和工具

## 🚀 快速开始

### 1. 获取访问权限

联系团队负责人获取以下权限：
- GitHub 仓库访问权限
- 开发环境数据库访问
- 项目管理工具账号
- 团队沟通群组邀请

### 2. 开发环境搭建

#### 必需软件安装
```bash
# Node.js (推荐使用 nvm 管理版本)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Git 配置
git config --global user.name "Your Name"
git config --global user.email "your.email@company.com"

# 推荐的开发工具
# VS Code + 扩展包
# Docker Desktop
# Postman 或 Insomnia
# TablePlus 或 pgAdmin (数据库管理)
```

#### 项目克隆和设置
```bash
# 克隆项目
git clone https://github.com/smartalk/smartalk.git
cd smartalk

# 安装依赖
npm install

# 复制环境配置
cp .env.example .env

# 编辑环境变量 (询问团队获取具体配置)
nano .env

# 启动数据库
docker-compose up -d postgres redis

# 运行数据库迁移
npm run db:migrate

# 填充测试数据
npm run db:seed

# 启动开发服务器
npm run dev
```

#### 验证环境
访问以下地址确认环境搭建成功：
- Web 应用: http://localhost:3000
- API 文档: http://localhost:3001/api-docs
- 健康检查: http://localhost:3001/api/v1/monitoring/health

### 3. 开发工具配置

#### VS Code 推荐扩展
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-jest",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-vscode.vscode-docker",
    "ms-vscode.vscode-git-graph"
  ]
}
```

#### VS Code 设置
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

## 📚 项目了解

### 项目概述
SmarTalk 是一个神经沉浸式英语学习平台，主要特点：
- 基于故事情境的学习方法
- 多选项视频互动内容
- 个性化学习进度追踪
- 多端支持 (Web + Mobile)

### 技术架构
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web 前端      │    │   移动端应用    │    │   管理后台      │
│   (Next.js)     │    │ (React Native)  │    │   (React)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                    ┌─────────────────┐
                    │   API 网关      │
                    │  (Express.js)   │
                    └─────────────────┘
                                │
                    ┌─────────────────┐
                    │   业务服务      │
                    │  (Node.js)      │
                    └─────────────────┘
                                │
                    ┌─────────────────┐
                    │   数据存储      │
                    │ (PostgreSQL)    │
                    └─────────────────┘
```

### 核心模块
1. **用户管理**: 注册、登录、资料管理
2. **内容管理**: 故事、关键词、视频管理
3. **学习引擎**: 进度追踪、成就系统
4. **分析系统**: 用户行为分析、学习效果评估

## 🛠️ 开发流程

### 分支管理策略
```
main                 # 生产分支
├── develop          # 开发分支
├── feature/xxx      # 功能分支
├── bugfix/xxx       # 修复分支
└── hotfix/xxx       # 热修复分支
```

### 开发工作流
1. **创建功能分支**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/user-profile-update
   ```

2. **开发和测试**
   ```bash
   # 编写代码
   # 运行测试
   npm test
   
   # 代码检查
   npm run lint
   npm run type-check
   ```

3. **提交代码**
   ```bash
   git add .
   git commit -m "feat(profile): add user avatar upload"
   git push origin feature/user-profile-update
   ```

4. **创建 Pull Request**
   - 填写 PR 模板
   - 请求代码审查
   - 确保 CI 通过
   - 合并到 develop 分支

### 提交消息规范
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

类型说明：
- `feat`: 新功能
- `fix`: 修复问题
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建或工具变动

## 🧪 测试指南

### 测试类型
- **单元测试**: 测试单个函数或组件
- **集成测试**: 测试模块间的交互
- **E2E 测试**: 测试完整的用户流程

### 运行测试
```bash
# 运行所有测试
npm test

# 运行特定模块测试
npm run test:backend
npm run test:web
npm run test:mobile

# 监听模式运行测试
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

### 编写测试
```typescript
// 示例：组件测试
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

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

## 📖 学习资源

### 必读文档
- [系统架构文档](../architecture/system-architecture.md)
- [编码规范指南](./coding-standards.md)
- [API 文档](http://localhost:3001/api-docs)
- [代码审查清单](./code-review-checklist.md)

### 技术学习
- **React/Next.js**: [官方文档](https://nextjs.org/docs)
- **React Native**: [官方文档](https://reactnative.dev/docs/getting-started)
- **TypeScript**: [官方手册](https://www.typescriptlang.org/docs/)
- **Prisma**: [官方文档](https://www.prisma.io/docs/)
- **PostgreSQL**: [官方文档](https://www.postgresql.org/docs/)

### 团队资源
- **技术分享**: 每周五下午技术分享会
- **代码审查**: 每个 PR 都需要至少一人审查
- **问题讨论**: 技术问题可在团队群组讨论
- **导师制度**: 新人会分配一位导师协助成长

## 🤝 团队协作

### 沟通渠道
- **日常沟通**: 团队微信群/Slack
- **技术讨论**: GitHub Discussions
- **问题反馈**: GitHub Issues
- **代码审查**: GitHub Pull Requests

### 会议安排
- **每日站会**: 每天上午 9:30 (15分钟)
- **周会**: 每周一上午 10:00 (1小时)
- **技术分享**: 每周五下午 3:00 (1小时)
- **回顾会议**: 每月最后一个周五 (2小时)

### 协作工具
- **代码管理**: GitHub
- **项目管理**: GitHub Projects
- **文档协作**: Notion/飞书文档
- **设计协作**: Figma
- **API 测试**: Postman Team

## 🎯 成长路径

### 初级开发者 (0-3个月)
- 熟悉项目架构和代码规范
- 完成简单的功能开发和 Bug 修复
- 学习团队使用的技术栈
- 参与代码审查过程

### 中级开发者 (3-12个月)
- 独立完成复杂功能开发
- 参与技术方案设计
- 指导新人入职
- 优化现有代码和性能

### 高级开发者 (12个月+)
- 负责核心模块架构设计
- 制定技术标准和最佳实践
- 跨团队技术协作
- 技术选型和决策

## 🆘 常见问题

### Q: 环境搭建失败怎么办？
A: 检查 Node.js 版本，确保数据库连接正常，查看错误日志，或寻求团队帮助。

### Q: 如何获取测试数据？
A: 运行 `npm run db:seed` 填充测试数据，或联系团队获取开发环境数据。

### Q: 代码审查被拒绝怎么办？
A: 仔细阅读审查意见，修改代码后重新提交，不明白的地方及时沟通。

### Q: 如何贡献开源项目？
A: 从小的 Bug 修复开始，逐步参与功能开发，遵循开源贡献指南。

## 📞 联系方式

- **技术负责人**: [技术负责人姓名] - [邮箱]
- **项目经理**: [项目经理姓名] - [邮箱]
- **HR 联系人**: [HR姓名] - [邮箱]
- **紧急联系**: [紧急联系方式]

---

**欢迎加入 SmarTalk 团队，期待你的精彩贡献！** 🚀
