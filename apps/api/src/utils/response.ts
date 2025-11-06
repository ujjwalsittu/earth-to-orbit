import { Response } from 'express';

interface SuccessResponse<T = any> {
  success: true;
  message?: string;
  data: T;
}

interface ErrorResponse {
  success: false;
  message: string;
  errors?: any;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PaginatedResponse<T = any> extends SuccessResponse<T> {
  pagination: PaginationMeta;
}

/**
 * Send a success response
 */
export const sendSuccess = <T = any>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response<SuccessResponse<T>> => {
  const response: SuccessResponse<T> = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a paginated success response
 */
export const sendPaginatedSuccess = <T = any>(
  res: Response,
  data: T,
  pagination: PaginationMeta,
  message?: string
): Response<PaginatedResponse<T>> => {
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination,
  };

  if (message) {
    response.message = message;
  }

  return res.status(200).json(response);
};

/**
 * Send an error response
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  errors?: any
): Response<ErrorResponse> => {
  const response: ErrorResponse = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

export default {
  sendSuccess,
  sendPaginatedSuccess,
  sendError,
};
