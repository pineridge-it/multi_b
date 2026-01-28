// Test setup file for Jest
// Global mocks and test utilities can be defined here

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DB_DATABASE = ':memory:';