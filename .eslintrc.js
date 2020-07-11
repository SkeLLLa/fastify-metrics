module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'google',
    'prettier',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
    ecmaVersion: 2018,
  },
  env: {
    es6: true,
    node: true,
    jest: false,
  },
  plugins: ['prettier', 'sort-requires', '@typescript-eslint'],
  rules: {
    'new-cap': ['error', { capIsNewExceptions: ['ObjectId', 'Fastify'] }],
    'prettier/prettier': 'error',
    'sort-requires/sort-requires': 'error',
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
  },
  overrides: [
    {
      files: ['**/__tests__/**/*', '**/__mocks__/**/*'],
      env: {
        jest: true,
      },
      plugins: ['jest'],
      ...require('eslint-plugin-jest').configs.recommended,
    },
  ],
};
