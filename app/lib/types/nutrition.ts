/**
 * Nutrition Type Definitions
 *
 * Defines all TypeScript interfaces and types for the Nutrition Tracking System
 */

// ============================================================================
// MEAL LOGGING INTERFACES
// ============================================================================

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealLog {
  id: string;
  userId: string;
  date: Date;
  mealType: MealType;
  recipeId?: string; // si depuis recette sauvegardée
  customFood?: CustomFood;
  servings: number; // multiplicateur de portions
  notes?: string;
  createdAt: Date;
}

export interface CustomFood {
  name: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber?: number; // grams
}

// ============================================================================
// DAILY NUTRITION TRACKING
// ============================================================================

export interface DailyNutrition {
  id: string;
  userId: string;
  date: Date;
  totalCalories: number;
  totalProtein: number; // grams
  totalCarbs: number; // grams
  totalFat: number; // grams
  totalFiber: number; // grams
  waterIntake: number; // ml
  mealsLogged: number;
  goalCalories: number;
  goalProtein: number;
  goalCarbs: number;
  goalFat: number;
}

// ============================================================================
// NUTRITION GOALS & USER PROFILE
// ============================================================================

export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type GoalType = 'lose_weight' | 'maintain' | 'gain_weight';
export type DietType = 'balanced' | 'keto' | 'high_protein';

export interface UserProfile {
  userId: string;
  weight: number; // kg
  height: number; // cm
  age: number; // years
  sex: Sex;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  dietType: DietType;
  createdAt: Date;
  updatedAt: Date;
}

export interface NutritionGoals {
  id: string;
  userId: string;
  bmr: number; // Base Metabolic Rate
  tdee: number; // Total Daily Energy Expenditure (BMR * activity multiplier)
  dailyCalories: number; // Adjusted based on goal
  dailyProtein: number; // grams
  dailyCarbs: number; // grams
  dailyFat: number; // grams
  calculatedDate: Date;
}

// ============================================================================
// DATA TRANSFER OBJECTS (DTOs)
// ============================================================================

export interface CreateMealLogDTO {
  date: string; // ISO date string
  mealType: MealType;
  recipeId?: string;
  customFood?: CustomFood;
  servings: number;
  notes?: string;
}

export interface UpdateMealLogDTO {
  servings?: number;
  notes?: string;
}

export interface CreateUserProfileDTO {
  weight: number;
  height: number;
  age: number;
  sex: Sex;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  dietType: DietType;
}

export interface UpdateUserProfileDTO {
  weight?: number;
  height?: number;
  age?: number;
  sex?: Sex;
  activityLevel?: ActivityLevel;
  goalType?: GoalType;
  dietType?: DietType;
}

// ============================================================================
// NUTRITION API RESPONSES
// ============================================================================

export interface NutritionixFoodItem {
  food_name: string;
  serving_qty: number;
  serving_unit: string;
  serving_weight_grams: number;
  nf_calories: number;
  nf_total_fat: number;
  nf_total_carbohydrate: number;
  nf_protein: number;
  nf_dietary_fiber: number;
}

export interface NutritionixResponse {
  foods: NutritionixFoodItem[];
}

// ============================================================================
// DASHBOARD & STATS
// ============================================================================

export interface NutritionProgress {
  consumed: number;
  goal: number;
  remaining: number;
  percentage: number;
}

export interface DailyNutritionStats {
  calories: NutritionProgress;
  protein: NutritionProgress;
  carbs: NutritionProgress;
  fat: NutritionProgress;
  waterIntake: number;
  mealsLogged: MealLog[];
}

export interface WeeklyNutritionSummary {
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  daysTracked: number;
  totalMealsLogged: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const GOAL_ADJUSTMENTS: Record<GoalType, number> = {
  lose_weight: -500, // -500 calories per day (~0.5kg per week)
  maintain: 0,
  gain_weight: 300, // +300 calories per day (~0.25kg per week)
};

export const MACRO_RATIOS: Record<DietType, { carbs: number; protein: number; fat: number }> = {
  balanced: { carbs: 0.40, protein: 0.30, fat: 0.30 },
  keto: { carbs: 0.05, protein: 0.25, fat: 0.70 },
  high_protein: { carbs: 0.30, protein: 0.40, fat: 0.30 },
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sédentaire (peu ou pas d\'exercice)',
  light: 'Légère activité (1-3 jours/semaine)',
  moderate: 'Activité modérée (3-5 jours/semaine)',
  active: 'Actif (6-7 jours/semaine)',
  very_active: 'Très actif (2x par jour)',
};

export const GOAL_LABELS: Record<GoalType, string> = {
  lose_weight: 'Perdre du poids',
  maintain: 'Maintenir le poids',
  gain_weight: 'Prendre du poids',
};

export const DIET_LABELS: Record<DietType, string> = {
  balanced: 'Équilibré',
  keto: 'Keto',
  high_protein: 'Riche en protéines',
};

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Petit-déjeuner',
  lunch: 'Déjeuner',
  dinner: 'Dîner',
  snack: 'Snack',
};
