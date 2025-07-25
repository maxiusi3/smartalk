/**
 * 统一的API路由管理器
 * 提供标准化的路由注册和中间件管理
 */

import { Router, Request, Response, NextFunction } from 'express';
import { BaseController } from '@/controllers/BaseController';

export interface RouteConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void> | void;
  middleware?: Array<(req: Request, res: Response, next: NextFunction) => void>;
  description?: string;
  tags?: string[];
}

export interface RouteGroup {
  prefix: string;
  routes: RouteConfig[];
  middleware?: Array<(req: Request, res: Response, next: NextFunction) => void>;
  description?: string;
}

/**
 * API路由管理器类
 */
export class ApiRouter {
  private router: Router;
  private routes: Map<string, RouteConfig[]> = new Map();

  constructor() {
    this.router = Router();
  }

  /**
   * 注册路由组
   */
  registerGroup(group: RouteGroup): void {
    const groupRouter = Router();

    // 应用组级中间件
    if (group.middleware) {
      group.middleware.forEach(middleware => {
        groupRouter.use(middleware);
      });
    }

    // 注册路由
    group.routes.forEach(route => {
      this.registerRoute(groupRouter, route);
    });

    // 将组路由挂载到主路由
    this.router.use(group.prefix, groupRouter);

    // 记录路由信息
    this.routes.set(group.prefix, group.routes);
  }

  /**
   * 注册单个路由
   */
  private registerRoute(router: Router, route: RouteConfig): void {
    const { method, path, handler, middleware = [] } = route;

    // 应用路由级中间件
    const allMiddleware = [...middleware, handler];

    switch (method) {
      case 'GET':
        router.get(path, ...allMiddleware);
        break;
      case 'POST':
        router.post(path, ...allMiddleware);
        break;
      case 'PUT':
        router.put(path, ...allMiddleware);
        break;
      case 'PATCH':
        router.patch(path, ...allMiddleware);
        break;
      case 'DELETE':
        router.delete(path, ...allMiddleware);
        break;
    }
  }

  /**
   * 获取Express路由实例
   */
  getRouter(): Router {
    return this.router;
  }

  /**
   * 获取所有注册的路由信息
   */
  getRoutes(): Map<string, RouteConfig[]> {
    return this.routes;
  }

  /**
   * 生成路由文档
   */
  generateDocs(): any {
    const docs: any = {
      version: '1.0.0',
      title: 'SmarTalk API Documentation',
      description: 'RESTful API for SmarTalk MVP',
      baseUrl: '/api/v1',
      routes: {},
    };

    this.routes.forEach((routes, prefix) => {
      docs.routes[prefix] = routes.map(route => ({
        method: route.method,
        path: `${prefix}${route.path}`,
        description: route.description,
        tags: route.tags,
      }));
    });

    return docs;
  }
}

/**
 * 创建标准化的REST资源路由
 */
export function createResourceRoutes<T extends BaseController>(
  controller: T,
  options: {
    resourceName: string;
    idParam?: string;
    excludeRoutes?: string[];
    customRoutes?: RouteConfig[];
  }
): RouteConfig[] {
  const { resourceName, idParam = 'id', excludeRoutes = [], customRoutes = [] } = options;

  const standardRoutes: RouteConfig[] = [
    {
      method: 'GET',
      path: '/',
      handler: (controller as any).getAll?.bind(controller),
      description: `Get all ${resourceName}`,
      tags: [resourceName],
    },
    {
      method: 'GET',
      path: `/:${idParam}`,
      handler: (controller as any).getById?.bind(controller),
      description: `Get ${resourceName} by ID`,
      tags: [resourceName],
    },
    {
      method: 'POST',
      path: '/',
      handler: (controller as any).create?.bind(controller),
      description: `Create new ${resourceName}`,
      tags: [resourceName],
    },
    {
      method: 'PUT',
      path: `/:${idParam}`,
      handler: (controller as any).update?.bind(controller),
      description: `Update ${resourceName} by ID`,
      tags: [resourceName],
    },
    {
      method: 'PATCH',
      path: `/:${idParam}`,
      handler: (controller as any).patch?.bind(controller),
      description: `Partially update ${resourceName} by ID`,
      tags: [resourceName],
    },
    {
      method: 'DELETE',
      path: `/:${idParam}`,
      handler: (controller as any).delete?.bind(controller),
      description: `Delete ${resourceName} by ID`,
      tags: [resourceName],
    },
  ];

  // 过滤掉不需要的路由
  const filteredRoutes = standardRoutes.filter(route => {
    const routeKey = `${route.method}:${route.path}`;
    return !excludeRoutes.includes(routeKey) && (controller as any)[route.handler.name];
  });

  // 添加自定义路由
  return [...filteredRoutes, ...customRoutes];
}

/**
 * 验证中间件工厂
 */
export function createValidationMiddleware(schema: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: error.details,
        },
      });
    }
    next();
  };
}

/**
 * 分页中间件
 */
export function paginationMiddleware(req: Request, res: Response, next: NextFunction) {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;

  req.pagination = { page, limit, skip };
  next();
}

/**
 * 排序中间件
 */
export function sortingMiddleware(allowedFields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { sortBy, sortOrder } = req.query;

    if (sortBy && allowedFields.includes(sortBy as string)) {
      req.sorting = {
        [sortBy as string]: sortOrder === 'desc' ? 'desc' : 'asc',
      };
    }

    next();
  };
}

/**
 * 过滤中间件
 */
export function filteringMiddleware(allowedFilters: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const filters: any = {};

    allowedFilters.forEach(field => {
      if (req.query[field] !== undefined) {
        filters[field] = req.query[field];
      }
    });

    req.filters = Object.keys(filters).length > 0 ? filters : undefined;
    next();
  };
}

// 扩展Express Request类型
declare global {
  namespace Express {
    interface Request {
      pagination?: {
        page: number;
        limit: number;
        skip: number;
      };
      sorting?: Record<string, 'asc' | 'desc'>;
      filters?: Record<string, any>;
    }
  }
}
