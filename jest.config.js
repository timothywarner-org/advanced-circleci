/**
 * Jest Configuration
 * Testing configuration for Globomantics Robot API
 */

module.exports = {
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
  // Coverage thresholds disabled for CI demo - focus is workflow patterns
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },
  testMatch: ['**/tests/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results',
        outputName: 'junit.xml'
      }
    ]
  ],
  setupFilesAfterEnv: ['./tests/setup.js'],
  testTimeout: 10000
};
