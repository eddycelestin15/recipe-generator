/**
 * Daily Nutrition Repository
 *
 * Data access layer for daily nutrition tracking using localStorage
 */

import type { DailyNutrition } from '../types/nutrition';

function generateId(): string {
  return `daily_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

const STORAGE_KEY_PREFIX = 'daily_nutrition_';

export class DailyNutritionRepository {
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

  private static getAllDailyNutritionFromStorage(): DailyNutrition[] {
    const data = localStorage.getItem(this.getStorageKey());
    if (!data) return [];

    try {
      const dailyNutrition = JSON.parse(data);
      return dailyNutrition.map((dn: any) => ({
        ...dn,
        date: new Date(dn.date),
      }));
    } catch (error) {
      console.error('Error parsing daily nutrition from localStorage:', error);
      return [];
    }
  }

  private static saveDailyNutritionToStorage(dailyNutrition: DailyNutrition[]): void {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(dailyNutrition));
  }

  /**
   * Get or create daily nutrition record for a date
   */
  static getOrCreateByDate(date: Date, goals: {
    goalCalories: number;
    goalProtein: number;
    goalCarbs: number;
    goalFat: number;
  }): DailyNutrition {
    const existing = this.getByDate(date);
    if (existing) return existing;

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const dailyNutrition: DailyNutrition = {
      id: generateId(),
      userId: this.getUserId(),
      date: targetDate,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      waterIntake: 0,
      mealsLogged: 0,
      goalCalories: goals.goalCalories,
      goalProtein: goals.goalProtein,
      goalCarbs: goals.goalCarbs,
      goalFat: goals.goalFat,
    };

    const allRecords = this.getAllDailyNutritionFromStorage();
    allRecords.push(dailyNutrition);
    this.saveDailyNutritionToStorage(allRecords);

    return dailyNutrition;
  }

  /**
   * Get daily nutrition for a specific date
   */
  static getByDate(date: Date): DailyNutrition | null {
    const allRecords = this.getAllDailyNutritionFromStorage();
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return allRecords.find(dn => {
      const recordDate = new Date(dn.date);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === targetDate.getTime();
    }) || null;
  }

  /**
   * Update daily nutrition
   */
  static update(date: Date, data: Partial<DailyNutrition>): DailyNutrition | null {
    const allRecords = this.getAllDailyNutritionFromStorage();
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const index = allRecords.findIndex(dn => {
      const recordDate = new Date(dn.date);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === targetDate.getTime();
    });

    if (index === -1) return null;

    const updated: DailyNutrition = {
      ...allRecords[index],
      ...data,
      date: targetDate, // Keep original date
    };

    allRecords[index] = updated;
    this.saveDailyNutritionToStorage(allRecords);

    return updated;
  }

  /**
   * Get daily nutrition for a date range
   */
  static getByDateRange(startDate: Date, endDate: Date): DailyNutrition[] {
    const allRecords = this.getAllDailyNutritionFromStorage();
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return allRecords.filter(dn => {
      const recordDate = new Date(dn.date);
      return recordDate >= start && recordDate <= end;
    });
  }

  /**
   * Delete all records (for testing)
   */
  static deleteAll(): void {
    localStorage.removeItem(this.getStorageKey());
  }
}
