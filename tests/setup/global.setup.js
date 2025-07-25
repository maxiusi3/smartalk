/**
 * 全局测试设置
 * 配置所有测试环境的通用设置
 */

// 扩展 Jest 匹配器
import '@testing-library/jest-dom';

// 设置全局变量
global.__DEV__ = true;
global.__TEST__ = true;

// 模拟全局对象
global.console = {
  ...console,
  // 在测试中静默某些日志
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: console.warn,
  error: console.error,
};

// 模拟 fetch
global.fetch = jest.fn();

// 模拟 localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// 模拟 sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// 设置测试超时
jest.setTimeout(10000);

// 全局测试钩子
beforeEach(() => {
  // 清理模拟
  jest.clearAllMocks();
  
  // 重置 fetch 模拟
  fetch.mockClear();
  
  // 重置存储模拟
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  // 清理定时器
  jest.clearAllTimers();
  
  // 恢复模拟
  jest.restoreAllMocks();
});

// 全局错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// 测试环境检查
if (process.env.NODE_ENV !== 'test') {
  console.warn('Warning: Tests should run in NODE_ENV=test');
}
