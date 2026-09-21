import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error('Unhandled Error', { message: err.message, stack: err.stack });

  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'An unexpected error occurred.';
  let statusCode = err.statusCode || 500;

  if (err.code === 'P2002') {
    code = 'CONFLICT';
    message = 'Resource already exists.';
    statusCode = 409;
  } else if (err.code === 'P2025') {
    code = 'NOT_FOUND';
    message = 'Resource not found.';
    statusCode = 404;
  }

  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'An unexpected error occurred.';
  }

  res.status(statusCode).json({ success: false, error: { code, message } });
}
