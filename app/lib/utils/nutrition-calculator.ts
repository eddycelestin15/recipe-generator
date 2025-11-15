/**
 * Nutrition Calculator Utilities
 *
 * Provides functions to calculate BMR, TDEE, and nutrition goals
 */

import type {
  Sex,
  ActivityLevel,
  GoalType,
  DietType,
  UserProfile,
  NutritionGoals,
  ACTIVITY_MULTIPLIERS,
  GOAL_ADJUSTMENTS,
  MACRO_RATIOS,
} from '../types/nutrition';

/**
 * Calculate Base Metabolic Rate (BMR) using Mifflin-St Jeor Equation
 *
 * Male: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) + 5
 * Female: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) - 161
 */
export function calculateBMR(weight: number, height: number, age: number, sex: Sex): number {
  const baseBMR = 10 * weight + 6.25 * height - 5 * age;
  return sex === 'male' ? baseBMR + 5 : baseBMR - 161;
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 *
 * TDEE = BMR * Activity Multiplier
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  return Math.round(bmr * multipliers[activityLevel]);
}

/**
 * Calculate daily calorie goal based on TDEE and goal type
 *
 * Weight Loss: TDEE - 500 (lose ~0.5kg/week)
 * Weight Gain: TDEE + 300 (gain ~0.25kg/week)
 * Maintain: TDEE
 */
export function calculateDailyCalories(tdee: number, goalType: GoalType): number {
  const adjustments: Record<GoalType, number> = {
    lose_weight: -500,
    maintain: 0,
    gain_weight: 300,
  };

  return Math.round(tdee + adjustments[goalType]);
}

/**
 * Calculate macro distribution based on diet type
 *
 * Returns grams of protein, carbs, and fat
 */
export function calculateMacros(
  dailyCalories: number,
  dietType: DietType
): { protein: number; carbs: number; fat: number } {
  const ratios: Record<DietType, { carbs: number; protein: number; fat: number }> = {
    balanced: { carbs: 0.40, protein: 0.30, fat: 0.30 },
    keto: { carbs: 0.05, protein: 0.25, fat: 0.70 },
    high_protein: { carbs: 0.30, protein: 0.40, fat: 0.30 },
  };

  const ratio = ratios[dietType];

  // Convert calorie percentages to grams
  // Protein: 4 cal/g, Carbs: 4 cal/g, Fat: 9 cal/g
  return {
    protein: Math.round((dailyCalories * ratio.protein) / 4),
    carbs: Math.round((dailyCalories * ratio.carbs) / 4),
    fat: Math.round((dailyCalories * ratio.fat) / 9),
  };
}

/**
 * Calculate complete nutrition goals from user profile
 */
export function calculateNutritionGoals(profile: UserProfile): Omit<NutritionGoals, 'id'> {
  const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.sex);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const dailyCalories = calculateDailyCalories(tdee, profile.goalType);
  const macros = calculateMacros(dailyCalories, profile.dietType);

  return {
    userId: profile.userId,
    bmr: Math.round(bmr),
    tdee,
    dailyCalories,
    dailyProtein: macros.protein,
    dailyCarbs: macros.carbs,
    dailyFat: macros.fat,
    calculatedDate: new Date(),
  };
}

/**
 * Calculate nutrition progress
 */
export function calculateProgress(consumed: number, goal: number) {
  return {
    consumed,
    goal,
    remaining: Math.max(0, goal - consumed),
    percentage: goal > 0 ? Math.min(100, Math.round((consumed / goal) * 100)) : 0,
  };
}

/**
 * Format nutrition value with unit
 */
export function formatNutritionValue(value: number, type: 'calories' | 'macros'): string {
  if (type === 'calories') {
    return `${Math.round(value)} cal`;
  }
  return `${Math.round(value)}g`;
}

/**
 * Get color based on percentage
 */
export function getProgressColor(percentage: number): string {
  if (percentage < 50) return 'text-green-600';
  if (percentage < 80) return 'text-yellow-600';
  if (percentage < 100) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Calculate total nutrition from meal logs
 */
export function calculateTotalNutrition(meals: Array<{
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  servings: number;
}>): {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
} {
  return meals.reduce(
    (totals, meal) => ({
      totalCalories: totals.totalCalories + meal.calories * meal.servings,
      totalProtein: totals.totalProtein + meal.protein * meal.servings,
      totalCarbs: totals.totalCarbs + meal.carbs * meal.servings,
      totalFat: totals.totalFat + meal.fat * meal.servings,
      totalFiber: totals.totalFiber + (meal.fiber || 0) * meal.servings,
    }),
    {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
    }
  );
}
