import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import { logger } from '../utils/logger';
import { errorResponse } from '../utils/response';

export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof ApiError) {
    logger.error(
      {
        error: err.message,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
      },
      'API Error'
    );

    errorResponse(res, err.message, err.statusCode, {
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  } else {
    logger.error(
      {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
      },
      'Unhandled Error'
    );

    errorResponse(res, 'Internal Server Error', 500, {
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  errorResponse(res, `Route ${req.originalUrl} not found`, 404);
}
