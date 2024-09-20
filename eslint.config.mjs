import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importX from 'eslint-plugin-import-x';
import jest from 'eslint-plugin-jest';
import prettier from 'eslint-plugin-prettier';
import tsdoc from 'eslint-plugin-tsdoc';
// import globals from 'globals';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  js.configs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  jest.configs['flat/recommended'],
  {
    ignores: [
      '**/logs/',
      '**/coverage/',
      '**/node_modules/',
      '**/.vscode/',
      '**/.idea/',
      '**/jest.config.js',
      '**/*.xxx.*',
      '**/dist/',
      'examples/**/*',
      '**/eslint.config.mjs',
      '**/.prettierrc.js',
      '**/.releaserc.js',
      '**/.release/',
    ],
  },
  ...compat.extends(
    'google',
    'prettier',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ),
  {
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
          project: 'tsconfig.json',
        },
      },
    },
    plugins: {
      jest,
      prettier,
      '@typescript-eslint': typescriptEslintEslintPlugin,
      tsdoc,
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: 'module',

      parserOptions: {
        project: 'tsconfig.json',
      },
    },

    rules: {
      'import-x/no-unresolved': 'error',
      'import-x/no-duplicates': ['error'],

      'new-cap': [
        'error',
        {
          capIsNewExceptions: ['ObjectId', 'Fastify'],
          capIsNewExceptionPattern: '^Type\\.',
        },
      ],
      'require-jsdoc': 'off',
      'valid-jsdoc': 'off',
      'tsdoc/syntax': 'error',
      'prettier/prettier': 'error',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-import-type-side-effects': 'error',

      'jest/expect-expect': 'warn',
      'jest/no-alias-methods': 'error',
      'jest/no-commented-out-tests': 'warn',
      'jest/no-conditional-expect': 'error',
      'jest/no-deprecated-functions': 'error',
      'jest/no-disabled-tests': 'warn',
      'jest/no-done-callback': 'error',
      'jest/no-export': 'error',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/no-interpolation-in-snapshots': 'error',
      'jest/no-jasmine-globals': 'error',
      'jest/no-mocks-import': 'error',
      'jest/no-standalone-expect': 'error',
      'jest/no-test-prefixes': 'error',
      'jest/valid-describe-callback': 'error',
      'jest/valid-expect': 'error',
      'jest/valid-expect-in-promise': 'error',
      'jest/valid-title': 'error',
    },
  },
];
