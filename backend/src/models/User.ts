import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  dailyCalorieGoal: number;
  dailyWaterGoal: number;
  weight?: number;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select: false means password is never returned in queries unless explicitly requested
    password: { type: String, required: true, minlength: 6, select: false },
    dailyCalorieGoal: { type: Number, default: 2000 },
    dailyWaterGoal: { type: Number, default: 2000 },
    weight: { type: Number },
  },
  { timestamps: true }
);

// Hash the password only in the model — single source of truth.
// This fixes the old double-hash bug where AuthService was also hashing,
// causing bcrypt.compare to always fail on login.
UserSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
