/**
 * SmarTalk 共享 ESLint 配置
 * 适用于前端、后端和移动端项目
 */

module.exports = {
  // 基础配置
  base: {
    env: {
      es2022: true,
      node: true,
    },
    extends: [
      'eslint:recommended',
      '@typescript-eslint/recommended',
      'prettier',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: [
      '@typescript-eslint',
      'import',
      'unused-imports',
    ],
    rules: {
      // TypeScript 规则
      '@typescript-eslint/no-unused-vars': 'off', // 使用 unused-imports 插件代替
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-const': 'error',
      '@typescript-eslint/no-var-requires': 'warn',

      // 导入规则
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'off', // TypeScript 处理

      // 未使用导入清理
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // 通用规则
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
      'eol-last': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
    },
  },

  // React/React Native 特定配置
  react: {
    env: {
      browser: true,
      es2022: true,
    },
    extends: [
      'eslint:recommended',
      '@typescript-eslint/recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'prettier',
    ],
    plugins: [
      '@typescript-eslint',
      'react',
      'react-hooks',
      'import',
      'unused-imports',
    ],
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React 规则
      'react/react-in-jsx-scope': 'off', // React 17+
      'react/prop-types': 'off', // 使用 TypeScript
      'react/display-name': 'warn',
      'react/no-unescaped-entities': 'warn',
      'react/jsx-uses-react': 'off', // React 17+
      'react/jsx-uses-vars': 'error',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-pascal-case': 'error',
      'react/no-deprecated': 'warn',
      'react/no-direct-mutation-state': 'error',
      'react/no-unused-state': 'warn',
      'react/prefer-stateless-function': 'warn',

      // React Hooks 规则
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Node.js/后端特定配置
  node: {
    env: {
      node: true,
      es2022: true,
    },
    extends: [
      'eslint:recommended',
      '@typescript-eslint/recommended',
      'prettier',
    ],
    rules: {
      // Node.js 特定规则
      'no-process-exit': 'error',
      'no-process-env': 'off', // 允许使用环境变量
      'global-require': 'warn',
      'no-sync': 'warn',
    },
  },

  // Next.js 特定配置
  nextjs: {
    extends: [
      'eslint:recommended',
      '@typescript-eslint/recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'next/core-web-vitals',
      'prettier',
    ],
    rules: {
      // Next.js 特定规则
      '@next/next/no-img-element': 'warn',
      '@next/next/no-html-link-for-pages': 'error',
    },
  },

  // 测试文件配置
  test: {
    env: {
      jest: true,
      node: true,
    },
    extends: [
      'eslint:recommended',
      '@typescript-eslint/recommended',
      'plugin:jest/recommended',
      'prettier',
    ],
    plugins: [
      '@typescript-eslint',
      'jest',
    ],
    rules: {
      // Jest 规则
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',

      // 测试文件中允许的规则
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
};
