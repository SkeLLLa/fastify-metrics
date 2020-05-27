module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.(ts|js)'],
  coverageReporters: ['lcov', 'text', 'json'],
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  moduleFileExtensions: ['ts', 'js'],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.spec.(ts|js)'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  verbose: true,
  preset: 'ts-jest',
};
