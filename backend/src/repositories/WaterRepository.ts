import mongoose from 'mongoose';
import Water, { IWater } from '../models/Water';
import { BaseRepository } from './BaseRepository';

class WaterRepository extends BaseRepository<IWater> {
  constructor() { super(Water); }

  async getTotalAmountToday(userId: string): Promise<number> {
    const { start, end } = this.todayRange();
    const result = await Water.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result[0]?.total || 0;
  }

  async getDailyHistory(userId: string): Promise<any[]> {
    return Water.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' }, day: { $dayOfMonth: '$date' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
      { $limit: 30 },
    ]);
  }
}

export default new WaterRepository();
