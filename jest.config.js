const config = {
  testEnvironment: 'node',
  setupFilesAfterEnv: [
    '<rootDir>/src/tests/fixtures/setup.js',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/database',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

module.exports = config;
