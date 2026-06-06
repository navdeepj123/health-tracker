import mongoose, { Document, Schema } from 'mongoose';

export interface IWater extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
}

const WaterSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IWater>('Water', WaterSchema);
