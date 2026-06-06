import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/UserRepository';
import { UnauthorizedError } from '../errors/AppError';

export interface AuthRequest extends Request { userId?: string; }

// Wraps async route handlers so errors propagate to the central error middleware
// instead of causing unhandled promise rejections that crash the process.
export const asyncHandler =
  (fn: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>) =>
  (req: AuthRequest, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// JWT authentication middleware — must run before any protected route
export const protect = asyncHandler(async (req: AuthRequest, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new UnauthorizedError('No token provided');

  const token = header.split(' ')[1];
  let decoded: { id: string };
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
  } catch {
    throw new UnauthorizedError('Token is invalid or expired');
  }

  const user = await UserRepository.findById(decoded.id);
  if (!user) throw new UnauthorizedError('User not found');

  // Store only the id — downstream code uses req.userId consistently
  req.userId = user._id.toString();
  next();
});
