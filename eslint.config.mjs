// eslint.config.mjs
// @ts-check

import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const commonRules = {
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-floating-promises': 'warn',
  '@typescript-eslint/no-unsafe-argument': 'warn',

  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    },
  ],
};

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/.next/**',
      '**/generated/**',
    ],
  },

  /*
   * API 正式源码
   *
   * 排除测试文件，避免它们被生产 tsconfig 接管。
   */
  {
    files: ['apps/api/src/**/*.ts'],

    ignores: ['apps/api/src/**/*.spec.ts', 'apps/api/src/**/*.test.ts'],

    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
    ],

    languageOptions: {
      globals: {
        ...globals.node,
      },

      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: commonRules,
  },

  /*
   * Jest 单元测试和 e2e 测试
   *
   * 明确使用 apps/api/tsconfig.spec.json，
   * 不让 Project Service 自动选择生产 tsconfig。
   */
  {
    files: [
      'apps/api/src/**/*.spec.ts',
      'apps/api/src/**/*.test.ts',
      'apps/api/test/**/*.ts',
    ],

    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
    ],

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },

      parserOptions: {
        projectService: false,
        project: ['./apps/api/tsconfig.spec.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: commonRules,
  },

  /*
   * Prisma 配置文件不使用类型感知 ESLint。
   */
  {
    files: ['apps/api/prisma.config.ts'],

    extends: [eslint.configs.recommended, ...tseslint.configs.recommended],

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },

    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars':
        commonRules['@typescript-eslint/no-unused-vars'],
    },
  },
);
