// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/setup.ts'],
  testMatch: ['**/tests/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // Add path aliases if needed
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/src/config/',
    '/src/database/',
    '/src/types/',
    '/src/utils/',
  ],
  verbose: true,
  maxWorkers: 1, // Run tests serially to avoid DB conflicts
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
};
