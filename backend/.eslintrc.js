const sharedConfig = require('../shared/config/eslint.config.js');

module.exports = {
  ...sharedConfig.base,
  ...sharedConfig.node,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  root: true,
  ignorePatterns: ['.eslintrc.js', 'dist/', 'node_modules/'],
  rules: {
    ...sharedConfig.base.rules,
    ...sharedConfig.node.rules,
    // 后端特定规则覆盖
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-console': 'warn', // 后端允许 console.log
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      ...sharedConfig.test,
    },
  ],
};
