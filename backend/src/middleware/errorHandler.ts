import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { AppError } from '../errors/AppError';

// HTTP request logger
export const logger = morgan('dev');

// Returns a 404 for any route that didn't match
export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Not Found - ${req.originalUrl}`, 404));
};

// Central error handler — reads statusCode off our typed AppErrors.
// Unknown errors (programmer mistakes) collapse to 500 and log a full stack trace.
export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction): void => {
  const statusCode = err instanceof AppError ? err.statusCode : err.statusCode || 500;

  if (statusCode >= 500) {
    console.error(`[ERROR] ${err.message}`);
    console.error(err.stack);
  }

  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
