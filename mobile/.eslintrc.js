const sharedConfig = require('../shared/config/eslint.config.js');

module.exports = {
  ...sharedConfig.base,
  ...sharedConfig.react,
  root: true,
  extends: [
    ...sharedConfig.react.extends,
    '@react-native',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    ...sharedConfig.react.plugins,
    'react-native',
  ],
  ignorePatterns: ['.eslintrc.js', 'node_modules/', '.expo/', 'android/', 'ios/'],
  rules: {
    ...sharedConfig.base.rules,
    ...sharedConfig.react.rules,
    // React Native 特定规则
    'react-native/no-inline-styles': 'warn',
    'react-native/no-unused-styles': 'error',
    'react-native/split-platform-components': 'error',
    'react-native/no-color-literals': 'warn',
    'react-native/no-raw-text': 'off',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-shadow': ['error'],
        'no-shadow': 'off',
        'no-undef': 'off',
        '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
        'react-hooks/exhaustive-deps': 'warn',
      },
    },
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      ...sharedConfig.test,
    },
  ],
};
