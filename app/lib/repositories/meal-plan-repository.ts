/**
 * Meal Plan Repository
 *
 * Data access layer for meal plan management using localStorage
 * Provides CRUD operations and querying capabilities
 */

import type {
  MealPlan,
  CreateMealPlanDTO,
  UpdateMealPlanDTO,
  DayMealPlan,
  UpdateMealSlotDTO,
  WeekOverview,
  DailyMealSummary,
} from '../types/meal-plan';
import { getWeekStart, getWeekEnd, generateWeekDays } from '../types/meal-plan';

/**
 * Generate a unique ID for meal plans
 */
function generateId(): string {
  return `meal_plan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

const STORAGE_KEY_PREFIX = 'meal_plans_';

export class MealPlanRepository {
  /**
   * Get the current user ID from localStorage
   */
  private static getUserId(): string {
    let userId = localStorage.getItem('current_user_id');
    if (!userId) {
      userId = 'default_user';
      localStorage.setItem('current_user_id', userId);
    }
    return userId;
  }

  /**
   * Get storage key for current user
   */
  private static getStorageKey(): string {
    return `${STORAGE_KEY_PREFIX}${this.getUserId()}`;
  }

  /**
   * Get all meal plans from localStorage
   */
  private static getAllMealPlansFromStorage(): MealPlan[] {
    const data = localStorage.getItem(this.getStorageKey());
    if (!data) return [];

    try {
      const mealPlans = JSON.parse(data);
      // Convert date strings back to Date objects
      return mealPlans.map((plan: any) => ({
        ...plan,
        weekStart: new Date(plan.weekStart),
        weekEnd: new Date(plan.weekEnd),
        days: plan.days.map((day: any) => ({
          ...day,
          date: new Date(day.date),
        })),
        generatedDate: plan.generatedDate ? new Date(plan.generatedDate) : undefined,
        createdAt: new Date(plan.createdAt),
        updatedAt: plan.updatedAt ? new Date(plan.updatedAt) : undefined,
      }));
    } catch (error) {
      console.error('Error parsing meal plans from localStorage:', error);
      return [];
    }
  }

  /**
   * Save all meal plans to localStorage
   */
  private static saveAllMealPlansToStorage(mealPlans: MealPlan[]): void {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(mealPlans));
  }

  /**
   * Get all meal plans for the current user
   */
  static getAll(): MealPlan[] {
    return this.getAllMealPlansFromStorage();
  }

  /**
   * Get a meal plan by ID
   */
  static getById(id: string): MealPlan | null {
    const mealPlans = this.getAllMealPlansFromStorage();
    return mealPlans.find(plan => plan.id === id) || null;
  }

  /**
   * Get meal plan for a specific week
   */
  static getByWeek(weekStart: Date): MealPlan | null {
    const mealPlans = this.getAllMealPlansFromStorage();
    const targetWeekStart = getWeekStart(weekStart);

    return mealPlans.find(plan => {
      const planWeekStart = getWeekStart(plan.weekStart);
      return planWeekStart.getTime() === targetWeekStart.getTime();
    }) || null;
  }

  /**
   * Get the active meal plan (current week)
   */
  static getActive(): MealPlan | null {
    const mealPlans = this.getAllMealPlansFromStorage();
    return mealPlans.find(plan => plan.isActive) || null;
  }

  /**
   * Create a new meal plan
   */
  static create(data: CreateMealPlanDTO): MealPlan {
    const mealPlans = this.getAllMealPlansFromStorage();

    const weekStartDate = new Date(data.weekStart);
    const weekStart = getWeekStart(weekStartDate);
    const weekEnd = getWeekEnd(weekStartDate);

    // Deactivate other plans for the same week
    mealPlans.forEach(plan => {
      const planWeekStart = getWeekStart(plan.weekStart);
      if (planWeekStart.getTime() === weekStart.getTime()) {
        plan.isActive = false;
      }
    });

    // Initialize days if not provided
    const days: DayMealPlan[] = data.days || generateWeekDays(weekStart).map(date => ({
      date,
      meals: [],
    }));

    const newMealPlan: MealPlan = {
      id: generateId(),
      userId: this.getUserId(),
      weekStart,
      weekEnd,
      days,
      totalCalories: 0,
      generatedDate: data.generationCriteria ? new Date() : undefined,
      generationCriteria: data.generationCriteria,
      isActive: true,
      createdAt: new Date(),
    };

    mealPlans.push(newMealPlan);
    this.saveAllMealPlansToStorage(mealPlans);

    return newMealPlan;
  }

  /**
   * Update a meal plan
   */
  static update(id: string, data: UpdateMealPlanDTO): MealPlan | null {
    const mealPlans = this.getAllMealPlansFromStorage();
    const index = mealPlans.findIndex(plan => plan.id === id);

    if (index === -1) return null;

    const updatedMealPlan: MealPlan = {
      ...mealPlans[index],
      ...data,
      updatedAt: new Date(),
    };

    // Recalculate total calories if days were updated
    if (data.days) {
      updatedMealPlan.totalCalories = this.calculateTotalCalories(data.days);
    }

    mealPlans[index] = updatedMealPlan;
    this.saveAllMealPlansToStorage(mealPlans);

    return updatedMealPlan;
  }

  /**
   * Update a specific meal slot in a meal plan
   */
  static updateMealSlot(id: string, slotData: UpdateMealSlotDTO): MealPlan | null {
    const mealPlan = this.getById(id);
    if (!mealPlan) return null;

    const slotDate = new Date(slotData.date);
    const dayIndex = mealPlan.days.findIndex(
      day => day.date.toDateString() === slotDate.toDateString()
    );

    if (dayIndex === -1) return null;

    // Find existing meal slot or create new one
    const mealIndex = mealPlan.days[dayIndex].meals.findIndex(
      meal => meal.mealType === slotData.mealType
    );

    const mealSlot = {
      mealType: slotData.mealType,
      recipeId: slotData.recipeId,
      servings: slotData.servings,
      notes: slotData.notes,
    };

    if (mealIndex !== -1) {
      mealPlan.days[dayIndex].meals[mealIndex] = mealSlot;
    } else {
      mealPlan.days[dayIndex].meals.push(mealSlot);
    }

    return this.update(id, { days: mealPlan.days });
  }

  /**
   * Delete a meal plan
   */
  static delete(id: string): boolean {
    const mealPlans = this.getAllMealPlansFromStorage();
    const filteredMealPlans = mealPlans.filter(plan => plan.id !== id);

    if (filteredMealPlans.length === mealPlans.length) {
      return false; // Meal plan not found
    }

    this.saveAllMealPlansToStorage(filteredMealPlans);
    return true;
  }

  /**
   * Set a meal plan as active
   */
  static setActive(id: string): MealPlan | null {
    const mealPlans = this.getAllMealPlansFromStorage();

    // Deactivate all plans
    mealPlans.forEach(plan => {
      plan.isActive = false;
    });

    // Activate the selected plan
    const index = mealPlans.findIndex(plan => plan.id === id);
    if (index === -1) return null;

    mealPlans[index].isActive = true;
    mealPlans[index].updatedAt = new Date();

    this.saveAllMealPlansToStorage(mealPlans);
    return mealPlans[index];
  }

  /**
   * Get week overview statistics
   */
  static getWeekOverview(id: string): WeekOverview | null {
    const mealPlan = this.getById(id);
    if (!mealPlan) return null;

    const totalMeals = mealPlan.days.reduce(
      (sum, day) => sum + day.meals.length,
      0
    );

    const uniqueRecipes = new Set(
      mealPlan.days.flatMap(day =>
        day.meals.filter(meal => meal.recipeId).map(meal => meal.recipeId!)
      )
    );

    return {
      totalCalories: mealPlan.totalCalories,
      averageDailyCalories: Math.round(mealPlan.totalCalories / 7),
      totalMeals,
      recipeVariety: uniqueRecipes.size,
      fridgeItemsUsed: 0, // Will be calculated with recipe data
      estimatedPrepTime: 0, // Will be calculated with recipe data
    };
  }

  /**
   * Get daily meal summary
   */
  static getDailySummary(id: string, date: Date): DailyMealSummary | null {
    const mealPlan = this.getById(id);
    if (!mealPlan) return null;

    const day = mealPlan.days.find(
      d => d.date.toDateString() === date.toDateString()
    );

    if (!day) return null;

    return {
      date: day.date,
      totalCalories: day.meals.reduce((sum, meal) => sum + (meal.calories || 0), 0),
      mealsCount: day.meals.length,
      totalPrepTime: 0, // Will be calculated with recipe data
      recipes: day.meals
        .filter(meal => meal.recipeId)
        .map(meal => ({
          recipeId: meal.recipeId!,
          recipeName: meal.recipeName || 'Unknown',
          mealType: meal.mealType,
        })),
    };
  }

  /**
   * Get upcoming meal plans
   */
  static getUpcoming(limit: number = 4): MealPlan[] {
    const mealPlans = this.getAllMealPlansFromStorage();
    const today = new Date();

    return mealPlans
      .filter(plan => plan.weekStart >= today)
      .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime())
      .slice(0, limit);
  }

  /**
   * Get past meal plans
   */
  static getPast(limit: number = 4): MealPlan[] {
    const mealPlans = this.getAllMealPlansFromStorage();
    const today = new Date();

    return mealPlans
      .filter(plan => plan.weekEnd < today)
      .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime())
      .slice(0, limit);
  }

  /**
   * Calculate total calories for a set of days
   */
  private static calculateTotalCalories(days: DayMealPlan[]): number {
    return days.reduce(
      (total, day) =>
        total + day.meals.reduce((sum, meal) => sum + (meal.calories || 0), 0),
      0
    );
  }

  /**
   * Delete all meal plans (for testing/reset purposes)
   */
  static deleteAll(): void {
    localStorage.removeItem(this.getStorageKey());
  }
}
