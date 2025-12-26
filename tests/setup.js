/**
 * Jest Test Setup
 * Global configuration for all tests
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.LOG_LEVEL = 'error';

// Increase timeout for integration tests
jest.setTimeout(10000);

// Global test utilities
global.testUtils = {
  // Helper to create a delay
  delay: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),

  // Sample robot data for tests
  sampleRobot: {
    name: 'Test Bot',
    type: 'testing',
    location: 'test-lab'
  },

  // Sample invalid robot data
  invalidRobot: {
    name: '', // Invalid: empty name
    type: null // Invalid: null type
  }
};

// Console spy for testing logging - suppress output during tests
let consoleLogSpy;
let consoleErrorSpy;

beforeAll(() => {
  consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  if (consoleLogSpy) consoleLogSpy.mockRestore();
  if (consoleErrorSpy) consoleErrorSpy.mockRestore();
});
