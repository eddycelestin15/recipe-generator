/**
 * Body Measurements Repository
 *
 * Data access layer for body measurements tracking using localStorage
 */

import type { BodyMeasurements, CreateBodyMeasurementsDTO } from '../types/health-dashboard';

const STORAGE_KEY = 'body_measurements';

export class BodyMeasurementsRepository {
  private static getUserId(): string {
    let userId = localStorage.getItem('current_user_id');
    if (!userId) {
      userId = 'default_user';
      localStorage.setItem('current_user_id', userId);
    }
    return userId;
  }

  private static getAllMeasurements(): BodyMeasurements[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    try {
      const measurements = JSON.parse(data);
      return measurements.map((m: any) => ({
        ...m,
        date: new Date(m.date),
        createdAt: new Date(m.createdAt),
      }));
    } catch (error) {
      console.error('Error parsing body measurements from localStorage:', error);
      return [];
    }
  }

  private static saveMeasurements(measurements: BodyMeasurements[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(measurements));
  }

  /**
   * Create new body measurements entry
   */
  static create(data: CreateBodyMeasurementsDTO): BodyMeasurements {
    const measurements = this.getAllMeasurements();
    const userId = this.getUserId();

    const newMeasurement: BodyMeasurements = {
      id: `measurements_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userId,
      date: new Date(data.date),
      chest: data.chest,
      waist: data.waist,
      hips: data.hips,
      arms: data.arms,
      thighs: data.thighs,
      calves: data.calves,
      neck: data.neck,
      notes: data.notes,
      createdAt: new Date(),
    };

    measurements.push(newMeasurement);
    this.saveMeasurements(measurements);
    return newMeasurement;
  }

  /**
   * Get all measurements for the current user
   */
  static getAll(): BodyMeasurements[] {
    const userId = this.getUserId();
    return this.getAllMeasurements()
      .filter(m => m.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Get measurement by ID
   */
  static getById(id: string): BodyMeasurements | null {
    const measurements = this.getAllMeasurements();
    return measurements.find(m => m.id === id) || null;
  }

  /**
   * Get the most recent measurements
   */
  static getLatest(): BodyMeasurements | null {
    const measurements = this.getAll();
    return measurements.length > 0 ? measurements[0] : null;
  }

  /**
   * Get measurements within a date range
   */
  static getByDateRange(startDate: Date, endDate: Date): BodyMeasurements[] {
    const userId = this.getUserId();
    return this.getAllMeasurements()
      .filter(
        m =>
          m.userId === userId &&
          m.date >= startDate &&
          m.date <= endDate
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Update measurements
   */
  static update(id: string, data: Partial<CreateBodyMeasurementsDTO>): BodyMeasurements | null {
    const measurements = this.getAllMeasurements();
    const index = measurements.findIndex(m => m.id === id);

    if (index === -1) return null;

    const updated: BodyMeasurements = {
      ...measurements[index],
      ...data,
      date: data.date ? new Date(data.date) : measurements[index].date,
    };

    measurements[index] = updated;
    this.saveMeasurements(measurements);
    return updated;
  }

  /**
   * Delete measurements
   */
  static delete(id: string): boolean {
    const measurements = this.getAllMeasurements();
    const filtered = measurements.filter(m => m.id !== id);

    if (filtered.length === measurements.length) return false;

    this.saveMeasurements(filtered);
    return true;
  }

  /**
   * Calculate change in measurement over time
   */
  static getMeasurementChange(
    measurementType: keyof Omit<BodyMeasurements, 'id' | 'userId' | 'date' | 'notes' | 'createdAt'>,
    startDate: Date,
    endDate: Date
  ): number | null {
    const measurements = this.getByDateRange(startDate, endDate);
    if (measurements.length < 2) return null;

    const first = measurements[0][measurementType];
    const last = measurements[measurements.length - 1][measurementType];

    if (first === undefined || last === undefined) return null;

    return parseFloat((last - first).toFixed(1));
  }
}
