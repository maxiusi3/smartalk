# SmarTalk 系统架构文档

## 📋 概述

SmarTalk 是一个神经沉浸式英语学习平台，采用现代化的微服务架构，支持 Web、移动端多平台访问。

## 🏗️ 整体架构

### 架构原则
- **模块化设计**: 各模块职责清晰，低耦合高内聚
- **可扩展性**: 支持水平扩展和垂直扩展
- **高可用性**: 关键服务具备容错和恢复能力
- **性能优化**: 多层缓存和性能监控
- **安全第一**: 全链路安全防护

### 系统分层

```
┌─────────────────────────────────────────────────────────────┐
│                    用户界面层 (Presentation Layer)              │
├─────────────────────┬─────────────────────┬─────────────────────┤
│     Web 应用        │     移动端应用       │     管理后台         │
│   (Next.js)        │  (React Native)     │   (React Admin)     │
└─────────────────────┴─────────────────────┴─────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                    API 网关层 (API Gateway)                  │
├─────────────────────────────────────────────────────────────┤
│  • 路由转发  • 认证授权  • 限流熔断  • 监控日志  • 协议转换    │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                    业务服务层 (Business Layer)               │
├─────────────────────┬─────────────────────┬─────────────────────┤
│    用户服务         │    内容服务         │    学习服务          │
│  (User Service)    │ (Content Service)   │ (Learning Service)  │
├─────────────────────┼─────────────────────┼─────────────────────┤
│    认证服务         │    分析服务         │    通知服务          │
│  (Auth Service)    │ (Analytics Service) │ (Notification)      │
└─────────────────────┴─────────────────────┴─────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                    数据访问层 (Data Access Layer)            │
├─────────────────────┬─────────────────────┬─────────────────────┤
│    关系数据库       │    缓存系统         │    文件存储          │
│   (PostgreSQL)     │     (Redis)        │      (AWS S3)       │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

## 🔧 技术栈

### 前端技术栈
- **Web**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Mobile**: React Native 0.72, TypeScript, React Navigation
- **状态管理**: Zustand, React Query
- **UI 组件**: 自研组件库 + Headless UI
- **构建工具**: Webpack, Metro, ESBuild

### 后端技术栈
- **运行时**: Node.js 18+
- **框架**: Express.js
- **语言**: TypeScript
- **ORM**: Prisma
- **数据库**: PostgreSQL 14+
- **缓存**: Redis 7+
- **文件存储**: AWS S3 / 阿里云 OSS

### 基础设施
- **容器化**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **监控**: Prometheus + Grafana
- **日志**: ELK Stack
- **部署**: AWS / 阿里云

## 📊 数据架构

### 数据库设计

#### 核心实体关系
```
User (用户)
├── UserProfile (用户资料)
├── UserProgress (学习进度)
└── UserKeywordProgress (关键词进度)

Story (故事)
├── Keyword (关键词)
│   └── Video (视频)
└── Chapter (章节)

Analytics (分析数据)
├── UserEvent (用户事件)
├── LearningMetrics (学习指标)
└── PerformanceMetrics (性能指标)
```

#### 数据分片策略
- **用户数据**: 按用户ID分片
- **内容数据**: 按故事类型分片
- **分析数据**: 按时间分片

### 缓存策略

#### 多层缓存架构
```
Browser Cache (浏览器缓存)
    ↓
CDN Cache (CDN缓存)
    ↓
API Gateway Cache (网关缓存)
    ↓
Application Cache (应用缓存)
    ↓
