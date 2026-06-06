import express, { Response } from 'express';
import { protect, asyncHandler, AuthRequest } from '../middleware/auth';
import ServiceFactory from '../patterns/factory/ServiceFactory';
import StatsService from '../services/StatsService';

const router = express.Router();
router.use(protect);

// Static routes before /:id — see workoutRoutes.ts for explanation
router.get('/stats', asyncHandler(async (req: AuthRequest, res: Response) => {
  const totalWater = await StatsService.waterToday(req.userId as string);
  res.json({ totalWater });
}));

router.get('/history', asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json(await StatsService.waterHistory(req.userId as string));
}));

router.get('/all', asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json(await ServiceFactory.getWaterService().getAll(req.userId as string));
}));

router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json(await ServiceFactory.getWaterService().getToday(req.userId as string));
}));

router.post('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const created = await ServiceFactory.getWaterService().create(req.userId as string, req.body);
  res.status(201).json(created);
}));

router.put('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const updated = await ServiceFactory.getWaterService().update(req.params.id, req.userId as string, req.body);
  res.json(updated);
}));

router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  await ServiceFactory.getWaterService().remove(req.params.id, req.userId as string);
  res.json({ message: 'Water log deleted' });
}));

export default router;
