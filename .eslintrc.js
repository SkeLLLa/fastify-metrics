module.exports = {
  extends: ['eslint:recommended', 'google'],
  parserOptions: {
    ecmaVersion: 2018,
  },
  env: {
    es6: true,
    node: true,
    jest: false,
  },
  rules: {
    'new-cap': ['error', {capIsNewExceptions: ['ObjectId', 'Fastify']}],
    'max-len': [
      'error',
      {
        code: 80,
        comments: 999,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreTrailingComments: true,
        ignoreUrls: true,
        ignoreTemplateLiterals: true,
      },
    ],
    indent: ['error', 2, {SwitchCase: 1}],
    'spaced-comment': ['error', 'always', {markers: ['/']}],
    'no-console': 'warn',
    'valid-jsdoc': 'off',
    'require-jsdoc': 'off',
  },
};
