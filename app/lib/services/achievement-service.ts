import { Achievement, AchievementProgress } from '../types/habits';
import { AchievementRepository } from '../repositories/achievement-repository';
import { UserAchievementRepository } from '../repositories/user-achievement-repository';
import { HabitRepository } from '../repositories/habit-repository';
import { HabitLogRepository } from '../repositories/habit-log-repository';
import { RoutineRepository } from '../repositories/routine-repository';
import { HabitStatsService } from './habit-stats-service';
import { subDays, eachDayOfInterval, startOfDay } from 'date-fns';

export class AchievementService {
  /**
   * Check and unlock achievements after a habit is completed
   */
  static checkAndUnlock(habitId: string): Achievement[] {
    const newlyUnlocked: Achievement[] = [];

    // Get all achievements
    const allAchievements = AchievementRepository.getAll();

    for (const achievement of allAchievements) {
      // Skip if already unlocked
      if (UserAchievementRepository.hasUnlocked(achievement.id)) {
        continue;
      }

      // Check if requirement is met
      const isMet = this.checkRequirement(achievement.requirement, habitId);

      if (isMet) {
        UserAchievementRepository.unlock(achievement.id, achievement.points, habitId);
        newlyUnlocked.push(achievement);
      }
    }

    return newlyUnlocked;
  }

  /**
   * Check if a specific requirement is met
   */
  private static checkRequirement(requirement: string, habitId?: string): boolean {
    switch (requirement) {
      case 'first_habit':
        return this.checkFirstHabit();

      case '7_day_streak':
        return this.checkStreak(7, habitId);

      case '30_day_streak':
        return this.checkStreak(30, habitId);

      case '100_day_streak':
        return this.checkStreak(100, habitId);

      case 'morning_routine_7':
        return this.checkRoutineStreak('morning', 7);

      case 'evening_routine_7':
        return this.checkRoutineStreak('evening', 7);

      case 'perfect_week':
        return this.checkPerfectWeek();

      case 'water_goal_7':
        return this.checkWaterGoal(7);

      case 'all_habits_today':
        return this.checkAllHabitsToday();

      case '10_habits_created':
        return this.checkHabitsCreated(10);

      case '100_completions':
        return this.checkTotalCompletions(100);

      case '500_completions':
        return this.checkTotalCompletions(500);

      case 'early_bird':
        return this.checkEarlyBird();

      case 'night_owl':
        return this.checkNightOwl();

      case 'comeback':
        return this.checkComeback(habitId);

      default:
        return false;
    }
  }

  /**
   * Check if user has completed their first habit
   */
  private static checkFirstHabit(): boolean {
    const logs = HabitLogRepository.getAll();
    return logs.some(log => log.completed);
  }

  /**
   * Check if any habit has reached a specific streak
   */
  private static checkStreak(days: number, habitId?: string): boolean {
    const habits = habitId ? [habitId] : HabitRepository.getAll().map(h => h.id);

    return habits.some(id => {
      const stats = HabitStatsService.getStats(id);
      return stats.currentStreak >= days;
    });
  }

