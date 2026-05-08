const ApiError = require('../utils/ApiError');

function errorHandler(err, req, res, next) {
  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Prisma known errors
  if (err.code === 'P2002') {
    statusCode = 409;
    const field = err.meta?.target?.[0] || 'field';
    message = `A record with this ${field} already exists`;
  }

  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }

  if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Invalid reference - related record not found';
  }

  // Log error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
