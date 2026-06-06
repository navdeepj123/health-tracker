export interface FoodPreset {
  name: string; calories: number; protein: number; carbs: number; fat: number; emoji: string;
}

export const FOOD_PRESETS: FoodPreset[] = [
  { name: 'Banana', calories: 89, protein: 1, carbs: 23, fat: 0, emoji: '🍌' },
  { name: 'Apple', calories: 72, protein: 0, carbs: 19, fat: 0, emoji: '🍎' },
  { name: 'Boiled Egg', calories: 78, protein: 6, carbs: 1, fat: 5, emoji: '🥚' },
  { name: 'Oats (100g)', calories: 389, protein: 17, carbs: 66, fat: 7, emoji: '🥣' },
  { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 4, emoji: '🍗' },
  { name: 'Brown Rice (100g)', calories: 216, protein: 5, carbs: 45, fat: 2, emoji: '🍚' },
  { name: 'Whole Milk (200ml)', calories: 130, protein: 7, carbs: 10, fat: 7, emoji: '🥛' },
  { name: 'Greek Yogurt', calories: 100, protein: 10, carbs: 6, fat: 3, emoji: '🫙' },
  { name: 'Avocado (half)', calories: 120, protein: 1, carbs: 6, fat: 11, emoji: '🥑' },
  { name: 'White Bread (slice)', calories: 79, protein: 3, carbs: 15, fat: 1, emoji: '🍞' },
  { name: 'Coffee (black)', calories: 5, protein: 0, carbs: 1, fat: 0, emoji: '☕' },
  { name: 'Almonds (30g)', calories: 174, protein: 6, carbs: 6, fat: 15, emoji: '🌰' },
  { name: 'Salmon (100g)', calories: 208, protein: 20, carbs: 0, fat: 13, emoji: '🐟' },
  { name: 'Pasta (100g cooked)', calories: 158, protein: 6, carbs: 31, fat: 1, emoji: '🍝' },
  { name: 'Orange Juice (200ml)', calories: 88, protein: 1, carbs: 21, fat: 0, emoji: '🍊' },
];

export const CALORIE_ESTIMATES: Record<string, number> = {
  cardio: 8, strength: 6, hiit: 10, yoga: 3, flexibility: 3, sports: 7, other: 5,
};

export const estimateCalories = (type: string, duration: number): number =>
  Math.round((CALORIE_ESTIMATES[type] || 5) * duration);