  /**
   * Check if a specific routine type has been completed for N consecutive days
   */
  private static checkRoutineStreak(type: 'morning' | 'evening', days: number): boolean {
    const routines = RoutineRepository.getByType(type).filter(r => r.isActive);
    if (routines.length === 0) return false;

    // Check each routine
    for (const routine of routines) {
      if (routine.habitIds.length === 0) continue;

      // Check if all habits in the routine have been completed for the last N days
      let consecutiveDays = 0;
      const today = startOfDay(new Date());

      for (let i = 0; i < days; i++) {
        const date = subDays(today, i);
        const allCompleted = routine.habitIds.every(habitId =>
          HabitLogRepository.wasCompletedOnDate(habitId, date)
        );

        if (allCompleted) {
          consecutiveDays++;
        } else {
          break;
        }
      }

      if (consecutiveDays >= days) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if user has achieved 100% completion for the past 7 days
   */
  private static checkPerfectWeek(): boolean {
    const today = startOfDay(new Date());
    const startDate = subDays(today, 6); // Last 7 days including today

    const allDays = eachDayOfInterval({ start: startDate, end: today });

    for (const day of allDays) {
      const scheduledHabits = HabitRepository.getScheduledForDay(day.getDay());
      if (scheduledHabits.length === 0) continue;

      const allCompleted = scheduledHabits.every(habit =>
        HabitLogRepository.wasCompletedOnDate(habit.id, day)
      );

      if (!allCompleted) {
        return false;
      }
    }

    return allDays.length > 0;
  }

  /**
   * Check if user has met water goal for N consecutive days
   * (Assumes water habit contains "water" or "eau" in the name)
   */
  private static checkWaterGoal(days: number): boolean {
    const habits = HabitRepository.getAll();
    const waterHabits = habits.filter(h =>
      h.name.toLowerCase().includes('water') ||
      h.name.toLowerCase().includes('eau') ||
      h.name.toLowerCase().includes('hydrat')
    );

    for (const habit of waterHabits) {
      let consecutiveDays = 0;
      const today = startOfDay(new Date());

      for (let i = 0; i < days; i++) {
        const date = subDays(today, i);
        const log = HabitLogRepository.getByHabitAndDate(habit.id, date);

        if (log?.completed && habit.type === 'number' && habit.target) {
          // Check if target was met
          if (log.value && log.value >= habit.target) {
            consecutiveDays++;
          } else {
            break;
          }
        } else if (log?.completed) {
          consecutiveDays++;
        } else {
          break;
        }
      }

      if (consecutiveDays >= days) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if all scheduled habits are completed today
   */
  private static checkAllHabitsToday(): boolean {
    const today = new Date();
    const scheduledHabits = HabitRepository.getScheduledForToday();

    if (scheduledHabits.length === 0) return false;

    return scheduledHabits.every(habit =>
      HabitLogRepository.wasCompletedOnDate(habit.id, today)
    );
  }

  /**
   * Check if user has created N habits
   */
  private static checkHabitsCreated(count: number): boolean {
    const habits = HabitRepository.getAll();
    return habits.length >= count;
  }

  /**
   * Check if user has N total completions across all habits
   */
  private static checkTotalCompletions(count: number): boolean {
    const logs = HabitLogRepository.getAll();
    const completedCount = logs.filter(log => log.completed).length;
    return completedCount >= count;
  }

  /**
   * Check if user completed a habit before 6am
   */
  private static checkEarlyBird(): boolean {
    const logs = HabitLogRepository.getAll();
    return logs.some(log => {
      const hour = log.loggedAt.getHours();
      return log.completed && hour < 6;
    });
  }

  /**
   * Check if user completed a habit after 10pm
   */
  private static checkNightOwl(): boolean {
    const logs = HabitLogRepository.getAll();
    return logs.some(log => {
      const hour = log.loggedAt.getHours();
      return log.completed && hour >= 22;
    });
  }

  /**
   * Check if user resumed a habit after 7+ day break
   */
  private static checkComeback(habitId?: string): boolean {
    const habits = habitId ? [habitId] : HabitRepository.getAll().map(h => h.id);

    for (const id of habits) {
      const logs = HabitLogRepository.getByHabitId(id)
        .filter(log => log.completed)
        .sort((a, b) => b.date.getTime() - a.date.getTime());

      if (logs.length < 2) continue;

      // Check if there's a gap of 7+ days between the two most recent completions
      for (let i = 0; i < logs.length - 1; i++) {
        const current = startOfDay(logs[i].date);
        const previous = startOfDay(logs[i + 1].date);
        const daysBetween = Math.abs(
          Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24))
        );

        if (daysBetween >= 7) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get all achievements with unlock status and progress
   */
  static getAllWithProgress(): AchievementProgress[] {
    const allAchievements = AchievementRepository.getAll();
    const unlockedIds = UserAchievementRepository.getUnlockedIds();
    const userAchievement = UserAchievementRepository.get();

    return allAchievements.map(achievement => {
      const unlocked = unlockedIds.includes(achievement.id);
      const unlockedAchievement = userAchievement.achievements.find(
        a => a.achievementId === achievement.id
      );

      const progress = this.calculateProgress(achievement.requirement);

      return {
        achievement,
        unlocked,
        unlockedDate: unlockedAchievement?.unlockedDate,
        progress: progress.percentage,
        progressDetails: progress.details,
      };
    });
  }

  /**
   * Calculate progress towards an achievement
   */
  private static calculateProgress(requirement: string): { percentage: number; details: string } {
    let current = 0;
    let target = 1;
    let details = '';

    switch (requirement) {
      case 'first_habit':
        current = this.checkFirstHabit() ? 1 : 0;
        target = 1;
        details = current > 0 ? '1/1 habitude complétée' : '0/1 habitude complétée';
        break;

      case '7_day_streak':
        current = this.getMaxStreak();
        target = 7;
        details = `${Math.min(current, target)}/${target} jours`;
        break;

      case '30_day_streak':
        current = this.getMaxStreak();
        target = 30;
        details = `${Math.min(current, target)}/${target} jours`;
        break;

      case '100_day_streak':
        current = this.getMaxStreak();
        target = 100;
        details = `${Math.min(current, target)}/${target} jours`;
        break;

      case '10_habits_created':
        current = HabitRepository.getAll().length;
        target = 10;
        details = `${Math.min(current, target)}/${target} habitudes créées`;
        break;

      case '100_completions':
        current = HabitLogRepository.getAll().filter(log => log.completed).length;
        target = 100;
        details = `${Math.min(current, target)}/${target} complétions`;
        break;

      case '500_completions':
        current = HabitLogRepository.getAll().filter(log => log.completed).length;
        target = 500;
        details = `${Math.min(current, target)}/${target} complétions`;
        break;

      default:
        details = 'À débloquer';
        current = this.checkRequirement(requirement) ? 1 : 0;
        target = 1;
    }

    const percentage = Math.min((current / target) * 100, 100);

    return { percentage, details };
  }

  /**
   * Get the maximum streak across all habits
   */
  private static getMaxStreak(): number {
    const habits = HabitRepository.getAll();
    let maxStreak = 0;

    for (const habit of habits) {
      const stats = HabitStatsService.getStats(habit.id);
      maxStreak = Math.max(maxStreak, stats.currentStreak);
    }

    return maxStreak;
  }

  /**
   * Get unlocked achievements
   */
  static getUnlocked(): Achievement[] {
    const unlockedIds = UserAchievementRepository.getUnlockedIds();
    return AchievementRepository.getAll().filter(a => unlockedIds.includes(a.id));
  }

  /**
   * Get locked achievements
   */
  static getLocked(): Achievement[] {
    const unlockedIds = UserAchievementRepository.getUnlockedIds();
    return AchievementRepository.getAll().filter(a => !unlockedIds.includes(a.id));
  }
}
