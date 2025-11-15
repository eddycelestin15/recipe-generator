/**
 * Weekly Summary Repository
 *
 * Data access layer for weekly summaries using localStorage
 */

import type { WeeklySummary } from '../types/health-dashboard';
import { startOfWeek, endOfWeek, format } from 'date-fns';

const STORAGE_KEY = 'weekly_summaries';

export class WeeklySummaryRepository {
  private static getUserId(): string {
    let userId = localStorage.getItem('current_user_id');
    if (!userId) {
      userId = 'default_user';
      localStorage.setItem('current_user_id', userId);
    }
    return userId;
  }

  private static getAllSummaries(): WeeklySummary[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    try {
      const summaries = JSON.parse(data);
      return summaries.map((s: any) => ({
        ...s,
        weekStart: new Date(s.weekStart),
        weekEnd: new Date(s.weekEnd),
        createdAt: new Date(s.createdAt),
      }));
    } catch (error) {
      console.error('Error parsing weekly summaries from localStorage:', error);
      return [];
    }
  }

  private static saveSummaries(summaries: WeeklySummary[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(summaries));
  }

  /**
   * Create a new weekly summary
   */
  static create(data: Omit<WeeklySummary, 'id' | 'userId' | 'createdAt'>): WeeklySummary {
    const summaries = this.getAllSummaries();
    const userId = this.getUserId();

    const newSummary: WeeklySummary = {
      id: `summary_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userId,
      weekStart: data.weekStart,
      weekEnd: data.weekEnd,
      avgCalories: data.avgCalories,
      avgProtein: data.avgProtein,
      avgCarbs: data.avgCarbs,
      avgFat: data.avgFat,
      workoutsDone: data.workoutsDone,
      complianceDays: data.complianceDays,
      weightChange: data.weightChange,
      insights: data.insights,
      createdAt: new Date(),
    };

    summaries.push(newSummary);
    this.saveSummaries(summaries);
    return newSummary;
  }

  /**
   * Get all summaries for the current user
   */
  static getAll(): WeeklySummary[] {
    const userId = this.getUserId();
    return this.getAllSummaries()
      .filter(s => s.userId === userId)
      .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());
  }

  /**
   * Get summary by ID
   */
  static getById(id: string): WeeklySummary | null {
    const summaries = this.getAllSummaries();
    return summaries.find(s => s.id === id) || null;
  }

  /**
   * Get summary for a specific week
   */
  static getByWeek(date: Date): WeeklySummary | null {
    const userId = this.getUserId();
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });

    const summaries = this.getAllSummaries();
    return (
      summaries.find(
        s =>
          s.userId === userId &&
          s.weekStart.getTime() === weekStart.getTime() &&
          s.weekEnd.getTime() === weekEnd.getTime()
      ) || null
    );
  }

  /**
   * Get the most recent summary
   */
  static getLatest(): WeeklySummary | null {
    const summaries = this.getAll();
    return summaries.length > 0 ? summaries[0] : null;
  }

  /**
   * Get summaries for the last N weeks
   */
  static getLastNWeeks(n: number): WeeklySummary[] {
    const summaries = this.getAll();
    return summaries.slice(0, n);
  }

  /**
   * Update a summary
   */
  static update(id: string, data: Partial<Omit<WeeklySummary, 'id' | 'userId' | 'createdAt'>>): WeeklySummary | null {
    const summaries = this.getAllSummaries();
    const index = summaries.findIndex(s => s.id === id);

    if (index === -1) return null;

    const updated: WeeklySummary = {
      ...summaries[index],
      ...data,
      weekStart: data.weekStart || summaries[index].weekStart,
      weekEnd: data.weekEnd || summaries[index].weekEnd,
    };

    summaries[index] = updated;
    this.saveSummaries(summaries);
    return updated;
  }

  /**
   * Delete a summary
   */
  static delete(id: string): boolean {
    const summaries = this.getAllSummaries();
    const filtered = summaries.filter(s => s.id !== id);

    if (filtered.length === summaries.length) return false;

    this.saveSummaries(filtered);
    return true;
  }

  /**
   * Calculate average compliance over last N weeks
   */
  static getAverageCompliance(weeks: number = 4): number {
    const summaries = this.getLastNWeeks(weeks);
    if (summaries.length === 0) return 0;

    const totalCompliance = summaries.reduce((sum, s) => sum + s.complianceDays, 0);
    const totalDays = summaries.length * 7;

    return Math.round((totalCompliance / totalDays) * 100);
  }

  /**
   * Get trend data for charts
   */
  static getTrendData(weeks: number = 8): {
    labels: string[];
    calories: number[];
    protein: number[];
    workouts: number[];
    compliance: number[];
  } {
    const summaries = this.getLastNWeeks(weeks).reverse();

    return {
      labels: summaries.map(s => format(s.weekStart, 'MMM d')),
      calories: summaries.map(s => Math.round(s.avgCalories)),
      protein: summaries.map(s => Math.round(s.avgProtein)),
      workouts: summaries.map(s => s.workoutsDone),
      compliance: summaries.map(s => Math.round((s.complianceDays / 7) * 100)),
    };
  }

  /**
   * Check if summary exists for current week
   */
  static existsForCurrentWeek(): boolean {
    return this.getByWeek(new Date()) !== null;
  }
}
