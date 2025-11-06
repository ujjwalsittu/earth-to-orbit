import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
  meta?: {
    requestId?: string;
    timestamp: string;
    [key: string]: any;
  };
}

export function successResponse<T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode = 200
): Response {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta: {
      requestId: res.getHeader('x-request-id') as string,
      timestamp: new Date().toISOString(),
    },
  };
  return res.status(statusCode).json(response);
}

export function errorResponse(
  res: Response,
  message: string,
  statusCode = 500,
  error?: any
): Response {
  const response: ApiResponse = {
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error : undefined,
    meta: {
      requestId: res.getHeader('x-request-id') as string,
      timestamp: new Date().toISOString(),
    },
  };
  return res.status(statusCode).json(response);
}
