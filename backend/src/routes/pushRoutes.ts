import express, { Response } from 'express';
import webpush from 'web-push';
import { protect, asyncHandler, AuthRequest } from '../middleware/auth';
import {
  configureWebPush,
  addSubscription,
  getSubscriptionsForUser,
} from '../services/PushSubscriptionStore';

const router = express.Router();

// Public — the frontend needs the VAPID public key before it can subscribe
router.get('/vapid-public-key', (_req, res: Response) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// Saves the browser's push subscription object to MongoDB
router.post(
  '/subscribe',
  protect,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    configureWebPush();
    await addSubscription(req.userId as string, req.body);
    res.status(201).json({ message: 'Subscribed successfully' });
  })
);

// Sends a push notification to all of this user's subscribed browsers
// Returns 404 if no subscription is found so the frontend knows to re-subscribe
router.post(
  '/send',
  protect,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    configureWebPush();
    const payload = JSON.stringify({
      title: req.body.title || 'Health Tracker',
      body: req.body.body || 'Keep up the great work!',
    });
    const subs = await getSubscriptionsForUser(req.userId as string);
    if (!subs.length) {
      return res.status(404).json({ message: 'No subscription found. Please enable notifications again.' });
    }
    await Promise.all(subs.map((s) => webpush.sendNotification(s, payload).catch(() => {})));
    res.json({ message: 'Notification sent' });
  })
);

export default router;
