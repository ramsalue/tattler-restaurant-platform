// src/middleware/errorHandler.js

/**
 * A custom error class for operational, predictable errors.
 * This allows us to create errors with a specific status code.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    // 'fail' for 4xx errors, 'error' for 5xx errors.
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // We only create operational errors, so this is always true.
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * The global error handling middleware for Express.
 * It catches all errors passed by `next(error)`.
 */
const errorHandler = (err, req, res, next) => {
  // Set a default status code if one isn't already present.
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // For development, we want to see all the details and the stack trace.
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else { // For production, we only send a clean, simple message.
    // For our own operational errors, send the message we created.
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      // For unknown programming errors, log them but don't leak details to the client.
      console.error('ERROR:', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!'
      });
    }
  }
};

/**
 * A middleware to handle any routes that are not found (404).
 */
const notFound = (req, res, next) => {
  // Create a new AppError and pass it to the global error handler.
  const error = new AppError(`Route ${req.originalUrl} not found on this server`, 404);
  next(error);
};

module.exports = {
  AppError,
  errorHandler,
  notFound
};