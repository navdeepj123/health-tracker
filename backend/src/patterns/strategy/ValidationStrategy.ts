import { ValidationError } from '../../errors/AppError';

// Strategy Pattern — each entity's validation rules live in their own class.
// ActivityService holds a reference to this interface, not the concrete class,
// so validation can be swapped or extended without touching the service.
export interface ValidationStrategy<T = any> {
  validate(data: T): void; // throws ValidationError if invalid
}

export class WorkoutValidationStrategy implements ValidationStrategy {
  private readonly allowedTypes = [
    'cardio', 'strength', 'flexibility', 'sports', 'hiit', 'yoga', 'other',
  ];

  validate(data: any): void {
    if (!data.title || typeof data.title !== 'string')
      throw new ValidationError('Workout title is required');
    if (!data.type || !this.allowedTypes.includes(String(data.type).toLowerCase()))
      throw new ValidationError(`Type must be one of: ${this.allowedTypes.join(', ')}`);
    if (data.duration === undefined || Number(data.duration) <= 0)
      throw new ValidationError('Duration must be a positive number');
    if (data.calories === undefined || Number(data.calories) <= 0)
      throw new ValidationError('Calories must be a positive number');
  }
}

export class FoodValidationStrategy implements ValidationStrategy {
  private readonly allowedMeals = ['breakfast', 'lunch', 'dinner', 'snack'];

  validate(data: any): void {
    if (!data.name || typeof data.name !== 'string')
      throw new ValidationError('Food name is required');
    if (data.calories === undefined || Number(data.calories) <= 0)
      throw new ValidationError('Calories must be a positive number');
    if (data.mealType && !this.allowedMeals.includes(String(data.mealType).toLowerCase()))
      throw new ValidationError(`Meal type must be one of: ${this.allowedMeals.join(', ')}`);
    for (const macro of ['protein', 'carbs', 'fat']) {
      if (data[macro] !== undefined && Number(data[macro]) < 0)
        throw new ValidationError(`${macro} cannot be negative`);
    }
  }
}

export class WaterValidationStrategy implements ValidationStrategy {
  validate(data: any): void {
    if (data.amount === undefined || Number(data.amount) <= 0)
      throw new ValidationError('Amount must be a positive number');
    if (Number(data.amount) > 10000)
      throw new ValidationError('Amount seems unrealistically high');
  }
}
