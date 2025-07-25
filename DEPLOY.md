# 🚀 SmarTalk 快速部署指南

## 📋 部署前准备

### 1. 账号注册
请先注册以下服务账号：
- [GitHub](https://github.com) - 代码托管
- [Vercel](https://vercel.com) - 前端部署
- [Railway](https://railway.app) - 后端部署
- [Supabase](https://supabase.com) - 数据库服务 (可选)

### 2. 环境要求
- Node.js >= 18.0.0
- Git 最新版本
- 网络连接良好

## 🎯 一键部署 (推荐)

### 方法一：使用部署脚本
```bash
# 1. 克隆项目 (如果还没有)
git clone https://github.com/your-username/smartalk.git
cd smartalk

# 2. 运行一键部署脚本
./scripts/deploy.sh production
```

### 方法二：手动部署

#### 步骤 1: 准备代码
```bash
# 确保代码已推送到 GitHub
git add .
git commit -m "准备部署到生产环境"
git push origin main
```

#### 步骤 2: 部署后端到 Railway
1. 访问 [Railway](https://railway.app)
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择 SmarTalk 仓库
5. 设置配置：
   - Root Directory: `backend`
   - Build Command: `npm run build`
   - Start Command: `npm start`

6. 添加 PostgreSQL 数据库：
   - 在项目中点击 "New Service"
   - 选择 "PostgreSQL"
   - 复制数据库连接 URL

7. 设置环境变量：
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-super-secret-jwt-key-32-characters-long
   JWT_REFRESH_SECRET=your-refresh-secret-key-32-characters-long
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```

#### 步骤 3: 部署前端到 Vercel
1. 访问 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 选择 SmarTalk 仓库
4. 设置配置：
   - Framework Preset: Next.js
   - Root Directory: `web`
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. 设置环境变量：
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.railway.app
   NEXT_PUBLIC_APP_ENV=production
   ```

#### 步骤 4: 配置域名 (可选)
1. 在 Vercel 项目设置中添加自定义域名
2. 在 Railway 项目设置中配置自定义域名
3. 更新 CORS 配置

## 🔧 环境变量配置

### Railway (后端) 必需变量
```bash
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-key-32-characters-long
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### Vercel (前端) 必需变量
```bash
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_APP_ENV=production
```

## 📊 部署验证

### 检查部署状态
1. **前端检查**
   - 访问 Vercel 提供的 URL
   - 确认页面正常加载
   - 检查控制台无错误

2. **后端检查**
   - 访问 `https://your-backend-url.railway.app/api/v1/health`
   - 确认返回健康状态
   - 检查 API 文档: `https://your-backend-url.railway.app/api-docs`

3. **数据库检查**
   - 在 Railway 控制台查看数据库连接状态
   - 确认数据库表已创建

### 常见问题排查
1. **构建失败**
   - 检查 Node.js 版本
   - 确认所有依赖已正确安装
   - 查看构建日志

2. **环境变量问题**
   - 确认所有必需变量已设置
   - 检查变量名拼写
   - 验证变量值格式

3. **CORS 错误**
   - 确认后端 CORS_ORIGIN 包含前端域名
   - 检查协议 (http/https) 是否匹配

## 🔄 自动化部署

### GitHub Actions 设置
1. 在 GitHub 仓库设置中添加 Secrets：
   ```
   RAILWAY_TOKEN=your-railway-token
   VERCEL_TOKEN=your-vercel-token
   VERCEL_ORG_ID=your-org-id
   VERCEL_PROJECT_ID=your-project-id
   ```

2. 推送到 main 分支将自动触发部署

### 本地 CLI 部署
```bash
# 安装 CLI 工具
npm install -g @railway/cli vercel

# 登录
railway login
vercel login

# 部署
railway up --service backend
vercel --prod
```

## 📈 性能优化

### 前端优化
- 启用 Vercel 的自动优化
- 配置 CDN 缓存
- 启用图片优化

### 后端优化
- 配置数据库连接池
- 启用 Redis 缓存
- 设置适当的内存限制

## 🔐 安全配置

### SSL 证书
- Vercel 和 Railway 自动提供 SSL 证书
- 确保所有连接使用 HTTPS

### 环境变量安全
- 使用强密码和密钥
- 定期轮换敏感信息
- 不要在代码中硬编码密钥

## 📞 技术支持

### 获取帮助
1. 查看部署日志
2. 检查服务状态页面
3. 联系技术支持团队

### 有用链接
- [Vercel 文档](https://vercel.com/docs)
- [Railway 文档](https://docs.railway.app)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)

---

## 🎉 部署成功！

恭喜！您的 SmarTalk 网站现在已经成功部署到生产环境。

### 访问地址
- **前端**: https://your-project.vercel.app
- **后端**: https://your-backend.railway.app
- **API 文档**: https://your-backend.railway.app/api-docs

### 下一步
1. 配置自定义域名
2. 设置监控和告警
3. 配置备份策略
4. 优化性能和安全性

**祝您使用愉快！** 🚀
