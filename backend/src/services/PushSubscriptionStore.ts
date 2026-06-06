import webpush, { PushSubscription } from 'web-push';
import mongoose from 'mongoose';
import PushSubscriptionModel from '../models/PushSubscription';

let configured = false;

export const configureWebPush = (): void => {
  if (configured) return;
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL as string,
    process.env.VAPID_PUBLIC_KEY as string,
    process.env.VAPID_PRIVATE_KEY as string
  );
  configured = true;
};

// Save subscription to MongoDB — survives server restarts
export const addSubscription = async (
  userId: string,
  subscription: PushSubscription
): Promise<void> => {
  const { endpoint, keys } = subscription as any;
  if (!endpoint || !keys?.p256dh || !keys?.auth) return;
  await PushSubscriptionModel.updateOne(
    { endpoint },
    { userId: new mongoose.Types.ObjectId(userId), endpoint, keys },
    { upsert: true }
  );
};

// Convert userId to ObjectId before querying so the type matches what's stored
export const getSubscriptionsForUser = async (
  userId: string
): Promise<PushSubscription[]> => {
  const docs = await PushSubscriptionModel.find({
    userId: new mongoose.Types.ObjectId(userId),
  });
  return docs.map((d) => ({
    endpoint: d.endpoint,
    keys: { p256dh: d.keys.p256dh, auth: d.keys.auth },
  })) as PushSubscription[];
};
