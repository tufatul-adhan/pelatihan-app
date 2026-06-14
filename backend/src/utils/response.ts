// src/utils/response.ts

import { Response } from 'express';
import { APIResponse, PaginatedResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200
): Response => {
  const response: APIResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  error?: string,
  statusCode: number = 400
): Response => {
  const response: APIResponse = {
    success: false,
    message,
    error: error || message,
  };
  return res.status(statusCode).json(response);
};

export const sendPaginated = <T>(
  res: Response,
  message: string,
  data: T[],
  total: number,
  page: number,
  limit: number,
  statusCode: number = 200
): Response => {
  const response: PaginatedResponse<T> = {
    success: true,
    message,
    data,
    total,
    page,
    limit,
  };
  return res.status(statusCode).json(response);
};
