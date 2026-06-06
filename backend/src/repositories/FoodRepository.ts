import mongoose from 'mongoose';
import Food, { IFood } from '../models/Food';
import { BaseRepository } from './BaseRepository';

class FoodRepository extends BaseRepository<IFood> {
  constructor() { super(Food); }

  async getTotalCaloriesToday(userId: string): Promise<number> {
    const { start, end } = this.todayRange();
    const result = await Food.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$calories' } } },
    ]);
    return result[0]?.total || 0;
  }

  // Returns today's macro totals for the dashboard macro breakdown
  async getMacrosToday(userId: string): Promise<{ protein: number; carbs: number; fat: number }> {
    const { start, end } = this.todayRange();
    const result = await Food.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end } } },
      { $group: { _id: null, protein: { $sum: '$protein' }, carbs: { $sum: '$carbs' }, fat: { $sum: '$fat' } } },
    ]);
    return result[0] || { protein: 0, carbs: 0, fat: 0 };
  }

  async getDailyHistory(userId: string): Promise<any[]> {
    return Food.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' }, day: { $dayOfMonth: '$date' } },
          totalCalories: { $sum: '$calories' },
          totalProtein: { $sum: '$protein' },
          totalCarbs: { $sum: '$carbs' },
          totalFat: { $sum: '$fat' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
      { $limit: 30 },
    ]);
  }
}

export default new FoodRepository();
