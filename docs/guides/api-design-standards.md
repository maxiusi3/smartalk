# SmarTalk API 设计标准

## 📋 概述

本文档定义了 SmarTalk 项目的 API 设计标准和最佳实践，确保 API 的一致性、可维护性和易用性。

## 🎯 设计原则

### 核心原则
1. **一致性**: 所有 API 端点遵循统一的命名和响应格式
2. **RESTful**: 遵循 REST 架构风格和 HTTP 语义
3. **可预测性**: API 行为应该符合开发者的直觉预期
4. **向后兼容**: 新版本应保持向后兼容性
5. **文档化**: 所有 API 都应有完整的文档

### 设计目标
- 提供清晰、直观的 API 接口
- 支持高效的客户端开发
- 便于测试和调试
- 支持 API 版本管理
- 提供良好的错误处理

## 🛣️ URL 设计规范

### 基础结构
```
https://api.smartalk.app/v1/{resource}[/{id}][/{sub-resource}]
```

### 命名规则
- **资源名称**: 使用复数名词，小写，用连字符分隔
- **路径参数**: 使用 camelCase
- **查询参数**: 使用 camelCase

### 示例
```
✅ 正确
GET /api/v1/stories
GET /api/v1/stories/123
GET /api/v1/stories/123/videos
GET /api/v1/users/profile
POST /api/v1/auth/login

❌ 错误
GET /api/v1/Story
GET /api/v1/getStories
GET /api/v1/stories_list
GET /api/v1/story/123
```

## 📝 HTTP 方法使用

### 标准方法
| 方法 | 用途 | 示例 |
|------|------|------|
| GET | 获取资源 | `GET /stories` - 获取故事列表 |
| POST | 创建资源 | `POST /stories` - 创建新故事 |
| PUT | 完整更新资源 | `PUT /stories/123` - 完整更新故事 |
| PATCH | 部分更新资源 | `PATCH /stories/123` - 部分更新故事 |
| DELETE | 删除资源 | `DELETE /stories/123` - 删除故事 |

### 特殊操作
对于不符合标准 CRUD 的操作，使用动词形式：
```
POST /auth/login          # 登录
POST /auth/logout         # 登出
POST /auth/refresh        # 刷新令牌
POST /stories/123/like    # 点赞故事
POST /users/reset-password # 重置密码
```

## 📊 响应格式标准

### 统一响应结构
所有 API 响应都应遵循以下结构：

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
  timestamp: string;
  requestId: string;
}
```

### 成功响应示例
```json
{
  "success": true,
  "data": {
    "id": "123",
    "title": "Sample Story",
    "description": "A sample story for learning"
  },
  "meta": {
    "version": "1.0.0"
  },
  "timestamp": "2024-01-25T10:30:00Z",
  "requestId": "req_abc123"
}
```

### 错误响应示例
```json
{
  "success": false,
  "error": {
    "code": "STORY_NOT_FOUND",
    "message": "Story not found with id: 123",
    "details": {
      "storyId": "123"
    }
  },
  "timestamp": "2024-01-25T10:30:00Z",
  "requestId": "req_abc123"
}
```

### 分页响应示例
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Story 1"
    },
    {
      "id": "2", 
      "title": "Story 2"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": "2024-01-25T10:30:00Z",
  "requestId": "req_abc123"
}
```

## 🔢 状态码使用

### 成功状态码
- **200 OK**: 请求成功，返回数据
- **201 Created**: 资源创建成功
- **204 No Content**: 请求成功，无返回内容（如删除操作）

### 客户端错误状态码
- **400 Bad Request**: 请求参数错误
- **401 Unauthorized**: 未认证
- **403 Forbidden**: 无权限
- **404 Not Found**: 资源不存在
- **409 Conflict**: 资源冲突（如重复创建）
- **422 Unprocessable Entity**: 请求格式正确但语义错误
- **429 Too Many Requests**: 请求频率超限

### 服务器错误状态码
- **500 Internal Server Error**: 服务器内部错误
- **503 Service Unavailable**: 服务不可用

