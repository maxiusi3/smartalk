# SmarTalk 迁移指南：从 Railway 到 Vercel + Supabase

## 🎯 迁移概述

本指南将帮助您将 SmarTalk 项目从 Railway 架构迁移到 Vercel + Supabase 架构。

### 迁移前后架构对比

**迁移前 (Railway)**:
```
GitHub → Railway (Node.js + PostgreSQL) ← Vercel (Next.js)
```

**迁移后 (Vercel + Supabase)**:
```
GitHub → Vercel (Next.js + API Routes) ← Supabase (PostgreSQL + Auth + Storage)
```

## 📋 迁移前准备

### 1. 备份现有数据
```bash
# 导出 Railway 数据库
railway db dump > smartalk_backup.sql

# 或使用 pg_dump
pg_dump $DATABASE_URL > smartalk_backup.sql
```

### 2. 记录现有配置
- 环境变量列表
- 数据库结构
- API 端点列表
- 用户认证逻辑

### 3. 准备新服务账号
- [Supabase](https://supabase.com) 账号
- [Vercel](https://vercel.com) 账号（如果还没有）

## 🗄️ 第一步：设置 Supabase 数据库

### 1. 创建 Supabase 项目
1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 点击 "New Project"
3. 选择组织和设置项目名称
4. 选择数据库密码和区域
5. 等待项目创建完成

### 2. 运行数据库迁移
```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录 Supabase
supabase login

# 初始化项目
supabase init

# 链接到远程项目
supabase link --project-ref your-project-ref

# 运行迁移
supabase db push
```

### 3. 导入现有数据
```bash
# 方法1: 使用 Supabase CLI
supabase db reset --linked

# 方法2: 在 Supabase Dashboard 中导入
# 1. 进入 SQL Editor
# 2. 粘贴备份的 SQL 内容
# 3. 执行导入
```

### 4. 配置认证设置
1. 在 Supabase Dashboard 中进入 "Authentication"
2. 配置 Site URL: `https://your-domain.vercel.app`
3. 添加重定向 URLs
4. 配置邮件模板（可选）

## 🔧 第二步：迁移后端 API

### 1. 创建 API 路由结构
```bash
# 在 web 目录下创建 API 路由
mkdir -p web/pages/api/{auth,stories,users,progress,achievements}
```

### 2. 迁移认证逻辑
将现有的 JWT 认证迁移到 Supabase Auth：

**原 Railway 代码**:
```javascript
// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
```

**新 Vercel API 代码**:
```javascript
// web/pages/api/auth/middleware.js
import { createSupabaseServerClient } from '../../../lib/supabase';

export const requireAuth = async (req, res) => {
  const supabase = createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  return user;
};
```

### 3. 迁移数据库查询
将 SQL 查询迁移到 Supabase 客户端：

**原 Railway 代码**:
```javascript
// backend/src/services/storyService.js
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const getStories = async (filters) => {
  const query = `
    SELECT s.*, COUNT(v.id) as video_count 
    FROM stories s 
    LEFT JOIN videos v ON s.id = v.story_id 
    WHERE s.category = $1 
    GROUP BY s.id
  `;
  const result = await pool.query(query, [filters.category]);
  return result.rows;
};
```

**新 Vercel API 代码**:
```javascript
// web/pages/api/stories/index.js
import { createSupabaseServerClient } from '../../../lib/supabase';

const getStories = async (filters) => {
  const supabase = createSupabaseServerClient();
  
  let query = supabase
    .from('stories')
    .select(`
      *,
      videos(count)
    `);
    
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};
```

### 4. 批量迁移 API 端点
使用提供的脚本批量创建 API 路由：

```bash
# 运行迁移脚本
node scripts/migrate-api-routes.js
```

## 🌐 第三步：更新前端配置

### 1. 安装 Supabase 依赖
```bash
cd web
npm install @supabase/supabase-js @supabase/ssr @supabase/auth-helpers-nextjs
```

### 2. 更新环境变量
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. 更新 API 调用
将前端的 API 调用从外部 URL 改为内部 API 路由：

**原代码**:
```javascript
// web/src/services/api.js
const API_BASE_URL = 'https://smartalk-backend.railway.app';

const getStories = async () => {
  const response = await fetch(`${API_BASE_URL}/api/stories`);
  return response.json();
};
```

**新代码**:
```javascript
// web/src/services/api.js
const getStories = async () => {
  const response = await fetch('/api/stories');
  return response.json();
};
```

### 4. 更新认证逻辑
```javascript
// web/src/hooks/useAuth.js
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

export const useAuth = () => {
  const supabase = useSupabaseClient();
  const user = useUser();
  
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };
  
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };
  
  return { user, login, logout };
};
```

## 🚀 第四步：部署到 Vercel

### 1. 更新 Vercel 配置
确保 `web/vercel.json` 已更新为新的配置。

### 2. 设置环境变量
在 Vercel Dashboard 中设置：
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. 部署应用
```bash
# 使用 Vercel CLI
vercel --prod

# 或推送到 GitHub 触发自动部署
git add .
git commit -m "Migrate to Vercel + Supabase architecture"
git push origin main
```

## 🧪 第五步：测试和验证

### 1. 功能测试清单
- [ ] 用户注册和登录
- [ ] 故事列表和详情
- [ ] 视频播放
- [ ] 学习进度记录
- [ ] 成就系统
- [ ] 用户资料管理

### 2. 性能测试
```bash
# 使用 Lighthouse 测试性能
npx lighthouse https://your-app.vercel.app --output html

# 使用 WebPageTest
# 访问 https://www.webpagetest.org/
```

### 3. 数据一致性检查
```sql
-- 在 Supabase SQL Editor 中运行
SELECT 
  (SELECT COUNT(*) FROM users) as user_count,
  (SELECT COUNT(*) FROM stories) as story_count,
  (SELECT COUNT(*) FROM videos) as video_count,
  (SELECT COUNT(*) FROM keywords) as keyword_count;
```

## 🔄 第六步：切换流量

### 1. 渐进式迁移
1. 先部署到测试域名
2. 进行全面测试
3. 逐步切换部分流量
4. 监控错误和性能
5. 完全切换

### 2. DNS 切换
```bash
# 更新域名 DNS 记录
# 将 A 记录或 CNAME 指向 Vercel
```

### 3. 监控和回滚计划
- 设置 Vercel Analytics
- 配置 Supabase 监控
- 准备回滚到 Railway 的计划

## 🧹 第七步：清理工作

### 1. 停用 Railway 服务
```bash
# 在确认迁移成功后
railway service delete
```

### 2. 更新文档
- 更新部署文档
- 更新开发环境设置
- 更新团队协作指南

### 3. 团队培训
- Supabase 使用培训
- Vercel 部署流程培训
- 新架构的维护指南

## 🚨 故障排除

### 常见问题

1. **API 路由 404 错误**
   - 检查文件路径是否正确
   - 确认 export default 语法

2. **Supabase 连接错误**
   - 检查环境变量
   - 确认项目 URL 和密钥

3. **认证问题**
   - 检查 Site URL 配置
   - 确认重定向 URL 设置

4. **数据库查询错误**
   - 检查 RLS 策略
   - 确认表权限设置

### 回滚计划
如果迁移出现问题，可以快速回滚：

1. 将 DNS 指向原 Railway 应用
2. 恢复原有的前端配置
3. 从备份恢复数据库（如需要）

## 📊 迁移后优化

### 1. 性能优化
- 启用 Vercel Edge Functions
- 配置 Supabase 连接池
- 优化数据库查询

### 2. 成本优化
- 监控 Vercel 使用量
- 优化 Supabase 查询
- 设置使用量告警

### 3. 安全加固
- 配置 RLS 策略
- 设置 API 速率限制
- 启用审计日志

---

**迁移完成！** 🎉

您的 SmarTalk 应用现在运行在现代化的 Vercel + Supabase 架构上，享受更好的性能、扩展性和开发体验。
