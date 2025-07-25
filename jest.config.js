module.exports = {
  projects: [
    {
      displayName: 'Backend',
      testMatch: ['<rootDir>/backend/src/**/*.test.ts'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/backend/src/__tests__/setup.ts'],
      collectCoverageFrom: [
        'backend/src/**/*.ts',
        '!backend/src/**/*.d.ts',
        '!backend/src/__tests__/**',
        '!backend/src/scripts/**',
      ],
      coverageDirectory: '<rootDir>/backend/coverage',
      coverageReporters: ['text', 'lcov', 'html'],
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
      transform: {
        '^.+\\.ts$': 'ts-jest',
      },
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/backend/src/$1',
      },
    },
    {
      displayName: 'Mobile',
      testMatch: ['<rootDir>/mobile/src/**/*.test.{ts,tsx}'],
      testEnvironment: 'jsdom',
      preset: 'react-native',
      setupFilesAfterEnv: [
        '<rootDir>/mobile/src/__tests__/setup.ts',
        '@testing-library/jest-native/extend-expect',
      ],
      collectCoverageFrom: [
        'mobile/src/**/*.{ts,tsx}',
        '!mobile/src/**/*.d.ts',
        '!mobile/src/__tests__/**',
        '!mobile/src/**/*.test.{ts,tsx}',
        '!mobile/src/types/**',
      ],
      coverageDirectory: '<rootDir>/mobile/coverage',
      coverageReporters: ['text', 'lcov', 'html'],
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
      },
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/mobile/src/$1',
      },
      transformIgnorePatterns: [
        'node_modules/(?!(react-native|@react-native|react-native-.*)/)',
      ],
    },
    {
      displayName: 'Shared',
      testMatch: ['<rootDir>/shared/**/*.test.{js,ts}'],
      testEnvironment: 'node',
      transform: {
        '^.+\\.ts$': 'ts-jest',
      },
      moduleNameMapping: {
        '^@shared/(.*)$': '<rootDir>/shared/$1',
      },
      collectCoverageFrom: [
        'shared/**/*.{js,ts}',
        '!shared/**/*.d.ts',
        '!shared/**/*.test.{js,ts}',
      ],
      coverageDirectory: '<rootDir>/coverage/shared',
      coverageReporters: ['text', 'lcov', 'html'],
      coverageThreshold: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
      },
    },
  ],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text-summary', 'lcov', 'html'],
  verbose: true,
  testTimeout: 10000,
  clearMocks: true,
  restoreMocks: true,
};