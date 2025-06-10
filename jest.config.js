/**
 * Jest测试配置
 */

// jest详细配置参见:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node', // 测试用例运行环境
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: [
    '**/test/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './',
      filename: 'jest_html_reporters.html',
      openReport: false
    }]
  ], // 测试用例报告
  collectCoverage: true, // 是否收集测试时的覆盖率信息
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/usage-example.ts',
    '!src/decorators-refactored.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'], // 收集测试时的覆盖率信息
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  // 将 `ts-jest` 的配置注入到运行时的全局变量中
  globals: {
    'ts-jest': {
      // 编译 Typescript 所依赖的配置
      tsconfig: '<rootDir>/tsconfig.json',
      // 是否启用报告诊断，这里是不启用
      diagnostics: false,
    },
  },
  // 测试超时时间
  testTimeout: 60000,
  // 设置文件
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  // 模块名映射
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  }
};
