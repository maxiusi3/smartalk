# SmarTalk 代码适配总结：Vercel + Supabase 架构

## 🔄 主要代码变更

### 1. 架构变更概述

**从**: 传统的 Node.js 后端 + PostgreSQL
**到**: Serverless API Routes + Supabase BaaS

### 2. 文件结构变更

```
原结构:
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   └── middleware/
│   └── package.json
├── web/
│   └── src/
└── shared/

新结构:
├── web/
│   ├── pages/api/          # 新增：API Routes
│   ├── lib/supabase.ts     # 新增：Supabase 配置
│   └── src/
├── supabase/               # 新增：数据库迁移
│   ├── migrations/
│   └── seed.sql
└── shared/
```

## 📝 具体代码变更

### 1. 数据库连接

**原 Railway 代码**:
```javascript
// backend/src/config/database.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = pool;
```

**新 Vercel + Supabase 代码**:
```typescript
// web/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### 2. 用户认证

**原 Railway 代码**:
```javascript
// backend/src/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const login = async (req, res) => {
  const { email, password } = req.body;
  
  // 查询用户
  const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  
  // 验证密码
  const validPassword = await bcrypt.compare(password, user.rows[0].password);
  
  if (validPassword) {
    const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET);
    res.json({ token, user: user.rows[0] });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};
```

**新 Vercel + Supabase 代码**:
```typescript
// web/pages/api/auth/login.ts
import { createSupabaseServerClient } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, password } = req.body;
  const supabase = createSupabaseServerClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  res.json({ user: data.user, session: data.session });
}
```

### 3. 数据查询

**原 Railway 代码**:
```javascript
// backend/src/services/storyService.js
const getStories = async (filters = {}) => {
  let query = `
    SELECT s.*, 
           COUNT(v.id) as video_count,
           ARRAY_AGG(k.word) as keywords
    FROM stories s
    LEFT JOIN videos v ON s.id = v.story_id
    LEFT JOIN story_keywords sk ON s.id = sk.story_id
    LEFT JOIN keywords k ON sk.keyword_id = k.id
  `;
  
  const conditions = [];
  const values = [];
  
  if (filters.category) {
    conditions.push(`s.category = $${values.length + 1}`);
    values.push(filters.category);
  }
  
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }
  
  query += ` GROUP BY s.id ORDER BY s.created_at DESC`;
  
  const result = await pool.query(query, values);
  return result.rows;
};
```

**新 Vercel + Supabase 代码**:
```typescript
// web/pages/api/stories/index.ts
const getStories = async (filters = {}) => {
  const supabase = createSupabaseServerClient();
  
  let query = supabase
    .from('stories')
    .select(`
      *,
      videos(count),
      story_keywords(
        keyword:keywords(word)
      )
    `);
  
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  
  query = query.order('created_at', { ascending: false });
  
  const { data, error } = await query;
  if (error) throw error;
  
  return data.map(story => ({
    ...story,
    video_count: story.videos?.[0]?.count || 0,
    keywords: story.story_keywords?.map(sk => sk.keyword.word) || []
  }));
};
```

### 4. 中间件适配

**原 Railway 代码**:
```javascript
// backend/src/middleware/auth.js
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.sendStatus(401);
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
```

**新 Vercel + Supabase 代码**:
```typescript
// web/lib/auth-middleware.ts
export const requireAuth = async (req: NextApiRequest, res: NextApiResponse) => {
  const supabase = createSupabaseServerClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  return user;
};

// 使用方式
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAuth(req, res);
  if (!user) return; // 已经返回了错误响应
  
  // 继续处理逻辑
}
```

### 5. 实时功能

**原 Railway 代码**:
```javascript
// backend/src/websocket.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // 处理消息
    const data = JSON.parse(message);
    
    // 广播给所有客户端
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  });
});
```

**新 Vercel + Supabase 代码**:
```typescript
// web/hooks/useRealtime.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const useRealtime = (table: string, filter?: any) => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const subscription = supabase
      .channel(`public:${table}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: table,
          filter: filter 
        }, 
        (payload) => {
          console.log('Change received!', payload);
          // 更新本地状态
          setData(current => {
            // 根据操作类型更新数据
            switch (payload.eventType) {
              case 'INSERT':
                return [...current, payload.new];
              case 'UPDATE':
                return current.map(item => 
                  item.id === payload.new.id ? payload.new : item
                );
              case 'DELETE':
                return current.filter(item => item.id !== payload.old.id);
              default:
                return current;
            }
          });
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [table, filter]);
  
  return data;
};
```

## 🔧 配置文件变更

### 1. 环境变量

**原 Railway 环境变量**:
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
REDIS_URL=redis://...
NODE_ENV=production
```

**新 Vercel + Supabase 环境变量**:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. 部署配置

**原 Railway 配置**:
```toml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
```

**新 Vercel 配置**:
```json
// vercel.json
{
  "functions": {
    "pages/api/**/*.js": {
      "maxDuration": 30
    }
  },
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
```

## 📦 依赖变更

### 移除的依赖
```json
// 不再需要的后端依赖
{
  "express": "^4.18.0",
  "pg": "^8.8.0",
  "jsonwebtoken": "^8.5.1",
  "bcrypt": "^5.1.0",
  "cors": "^2.8.5",
  "helmet": "^6.0.0"
}
```

### 新增的依赖
```json
// 新增的前端依赖
{
  "@supabase/supabase-js": "^2.38.0",
  "@supabase/ssr": "^0.0.10",
  "@supabase/auth-helpers-nextjs": "^0.8.7",
  "@supabase/auth-helpers-react": "^0.4.2",
  "@supabase/auth-ui-react": "^0.4.6"
}
```

## 🧪 测试适配

### 原测试代码
```javascript
// backend/tests/auth.test.js
const request = require('supertest');
const app = require('../src/app');

describe('Auth Endpoints', () => {
  test('POST /auth/login', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
```

### 新测试代码
```typescript
// web/__tests__/api/auth.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/auth/login';

describe('/api/auth/login', () => {
  test('should login user successfully', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123'
      }
    });
    
    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('user');
  });
});
```

## 📊 性能影响

### 1. 冷启动
- **Railway**: 无冷启动（常驻进程）
- **Vercel**: 100-300ms 冷启动时间

### 2. 数据库连接
- **Railway**: 连接池管理
- **Supabase**: 自动连接池 + 边缘缓存

### 3. 扩展性
- **Railway**: 垂直扩展
- **Vercel**: 无限水平扩展

## 🎯 迁移检查清单

### 代码迁移
- [ ] 数据库连接迁移到 Supabase
- [ ] 认证逻辑迁移到 Supabase Auth
- [ ] API 路由创建和测试
- [ ] 实时功能迁移到 Supabase Realtime
- [ ] 文件上传迁移到 Supabase Storage

### 配置迁移
- [ ] 环境变量更新
- [ ] 部署配置更新
- [ ] DNS 配置更新

### 测试验证
- [ ] 单元测试更新
- [ ] 集成测试验证
- [ ] 端到端测试验证
- [ ] 性能测试对比

### 部署验证
- [ ] 开发环境部署
- [ ] 测试环境部署
- [ ] 生产环境部署
- [ ] 监控和告警设置

---

**总结**: 迁移到 Vercel + Supabase 架构主要涉及将传统的 Node.js 后端逻辑转换为 Serverless API Routes，并利用 Supabase 的 BaaS 功能简化数据库操作、认证和实时功能的实现。虽然需要一定的代码重构，但能获得更好的扩展性、性能和开发体验。
