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
];
