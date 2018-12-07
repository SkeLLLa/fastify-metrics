module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.(ts|js)'],
  coverageReporters: ['lcov', 'text'],
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  moduleFileExtensions: ['ts', 'js'],
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.spec.(ts|js)'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  verbose: true,
  preset: 'ts-jest',
};
