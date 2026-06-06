import mongoose, { Document, Schema } from 'mongoose';

export interface IFood extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: string;
  date: Date;
}

const FoodSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    calories: { type: Number, required: true, min: 0 },
    protein: { type: Number, default: 0, min: 0 },
    carbs: { type: Number, default: 0, min: 0 },
    fat: { type: Number, default: 0, min: 0 },
    mealType: {
      type: String,
      required: true,
      lowercase: true,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      default: 'snack',
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IFood>('Food', FoodSchema);
