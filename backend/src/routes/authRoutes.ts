import express, { Response } from 'express';
import AuthService from '../services/AuthService';
import { asyncHandler, protect, AuthRequest } from '../middleware/auth';
import UserRepository from '../repositories/UserRepository';
import { ValidationError } from '../errors/AppError';

const router = express.Router();

router.post('/register', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) throw new ValidationError('All fields are required');
  if (password.length < 6) throw new ValidationError('Password must be at least 6 characters');
  const result = await AuthService.register(name, email, password);
  res.status(201).json({ ...result.user, token: result.token });
}));

router.post('/login', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ValidationError('All fields are required');
  const result = await AuthService.login(email, password);
  res.json({ ...result.user, token: result.token });
}));

router.get('/profile', protect, asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await UserRepository.findById(req.userId as string);
  res.json(user);
}));

router.put('/profile', protect, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, dailyCalorieGoal, dailyWaterGoal, weight } = req.body;
  const updated = await UserRepository.updateProfile(
    req.userId as string,
    { name, dailyCalorieGoal, dailyWaterGoal, weight } as any
  );
  res.json(updated);
}));

export default router;
