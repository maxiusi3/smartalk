# SmarTalk 网站发布指南

## 🚀 快速部署 (推荐)

### 方案一：现代云平台一键部署

#### 前端部署 - Vercel
1. **准备工作**
   ```bash
   # 确保项目已推送到 GitHub
   git add .
   git commit -m "准备部署"
   git push origin main
   ```

2. **Vercel 部署**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录
   - 点击 "New Project"
   - 选择 SmarTalk 仓库
   - 配置项目设置：
     - Framework Preset: Next.js
     - Root Directory: `web`
     - Build Command: `npm run build`
     - Output Directory: `.next`

3. **环境变量配置**
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.railway.app
   NEXT_PUBLIC_APP_ENV=production
   ```

#### 后端部署 - Railway
1. **Railway 部署**
   - 访问 [railway.app](https://railway.app)
   - 使用 GitHub 账号登录
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择 SmarTalk 仓库
   - 设置 Root Directory: `backend`

2. **数据库配置**
   - 在 Railway 项目中添加 PostgreSQL 服务
   - 复制数据库连接 URL

3. **环境变量配置**
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   JWT_SECRET=your-super-secret-jwt-key-32-characters-long
   JWT_REFRESH_SECRET=your-refresh-secret-key-32-characters-long
   NODE_ENV=production
   PORT=3001
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```

#### 域名配置
1. **Vercel 域名**
   - 在 Vercel 项目设置中添加自定义域名
   - 配置 DNS 记录指向 Vercel

2. **Railway 域名**
   - Railway 会自动提供一个域名
   - 可以在设置中配置自定义域名

### 方案二：传统云服务器部署

#### 服务器要求
- Ubuntu 20.04+ 或 CentOS 7+
- 2GB+ RAM
- 20GB+ 存储空间
- Node.js 18+
- PostgreSQL 14+
- Nginx

#### 部署步骤
1. **服务器准备**
   ```bash
   # 更新系统
   sudo apt update && sudo apt upgrade -y
   
   # 安装 Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # 安装 PostgreSQL
   sudo apt install postgresql postgresql-contrib -y
   
   # 安装 Nginx
   sudo apt install nginx -y
   
   # 安装 PM2
   sudo npm install -g pm2
   ```

2. **项目部署**
   ```bash
   # 克隆项目
   git clone https://github.com/your-username/smartalk.git
   cd smartalk
   
   # 安装依赖
   npm install
   
   # 构建项目
   npm run build
   
   # 启动服务
   pm2 start ecosystem.config.js
   ```

3. **Nginx 配置**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # 前端
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
       
       # 后端 API
       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🔧 部署配置文件

### Vercel 配置
创建 `web/vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend-url.railway.app/api/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_BASE_URL": "https://your-backend-url.railway.app"
  }
}
```

### Railway 配置
创建 `backend/railway.toml`:
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[env]
NODE_ENV = "production"
```

### PM2 配置
创建 `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'smartalk-backend',
      script: './backend/dist/index.js',
      cwd: './backend',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'smartalk-frontend',
      script: 'npm',
      args: 'start',
      cwd: './web',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
```

## 🔐 SSL 证书配置

### Let's Encrypt (免费)
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 监控和日志

### 应用监控
```bash
# PM2 监控
pm2 monit

# 查看日志
pm2 logs

# 重启应用
pm2 restart all
```

### 系统监控
```bash
# 安装监控工具
sudo apt install htop iotop -y

# 查看系统状态
htop
```

## 🔄 自动化部署

### GitHub Actions
创建 `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build project
        run: npm run build
        
      - name: Deploy to Railway
        uses: railway-app/railway@v1
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}
          
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🚨 故障排除

### 常见问题
1. **构建失败**
   - 检查 Node.js 版本
   - 确认所有依赖已安装
   - 查看构建日志

2. **数据库连接失败**
   - 检查数据库 URL
   - 确认网络连接
   - 验证数据库权限

3. **环境变量问题**
   - 确认所有必需的环境变量已设置
   - 检查变量名拼写
   - 验证变量值格式

### 日志查看
```bash
# Vercel 日志
vercel logs

# Railway 日志
railway logs

# PM2 日志
pm2 logs smartalk-backend
pm2 logs smartalk-frontend
```

## 📋 部署检查清单

### 部署前检查
- [ ] 代码已推送到 GitHub
- [ ] 所有测试通过
- [ ] 环境变量已配置
- [ ] 数据库已设置
- [ ] 域名已准备

### 部署后检查
- [ ] 网站可以正常访问
- [ ] API 接口正常工作
- [ ] 数据库连接正常
- [ ] SSL 证书有效
- [ ] 监控系统正常

## 🎯 性能优化

### 前端优化
- 启用 Gzip 压缩
- 配置 CDN
- 图片优化
- 代码分割

### 后端优化
- 数据库索引优化
- 缓存策略
- 连接池配置
- 负载均衡

## 📞 技术支持

如果在部署过程中遇到问题，可以：
1. 查看项目文档
2. 检查日志文件
3. 联系技术支持团队

---

**祝您部署顺利！** 🚀
