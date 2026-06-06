import User, { IUser } from '../models/User';

// UserRepository does not extend BaseRepository because users are not
// time-scoped activities — they have a different query surface.
class UserRepository {
  async findByEmail(email: string, withPassword = false) {
    const q = User.findOne({ email: email.toLowerCase() });
    // Only select password when explicitly needed (e.g. login)
    if (withPassword) q.select('+password');
    return q.exec();
  }

  async findById(id: string) {
    return User.findById(id).exec();
  }

  async create(data: { name: string; email: string; password: string }) {
    return User.create(data);
  }

  async updateProfile(id: string, data: Partial<IUser>) {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }
}

export default new UserRepository();
