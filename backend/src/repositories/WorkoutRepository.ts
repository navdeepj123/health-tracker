import mongoose from 'mongoose';
import Workout, { IWorkout } from '../models/Workout';
import { BaseRepository } from './BaseRepository';

// Extends the generic base with workout-specific aggregations
class WorkoutRepository extends BaseRepository<IWorkout> {
  constructor() { super(Workout); }

  async getTotalCaloriesToday(userId: string): Promise<number> {
    const { start, end } = this.todayRange();
    const result = await Workout.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$calories' } } },
    ]);
    return result[0]?.total || 0;
  }

  // Groups workouts by calendar day for the history page
  async getDailyHistory(userId: string): Promise<any[]> {
    return Workout.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' }, day: { $dayOfMonth: '$date' } },
          totalCalories: { $sum: '$calories' },
          totalDuration: { $sum: '$duration' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
      { $limit: 30 },
    ]);
  }

  // Returns the last 7 days for the dashboard bar chart
  async getWeeklyCalories(userId: string): Promise<any[]> {
    const days: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);
      const res = await Workout.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId), date: { $gte: d, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$calories' } } },
      ]);
      days.push({ day: d.toLocaleDateString('en', { weekday: 'short' }), calories: res[0]?.total || 0 });
    }
    return days;
  }
}

export default new WorkoutRepository();
