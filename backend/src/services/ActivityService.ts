import { BaseRepository } from '../repositories/BaseRepository';
import { ValidationStrategy } from '../patterns/strategy/ValidationStrategy';
import EventBus, { DomainEvent } from '../patterns/observer/EventBus';
import { NotFoundError } from '../errors/AppError';
import { Document } from 'mongoose';

// Generic service that powers Workout, Food and Water.
// It ties together three patterns:
//   - Repository: all DB access via the injected repository
//   - Strategy: validation via the injected validator (no if-chains here)
//   - Observer: publishes a domain event after creation so observers react
export class ActivityService<T extends Document> {
  constructor(
    private readonly repository: BaseRepository<T>,
    private readonly validator: ValidationStrategy,
    private readonly createdEvent: DomainEvent,
    private readonly resourceName: string
  ) {}

  getToday(userId: string) { return this.repository.findTodayByUser(userId); }
  getAll(userId: string) { return this.repository.findAllByUser(userId); }

  async create(userId: string, data: any) {
    this.validator.validate(data); // throws ValidationError if rules fail
    const created = await this.repository.create({ ...data, user: userId });
    EventBus.publish(this.createdEvent, created); // observers notified here
    return created;
  }

  async update(id: string, userId: string, data: any) {
    const existing = await this.repository.findById(id, userId);
    if (!existing) throw new NotFoundError(this.resourceName);
    // Merge before validating so partial updates still satisfy all rules
    this.validator.validate({ ...existing.toObject(), ...data });
    return this.repository.update(id, userId, data);
  }

  async remove(id: string, userId: string) {
    const existing = await this.repository.findById(id, userId);
    if (!existing) throw new NotFoundError(this.resourceName);
    return this.repository.delete(id, userId);
  }
}
