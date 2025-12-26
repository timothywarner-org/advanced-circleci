/**
 * Unit Tests: Error Handler Middleware
 * Tests error handling for various error types
 */

const errorHandler = require('../../src/middleware/errorHandler');

describe('Error Handler Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    // Suppress console.error during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('ValidationError handling', () => {
    it('should return 400 for ValidationError', () => {
      const error = new Error('Invalid input');
      error.name = 'ValidationError';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation Error',
          message: 'Invalid input'
        })
      );
    });
  });

  describe('UnauthorizedError handling', () => {
    it('should return 401 for UnauthorizedError', () => {
      const error = new Error('Not authenticated');
      error.name = 'UnauthorizedError';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Unauthorized',
          message: 'Authentication required'
        })
      );
    });
  });

  describe('ForbiddenError handling', () => {
    it('should return 403 for ForbiddenError', () => {
      const error = new Error('Access denied');
      error.name = 'ForbiddenError';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Forbidden',
          message: 'Insufficient permissions'
        })
      );
    });
  });

  describe('Generic error handling', () => {
    it('should return 500 for generic errors', () => {
      const error = new Error('Something went wrong');

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Internal Server Error'
        })
      );
    });

    it('should use custom status code if provided', () => {
      const error = new Error('Not found');
      error.status = 404;

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should hide error details in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Sensitive error details');

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'An unexpected error occurred'
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should show error details in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Development error details');

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Development error details'
        })
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Logging', () => {
    it('should log error message', () => {
      const error = new Error('Test error');

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(console.error).toHaveBeenCalled();
    });

    it('should log stack trace in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Test error');
      error.stack = 'Error stack trace';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(console.error).toHaveBeenCalledWith(error.stack);

      process.env.NODE_ENV = originalEnv;
    });
  });
});
