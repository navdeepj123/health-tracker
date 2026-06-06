import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/UserRepository';
import EventBus from '../patterns/observer/EventBus';
import { ConflictError, UnauthorizedError } from '../errors/AppError';

// Singleton — one shared instance for the whole app
class AuthService {
  private static instance: AuthService;
  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) AuthService.instance = new AuthService();
    return AuthService.instance;
  }

  private generateToken(id: string): string {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '30d' });
  }

  async register(name: string, email: string, password: string) {
    const existing = await UserRepository.findByEmail(email);
    if (existing) throw new ConflictError('An account with this email already exists');

    // Pass the plain password — the User model's pre-save hook hashes it once
    const user = await UserRepository.create({ name, email, password });
    EventBus.publish('user.registered', { user: user._id, email });

    return {
      user: { _id: user._id, name: user.name, email: user.email, dailyCalorieGoal: user.dailyCalorieGoal, dailyWaterGoal: user.dailyWaterGoal },
      token: this.generateToken(user._id.toString()),
    };
  }

  async login(email: string, password: string) {
    // Must request password explicitly since it's select:false on the schema
    const user = await UserRepository.findByEmail(email, true);
    if (!user) throw new UnauthorizedError('Invalid email or password');

    const match = await user.comparePassword(password);
    if (!match) throw new UnauthorizedError('Invalid email or password');

    return {
      user: { _id: user._id, name: user.name, email: user.email, dailyCalorieGoal: user.dailyCalorieGoal, dailyWaterGoal: user.dailyWaterGoal },
      token: this.generateToken(user._id.toString()),
    };
  }
}

export default AuthService.getInstance();
