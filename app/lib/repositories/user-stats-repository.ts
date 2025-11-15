/**
 * User Stats Repository
 *
 * Data access layer for user statistics and achievements using localStorage
 */

import type { UserStats } from '../types/health-dashboard';
import { ACHIEVEMENT_DEFINITIONS } from '../types/health-dashboard';

const STORAGE_KEY_PREFIX = 'user_stats_';

export class UserStatsRepository {
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

  private static getStatsFromStorage(): UserStats | null {
    const data = localStorage.getItem(this.getStorageKey());
    if (!data) return null;

    try {
      const stats = JSON.parse(data);
      return {
        ...stats,
        memberSince: new Date(stats.memberSince),
        lastActivityDate: new Date(stats.lastActivityDate),
        updatedAt: new Date(stats.updatedAt),
      };
    } catch (error) {
      console.error('Error parsing user stats from localStorage:', error);
      return null;
    }
  }

  private static saveStatsToStorage(stats: UserStats): void {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(stats));
  }

  /**
   * Initialize user stats (call once when user first uses the app)
   */
  static initialize(): UserStats {
    const existing = this.getStatsFromStorage();
    if (existing) return existing;

    const stats: UserStats = {
      userId: this.getUserId(),
      currentStreak: 0,
      longestStreak: 0,
      totalWorkouts: 0,
      totalRecipesGenerated: 0,
      totalMealsLogged: 0,
      memberSince: new Date(),
      achievements: [],
      lastActivityDate: new Date(),
      updatedAt: new Date(),
    };

    this.saveStatsToStorage(stats);
    return stats;
  }

  /**
   * Get user stats
   */
  static get(): UserStats {
    const stats = this.getStatsFromStorage();
    return stats || this.initialize();
  }

  /**
   * Update streak (call this when user logs activity)
   */
  static updateStreak(): UserStats {
    const stats = this.get();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActivity = new Date(stats.lastActivityDate);
    lastActivity.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    let newCurrentStreak = stats.currentStreak;

    if (daysDiff === 0) {
      // Same day, no change
      newCurrentStreak = stats.currentStreak;
    } else if (daysDiff === 1) {
      // Consecutive day
      newCurrentStreak = stats.currentStreak + 1;
    } else {
      // Streak broken
      newCurrentStreak = 1;
    }

    const newLongestStreak = Math.max(stats.longestStreak, newCurrentStreak);

    const updatedStats: UserStats = {
      ...stats,
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastActivityDate: new Date(),
      updatedAt: new Date(),
    };

    this.saveStatsToStorage(updatedStats);
    this.checkAchievements(updatedStats);

    return updatedStats;
  }

  /**
   * Increment workout count
   */
  static incrementWorkouts(): UserStats {
    const stats = this.updateStreak();
    const updatedStats: UserStats = {
      ...stats,
      totalWorkouts: stats.totalWorkouts + 1,
      updatedAt: new Date(),
    };

    this.saveStatsToStorage(updatedStats);
    this.checkAchievements(updatedStats);

    return updatedStats;
  }

  /**
   * Increment recipe count
   */
  static incrementRecipes(): UserStats {
    const stats = this.get();
    const updatedStats: UserStats = {
      ...stats,
      totalRecipesGenerated: stats.totalRecipesGenerated + 1,
      updatedAt: new Date(),
    };

    this.saveStatsToStorage(updatedStats);
    return updatedStats;
  }

  /**
   * Increment meal logged count
   */
  static incrementMeals(): UserStats {
    const stats = this.updateStreak();
    const updatedStats: UserStats = {
      ...stats,
      totalMealsLogged: stats.totalMealsLogged + 1,
      updatedAt: new Date(),
    };

    this.saveStatsToStorage(updatedStats);
    this.checkAchievements(updatedStats);

    return updatedStats;
  }

  /**
   * Add achievement
   */
  static addAchievement(achievementId: string): UserStats {
    const stats = this.get();

    if (stats.achievements.includes(achievementId)) {
      return stats;
    }

    const updatedStats: UserStats = {
      ...stats,
      achievements: [...stats.achievements, achievementId],
      updatedAt: new Date(),
    };

    this.saveStatsToStorage(updatedStats);
    return updatedStats;
  }

  /**
   * Check and unlock achievements
   */
  private static checkAchievements(stats: UserStats): void {
    ACHIEVEMENT_DEFINITIONS.forEach(achievement => {
      if (stats.achievements.includes(achievement.id)) {
        return; // Already unlocked
      }

      let shouldUnlock = false;

      switch (achievement.id) {
        case 'first_meal':
          shouldUnlock = stats.totalMealsLogged >= 1;
          break;
        case 'week_streak':
          shouldUnlock = stats.currentStreak >= 7;
          break;
        case 'month_streak':
          shouldUnlock = stats.currentStreak >= 30;
          break;
        case '50_workouts':
          shouldUnlock = stats.totalWorkouts >= 50;
          break;
        case '100_meals':
          shouldUnlock = stats.totalMealsLogged >= 100;
          break;
        // Add more achievement checks as needed
      }

      if (shouldUnlock) {
        this.addAchievement(achievement.id);
      }
    });
  }

  /**
   * Get unlocked achievements with details
   */
  static getUnlockedAchievements() {
    const stats = this.get();
    return ACHIEVEMENT_DEFINITIONS.filter(achievement =>
      stats.achievements.includes(achievement.id)
    );
  }

  /**
   * Get locked achievements
   */
  static getLockedAchievements() {
    const stats = this.get();
    return ACHIEVEMENT_DEFINITIONS.filter(
      achievement => !stats.achievements.includes(achievement.id)
    );
  }

  /**
   * Reset stats (use with caution)
   */
  static reset(): void {
    localStorage.removeItem(this.getStorageKey());
    this.initialize();
  }
}
