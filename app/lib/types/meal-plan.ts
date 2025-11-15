/**
 * Meal Planning Type Definitions
 *
 * Defines all TypeScript interfaces and types for the Meal Planning System
 */

import type { MealType } from './nutrition';

// ============================================================================
// MEAL PLAN INTERFACES
// ============================================================================

export interface MealSlot {
  mealType: MealType;
  recipeId?: string;
  recipeName?: string;
  servings?: number;
  calories?: number;
  notes?: string;
}

export interface DayMealPlan {
  date: Date;
  meals: MealSlot[];
}

export interface MealPlan {
  id: string;
  userId: string;
  weekStart: Date; // Monday
  weekEnd: Date; // Sunday
  days: DayMealPlan[];
  totalCalories: number; // Week total
  generatedDate?: Date;
  generationCriteria?: MealPlanGenerationCriteria;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// ============================================================================
// MEAL PLAN GENERATION
// ============================================================================

export interface MealPlanGenerationCriteria {
  dailyCalorieTarget: number;
  avoidRepetition: boolean; // Don't repeat same recipe too often
  useFridgeItems: boolean; // Prioritize fridge ingredients
  considerPrepTime: boolean; // Consider prep time for busy days
  balanceNutrition: boolean; // Balance macros over the week
  dietaryPreferences?: string[]; // e.g., "vegetarian", "low-carb"
  maxPrepTimePerDay?: Record<string, number>; // e.g., { "monday": 30, "tuesday": 60 }
  preferredMealTypes?: Partial<Record<MealType, number>>; // Number of meals per type
  excludeRecipeIds?: string[]; // Recipes to avoid
}

export interface MealPlanGenerationRequest {
  weekStart: Date;
  criteria: MealPlanGenerationCriteria;
}

export interface MealPlanSuggestion {
  date: Date;
  mealType: MealType;
  recipeId: string;
  recipeName: string;
  reason: string; // Why this recipe was suggested
  calories: number;
  prepTime: number;
}

// ============================================================================
// SHOPPING LIST INTERFACES
// ============================================================================

export type FoodCategory =
  | 'fruits'
  | 'vegetables'
  | 'meat'
  | 'fish'
  | 'dairy'
  | 'grains'
  | 'spices'
  | 'condiments'
  | 'beverages'
  | 'bakery'
  | 'frozen'
  | 'canned'
  | 'other';

export interface ShoppingListItem {
  name: string;
  quantity: number;
  unit: string;
  category: FoodCategory;
  checked: boolean;
  estimatedPrice?: number;
  recipeIds: string[]; // Which recipes need this item
  inFridge: boolean; // Already have this in fridge
}

export interface ShoppingList {
  id: string;
  userId: string;
  mealPlanId?: string;
  name: string;
  createdDate: Date;
  items: ShoppingListItem[];
  totalEstimated?: number;
  isCompleted: boolean;
}

// ============================================================================
// MEAL PREP INTERFACES
// ============================================================================

export interface MealPrepRecommendation {
  recipeId: string;
  recipeName: string;
  batchSize: number; // How many portions to make
  prepDay: string; // e.g., "Sunday"
  storageInstructions: string;
  shelfLife: number; // Days
  plannedMeals: {
    date: Date;
    mealType: MealType;
  }[];
}

export interface LeftoverSuggestion {
  originalRecipeId: string;
  originalRecipeName: string;
  servingsLeft: number;
  expiryDate: Date;
  suggestedRecipes: {
    recipeId: string;
    recipeName: string;
    reason: string;
  }[];
}

// ============================================================================
// DATA TRANSFER OBJECTS (DTOs)
// ============================================================================

export interface CreateMealPlanDTO {
  weekStart: string; // ISO date string
  days?: DayMealPlan[];
  generationCriteria?: MealPlanGenerationCriteria;
}

export interface UpdateMealPlanDTO {
  days?: DayMealPlan[];
  isActive?: boolean;
}

export interface UpdateMealSlotDTO {
  date: string; // ISO date string
  mealType: MealType;
  recipeId?: string;
  servings?: number;
  notes?: string;
}

export interface CreateShoppingListDTO {
  mealPlanId?: string;
  name: string;
  items?: ShoppingListItem[];
}

export interface UpdateShoppingListDTO {
  name?: string;
  items?: ShoppingListItem[];
  isCompleted?: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface WeekOverview {
  totalCalories: number;
  averageDailyCalories: number;
  totalMeals: number;
  recipeVariety: number; // Number of unique recipes
  fridgeItemsUsed: number;
  estimatedPrepTime: number; // Total minutes
}

export interface DailyMealSummary {
  date: Date;
  totalCalories: number;
  mealsCount: number;
  totalPrepTime: number;
  recipes: {
    recipeId: string;
    recipeName: string;
    mealType: MealType;
  }[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const DAYS_OF_WEEK = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
] as const;

export const FOOD_CATEGORIES: { value: FoodCategory; label: string; emoji: string }[] = [
  { value: 'fruits', label: 'Fruits', emoji: '🍎' },
  { value: 'vegetables', label: 'Légumes', emoji: '🥕' },
  { value: 'meat', label: 'Viande', emoji: '🥩' },
  { value: 'fish', label: 'Poisson', emoji: '🐟' },
  { value: 'dairy', label: 'Produits laitiers', emoji: '🥛' },
  { value: 'grains', label: 'Céréales', emoji: '🌾' },
  { value: 'spices', label: 'Épices', emoji: '🧂' },
  { value: 'condiments', label: 'Condiments', emoji: '🍯' },
  { value: 'beverages', label: 'Boissons', emoji: '🥤' },
  { value: 'bakery', label: 'Boulangerie', emoji: '🍞' },
  { value: 'frozen', label: 'Surgelés', emoji: '❄️' },
  { value: 'canned', label: 'Conserves', emoji: '🥫' },
  { value: 'other', label: 'Autre', emoji: '📦' },
];

export const MEAL_PREP_FRIENDLY_TAGS = [
  'meal-prep',
  'freezer-friendly',
  'batch-cooking',
  'leftovers-friendly',
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the start of week (Monday) for a given date
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  return new Date(d.setDate(diff));
}

/**
 * Get the end of week (Sunday) for a given date
 */
export function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
}

/**
 * Generate all days for a week
 */
export function generateWeekDays(weekStart: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    days.push(day);
  }
  return days;
}

/**
 * Check if a date is in the current week
 */
export function isCurrentWeek(weekStart: Date): boolean {
  const today = new Date();
  const currentWeekStart = getWeekStart(today);
  return weekStart.getTime() === currentWeekStart.getTime();
}

/**
 * Categorize ingredient into food category
 */
export function categorizeIngredient(ingredientName: string): FoodCategory {
  const name = ingredientName.toLowerCase();

  // Fruits
  if (/pomme|poire|banane|orange|fraise|raisin|citron|mangue|ananas|kiwi/i.test(name)) {
    return 'fruits';
  }

  // Vegetables
  if (/tomate|carotte|oignon|ail|poivron|courgette|aubergine|salade|épinard|brocoli|chou/i.test(name)) {
    return 'vegetables';
  }

  // Meat
  if (/poulet|boeuf|porc|agneau|veau|dinde|canard|viande/i.test(name)) {
    return 'meat';
  }

  // Fish
  if (/saumon|thon|cabillaud|crevette|moule|poisson|fruits de mer/i.test(name)) {
    return 'fish';
  }

  // Dairy
  if (/lait|fromage|yaourt|beurre|crème|œuf|oeuf/i.test(name)) {
    return 'dairy';
  }

  // Grains
  if (/riz|pâtes|pain|farine|quinoa|avoine|céréales/i.test(name)) {
    return 'grains';
  }

  // Spices
  if (/sel|poivre|paprika|cumin|curry|thym|basilic|persil|cannelle|muscade/i.test(name)) {
    return 'spices';
  }

  // Condiments
  if (/huile|vinaigre|sauce|mayonnaise|moutarde|ketchup|miel/i.test(name)) {
    return 'condiments';
  }

  // Beverages
  if (/eau|jus|café|thé|soda|vin|bière/i.test(name)) {
    return 'beverages';
  }

  // Frozen
  if (/surgelé|glace|frozen/i.test(name)) {
    return 'frozen';
  }

  // Canned
  if (/conserve|boîte|canned/i.test(name)) {
    return 'canned';
  }

  return 'other';
}
