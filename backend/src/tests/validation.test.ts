import { WorkoutValidationStrategy, FoodValidationStrategy, WaterValidationStrategy } from '../patterns/strategy/ValidationStrategy';
import { ValidationError } from '../errors/AppError';

describe('WorkoutValidationStrategy', () => {
  const v = new WorkoutValidationStrategy();
  it('accepts valid workout', () => expect(() => v.validate({ title: 'Run', type: 'cardio', duration: 30, calories: 200 })).not.toThrow());
  it('rejects missing title', () => expect(() => v.validate({ type: 'cardio', duration: 30, calories: 200 })).toThrow(ValidationError));
  it('rejects invalid type', () => expect(() => v.validate({ title: 'Run', type: 'dancing', duration: 30, calories: 200 })).toThrow(ValidationError));
  it('rejects zero duration', () => expect(() => v.validate({ title: 'Run', type: 'cardio', duration: 0, calories: 200 })).toThrow(ValidationError));
});

describe('FoodValidationStrategy', () => {
  const v = new FoodValidationStrategy();
  it('accepts valid food', () => expect(() => v.validate({ name: 'Eggs', calories: 150 })).not.toThrow());
  it('rejects missing name', () => expect(() => v.validate({ calories: 150 })).toThrow(ValidationError));
  it('rejects negative protein', () => expect(() => v.validate({ name: 'Eggs', calories: 150, protein: -5 })).toThrow(ValidationError));
});

describe('WaterValidationStrategy', () => {
  const v = new WaterValidationStrategy();
  it('accepts valid amount', () => expect(() => v.validate({ amount: 250 })).not.toThrow());
  it('rejects zero', () => expect(() => v.validate({ amount: 0 })).toThrow(ValidationError));
  it('rejects unrealistic amount', () => expect(() => v.validate({ amount: 99999 })).toThrow(ValidationError));
});
