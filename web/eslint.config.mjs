import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// 导入共享配置
const sharedConfig = await import('../shared/config/eslint.config.js');

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      ...sharedConfig.default.base.rules,
      ...sharedConfig.default.react.rules,
      ...sharedConfig.default.nextjs.rules,
      // Next.js 特定规则覆盖
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@next/next/no-img-element': 'warn',
      '@next/next/no-html-link-for-pages': 'error',
    },
    ignorePatterns: [
      '.next/',
      'node_modules/',
      'out/',
      'build/',
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
    ],
  },
];

export default eslintConfig;
