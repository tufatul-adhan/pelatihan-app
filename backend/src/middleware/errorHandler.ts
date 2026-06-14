// src/middleware/errorHandler.ts

import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err.message);

  if (err.message.includes('Invalid or expired token')) {
    sendError(res, 'Authentication error', err.message, 401);
    return;
  }

  if (err.message.includes('Access denied')) {
    sendError(res, 'Authorization error', err.message, 403);
    return;
  }

  sendError(res, 'Internal server error', err.message, 500);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.method} ${req.path} not found`, 'Not found', 404);
};
