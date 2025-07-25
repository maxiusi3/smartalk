# SmarTalk Backend API

SmarTalk MVP后端API服务，基于Node.js + Express.js + PostgreSQL + Prisma构建。

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- PostgreSQL >= 13
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 环境配置

1. 复制环境变量模板：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，配置数据库连接和其他环境变量：
```env
DATABASE_URL="postgresql://username:password@localhost:5432/smartalk_mvp?schema=public"
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
```

### 数据库设置

1. 生成Prisma客户端：
```bash
npm run db:generate
```

2. 推送数据库schema：
```bash
npm run db:push
```

3. 运行数据库种子（可选）：
```bash
npm run db:seed
```

### 启动开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:3001 启动

## 📚 API文档

### 健康检查
- `GET /api/v1/health` - 服务器健康状态检查

### 用户管理
- `POST /api/v1/users/anonymous` - 创建匿名用户
- `GET /api/v1/users/:userId/progress/:dramaId` - 获取用户进度

### 内容管理
- `GET /api/v1/interests` - 获取所有兴趣主题
- `GET /api/v1/dramas/by-interest/:interestId` - 根据兴趣获取剧集
- `GET /api/v1/dramas/:dramaId/keywords` - 获取剧集词汇

### 进度跟踪
- `POST /api/v1/progress/unlock` - 更新词汇学习进度

### 数据分析
- `POST /api/v1/analytics/events` - 记录用户行为事件

## 🧪 测试

运行所有测试：
```bash
npm test
```

运行测试并监听文件变化：
```bash
npm run test:watch
```

生成测试覆盖率报告：
```bash
npm run test:coverage
```

## 🛠️ 开发工具

### 数据库管理
```bash
# 打开Prisma Studio（数据库可视化工具）
npm run db:studio

# 创建新的数据库迁移
npm run db:migrate

# 重置数据库并重新种子
npm run db:push && npm run db:seed
```

### 代码质量
```bash
# 运行ESLint检查
npm run lint

# 自动修复ESLint问题
npm run lint:fix
```

## 📁 项目结构

```
backend/
├── src/
│   ├── controllers/     # 控制器层
│   ├── services/        # 业务逻辑层
│   ├── routes/          # 路由定义
│   ├── middleware/      # 中间件
│   ├── utils/           # 工具函数
│   ├── scripts/         # 脚本文件
│   └── __tests__/       # 测试文件
├── prisma/
│   └── schema.prisma    # 数据库schema
├── dist/                # 编译输出
└── uploads/             # 文件上传目录
```

## 🔧 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DATABASE_URL` | PostgreSQL数据库连接字符串 | - |
| `PORT` | 服务器端口 | 3001 |
| `NODE_ENV` | 运行环境 | development |
| `JWT_SECRET` | JWT签名密钥 | - |
| `CORS_ORIGIN` | CORS允许的源 | http://localhost:3000 |

## 📝 开发注意事项

1. **数据库迁移**：修改schema后记得运行 `npm run db:push`
2. **类型安全**：使用TypeScript，确保类型定义正确
3. **错误处理**：所有API都应该有适当的错误处理
4. **测试覆盖**：新功能需要编写相应的测试用例
5. **代码规范**：提交前运行 `npm run lint` 检查代码质量
