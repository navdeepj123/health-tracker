import { Model, Document, FilterQuery } from 'mongoose';

// Repository Pattern — all Mongoose access goes through here.
// Services never write DB queries directly, so swapping the data store
// only requires changing the repository files, not the business logic.
//
// The generic <T> means one base class covers Workout, Food and Water.
export abstract class BaseRepository<T extends Document> {
  protected constructor(protected readonly model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async findAllByUser(userId: string): Promise<T[]> {
    return this.model
      .find({ user: userId } as FilterQuery<T>)
      .sort({ date: -1 })
      .exec();
  }

  async findById(id: string, userId: string): Promise<T | null> {
    // Always scope by userId so users can only access their own data
    return this.model.findOne({ _id: id, user: userId } as FilterQuery<T>).exec();
  }

  async update(id: string, userId: string, data: Partial<T>): Promise<T | null> {
    return this.model
      .findOneAndUpdate(
        { _id: id, user: userId } as FilterQuery<T>,
        data,
        { new: true, runValidators: true }
      )
      .exec();
  }

  async delete(id: string, userId: string): Promise<T | null> {
    return this.model
      .findOneAndDelete({ _id: id, user: userId } as FilterQuery<T>)
      .exec();
  }

  // Helper: start and end of the current calendar day (midnight to 23:59)
  protected todayRange(): { start: Date; end: Date } {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  async findTodayByUser(userId: string): Promise<T[]> {
    const { start, end } = this.todayRange();
    return this.model
      .find({ user: userId, date: { $gte: start, $lte: end } } as FilterQuery<T>)
      .sort({ date: -1 })
      .exec();
  }
}
