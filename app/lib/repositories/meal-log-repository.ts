/**
 * Meal Log Repository
 *
 * Data access layer for meal logging using localStorage
 */

import type { MealLog, CreateMealLogDTO, UpdateMealLogDTO } from '../types/nutrition';

function generateId(): string {
  return `meal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

const STORAGE_KEY_PREFIX = 'meal_logs_';

export class MealLogRepository {
  private static getUserId(): string {
    let userId = localStorage.getItem('current_user_id');
    if (!userId) {
      userId = 'default_user';
      localStorage.setItem('current_user_id', userId);
    }
    return userId;
  }

  private static getStorageKey(): string {
    return `${STORAGE_KEY_PREFIX}${this.getUserId()}`;
  }

  private static getAllMealLogsFromStorage(): MealLog[] {
    const data = localStorage.getItem(this.getStorageKey());
    if (!data) return [];

    try {
      const meals = JSON.parse(data);
      return meals.map((meal: any) => ({
        ...meal,
        date: new Date(meal.date),
        createdAt: new Date(meal.createdAt),
      }));
    } catch (error) {
      console.error('Error parsing meal logs from localStorage:', error);
      return [];
    }
  }

  private static saveMealLogsToStorage(meals: MealLog[]): void {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(meals));
  }

  /**
   * Create a new meal log
   */
  static create(data: CreateMealLogDTO): MealLog {
    const meals = this.getAllMealLogsFromStorage();

    const newMeal: MealLog = {
      id: generateId(),
      userId: this.getUserId(),
      date: new Date(data.date),
      mealType: data.mealType,
      recipeId: data.recipeId,
      customFood: data.customFood,
      servings: data.servings,
      notes: data.notes,
      createdAt: new Date(),
    };

    meals.push(newMeal);
    this.saveMealLogsToStorage(meals);

    return newMeal;
  }

  /**
   * Get all meal logs
   */
  static getAll(): MealLog[] {
    return this.getAllMealLogsFromStorage();
  }

  /**
   * Get meal log by ID
   */
  static getById(id: string): MealLog | null {
    const meals = this.getAllMealLogsFromStorage();
    return meals.find(meal => meal.id === id) || null;
  }

  /**
   * Get meal logs for a specific date
   */
  static getByDate(date: Date): MealLog[] {
    const meals = this.getAllMealLogsFromStorage();
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return meals.filter(meal => {
      const mealDate = new Date(meal.date);
      mealDate.setHours(0, 0, 0, 0);
      return mealDate.getTime() === targetDate.getTime();
    });
  }

  /**
   * Get meal logs for a date range
   */
  static getByDateRange(startDate: Date, endDate: Date): MealLog[] {
    const meals = this.getAllMealLogsFromStorage();
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return meals.filter(meal => {
      const mealDate = new Date(meal.date);
      return mealDate >= start && mealDate <= end;
    });
  }

  /**
   * Update a meal log
   */
  static update(id: string, data: UpdateMealLogDTO): MealLog | null {
    const meals = this.getAllMealLogsFromStorage();
    const index = meals.findIndex(meal => meal.id === id);

    if (index === -1) return null;

    const updatedMeal: MealLog = {
      ...meals[index],
      ...data,
    };

    meals[index] = updatedMeal;
    this.saveMealLogsToStorage(meals);

    return updatedMeal;
  }

  /**
   * Delete a meal log
   */
  static delete(id: string): boolean {
    const meals = this.getAllMealLogsFromStorage();
    const filteredMeals = meals.filter(meal => meal.id !== id);

    if (filteredMeals.length === meals.length) {
      return false;
    }

    this.saveMealLogsToStorage(filteredMeals);
    return true;
  }

  /**
   * Delete all meal logs (for testing)
   */
  static deleteAll(): void {
    localStorage.removeItem(this.getStorageKey());
  }

  /**
   * Get recent meal logs
   */
  static getRecent(limit: number = 10): MealLog[] {
    const meals = this.getAllMealLogsFromStorage();
    return meals
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}
