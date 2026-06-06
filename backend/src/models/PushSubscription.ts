import mongoose, { Document, Schema } from 'mongoose';

// Stores push subscription objects in MongoDB so they survive server restarts.
// Previously subscriptions were held in memory and lost on every restart,
// which is why notifications stopped working after restarting the backend.
export interface IPushSubscription extends Document {
  userId: mongoose.Types.ObjectId;
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

const PushSubscriptionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // endpoint is unique per browser — used to avoid duplicate subscriptions
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IPushSubscription>('PushSubscription', PushSubscriptionSchema);
