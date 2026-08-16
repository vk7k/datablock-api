const { errorResponse } = require('../utils/response.util');

/**
 * 404 Not Found Middleware
 */
const notFoundHandler = (req, res, next) => {
  return errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

/**
 * Global Express Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('[Unhandled Error]', err);

  // Handle Bad JSON syntax in request body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(res, 'Malformed JSON payload in request body', 400);
  }

  // Handle Prisma Database Errors
  if (err.code) {
    switch (err.code) {
      case 'P2002': {
        const target = err.meta?.target ? ` (${err.meta.target})` : '';
        return errorResponse(res, `A record with this unique value already exists${target}`, 409);
      }
      case 'P2025':
        return errorResponse(res, 'Record not found in the database', 404);
      case 'P2003':
        return errorResponse(res, 'Foreign key constraint violated. The referenced parent entity does not exist.', 400);
      case 'P2000':
        return errorResponse(res, 'The provided value is too long for the database column', 400);
      default:
        break;
    }
  }

  // Handle custom status errors
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : undefined
  );
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
