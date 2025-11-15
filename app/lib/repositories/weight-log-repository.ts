/**
 * Weight Log Repository
 *
 * Data access layer for weight tracking using localStorage
 */

import type { WeightLog, CreateWeightLogDTO, UpdateWeightLogDTO } from '../types/health-dashboard';
import { UserProfileRepository } from './user-profile-repository';

const STORAGE_KEY = 'weight_logs';

export class WeightLogRepository {
  private static getUserId(): string {
    let userId = localStorage.getItem('current_user_id');
    if (!userId) {
      userId = 'default_user';
      localStorage.setItem('current_user_id', userId);
    }
    return userId;
  }

  private static getAllLogs(): WeightLog[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    try {
      const logs = JSON.parse(data);
      return logs.map((log: any) => ({
        ...log,
        date: new Date(log.date),
        createdAt: new Date(log.createdAt),
      }));
    } catch (error) {
      console.error('Error parsing weight logs from localStorage:', error);
      return [];
    }
  }

  private static saveLogs(logs: WeightLog[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }

  private static calculateBMI(weight: number): number {
    const profile = UserProfileRepository.get();
    if (!profile?.height) return 0;

    const heightInMeters = profile.height / 100;
    return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
  }

  /**
   * Create a new weight log entry
   */
  static create(data: CreateWeightLogDTO): WeightLog {
    const logs = this.getAllLogs();
    const userId = this.getUserId();
    const bmi = this.calculateBMI(data.weight);

    const newLog: WeightLog = {
      id: `weight_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userId,
      date: new Date(data.date),
      weight: data.weight,
      bmi,
      bodyFat: data.bodyFat,
      notes: data.notes,
      createdAt: new Date(),
    };

    logs.push(newLog);
    this.saveLogs(logs);
    return newLog;
  }

  /**
   * Get all weight logs for the current user
   */
  static getAll(): WeightLog[] {
    const userId = this.getUserId();
    return this.getAllLogs().filter(log => log.userId === userId);
  }

  /**
   * Get weight log by ID
   */
  static getById(id: string): WeightLog | null {
    const logs = this.getAllLogs();
    return logs.find(log => log.id === id) || null;
  }

  /**
   * Get weight logs within a date range
   */
  static getByDateRange(startDate: Date, endDate: Date): WeightLog[] {
    const userId = this.getUserId();
    return this.getAllLogs().filter(
      log =>
        log.userId === userId &&
        log.date >= startDate &&
        log.date <= endDate
    );
  }

  /**
   * Get the most recent weight log
   */
  static getLatest(): WeightLog | null {
    const logs = this.getAll();
    if (logs.length === 0) return null;

    return logs.reduce((latest, current) =>
      current.date > latest.date ? current : latest
    );
  }

  /**
   * Get weight logs for the last N days
   */
  static getLastNDays(days: number): WeightLog[] {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.getByDateRange(startDate, endDate).sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
  }

  /**
   * Update a weight log
   */
  static update(id: string, data: UpdateWeightLogDTO): WeightLog | null {
    const logs = this.getAllLogs();
    const index = logs.findIndex(log => log.id === id);

    if (index === -1) return null;

    const updatedLog = {
      ...logs[index],
      ...(data.weight !== undefined && {
        weight: data.weight,
        bmi: this.calculateBMI(data.weight),
      }),
      ...(data.bodyFat !== undefined && { bodyFat: data.bodyFat }),
      ...(data.notes !== undefined && { notes: data.notes }),
    };

    logs[index] = updatedLog;
    this.saveLogs(logs);
    return updatedLog;
  }

  /**
   * Delete a weight log
   */
  static delete(id: string): boolean {
    const logs = this.getAllLogs();
    const filteredLogs = logs.filter(log => log.id !== id);

    if (filteredLogs.length === logs.length) return false;

    this.saveLogs(filteredLogs);
    return true;
  }

  /**
   * Calculate average weight over a period
   */
  static getAverageWeight(startDate: Date, endDate: Date): number {
    const logs = this.getByDateRange(startDate, endDate);
    if (logs.length === 0) return 0;

    const totalWeight = logs.reduce((sum, log) => sum + log.weight, 0);
    return parseFloat((totalWeight / logs.length).toFixed(1));
  }

  /**
   * Calculate weight change over a period
   */
  static getWeightChange(startDate: Date, endDate: Date): number {
    const logs = this.getByDateRange(startDate, endDate).sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    if (logs.length < 2) return 0;

    return parseFloat((logs[logs.length - 1].weight - logs[0].weight).toFixed(1));
  }

  /**
   * Predict weight based on linear regression
   */
  static predictWeight(daysAhead: number): number | null {
    const logs = this.getLastNDays(30);
    if (logs.length < 7) return null;

    // Simple linear regression
    const n = logs.length;
    const x = logs.map((_, i) => i);
    const y = logs.map(log => log.weight);

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const predictedWeight = slope * (n + daysAhead) + intercept;
    return parseFloat(predictedWeight.toFixed(1));
  }

  /**
   * Get estimated days to reach goal weight
   */
  static getDaysToGoal(goalWeight: number): number | null {
    const logs = this.getLastNDays(30);
    if (logs.length < 7) return null;

    const latest = this.getLatest();
    if (!latest) return null;

    const currentWeight = latest.weight;
    if (currentWeight === goalWeight) return 0;

    // Calculate average weekly weight change
    const weeklyChange = this.getWeightChange(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      new Date()
    );

    if (weeklyChange === 0) return null;

    const weightDifference = goalWeight - currentWeight;
    const weeks = weightDifference / weeklyChange;

    return Math.ceil(weeks * 7);
  }
}
