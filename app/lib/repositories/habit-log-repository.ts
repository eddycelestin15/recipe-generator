import { HabitLog, LogHabitDTO } from '../types/habits';
import { startOfDay, isEqual, isBefore, isAfter, subDays } from 'date-fns';

const STORAGE_KEY = 'habit_logs';

export class HabitLogRepository {
  private static getUserId(): string {
    if (typeof window === 'undefined') return 'default_user';
    return localStorage.getItem('current_user_id') || 'default_user';
  }

  private static getStorageKey(): string {
    return `${STORAGE_KEY}_${this.getUserId()}`;
  }

  private static getAllFromStorage(): HabitLog[] {
    if (typeof window === 'undefined') return [];

    const data = localStorage.getItem(this.getStorageKey());
    if (!data) return [];

    try {
      const parsed = JSON.parse(data);
      return parsed.map((log: any) => ({
        ...log,
        date: new Date(log.date),
        loggedAt: new Date(log.loggedAt),
      }));
    } catch {
      return [];
    }
  }

  private static saveToStorage(logs: HabitLog[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.getStorageKey(), JSON.stringify(logs));
  }

  /**
   * Normalize date to midnight (start of day)
   */
  private static normalizeDate(date: Date): Date {
    return startOfDay(date);
  }

  /**
   * Get all logs
   */
  static getAll(): HabitLog[] {
    return this.getAllFromStorage();
  }

  /**
   * Get logs for a specific habit
   */
  static getByHabitId(habitId: string): HabitLog[] {
    return this.getAllFromStorage()
      .filter(log => log.habitId === habitId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Get log for a specific habit on a specific date
   */
  static getByHabitAndDate(habitId: string, date: Date): HabitLog | null {
    const normalizedDate = this.normalizeDate(date);
    const logs = this.getAllFromStorage();

    return logs.find(log =>
      log.habitId === habitId &&
      isEqual(this.normalizeDate(log.date), normalizedDate)
    ) || null;
  }

  /**
   * Get all logs for a specific date
   */
  static getByDate(date: Date): HabitLog[] {
    const normalizedDate = this.normalizeDate(date);
    const logs = this.getAllFromStorage();

    return logs.filter(log =>
      isEqual(this.normalizeDate(log.date), normalizedDate)
    );
  }

  /**
   * Get logs for a date range
   */
  static getByDateRange(startDate: Date, endDate: Date): HabitLog[] {
    const normalizedStart = this.normalizeDate(startDate);
    const normalizedEnd = this.normalizeDate(endDate);
    const logs = this.getAllFromStorage();

    return logs.filter(log => {
      const logDate = this.normalizeDate(log.date);
      return (isEqual(logDate, normalizedStart) || isAfter(logDate, normalizedStart)) &&
             (isEqual(logDate, normalizedEnd) || isBefore(logDate, normalizedEnd));
    });
  }

  /**
   * Create or update a habit log
   */
  static log(data: LogHabitDTO): HabitLog {
    const logs = this.getAllFromStorage();
    const normalizedDate = this.normalizeDate(data.date);

    // Check if log already exists for this habit and date
    const existingIndex = logs.findIndex(log =>
      log.habitId === data.habitId &&
      isEqual(this.normalizeDate(log.date), normalizedDate)
    );

    if (existingIndex !== -1) {
      // Update existing log
      logs[existingIndex] = {
        ...logs[existingIndex],
        completed: data.completed,
        value: data.value,
        notes: data.notes,
        loggedAt: new Date(),
      };

      this.saveToStorage(logs);
      return logs[existingIndex];
    } else {
      // Create new log
      const newLog: HabitLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: this.getUserId(),
        habitId: data.habitId,
        date: normalizedDate,
        completed: data.completed,
        value: data.value,
        notes: data.notes,
        loggedAt: new Date(),
      };

      logs.push(newLog);
      this.saveToStorage(logs);

      return newLog;
    }
  }

  /**
   * Delete a log
   */
  static delete(id: string): boolean {
    const logs = this.getAllFromStorage();
    const filtered = logs.filter(log => log.id !== id);

    if (filtered.length === logs.length) return false;

    this.saveToStorage(filtered);
    return true;
  }

  /**
   * Delete all logs for a habit
   */
  static deleteByHabitId(habitId: string): number {
    const logs = this.getAllFromStorage();
    const filtered = logs.filter(log => log.habitId !== habitId);
    const deletedCount = logs.length - filtered.length;

    this.saveToStorage(filtered);
    return deletedCount;
  }

  /**
   * Get recent logs (last N days)
   */
  static getRecent(days: number = 30): HabitLog[] {
    const startDate = subDays(new Date(), days);
    return this.getByDateRange(startDate, new Date());
  }

  /**
   * Get completion count for a habit
   */
  static getCompletionCount(habitId: string): number {
    return this.getAllFromStorage()
      .filter(log => log.habitId === habitId && log.completed)
      .length;
  }

  /**
   * Get average value for number-type habits
   */
  static getAverageValue(habitId: string): number | null {
    const logs = this.getAllFromStorage()
      .filter(log => log.habitId === habitId && log.value !== undefined);

    if (logs.length === 0) return null;

    const sum = logs.reduce((acc, log) => acc + (log.value || 0), 0);
    return sum / logs.length;
  }

  /**
   * Check if habit was completed on a specific date
   */
  static wasCompletedOnDate(habitId: string, date: Date): boolean {
    const log = this.getByHabitAndDate(habitId, date);
    return log?.completed || false;
  }
}
