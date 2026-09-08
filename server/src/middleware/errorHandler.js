/* Gather Platform - Centralized Error Handler */

function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Only log unexpected server errors (5xx), not client 4xx errors
  if (status >= 500) {
    console.error('Server Error:', err);
  }

  res.status(status).json({
    error: true,
    status,
    message
  });
}

module.exports = errorHandler;
