import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkout extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  type: string;
  duration: number;
  calories: number;
  notes?: string;
  date: Date;
}

const WorkoutSchema: Schema = new Schema(
  {
    // Index on user so queries by user are fast
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      lowercase: true,
      enum: ['cardio', 'strength', 'flexibility', 'sports', 'hiit', 'yoga', 'other'],
    },
    duration: { type: Number, required: true, min: 0 },
    calories: { type: Number, required: true, min: 0 },
    notes: { type: String, default: '' },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IWorkout>('Workout', WorkoutSchema);
