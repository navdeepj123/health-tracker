// Factory Pattern — the single place that knows how to build a fully-wired
// ActivityService. Routes just ask: ServiceFactory.getWorkoutService().
// If a dependency changes, this file changes — nothing else does.
import { ActivityService } from '../../services/ActivityService';
import {
  WorkoutValidationStrategy,
  FoodValidationStrategy,
  WaterValidationStrategy,
} from '../strategy/ValidationStrategy';
import workoutRepository from '../../repositories/WorkoutRepository';
import foodRepository from '../../repositories/FoodRepository';
import waterRepository from '../../repositories/WaterRepository';
import { IWorkout } from '../../models/Workout';
import { IFood } from '../../models/Food';
import { IWater } from '../../models/Water';

class ServiceFactory {
  private static workoutService: ActivityService<IWorkout>;
  private static foodService: ActivityService<IFood>;
  private static waterService: ActivityService<IWater>;

  static getWorkoutService(): ActivityService<IWorkout> {
    if (!this.workoutService)
      this.workoutService = new ActivityService<IWorkout>(
        workoutRepository, new WorkoutValidationStrategy(), 'workout.created', 'Workout'
      );
    return this.workoutService;
  }

  static getFoodService(): ActivityService<IFood> {
    if (!this.foodService)
      this.foodService = new ActivityService<IFood>(
        foodRepository, new FoodValidationStrategy(), 'food.created', 'Food'
      );
    return this.foodService;
  }

  static getWaterService(): ActivityService<IWater> {
    if (!this.waterService)
      this.waterService = new ActivityService<IWater>(
        waterRepository, new WaterValidationStrategy(), 'water.created', 'Water log'
      );
    return this.waterService;
  }
}

export default ServiceFactory;
