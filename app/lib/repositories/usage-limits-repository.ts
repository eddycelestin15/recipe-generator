/**
 * Usage Limits Repository
 *
 * Data access layer for tracking user feature usage limits
 */

import { isBrowser, getItem, setItem, removeItem, getCurrentUserId } from '../utils/storage';
import type {
  UsageLimits,
  UsageIncrementDTO,
  PlanType,
} from '../types/subscription';

const STORAGE_KEY_PREFIX = 'usage_limits_';

export class UsageLimitsRepository {
  /**
   * Get the current user ID from localStorage
   */
  private static getUserId(): string {
    let userId = getItem('current_user_id');
    if (!userId) {
      userId = 'default_user';
      setItem('current_user_id', userId);
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
   * Get usage limits from localStorage
   */
  private static getUsageLimitsFromStorage(): UsageLimits | null {
    const data = getItem(this.getStorageKey());
    if (!data) return null;

    try {
      const limits = JSON.parse(data);
      return {
        ...limits,
        lastResetDate: new Date(limits.lastResetDate),
        updatedAt: new Date(limits.updatedAt),
      };
    } catch (error) {
      console.error('Error parsing usage limits from localStorage:', error);
      return null;
    }
  }

  /**
   * Save usage limits to localStorage
   */
  private static saveUsageLimitsToStorage(limits: UsageLimits): void {
    setItem(this.getStorageKey(), JSON.stringify(limits));
  }

  /**
   * Check if monthly reset is needed
   */
  private static shouldResetMonthlyCounters(lastResetDate: Date): boolean {
    const now = new Date();
    const lastReset = new Date(lastResetDate);

    // Reset if it's a new month
    return (
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear()
    );
  }

  /**
   * Get usage limits (auto-creates if doesn't exist)
   */
  static getOrCreate(plan: PlanType = 'free'): UsageLimits {
    let limits = this.getUsageLimitsFromStorage();

    if (!limits) {
      const now = new Date();
      limits = {
        userId: this.getUserId(),
        plan: plan,
        recipesGeneratedThisMonth: 0,
        photoAnalysesThisMonth: 0,
        aiChatMessagesThisMonth: 0,
        totalSavedRecipes: 0,
        totalFridgeItems: 0,
        totalHabits: 0,
        totalRoutines: 0,
        lastResetDate: now,
        updatedAt: now,
      };
      this.saveUsageLimitsToStorage(limits);
      return limits;
    }

    // Check if monthly counters need reset
    if (this.shouldResetMonthlyCounters(limits.lastResetDate)) {
      limits = {
        ...limits,
        recipesGeneratedThisMonth: 0,
        photoAnalysesThisMonth: 0,
        aiChatMessagesThisMonth: 0,
        lastResetDate: new Date(),
        updatedAt: new Date(),
      };
      this.saveUsageLimitsToStorage(limits);
    }

    return limits;
  }

  /**
   * Update plan type
   */
  static updatePlan(plan: PlanType): UsageLimits {
    const limits = this.getOrCreate();
    const updatedLimits: UsageLimits = {
      ...limits,
      plan,
      updatedAt: new Date(),
    };
    this.saveUsageLimitsToStorage(updatedLimits);
    return updatedLimits;
  }

  /**
   * Increment usage counters
   */
  static increment(data: UsageIncrementDTO): UsageLimits {
    const limits = this.getOrCreate();

    const updatedLimits: UsageLimits = {
      ...limits,
      recipesGeneratedThisMonth: limits.recipesGeneratedThisMonth + (data.recipesGenerated || 0),
      photoAnalysesThisMonth: limits.photoAnalysesThisMonth + (data.photoAnalyses || 0),
      aiChatMessagesThisMonth: limits.aiChatMessagesThisMonth + (data.aiChatMessages || 0),
      totalSavedRecipes: limits.totalSavedRecipes + (data.savedRecipes || 0),
      totalFridgeItems: limits.totalFridgeItems + (data.fridgeItems || 0),
      totalHabits: limits.totalHabits + (data.habits || 0),
      totalRoutines: limits.totalRoutines + (data.routines || 0),
      updatedAt: new Date(),
    };

    this.saveUsageLimitsToStorage(updatedLimits);
    return updatedLimits;
  }

  /**
   * Decrement usage counters (for when items are deleted)
   */
  static decrement(data: UsageIncrementDTO): UsageLimits {
    const limits = this.getOrCreate();

    const updatedLimits: UsageLimits = {
      ...limits,
      totalSavedRecipes: Math.max(0, limits.totalSavedRecipes - (data.savedRecipes || 0)),
      totalFridgeItems: Math.max(0, limits.totalFridgeItems - (data.fridgeItems || 0)),
      totalHabits: Math.max(0, limits.totalHabits - (data.habits || 0)),
      totalRoutines: Math.max(0, limits.totalRoutines - (data.routines || 0)),
      updatedAt: new Date(),
    };

    this.saveUsageLimitsToStorage(updatedLimits);
    return updatedLimits;
  }

  /**
   * Set absolute count for a counter
   */
  static setCount(counter: keyof UsageIncrementDTO, value: number): UsageLimits {
    const limits = this.getOrCreate();

    const updatedLimits: UsageLimits = { ...limits, updatedAt: new Date() };

    switch (counter) {
      case 'savedRecipes':
        updatedLimits.totalSavedRecipes = value;
        break;
      case 'fridgeItems':
        updatedLimits.totalFridgeItems = value;
        break;
      case 'habits':
        updatedLimits.totalHabits = value;
        break;
      case 'routines':
        updatedLimits.totalRoutines = value;
        break;
    }

    this.saveUsageLimitsToStorage(updatedLimits);
    return updatedLimits;
  }

  /**
   * Reset monthly counters manually
   */
  static resetMonthlyCounters(): UsageLimits {
    const limits = this.getOrCreate();

    const updatedLimits: UsageLimits = {
      ...limits,
      recipesGeneratedThisMonth: 0,
      photoAnalysesThisMonth: 0,
      aiChatMessagesThisMonth: 0,
      lastResetDate: new Date(),
      updatedAt: new Date(),
    };

    this.saveUsageLimitsToStorage(updatedLimits);
    return updatedLimits;
  }

  /**
   * Delete usage limits
   */
  static delete(): boolean {
    const limits = this.getUsageLimitsFromStorage();
    if (!limits) return false;

    removeItem(this.getStorageKey());
    return true;
  }

  /**
   * Get current usage percentage for a limit
   */
  static getUsagePercentage(
    current: number,
    limit: number
  ): number {
    if (limit === Infinity) return 0;
    return Math.min(100, (current / limit) * 100);
  }
}