## 🔍 查询参数规范

### 分页参数
```
GET /stories?page=1&limit=10
```
- `page`: 页码，从 1 开始
- `limit`: 每页数量，默认 10，最大 100

### 排序参数
```
GET /stories?sort=createdAt&order=desc
```
- `sort`: 排序字段
- `order`: 排序方向，`asc` 或 `desc`

### 过滤参数
```
GET /stories?category=travel&difficulty=beginner
```
- 使用资源字段名作为过滤参数
- 支持多值过滤：`category=travel,business`

### 搜索参数
```
GET /stories?q=english+learning
```
- `q`: 搜索关键词
- 支持全文搜索

### 字段选择
```
GET /stories?fields=id,title,description
```
- `fields`: 指定返回字段，减少数据传输

## 🔐 认证和授权

### 认证方式
使用 Bearer Token 认证：
```
Authorization: Bearer <access_token>
```

### 权限控制
- 使用基于角色的访问控制 (RBAC)
- 在响应中包含权限信息（如适用）

## 📅 版本管理

### 版本策略
- 使用 URL 路径版本控制：`/api/v1/`
- 主版本号表示不兼容的 API 变更
- 保持至少两个版本的向后兼容

### 弃用策略
- 在响应头中包含弃用警告
- 在响应 meta 中包含弃用信息
- 提供至少 6 个月的迁移期

## 🚨 错误处理

### 错误码设计
使用语义化的错误码：
```typescript
enum ApiErrorCode {
  // 通用错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // 业务错误
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  STORY_NOT_FOUND = 'STORY_NOT_FOUND',
}
```

### 错误消息
- 提供清晰、可操作的错误消息
- 包含足够的上下文信息
- 避免暴露敏感信息

### 验证错误
对于字段验证错误，提供详细信息：
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "field": "email",
    "details": {
      "email": ["Email format is invalid"]
    }
  }
}
```

## 📈 性能优化

### 缓存策略
- 使用适当的 HTTP 缓存头
- 实现 ETag 支持
- 提供条件请求支持

### 数据优化
- 支持字段选择减少数据传输
- 实现数据压缩
- 使用分页避免大数据集

### 速率限制
- 实现 API 速率限制
- 在响应头中包含限制信息：
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## 🧪 测试标准

### API 测试要求
- 每个端点都应有单元测试
- 包含集成测试验证端到端流程
- 测试各种错误场景
- 验证响应格式和状态码

### 测试数据
- 使用一致的测试数据
- 提供测试环境的种子数据
- 确保测试的可重复性

## 📚 文档标准

### API 文档要求
- 使用 OpenAPI/Swagger 规范
- 包含详细的请求/响应示例
- 提供错误码说明
- 包含认证和授权信息

### 文档维护
- 代码变更时同步更新文档
- 定期审查文档的准确性
- 提供变更日志

## 🔧 开发工具

### 推荐工具
- **API 设计**: OpenAPI/Swagger Editor
- **API 测试**: Postman, Insomnia
- **API 监控**: Prometheus, Grafana
- **文档生成**: Swagger UI, Redoc

### 代码生成
- 使用 OpenAPI 规范生成客户端 SDK
- 自动生成 API 文档
- 生成测试用例模板

## ✅ 检查清单

### API 设计检查清单
- [ ] URL 遵循 RESTful 设计原则
- [ ] 使用正确的 HTTP 方法
- [ ] 响应格式符合统一标准
- [ ] 错误处理完整且一致
- [ ] 包含适当的状态码
- [ ] 支持分页和排序
- [ ] 实现认证和授权
- [ ] 包含版本控制
- [ ] 提供完整的文档
- [ ] 通过所有测试用例

### 发布前检查清单
- [ ] API 文档已更新
- [ ] 所有测试通过
- [ ] 性能测试达标
- [ ] 安全审查完成
- [ ] 向后兼容性验证
- [ ] 监控和日志配置
- [ ] 错误处理测试
- [ ] 负载测试完成

---

**注意**: 本标准应该在团队中保持一致，并随项目发展持续完善。
