# SmarTalk 数据库迁移指南

## 📋 概述

本指南详细说明如何将 SmarTalk MVP 项目从 SQLite 迁移到 PostgreSQL，包括迁移步骤、验证方法和故障排除。

## 🎯 迁移目标

- **从**: SQLite (开发环境)
- **到**: PostgreSQL (生产就绪)
- **保持**: 数据完整性和应用功能

## 📋 迁移前准备

### 1. 环境要求

```bash
# 检查 Node.js 版本 (需要 16+)
node --version

# 检查 PostgreSQL 安装
psql --version

# 检查 Prisma CLI
npx prisma --version
```

### 2. PostgreSQL 设置

#### 本地开发环境
```bash
# macOS (使用 Homebrew)
brew install postgresql
brew services start postgresql

# 创建数据库
createdb smartalk_mvp

# 创建用户 (可选)
psql -c "CREATE USER smartalk WITH PASSWORD 'your_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE smartalk_mvp TO smartalk;"
```

#### Docker 环境
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: smartalk_mvp
      POSTGRES_USER: smartalk
      POSTGRES_PASSWORD: your_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 3. 环境变量配置

更新 `backend/.env` 文件：

```env
# 原 SQLite 配置 (备份用)
# DATABASE_URL="file:./dev.db"

# 新 PostgreSQL 配置
DATABASE_URL="postgresql://smartalk:your_password@localhost:5432/smartalk_mvp?schema=public"
```

## 🔄 迁移步骤

### 方法一：自动迁移脚本 (推荐)

```bash
# 1. 运行自动迁移脚本
cd backend
npm run migrate:postgresql

# 2. 验证迁移结果
npm run verify:postgresql
```

### 方法二：手动迁移

#### 步骤 1: 备份现有数据

```bash
# 备份 SQLite 数据库
cp backend/prisma/dev.db backups/dev.db.backup

# 导出数据 (如果有数据)
sqlite3 backend/prisma/dev.db .dump > backups/sqlite-dump.sql
```

#### 步骤 2: 更新 Schema

```prisma
// backend/prisma/schema.prisma
datasource db {
  provider = "postgresql"  // 从 "sqlite" 改为 "postgresql"
  url      = env("DATABASE_URL")
}

// 更新 JSON 字段类型
model AnalyticsEvent {
  // ...
  eventData  Json?    @map("event_data") // 从 String? 改为 Json?
  // ...
}
```

#### 步骤 3: 生成和推送 Schema

```bash
# 生成 Prisma 客户端
npx prisma generate

# 推送 schema 到 PostgreSQL
npx prisma db push

# 或者使用迁移 (推荐用于生产)
npx prisma migrate dev --name init
```

#### 步骤 4: 数据迁移 (如果需要)

如果有现有数据需要迁移：

```bash
# 使用自定义脚本导入数据
node scripts/import-data.js
```

## ✅ 验证迁移

### 1. 连接测试

```bash
# 使用验证脚本
npm run verify:postgresql

# 或手动测试
npx prisma studio
```

### 2. 应用测试

```bash
# 启动后端服务
npm run dev

# 运行测试套件
npm test

# 检查 API 端点
curl http://localhost:3001/api/v1/health
```

### 3. 数据完整性检查

```sql
-- 连接到 PostgreSQL
psql "postgresql://smartalk:your_password@localhost:5432/smartalk_mvp"

-- 检查表结构
\dt

-- 检查数据
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM interests;
SELECT COUNT(*) FROM dramas;
```

## 🔧 配置更新

### 1. 环境配置

更新所有环境的数据库配置：

```bash
# 开发环境
DATABASE_URL="postgresql://smartalk:password@localhost:5432/smartalk_mvp?schema=public"

# 测试环境
TEST_DATABASE_URL="postgresql://smartalk:password@localhost:5432/smartalk_test?schema=public"

# 生产环境 (示例)
DATABASE_URL="postgresql://user:password@prod-host:5432/smartalk_prod?schema=public&sslmode=require"
```

### 2. 部署配置

更新 CI/CD 和部署脚本：

```yaml
# .github/workflows/deploy.yml
- name: Setup PostgreSQL
  run: |
    sudo apt-get install postgresql-client
    
- name: Run migrations
  run: |
    npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## 🚨 故障排除

### 常见问题

#### 1. 连接失败
```
Error: Can't reach database server
```

**解决方案**:
- 检查 PostgreSQL 是否运行: `brew services list | grep postgres`
- 验证连接字符串格式
- 检查防火墙设置

#### 2. 权限错误
```
Error: permission denied for database
```

**解决方案**:
```sql
GRANT ALL PRIVILEGES ON DATABASE smartalk_mvp TO smartalk;
GRANT ALL ON SCHEMA public TO smartalk;
```

#### 3. Schema 推送失败
```
Error: Schema validation failed
```

**解决方案**:
- 检查 PostgreSQL 版本兼容性
- 验证 schema.prisma 语法
- 清理并重新生成: `npx prisma generate`

#### 4. 数据类型不兼容
```
Error: Invalid value for field type
```

**解决方案**:
- 检查 SQLite 到 PostgreSQL 的类型映射
- 更新数据转换逻辑
- 使用 PostgreSQL 特定的数据类型

### 回滚步骤

如果迁移失败，可以回滚到 SQLite：

```bash
# 1. 恢复原始 schema
cp backend/prisma/schema.prisma.sqlite.backup backend/prisma/schema.prisma

# 2. 恢复数据库文件
cp backups/dev.db.backup backend/prisma/dev.db

# 3. 更新环境变量
# DATABASE_URL="file:./dev.db"

# 4. 重新生成客户端
npx prisma generate
```

## 📊 性能优化

### 1. 索引优化

```sql
-- 为常用查询添加索引
CREATE INDEX idx_users_device_id ON users(device_id);
CREATE INDEX idx_user_progress_user_drama ON user_progress(user_id, drama_id);
CREATE INDEX idx_analytics_events_user_type ON analytics_events(user_id, event_type);
```

### 2. 连接池配置

```env
# 数据库连接池设置
DATABASE_URL="postgresql://user:password@host:5432/db?schema=public&connection_limit=10&pool_timeout=20"
```

### 3. 查询优化

```typescript
// 使用 Prisma 查询优化
const users = await prisma.user.findMany({
  select: {
    id: true,
    deviceId: true,
    // 只选择需要的字段
  },
  take: 100, // 限制结果数量
});
```

## 📚 参考资源

- [Prisma PostgreSQL 指南](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [SQLite 到 PostgreSQL 迁移指南](https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate/team-development)

## 🎯 下一步

迁移完成后的建议：

1. **监控设置**: 配置数据库性能监控
2. **备份策略**: 建立定期备份机制
3. **安全加固**: 配置 SSL 连接和访问控制
4. **性能调优**: 根据使用模式优化查询和索引
5. **文档更新**: 更新开发和部署文档

---

**最后更新**: 2024-01-19
**维护者**: SmarTalk 技术团队
