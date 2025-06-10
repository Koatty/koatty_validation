/**
 * Jest测试环境设置
 * @author richen
 */

// 设置测试环境变量
process.env.NODE_ENV = 'test';

// 模拟性能API（如果在Node.js环境中不存在）
if (typeof performance === 'undefined') {
  global.performance = {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
    getEntriesByName: () => [],
    getEntriesByType: () => [],
    clearMarks: () => {},
    clearMeasures: () => {}
  } as any;
}

// 设置全局测试超时
jest.setTimeout(60000);

// 在每个测试后清理
afterEach(() => {
  // 清理可能的定时器
  jest.clearAllTimers();
});

// 全局错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// 模拟console方法以避免测试输出干扰
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeAll(() => {
  // 可以选择性地静默某些console输出
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  // 恢复原始console方法
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});

export {}; 