import express, { Response } from 'express';
import { protect, asyncHandler, AuthRequest } from '../middleware/auth';
import ServiceFactory from '../patterns/factory/ServiceFactory';
import StatsService from '../services/StatsService';

const router = express.Router();
router.use(protect); // all workout routes require authentication

// IMPORTANT: static paths must be declared before /:id routes.
// If /stats or /history come after /:id, Express treats them as an id
// value (e.g. looking for a workout with _id = "stats"), which returns 404.

router.get('/stats', asyncHandler(async (req: AuthRequest, res: Response) => {
  const totalCaloriesBurned = await StatsService.workoutCaloriesToday(req.userId as string);
  const weekly = await StatsService.weeklyWorkoutCalories(req.userId as string);
  res.json({ totalCaloriesBurned, weekly });
}));

router.get('/history', asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json(await StatsService.workoutHistory(req.userId as string));
}));

router.get('/all', asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json(await ServiceFactory.getWorkoutService().getAll(req.userId as string));
}));

router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json(await ServiceFactory.getWorkoutService().getToday(req.userId as string));
}));

router.post('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const created = await ServiceFactory.getWorkoutService().create(req.userId as string, req.body);
  res.status(201).json(created);
}));

router.put('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const updated = await ServiceFactory.getWorkoutService().update(req.params.id, req.userId as string, req.body);
  res.json(updated);
}));

router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  await ServiceFactory.getWorkoutService().remove(req.params.id, req.userId as string);
  res.json({ message: 'Workout deleted' });
}));

export default router;
