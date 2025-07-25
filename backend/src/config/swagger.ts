/**
 * Swagger/OpenAPI 配置
 * 自动生成API文档和接口测试集合
 */

import swaggerJsdoc from 'swagger-jsdoc';
import { APP_CONFIG } from '../../shared/constants';

/**
 * Swagger配置选项
 */
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: `${APP_CONFIG.NAME} API`,
      version: APP_CONFIG.VERSION,
      description: `${APP_CONFIG.DESCRIPTION} - RESTful API 文档`,
      contact: {
        name: APP_CONFIG.AUTHOR,
        email: APP_CONFIG.SUPPORT_EMAIL,
        url: APP_CONFIG.WEBSITE,
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3001',
        description: '开发环境',
      },
      {
        url: 'https://api-staging.smartalk.app',
        description: '测试环境',
      },
      {
        url: 'https://api.smartalk.app',
        description: '生产环境',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Bearer Token 认证',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API Key 认证',
        },
      },
      schemas: {
        // 通用响应模式
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: '请求是否成功',
            },
            data: {
              type: 'object',
              description: '响应数据',
            },
            message: {
              type: 'string',
              description: '响应消息',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: '响应时间戳',
            },
          },
          required: ['success'],
        },
        
        // 错误响应模式
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: '错误代码',
                },
                message: {
                  type: 'string',
                  description: '错误消息',
                },
                details: {
                  type: 'string',
                  description: '错误详情',
                },
              },
              required: ['code', 'message'],
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
          },
          required: ['success', 'error'],
        },
        
        // 分页响应模式
        PaginatedResponse: {
          allOf: [
            { $ref: '#/components/schemas/ApiResponse' },
            {
              type: 'object',
              properties: {
                data: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: {},
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        page: {
                          type: 'integer',
                          minimum: 1,
                        },
                        limit: {
                          type: 'integer',
                          minimum: 1,
                          maximum: 100,
                        },
                        total: {
                          type: 'integer',
                          minimum: 0,
                        },
                        totalPages: {
                          type: 'integer',
                          minimum: 0,
                        },
                      },
                      required: ['page', 'limit', 'total', 'totalPages'],
                    },
                  },
                  required: ['items', 'pagination'],
                },
              },
            },
          ],
        },
        
        // 用户模式
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: '用户ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: '邮箱地址',
            },
            username: {
              type: 'string',
              description: '用户名',
            },
            profile: {
              $ref: '#/components/schemas/UserProfile',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
          required: ['id', 'email'],
        },
        
        // 用户资料模式
        UserProfile: {
          type: 'object',
          properties: {
            firstName: {
              type: 'string',
              description: '名',
            },
            lastName: {
              type: 'string',
              description: '姓',
            },
            avatar: {
              type: 'string',
              format: 'uri',
              description: '头像URL',
            },
            bio: {
              type: 'string',
              description: '个人简介',
            },
            interests: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['travel', 'movie', 'workplace', 'daily_life', 'business', 'technology'],
              },
              description: '学习兴趣',
            },
            level: {
              type: 'string',
              enum: ['beginner', 'intermediate', 'advanced', 'expert'],
              description: '英语水平',
            },
          },
        },
        
        // 故事模式
        Story: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            title: {
              type: 'string',
              description: '故事标题',
            },
            description: {
              type: 'string',
              description: '故事描述',
            },
            interest: {
              type: 'string',
              enum: ['travel', 'movie', 'workplace', 'daily_life', 'business', 'technology'],
              description: '兴趣分类',
            },
            difficulty: {
              type: 'string',
              enum: ['beginner', 'intermediate', 'advanced', 'expert'],
              description: '难度等级',
            },
            published: {
              type: 'boolean',
              description: '是否已发布',
            },
            keywords: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Keyword',
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
          required: ['id', 'title', 'interest', 'difficulty'],
        },
        
        // 关键词模式
        Keyword: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            word: {
              type: 'string',
              description: '关键词',
            },
            pronunciation: {
              type: 'string',
              description: '发音',
            },
            meaning: {
              type: 'string',
              description: '中文含义',
            },
            difficulty: {
              type: 'string',
              enum: ['beginner', 'intermediate', 'advanced', 'expert'],
            },
            order: {
              type: 'integer',
              minimum: 1,
              description: '在故事中的顺序',
            },
            videos: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Video',
              },
            },
          },
          required: ['id', 'word', 'meaning', 'order'],
        },
        
        // 视频模式
        Video: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            url: {
              type: 'string',
              format: 'uri',
              description: '视频URL',
            },
            type: {
              type: 'string',
              enum: ['context', 'option_a', 'option_b', 'option_c', 'option_d', 'explanation'],
              description: '视频类型',
            },
            duration: {
              type: 'number',
              description: '视频时长（秒）',
            },
            order: {
              type: 'integer',
              minimum: 1,
            },
          },
          required: ['id', 'url', 'type'],
        },
        
        // 学习进度模式
        UserProgress: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            userId: {
              type: 'string',
              format: 'uuid',
            },
            storyId: {
              type: 'string',
              format: 'uuid',
            },
            completed: {
              type: 'boolean',
              description: '是否完成',
            },
            completedKeywords: {
              type: 'integer',
              minimum: 0,
              description: '已完成关键词数量',
            },
            totalKeywords: {
              type: 'integer',
              minimum: 0,
              description: '总关键词数量',
            },
            accuracy: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: '准确率',
            },
            timeSpent: {
              type: 'integer',
              minimum: 0,
              description: '学习时间（秒）',
            },
            startedAt: {
              type: 'string',
              format: 'date-time',
            },
            completedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
          },
          required: ['id', 'userId', 'storyId', 'completed'],
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: '用户认证相关接口',
      },
      {
        name: 'Users',
        description: '用户管理相关接口',
      },
      {
        name: 'Stories',
        description: '故事内容相关接口',
      },
      {
        name: 'Keywords',
        description: '关键词相关接口',
      },
      {
        name: 'Videos',
        description: '视频内容相关接口',
      },
      {
        name: 'Progress',
        description: '学习进度相关接口',
      },
      {
        name: 'Analytics',
        description: '数据分析相关接口',
      },
      {
        name: 'Monitoring',
        description: '系统监控相关接口',
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/models/*.ts',
  ],
};

/**
 * 生成Swagger规范
 */
export const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * Swagger UI 配置
 */
export const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #4A90E2 }
  `,
  customSiteTitle: `${APP_CONFIG.NAME} API Documentation`,
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
  },
};

export default swaggerSpec;
