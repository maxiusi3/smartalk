/**
 * API版本管理器
 * 支持多版本API并存和平滑迁移
 */

import { Router, Request, Response, NextFunction } from 'express';
import { ApiRouter, RouteGroup } from './ApiRouter';

export interface ApiVersion {
  version: string;
  routes: RouteGroup[];
  deprecated?: boolean;
  deprecationDate?: Date;
  sunsetDate?: Date;
  description?: string;
}

/**
 * API版本管理器类
 */
export class ApiVersionManager {
  private versions: Map<string, ApiRouter> = new Map();
  private router: Router;

  constructor() {
    this.router = Router();
  }

  /**
   * 注册API版本
   */
  registerVersion(apiVersion: ApiVersion): void {
    const { version, routes, deprecated, deprecationDate, sunsetDate } = apiVersion;

    // 创建版本路由器
    const versionRouter = new ApiRouter();

    // 注册路由组
    routes.forEach(group => {
      versionRouter.registerGroup(group);
    });

    // 添加版本信息中间件
    const versionMiddleware = (req: Request, res: Response, next: NextFunction) => {
      // 添加版本信息到响应头
      res.setHeader('API-Version', version);
      
      // 如果API已废弃，添加废弃警告
      if (deprecated) {
        res.setHeader('API-Deprecated', 'true');
        if (deprecationDate) {
          res.setHeader('API-Deprecation-Date', deprecationDate.toISOString());
        }
        if (sunsetDate) {
          res.setHeader('API-Sunset-Date', sunsetDate.toISOString());
        }
      }

      next();
    };

    // 将版本路由挂载到主路由
    this.router.use(`/${version}`, versionMiddleware, versionRouter.getRouter());

    // 存储版本信息
    this.versions.set(version, versionRouter);
  }

  /**
   * 获取Express路由实例
   */
  getRouter(): Router {
    return this.router;
  }

  /**
   * 获取所有版本信息
   */
  getVersions(): string[] {
    return Array.from(this.versions.keys());
  }

  /**
   * 获取特定版本的路由信息
   */
  getVersionRoutes(version: string): Map<string, any> | undefined {
    const versionRouter = this.versions.get(version);
    return versionRouter?.getRoutes();
  }

  /**
   * 生成API文档
   */
  generateApiDocs(): any {
    const docs: any = {
      title: 'SmarTalk API Documentation',
      description: 'RESTful API for SmarTalk MVP',
      versions: {},
    };

    this.versions.forEach((router, version) => {
      docs.versions[version] = router.generateDocs();
    });

    return docs;
  }

  /**
   * 创建版本重定向中间件
   */
  createVersionRedirectMiddleware(defaultVersion: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      // 如果请求路径不包含版本号，重定向到默认版本
      if (!req.path.match(/^\/v\d+/)) {
        const newPath = `/${defaultVersion}${req.path}`;
        return res.redirect(301, newPath);
      }
      next();
    };
  }
}

/**
 * 创建标准的API v1路由配置
 */
export function createV1Routes(): RouteGroup[] {
  return [
    {
      prefix: '/health',
      description: 'Health check endpoints',
      routes: [
        {
          method: 'GET',
          path: '/',
          handler: async (req: Request, res: Response) => {
            res.json({
              success: true,
              data: {
                status: 'healthy',
                version: 'v1',
                timestamp: new Date().toISOString(),
              },
            });
          },
          description: 'Health check endpoint',
          tags: ['health'],
        },
      ],
    },
    {
      prefix: '/users',
      description: 'User management endpoints',
      routes: [
        // 用户路由将在这里定义
      ],
    },
    {
      prefix: '/interests',
      description: 'Interest management endpoints',
      routes: [
        // 兴趣路由将在这里定义
      ],
    },
    {
      prefix: '/dramas',
      description: 'Drama content endpoints',
      routes: [
        // 剧集路由将在这里定义
      ],
    },
    {
      prefix: '/progress',
      description: 'User progress tracking endpoints',
      routes: [
        // 进度路由将在这里定义
      ],
    },
    {
      prefix: '/analytics',
      description: 'Analytics and tracking endpoints',
      routes: [
        // 分析路由将在这里定义
      ],
    },
  ];
}

/**
 * 创建标准的API v2路由配置（未来版本）
 */
export function createV2Routes(): RouteGroup[] {
  return [
    {
      prefix: '/health',
      description: 'Enhanced health check endpoints',
      routes: [
        {
          method: 'GET',
          path: '/',
          handler: async (req: Request, res: Response) => {
            res.json({
              success: true,
              data: {
                status: 'healthy',
                version: 'v2',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
              },
            });
          },
          description: 'Enhanced health check endpoint',
          tags: ['health'],
        },
        {
          method: 'GET',
          path: '/detailed',
          handler: async (req: Request, res: Response) => {
            res.json({
              success: true,
              data: {
                status: 'healthy',
                version: 'v2',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                cpu: process.cpuUsage(),
                environment: process.env.NODE_ENV,
              },
            });
          },
          description: 'Detailed health check endpoint',
          tags: ['health'],
        },
      ],
    },
    // 其他v2路由...
  ];
}

/**
 * 默认API版本管理器实例
 */
export const apiVersionManager = new ApiVersionManager();

// 注册v1版本
apiVersionManager.registerVersion({
  version: 'v1',
  routes: createV1Routes(),
  description: 'Initial API version',
});

// 注册v2版本（未来版本，当前为空）
apiVersionManager.registerVersion({
  version: 'v2',
  routes: createV2Routes(),
  description: 'Enhanced API version with improved features',
});
