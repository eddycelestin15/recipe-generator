import { HabitStats, Habit, HabitLog } from '../types/habits';
import { HabitRepository } from '../repositories/habit-repository';
import { HabitLogRepository } from '../repositories/habit-log-repository';
import { startOfDay, subDays, differenceInDays, eachDayOfInterval } from 'date-fns';

export class HabitStatsService {
  /**
   * Calculate current streak for a habit
   * Starts from today and goes backwards, counting consecutive days
   */
  static calculateStreak(habitId: string): number {
    const logs = HabitLogRepository.getByHabitId(habitId);
    const completedLogs = logs.filter(log => log.completed).sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );

    if (completedLogs.length === 0) return 0;

    const today = startOfDay(new Date());
    let streak = 0;
    let currentDate = today;

    // Check if completed today or yesterday (grace period)
    const lastCompletedDate = startOfDay(completedLogs[0].date);
    const daysSinceLastCompletion = differenceInDays(today, lastCompletedDate);

    if (daysSinceLastCompletion > 1) {
      // Streak is broken
      return 0;
    }

    // Count backwards from the most recent completion
    currentDate = lastCompletedDate;

    for (let i = 0; i < completedLogs.length; i++) {
      const logDate = startOfDay(completedLogs[i].date);

      if (i === 0) {
        // First log
        streak = 1;
        currentDate = logDate;
      } else {
        // Check if this log is exactly 1 day before the current date
        const expectedDate = subDays(currentDate, 1);
        if (startOfDay(logDate).getTime() === expectedDate.getTime()) {
          streak++;
          currentDate = logDate;
        } else if (startOfDay(logDate).getTime() === currentDate.getTime()) {
          // Same day (duplicate), skip
          continue;
        } else {
          // Gap found, stop counting
          break;
        }
      }
    }

    return streak;
  }

  /**
   * Calculate longest streak for a habit
   */
  static calculateLongestStreak(habitId: string): number {
    const logs = HabitLogRepository.getByHabitId(habitId);
    const completedLogs = logs
      .filter(log => log.completed)
      .sort((a, b) => a.date.getTime() - b.date.getTime()); // Ascending order

    if (completedLogs.length === 0) return 0;

    let longestStreak = 0;
    let currentStreak = 1;
    let previousDate = startOfDay(completedLogs[0].date);

    for (let i = 1; i < completedLogs.length; i++) {
      const currentDate = startOfDay(completedLogs[i].date);

      if (currentDate.getTime() === previousDate.getTime()) {
        // Same day (duplicate), skip
        continue;
      }

      const expectedNextDate = subDays(previousDate, -1); // Add 1 day
      if (currentDate.getTime() === expectedNextDate.getTime()) {
        // Consecutive day
        currentStreak++;
      } else {
        // Gap found, reset streak
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }

      previousDate = currentDate;
    }

    longestStreak = Math.max(longestStreak, currentStreak);
    return longestStreak;
  }

  /**
   * Calculate total completions for a habit
   */
  static calculateTotalCompletions(habitId: string): number {
    const logs = HabitLogRepository.getByHabitId(habitId);
    return logs.filter(log => log.completed).length;
  }

  /**
   * Calculate completion rate for a habit
   */
  static calculateCompletionRate(habitId: string, days: number = 30): number {
    const habit = HabitRepository.getById(habitId);
    if (!habit) return 0;

    const endDate = new Date();
    const startDate = subDays(endDate, days);

    // Get all days in the range
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    // Filter days based on habit frequency
    const scheduledDays = allDays.filter(day => {
      if (habit.frequency === 'daily') return true;

      if (habit.frequency === 'weekly' && habit.specificDays) {
        const dayOfWeek = day.getDay();
        return habit.specificDays.includes(dayOfWeek);
      }

      return false;
    });

    if (scheduledDays.length === 0) return 0;

    // Count completed days
    const completedDays = scheduledDays.filter(day =>
      HabitLogRepository.wasCompletedOnDate(habitId, day)
    );

    return (completedDays.length / scheduledDays.length) * 100;
  }

  /**
   * Calculate average value for number-type habits
   */
  static calculateAverageValue(habitId: string): number | null {
    return HabitLogRepository.getAverageValue(habitId);
  }

  /**
   * Get last completed date for a habit
   */
  static getLastCompletedDate(habitId: string): Date | null {
    const logs = HabitLogRepository.getByHabitId(habitId);
    const completedLogs = logs
      .filter(log => log.completed)
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    return completedLogs.length > 0 ? completedLogs[0].date : null;
  }

  /**
   * Get comprehensive stats for a habit
   */
  static getStats(habitId: string): HabitStats {
    const currentStreak = this.calculateStreak(habitId);
    const longestStreak = this.calculateLongestStreak(habitId);
    const totalCompletions = this.calculateTotalCompletions(habitId);
    const completionRate = this.calculateCompletionRate(habitId);
    const averageValue = this.calculateAverageValue(habitId);
    const lastCompletedDate = this.getLastCompletedDate(habitId);

    return {
      habitId,
      currentStreak,
      longestStreak,
      totalCompletions,
      completionRate,
      averageValue: averageValue || undefined,
      lastCompletedDate: lastCompletedDate || undefined,
      streakHistory: this.getStreakHistory(habitId, 30),
    };
  }

  /**
   * Get streak history over the last N days
   */
  static getStreakHistory(habitId: string, days: number = 30): { date: Date; streak: number }[] {
    const logs = HabitLogRepository.getByHabitId(habitId);
    const completedLogs = logs
      .filter(log => log.completed)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (completedLogs.length === 0) return [];

    const endDate = new Date();
    const startDate = subDays(endDate, days);
    const history: { date: Date; streak: number }[] = [];

    let streak = 0;
    let logIndex = 0;

    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    for (const day of allDays) {
      const normalizedDay = startOfDay(day);

      // Check if there's a completed log for this day
      const hasLog = completedLogs.some(
        log => startOfDay(log.date).getTime() === normalizedDay.getTime()
      );

      if (hasLog) {
        streak++;
      } else {
        streak = 0;
      }

      history.push({ date: normalizedDay, streak });
    }

    return history;
  }

  /**
   * Get today's habits with their logs
   */
  static getTodayHabits() {
    const today = new Date();
    const scheduledHabits = HabitRepository.getScheduledForToday();

    return scheduledHabits.map(habit => {
      const log = HabitLogRepository.getByHabitAndDate(habit.id, today);
      return {
        habit,
        log: log || undefined,
        isScheduledToday: true,
      };
    });
  }

  /**
   * Calculate overall completion rate for today
   */
  static getTodayCompletionRate(): number {
    const todayHabits = this.getTodayHabits();
    if (todayHabits.length === 0) return 0;

    const completed = todayHabits.filter(h => h.log?.completed).length;
    return (completed / todayHabits.length) * 100;
  }

  /**
   * Calculate overall streak (all habits completed today)
   */
  static getOverallStreak(): number {
    const today = startOfDay(new Date());
    let streak = 0;
    let currentDate = today;

    while (true) {
      const scheduledHabits = HabitRepository.getScheduledForDay(currentDate.getDay());
      if (scheduledHabits.length === 0) {
        // No habits scheduled, check previous day
        currentDate = subDays(currentDate, 1);
        continue;
      }

      const allCompleted = scheduledHabits.every(habit =>
        HabitLogRepository.wasCompletedOnDate(habit.id, currentDate)
      );

      if (allCompleted) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }

      // Safety limit
      if (streak > 365) break;
    }

    return streak;
  }
}
