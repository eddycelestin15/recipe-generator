import { UserAchievement } from '../types/habits';

const STORAGE_KEY = 'user_achievements';

export class UserAchievementRepository {
  private static getUserId(): string {
    if (typeof window === 'undefined') return 'default_user';
    return localStorage.getItem('current_user_id') || 'default_user';
  }

  private static getStorageKey(): string {
    return `${STORAGE_KEY}_${this.getUserId()}`;
  }

  private static getFromStorage(): UserAchievement | null {
    if (typeof window === 'undefined') return null;

    const data = localStorage.getItem(this.getStorageKey());
    if (!data) return null;

    try {
      const parsed = JSON.parse(data);
      return {
        ...parsed,
        achievements: parsed.achievements.map((a: any) => ({
          ...a,
          unlockedDate: new Date(a.unlockedDate),
        })),
      };
    } catch {
      return null;
    }
  }

  private static saveToStorage(userAchievement: UserAchievement): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.getStorageKey(), JSON.stringify(userAchievement));
  }

  /**
   * Get or create user achievement record
   */
  static get(): UserAchievement {
    const existing = this.getFromStorage();
    if (existing) return existing;

    // Create new record
    const newRecord: UserAchievement = {
      userId: this.getUserId(),
      achievements: [],
      totalPoints: 0,
      level: 1,
    };

    this.saveToStorage(newRecord);
    return newRecord;
  }

  /**
   * Unlock an achievement for the user
   */
  static unlock(achievementId: string, points: number, habitId?: string): UserAchievement {
    const userAchievement = this.get();

    // Check if already unlocked
    const alreadyUnlocked = userAchievement.achievements.some(
      a => a.achievementId === achievementId
    );

    if (alreadyUnlocked) {
      return userAchievement;
    }

    // Add achievement
    userAchievement.achievements.push({
      achievementId,
      unlockedDate: new Date(),
      habitId,
    });

    // Update points and level
    userAchievement.totalPoints += points;
    userAchievement.level = this.calculateLevel(userAchievement.totalPoints);

    this.saveToStorage(userAchievement);
    return userAchievement;
  }

  /**
   * Check if user has unlocked a specific achievement
   */
  static hasUnlocked(achievementId: string): boolean {
    const userAchievement = this.get();
    return userAchievement.achievements.some(a => a.achievementId === achievementId);
  }

  /**
   * Get all unlocked achievement IDs
   */
  static getUnlockedIds(): string[] {
    const userAchievement = this.get();
    return userAchievement.achievements.map(a => a.achievementId);
  }

  /**
   * Get unlocked achievements count
   */
  static getUnlockedCount(): number {
    const userAchievement = this.get();
    return userAchievement.achievements.length;
  }

  /**
   * Get total points
   */
  static getTotalPoints(): number {
    const userAchievement = this.get();
    return userAchievement.totalPoints;
  }

  /**
   * Get current level
   */
  static getLevel(): number {
    const userAchievement = this.get();
    return userAchievement.level;
  }

  /**
   * Calculate level from total points
   * Level 1: 0-99 points
   * Level 2: 100-249 points
   * Level 3: 250-499 points
   * Level 4: 500-999 points
   * Level 5+: Every 500 points
   */
  private static calculateLevel(points: number): number {
    if (points < 100) return 1;
    if (points < 250) return 2;
    if (points < 500) return 3;
    if (points < 1000) return 4;
    return Math.floor(points / 500) + 3;
  }

  /**
   * Get points needed for next level
   */
  static getPointsForNextLevel(): number {
    const userAchievement = this.get();
    const currentPoints = userAchievement.totalPoints;
    const currentLevel = userAchievement.level;

    if (currentLevel === 1) return 100 - currentPoints;
    if (currentLevel === 2) return 250 - currentPoints;
    if (currentLevel === 3) return 500 - currentPoints;
    if (currentLevel === 4) return 1000 - currentPoints;

    const nextLevelThreshold = (currentLevel - 2) * 500;
    return nextLevelThreshold - currentPoints;
  }

  /**
   * Reset all achievements (for testing purposes)
   */
  static reset(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.getStorageKey());
  }
}
