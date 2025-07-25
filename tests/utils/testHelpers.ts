/**
 * 测试工具库
 * 提供通用的测试辅助函数和工具
 */

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// 模拟数据生成器
export const mockData = {
  /**
   * 生成模拟用户数据
   */
  user: (overrides: Partial<any> = {}) => ({
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    profile: {
      firstName: 'Test',
      lastName: 'User',
      avatar: 'https://example.com/avatar.jpg',
      interests: ['travel', 'movie'],
      level: 'intermediate',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }),

  /**
   * 生成模拟故事数据
   */
  story: (overrides: Partial<any> = {}) => ({
    id: 'story-123',
    title: 'Test Story',
    description: 'A test story for learning',
    interest: 'travel',
    difficulty: 'intermediate',
    published: true,
    keywords: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }),

  /**
   * 生成模拟关键词数据
   */
  keyword: (overrides: Partial<any> = {}) => ({
    id: 'keyword-123',
    word: 'adventure',
    pronunciation: '/ədˈventʃər/',
    meaning: '冒险',
    difficulty: 'intermediate',
    order: 1,
    storyId: 'story-123',
    videos: [],
    ...overrides,
  }),

  /**
   * 生成模拟视频数据
   */
  video: (overrides: Partial<any> = {}) => ({
    id: 'video-123',
    url: 'https://example.com/video.mp4',
    type: 'context',
    duration: 30,
    order: 1,
    keywordId: 'keyword-123',
    ...overrides,
  }),

  /**
   * 生成模拟进度数据
   */
  progress: (overrides: Partial<any> = {}) => ({
    id: 'progress-123',
    userId: 'user-123',
    storyId: 'story-123',
    completed: false,
    completedKeywords: 5,
    totalKeywords: 15,
    accuracy: 0.8,
    timeSpent: 1800,
    startedAt: new Date().toISOString(),
    completedAt: null,
    ...overrides,
  }),
};

// API 模拟工具
export const mockApi = {
  /**
   * 模拟成功的 API 响应
   */
  success: (data: any) => ({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  }),

  /**
   * 模拟错误的 API 响应
   */
  error: (code: string, message: string, details?: string) => ({
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  }),

  /**
   * 模拟分页响应
   */
  paginated: (items: any[], page = 1, limit = 10) => ({
    success: true,
    data: {
      items: items.slice((page - 1) * limit, page * limit),
      pagination: {
        page,
        limit,
        total: items.length,
        totalPages: Math.ceil(items.length / limit),
      },
    },
    timestamp: new Date().toISOString(),
  }),
};

// 异步测试工具
export const asyncUtils = {
  /**
   * 等待指定时间
   */
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * 等待条件满足
   */
  waitFor: async (
    condition: () => boolean | Promise<boolean>,
    timeout = 5000,
    interval = 100
  ) => {
    const start = Date.now();
    
    while (Date.now() - start < timeout) {
      if (await condition()) {
        return true;
      }
      await asyncUtils.wait(interval);
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  },

  /**
   * 模拟网络延迟
   */
  simulateNetworkDelay: (min = 100, max = 500) => {
    const delay = Math.random() * (max - min) + min;
    return asyncUtils.wait(delay);
  },
};

// 测试环境工具
export const testEnv = {
  /**
   * 设置环境变量
   */
  setEnv: (key: string, value: string) => {
    const originalValue = process.env[key];
    process.env[key] = value;
    
    return () => {
      if (originalValue === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalValue;
      }
    };
  },

  /**
   * 模拟控制台方法
   */
  mockConsole: () => {
    const originalConsole = { ...console };
    const mockMethods = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    };

    Object.assign(console, mockMethods);

    return {
      ...mockMethods,
      restore: () => Object.assign(console, originalConsole),
    };
  },

  /**
   * 模拟 localStorage
   */
  mockLocalStorage: () => {
    const store: Record<string, string> = {};
    
    const mockStorage = {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach(key => delete store[key]);
      }),
      length: 0,
      key: jest.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true,
    });

    return mockStorage;
  },
};

// 性能测试工具
export const performanceUtils = {
  /**
   * 测量函数执行时间
   */
  measureTime: async <T>(fn: () => Promise<T> | T): Promise<{ result: T; time: number }> => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    return {
      result,
      time: end - start,
    };
  },

  /**
   * 测量内存使用
   */
  measureMemory: () => {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in window.performance) {
      return (window.performance as any).memory;
    }
    
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage();
    }
    
    return null;
  },

  /**
   * 性能基准测试
   */
  benchmark: async (
    fn: () => Promise<any> | any,
    iterations = 100
  ): Promise<{
    average: number;
    min: number;
    max: number;
    total: number;
  }> => {
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const { time } = await performanceUtils.measureTime(fn);
      times.push(time);
    }
    
    return {
      average: times.reduce((sum, time) => sum + time, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      total: times.reduce((sum, time) => sum + time, 0),
    };
  },
};

// 自定义渲染器 (React Testing Library)
export const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  // 这里可以添加全局的 Provider 包装器
  // 例如：ThemeProvider, Router, Store Provider 等
  
  return render(ui, {
    ...options,
  });
};

// 测试断言工具
export const assertions = {
  /**
   * 断言 API 响应格式
   */
  expectApiResponse: (response: any) => {
    expect(response).toHaveProperty('success');
    expect(response).toHaveProperty('timestamp');
    
    if (response.success) {
      expect(response).toHaveProperty('data');
    } else {
      expect(response).toHaveProperty('error');
      expect(response.error).toHaveProperty('code');
      expect(response.error).toHaveProperty('message');
    }
  },

  /**
   * 断言分页响应格式
   */
  expectPaginatedResponse: (response: any) => {
    assertions.expectApiResponse(response);
    
    if (response.success) {
      expect(response.data).toHaveProperty('items');
      expect(response.data).toHaveProperty('pagination');
      expect(response.data.pagination).toHaveProperty('page');
      expect(response.data.pagination).toHaveProperty('limit');
      expect(response.data.pagination).toHaveProperty('total');
      expect(response.data.pagination).toHaveProperty('totalPages');
    }
  },

  /**
   * 断言性能指标
   */
  expectPerformance: (time: number, threshold: number) => {
    expect(time).toBeLessThan(threshold);
  },

  /**
   * 断言错误格式
   */
  expectError: (error: any, expectedCode?: string) => {
    expect(error).toHaveProperty('code');
    expect(error).toHaveProperty('message');
    
    if (expectedCode) {
      expect(error.code).toBe(expectedCode);
    }
  },
};

// 测试数据清理工具
export const cleanup = {
  /**
   * 清理测试数据库
   */
  database: async () => {
    // 这里实现数据库清理逻辑
    console.log('Cleaning up test database...');
  },

  /**
   * 清理测试文件
   */
  files: async () => {
    // 这里实现测试文件清理逻辑
    console.log('Cleaning up test files...');
  },

  /**
   * 重置模拟对象
   */
  mocks: () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  },
};

// 导出所有工具
export * from '@testing-library/react';
export * from '@testing-library/jest-dom';
export { customRender as render };