Database Cache (数据库缓存)
```

#### 缓存策略
- **静态资源**: CDN + 长期缓存
- **API 响应**: Redis + TTL 策略
- **用户会话**: Redis + 滑动过期
- **数据库查询**: 查询结果缓存

## 🔐 安全架构

### 认证授权
- **认证方式**: JWT + Refresh Token
- **授权模型**: RBAC (基于角色的访问控制)
- **会话管理**: 无状态 + Redis 会话存储
- **密码策略**: BCrypt + 盐值加密

### 数据安全
- **传输加密**: HTTPS/TLS 1.3
- **存储加密**: 数据库字段级加密
- **敏感信息**: 环境变量 + 密钥管理
- **数据脱敏**: 日志和分析数据脱敏

### 安全防护
- **输入验证**: 参数校验 + SQL注入防护
- **输出编码**: XSS 防护
- **访问控制**: IP 白名单 + 频率限制
- **安全监控**: 异常行为检测

## 🚀 性能架构

### 性能优化策略
- **代码分割**: 路由级别 + 组件级别
- **懒加载**: 图片 + 组件 + 路由
- **预加载**: 关键资源预加载
- **压缩优化**: Gzip + Brotli

### 监控体系
- **应用监控**: APM + 错误追踪
- **基础设施监控**: 系统资源监控
- **业务监控**: 关键指标监控
- **用户体验监控**: 真实用户监控

### 性能指标
- **响应时间**: API < 500ms, 页面 < 2s
- **吞吐量**: 1000+ QPS
- **可用性**: 99.9%+
- **错误率**: < 0.1%

## 🔄 部署架构

### 环境划分
- **开发环境**: 本地开发 + 功能测试
- **测试环境**: 集成测试 + 性能测试
- **预生产环境**: 生产数据 + 灰度发布
- **生产环境**: 正式服务 + 高可用部署

### 部署策略
- **蓝绿部署**: 零停机部署
- **滚动更新**: 渐进式更新
- **灰度发布**: 风险控制
- **回滚机制**: 快速回滚

### 容器化部署
```yaml
# Docker Compose 架构示例
services:
  nginx:          # 负载均衡
  api-gateway:    # API 网关
  user-service:   # 用户服务
  content-service: # 内容服务
  learning-service: # 学习服务
  postgres:       # 数据库
  redis:          # 缓存
  monitoring:     # 监控服务
```

## 📈 扩展性设计

### 水平扩展
- **无状态服务**: 支持多实例部署
- **数据库分片**: 支持数据水平分割
- **缓存集群**: Redis 集群模式
- **负载均衡**: 多层负载均衡

### 垂直扩展
- **资源优化**: CPU + 内存优化
- **数据库优化**: 索引 + 查询优化
- **缓存优化**: 缓存命中率优化
- **代码优化**: 算法 + 数据结构优化

## 🔧 开发架构

### 代码组织
```
smartalk/
├── backend/          # 后端服务
│   ├── src/
│   │   ├── controllers/  # 控制器
│   │   ├── services/     # 业务逻辑
│   │   ├── models/       # 数据模型
│   │   ├── middleware/   # 中间件
│   │   └── utils/        # 工具函数
│   └── tests/           # 测试文件
├── mobile/          # 移动端应用
│   ├── src/
│   │   ├── components/   # 组件
│   │   ├── screens/      # 页面
│   │   ├── navigation/   # 导航
│   │   └── services/     # 服务
│   └── tests/
├── web/             # Web 应用
│   ├── src/
│   │   ├── components/   # 组件
│   │   ├── pages/        # 页面
│   │   ├── hooks/        # Hooks
│   │   └── utils/        # 工具
│   └── tests/
├── shared/          # 共享代码
│   ├── components/       # 共享组件
│   ├── utils/           # 共享工具
│   ├── constants/       # 常量定义
│   └── types/           # 类型定义
└── docs/            # 文档
```

### 开发流程
1. **需求分析** → 技术方案设计
2. **接口设计** → API 文档编写
3. **数据库设计** → 数据模型定义
4. **编码实现** → 单元测试编写
5. **集成测试** → 性能测试
6. **代码审查** → 部署发布

## 📋 技术决策记录

### ADR-001: 选择 PostgreSQL 作为主数据库
- **决策**: 使用 PostgreSQL 替代 MySQL
- **理由**: 更好的 JSON 支持、复杂查询能力、扩展性
- **影响**: 需要团队学习 PostgreSQL 特性

### ADR-002: 采用 Monorepo 架构
- **决策**: 使用单一代码仓库管理多个项目
- **理由**: 代码共享、依赖管理、构建优化
- **影响**: 需要配置复杂的构建工具链

### ADR-003: 选择 React Native 开发移动端
- **决策**: 使用 React Native 而非原生开发
- **理由**: 代码复用、开发效率、团队技能匹配
- **影响**: 某些原生功能需要桥接实现

## 🔮 未来规划

### 短期目标 (3个月)
- [ ] 完善监控和告警系统
- [ ] 优化数据库查询性能
- [ ] 实现自动化测试覆盖
- [ ] 建立完整的 CI/CD 流程

### 中期目标 (6个月)
- [ ] 微服务架构拆分
- [ ] 实现多租户支持
- [ ] 引入机器学习推荐
- [ ] 国际化多语言支持

### 长期目标 (12个月)
- [ ] 云原生架构迁移
- [ ] 实时协作功能
- [ ] AI 智能辅导系统
- [ ] 全球化部署

---

**文档维护**: 本文档应随系统演进持续更新，确保架构文档与实际系统保持一致。
