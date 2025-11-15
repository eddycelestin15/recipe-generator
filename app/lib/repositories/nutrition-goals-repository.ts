/**
 * Nutrition Goals Repository
 *
 * Data access layer for nutrition goals using localStorage
 */

import type { NutritionGoals } from '../types/nutrition';

function generateId(): string {
  return `goals_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

const STORAGE_KEY_PREFIX = 'nutrition_goals_';

export class NutritionGoalsRepository {
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

  private static getGoalsFromStorage(): NutritionGoals | null {
    const data = localStorage.getItem(this.getStorageKey());
    if (!data) return null;

    try {
      const goals = JSON.parse(data);
      return {
        ...goals,
        calculatedDate: new Date(goals.calculatedDate),
      };
    } catch (error) {
      console.error('Error parsing nutrition goals from localStorage:', error);
      return null;
    }
  }

  private static saveGoalsToStorage(goals: NutritionGoals): void {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(goals));
  }

  /**
   * Get current nutrition goals
   */
  static get(): NutritionGoals | null {
    return this.getGoalsFromStorage();
  }

  /**
   * Create or update nutrition goals
   */
  static save(data: Omit<NutritionGoals, 'id'>): NutritionGoals {
    const existingGoals = this.getGoalsFromStorage();

    const goals: NutritionGoals = {
      id: existingGoals?.id || generateId(),
      ...data,
    };

    this.saveGoalsToStorage(goals);
    return goals;
  }

  /**
   * Delete nutrition goals
   */
  static delete(): boolean {
    const goals = this.getGoalsFromStorage();
    if (!goals) return false;

    localStorage.removeItem(this.getStorageKey());
    return true;
  }

  /**
   * Check if goals exist
   */
  static exists(): boolean {
    return this.getGoalsFromStorage() !== null;
  }
}
