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
  transform: {
    '^.+\\.(js)$': 'babel-jest',
  },
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '#validators/(.*)': '<rootDir>/src/middlewares/validators/$1',
    '#(.*)': '<rootDir>/src/$1',
  },
};

export default config;
