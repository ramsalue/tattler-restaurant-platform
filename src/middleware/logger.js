// src/middleware/logger.js
const morgan = require('morgan');

/**
 * Morgan is a popular HTTP request logger middleware.
 * Can define custom formats for how it logs information.
 */

// This defines a new "token" for use in our log format to show response time.
morgan.token('response-time-ms', (req, res) => {
  if (!req._startAt || !res._startAt) {
    return '';
  }

  const ms = (res._startAt[0] - req._startAt[0]) * 1e3 +
             (res._startAt[1] - req._startAt[1]) * 1e-6;

  return ms.toFixed(2);
});

// A custom, colorful format for development logging.
const devLogger = morgan((tokens, req, res) => {
  return [
    tokens.method(req, res), // e.g., GET
    tokens.url(req, res), // e.g., /api/v1/restaurants
    tokens.status(req, res), // e.g., 200
    tokens['response-time-ms'](req, res), 'ms', // e.g., 15.30 ms
  ].join(' ');
});

// A standard, more detailed format for production logging.
const prodLogger = morgan('combined');

// We export the appropriate logger based on the NODE_ENV environment variable.
module.exports = process.env.NODE_ENV === 'production' ? prodLogger : devLogger;