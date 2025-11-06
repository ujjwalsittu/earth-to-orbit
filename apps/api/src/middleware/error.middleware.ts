import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import ApiError from '../utils/api-error';
import logger from '../utils/logger';

/**
 * Global error handler middleware
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = err;

  // Log error
  logger.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Convert known errors to ApiError
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || 'Internal server error';
    error = new ApiError(statusCode, message, false, error.stack);
  }

  // Mongoose bad ObjectId
  if (error.name === 'CastError') {
    error = new ApiError(400, 'Invalid ID format');
  }

  // Mongoose duplicate key
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];
    error = new ApiError(409, `${field} already exists`);
  }

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((err: any) => err.message);
    error = new ApiError(400, `Validation failed: ${errors.join(', ')}`);
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token');
  }

  if (error.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token expired');
  }

  // Send error response
  const response: any = {
    success: false,
    message: error.message,
  };

  // Include stack trace in development
  if (env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(error.statusCode || 500).json(response);
};

/**
 * 404 handler
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(404, `Route not found: ${req.method} ${req.url}`);
  next(error);
};

export default errorHandler;
