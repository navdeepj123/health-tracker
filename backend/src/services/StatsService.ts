import workoutRepository from '../repositories/WorkoutRepository';
import foodRepository from '../repositories/FoodRepository';
import waterRepository from '../repositories/WaterRepository';

// Thin facade over the three repositories for read-only analytics.
// Keeps aggregation logic out of routes and controllers.
class StatsService {
  private static instance: StatsService;
  private constructor() {}
  static getInstance(): StatsService {
    if (!StatsService.instance) StatsService.instance = new StatsService();
    return StatsService.instance;
  }

  workoutCaloriesToday(userId: string) { return workoutRepository.getTotalCaloriesToday(userId); }
  foodCaloriesToday(userId: string) { return foodRepository.getTotalCaloriesToday(userId); }
  waterToday(userId: string) { return waterRepository.getTotalAmountToday(userId); }
  foodMacrosToday(userId: string) { return foodRepository.getMacrosToday(userId); }
  workoutHistory(userId: string) { return workoutRepository.getDailyHistory(userId); }
  foodHistory(userId: string) { return foodRepository.getDailyHistory(userId); }
  waterHistory(userId: string) { return waterRepository.getDailyHistory(userId); }
  weeklyWorkoutCalories(userId: string) { return workoutRepository.getWeeklyCalories(userId); }
}

export default StatsService.getInstance();
