import { DailyCheckIn, CreateCheckInDTO } from '../types/habits';
import { startOfDay, isEqual, isBefore, isAfter, subDays } from 'date-fns';

const STORAGE_KEY = 'daily_checkins';

export class DailyCheckInRepository {
  private static getUserId(): string {
    if (typeof window === 'undefined') return 'default_user';
    return localStorage.getItem('current_user_id') || 'default_user';
  }

  private static getStorageKey(): string {
    return `${STORAGE_KEY}_${this.getUserId()}`;
  }

  private static getAllFromStorage(): DailyCheckIn[] {
    if (typeof window === 'undefined') return [];

    const data = localStorage.getItem(this.getStorageKey());
    if (!data) return [];

    try {
      const parsed = JSON.parse(data);
      return parsed.map((checkIn: any) => ({
        ...checkIn,
        date: new Date(checkIn.date),
        createdAt: new Date(checkIn.createdAt),
      }));
    } catch {
      return [];
    }
  }

  private static saveToStorage(checkIns: DailyCheckIn[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.getStorageKey(), JSON.stringify(checkIns));
  }

  /**
   * Normalize date to midnight (start of day)
   */
  private static normalizeDate(date: Date): Date {
    return startOfDay(date);
  }

  /**
   * Get all check-ins
   */
  static getAll(): DailyCheckIn[] {
    return this.getAllFromStorage().sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Get check-in for a specific date
   */
  static getByDate(date: Date): DailyCheckIn | null {
    const normalizedDate = this.normalizeDate(date);
    const checkIns = this.getAllFromStorage();

    return checkIns.find(checkIn =>
      isEqual(this.normalizeDate(checkIn.date), normalizedDate)
    ) || null;
  }

  /**
   * Get check-ins for a date range
   */
  static getByDateRange(startDate: Date, endDate: Date): DailyCheckIn[] {
    const normalizedStart = this.normalizeDate(startDate);
    const normalizedEnd = this.normalizeDate(endDate);
    const checkIns = this.getAllFromStorage();

    return checkIns.filter(checkIn => {
      const checkInDate = this.normalizeDate(checkIn.date);
      return (isEqual(checkInDate, normalizedStart) || isAfter(checkInDate, normalizedStart)) &&
             (isEqual(checkInDate, normalizedEnd) || isBefore(checkInDate, normalizedEnd));
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Get recent check-ins (last N days)
   */
  static getRecent(days: number = 30): DailyCheckIn[] {
    const startDate = subDays(new Date(), days);
    return this.getByDateRange(startDate, new Date());
  }

  /**
   * Create or update a check-in for a date
   */
  static createOrUpdate(data: CreateCheckInDTO): DailyCheckIn {
    const checkIns = this.getAllFromStorage();
    const normalizedDate = this.normalizeDate(data.date);

    // Check if check-in already exists for this date
    const existingIndex = checkIns.findIndex(checkIn =>
      isEqual(this.normalizeDate(checkIn.date), normalizedDate)
    );

    if (existingIndex !== -1) {
      // Update existing check-in
      checkIns[existingIndex] = {
        ...checkIns[existingIndex],
        mood: data.mood,
        energy: data.energy,
        sleepHours: data.sleepHours,
        sleepQuality: data.sleepQuality,
        notes: data.notes,
      };

      this.saveToStorage(checkIns);
      return checkIns[existingIndex];
    } else {
      // Create new check-in
      const newCheckIn: DailyCheckIn = {
        id: `checkin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: this.getUserId(),
        date: normalizedDate,
        mood: data.mood,
        energy: data.energy,
        sleepHours: data.sleepHours,
        sleepQuality: data.sleepQuality,
        notes: data.notes,
        createdAt: new Date(),
      };

      checkIns.push(newCheckIn);
      this.saveToStorage(checkIns);

      return newCheckIn;
    }
  }

  /**
   * Delete a check-in
   */
  static delete(id: string): boolean {
    const checkIns = this.getAllFromStorage();
    const filtered = checkIns.filter(checkIn => checkIn.id !== id);

    if (filtered.length === checkIns.length) return false;

    this.saveToStorage(filtered);
    return true;
  }

  /**
   * Get average mood over a period
   */
  static getAverageMood(days: number = 7): number | null {
    const checkIns = this.getRecent(days);
    if (checkIns.length === 0) return null;

    const sum = checkIns.reduce((acc, checkIn) => acc + checkIn.mood, 0);
    return sum / checkIns.length;
  }

  /**
   * Get average energy over a period
   */
  static getAverageEnergy(days: number = 7): number | null {
    const checkIns = this.getRecent(days);
    if (checkIns.length === 0) return null;

    const sum = checkIns.reduce((acc, checkIn) => acc + checkIn.energy, 0);
    return sum / checkIns.length;
  }

  /**
   * Get average sleep hours over a period
   */
  static getAverageSleep(days: number = 7): number | null {
    const checkIns = this.getRecent(days);
    if (checkIns.length === 0) return null;

    const sum = checkIns.reduce((acc, checkIn) => acc + checkIn.sleepHours, 0);
    return sum / checkIns.length;
  }

  /**
   * Get average sleep quality over a period
   */
  static getAverageSleepQuality(days: number = 7): number | null {
    const checkIns = this.getRecent(days);
    if (checkIns.length === 0) return null;

    const sum = checkIns.reduce((acc, checkIn) => acc + checkIn.sleepQuality, 0);
    return sum / checkIns.length;
  }

  /**
   * Check if user has checked in today
   */
  static hasCheckedInToday(): boolean {
    const today = this.getByDate(new Date());
    return today !== null;
  }
}
