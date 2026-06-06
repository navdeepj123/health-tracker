import express, { Response } from 'express';
import { protect, asyncHandler, AuthRequest } from '../middleware/auth';
import ServiceFactory from '../patterns/factory/ServiceFactory';
import StatsService from '../services/StatsService';

const router = express.Router();
router.use(protect);

// Static routes before /:id — see workoutRoutes.ts for explanation
router.get('/stats', asyncHandler(async (req: AuthRequest, res: Response) => {
  const totalCaloriesConsumed = await StatsService.foodCaloriesToday(req.userId as string);
  const macros = await StatsService.foodMacrosToday(req.userId as string);
  res.json({ totalCaloriesConsumed, ...macros });
}));

router.get('/history', asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json(await StatsService.foodHistory(req.userId as string));
}));

router.get('/all', asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json(await ServiceFactory.getFoodService().getAll(req.userId as string));
}));

router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json(await ServiceFactory.getFoodService().getToday(req.userId as string));
}));

router.post('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const created = await ServiceFactory.getFoodService().create(req.userId as string, req.body);
  res.status(201).json(created);
}));

router.put('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const updated = await ServiceFactory.getFoodService().update(req.params.id, req.userId as string, req.body);
  res.json(updated);
}));

router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  await ServiceFactory.getFoodService().remove(req.params.id, req.userId as string);
  res.json({ message: 'Food deleted' });
}));

export default router;
