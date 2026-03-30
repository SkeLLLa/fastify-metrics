import eslintConfig from '@skellla/lint-config/eslint';

export default [
  {
    ignores: [
      '**/logs/',
      '**/coverage/',
      '**/node_modules/',
      '**/.vscode/',
      '**/.idea/',
      '**/*.xxx.*',
      '**/dist/',
      'examples/**/*',
      '**/.release/',
    ],
  },
  ...eslintConfig,
  {
    files: ['**/__tests__/**/*', '**/test/**/*'],
    rules: {
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
];
