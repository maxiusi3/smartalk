# 🚀 SmarTalk Vercel + Supabase 快速部署指南

## 📋 部署概述

本指南将帮助您在 **15 分钟内** 将 SmarTalk 部署到 Vercel + Supabase 架构。

### 🎯 部署后您将获得：
- ✅ 全球 CDN 加速的 Web 应用
- ✅ 自动扩展的 Serverless API
- ✅ 完整的用户认证系统
- ✅ 实时数据库和存储
- ✅ 专业的监控和分析

## 🛠️ 准备工作 (5 分钟)

### 1. 注册必需账号
- [Supabase](https://supabase.com) - 数据库和后端服务
- [Vercel](https://vercel.com) - 前端部署和 API 托管

### 2. 检查本地环境
```bash
# 检查 Node.js 版本 (需要 >= 18)
node --version

# 检查 npm
npm --version

# 检查 git
git --version
```

## 🧙‍♂️ 方法一：使用配置向导 (推荐)

### 步骤 1: 运行配置向导
```bash
./scripts/setup-wizard.sh
```

向导将引导您：
1. 🗄️ 配置 Supabase 项目
2. 🌐 设置 Vercel 项目
3. ⚙️ 配置第三方服务（可选）
4. 🔒 查看安全建议

### 步骤 2: 运行一键部署
```bash
./scripts/deploy-vercel-supabase.sh
```

部署脚本将自动：
- ✅ 验证配置和连接
- ✅ 安装必需依赖
- ✅ 构建和部署应用
- ✅ 配置环境变量
- ✅ 运行部署后验证

## 🔧 方法二：手动部署

### 步骤 1: 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 点击 "New Project"
3. 设置项目信息：
   - 项目名称：`smartalk-production`
   - 数据库密码：设置强密码
   - 区域：选择 `Singapore` 或 `Tokyo`

4. 等待项目创建完成（约 2 分钟）

### 步骤 2: 配置数据库

1. 进入 Supabase Dashboard > SQL Editor
2. 复制并执行 `supabase/migrations/001_initial_schema.sql` 中的内容
3. 复制并执行 `supabase/seed.sql` 中的示例数据（可选）

### 步骤 3: 获取 Supabase 配置

在 Supabase Dashboard > Settings > API 中获取：
- `Project URL`
- `anon/public key`
- `service_role key`

### 步骤 4: 部署到 Vercel

1. 安装 Vercel CLI：
```bash
npm install -g vercel
```

2. 登录 Vercel：
```bash
vercel login
```

3. 在项目根目录运行：
```bash
cd web
vercel --prod
```

4. 设置环境变量：
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

## 🔐 环境变量配置

### 必需变量
```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# 应用配置
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_ENV=production
```

### 可选变量（增强功能）
```bash
# Redis 缓存
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# 邮件服务
RESEND_API_KEY=re_...

# 错误监控
SENTRY_DSN=https://...
```

## ✅ 部署验证

### 1. 检查应用状态
访问您的应用 URL，确认：
- [ ] 首页正常加载
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 故事列表显示正常

### 2. 检查 API 健康状态
访问 `https://your-app.vercel.app/api/health`，应该返回：
```json
{
  "status": "healthy",
  "checks": {
    "database": true,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. 检查数据库连接
在 Supabase Dashboard > Table Editor 中确认：
- [ ] 表结构已创建
- [ ] 示例数据已导入（如果执行了 seed.sql）

## 🎨 自定义配置

### 1. 配置自定义域名
```bash
# 在 Vercel 中添加域名
vercel domains add your-domain.com

# 更新环境变量
vercel env add NEXT_PUBLIC_APP_URL production
# 输入: https://your-domain.com
```

### 2. 配置邮件模板
1. 进入 Supabase Dashboard > Authentication > Email Templates
2. 自定义注册确认、密码重置等邮件模板

### 3. 配置认证设置
在 Supabase Dashboard > Authentication > Settings 中：
- 设置 Site URL: `https://your-app.vercel.app`
- 添加重定向 URLs
- 配置密码策略

## 📊 监控和维护

### 1. 性能监控
- **Vercel Analytics**: 自动启用，查看访问统计
- **Supabase Dashboard**: 监控数据库性能和使用量

### 2. 错误监控
如果配置了 Sentry：
- 访问 Sentry Dashboard 查看错误报告
- 设置告警规则

### 3. 日常维护
- 定期检查 Supabase 使用量
- 监控 Vercel 函数执行时间
- 更新依赖包版本

## 💰 成本估算

### 免费额度（适合 MVP）
| 服务 | 免费额度 | 预估够用时长 |
|------|----------|-------------|
| Vercel | 100GB 带宽/月 | 3-6 个月 |
| Supabase | 500MB 数据库 | 6-12 个月 |
| **总成本** | **$0/月** | **适合初期验证** |

### 付费升级建议
当达到以下指标时考虑升级：
- 月活用户 > 1000
- 数据库大小 > 400MB
- 月带宽 > 80GB

## 🆘 故障排除

### 常见问题

1. **部署失败**
   ```bash
   # 检查 Node.js 版本
   node --version  # 需要 >= 18
   
   # 清理缓存重试
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **数据库连接错误**
   - 检查 Supabase URL 和密钥是否正确
   - 确认 Supabase 项目状态正常
   - 检查网络连接

3. **认证问题**
   - 确认 Site URL 配置正确
   - 检查重定向 URLs 设置
   - 验证环境变量是否正确设置

4. **API 路由 404**
   - 确认文件路径正确
   - 检查 `export default` 语法
   - 验证 Vercel 函数配置

### 获取帮助
- 📖 查看详细文档：`docs/deployment/vercel-supabase-implementation.md`
- 🐛 提交问题：GitHub Issues
- 💬 社区支持：Discord/Slack

## 🎉 部署成功！

恭喜！您的 SmarTalk 应用现在运行在现代化的 Vercel + Supabase 架构上。

### 下一步建议：
1. 🎨 自定义应用外观和品牌
2. 📝 添加更多学习内容
3. 📊 配置分析和监控
4. 🔒 加强安全配置
5. 🚀 推广您的应用

**享受您的英语学习平台吧！** 🌟
