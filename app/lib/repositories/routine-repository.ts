import { Routine, CreateRoutineDTO, UpdateRoutineDTO } from '../types/habits';

const STORAGE_KEY = 'routines';

export class RoutineRepository {
  private static getUserId(): string {
    if (typeof window === 'undefined') return 'default_user';
    return localStorage.getItem('current_user_id') || 'default_user';
  }

  private static getStorageKey(): string {
    return `${STORAGE_KEY}_${this.getUserId()}`;
  }

  private static getAllFromStorage(): Routine[] {
    if (typeof window === 'undefined') return [];

    const data = localStorage.getItem(this.getStorageKey());
    if (!data) return [];

    try {
      const parsed = JSON.parse(data);
      return parsed.map((routine: any) => ({
        ...routine,
        createdDate: new Date(routine.createdDate),
        updatedDate: new Date(routine.updatedDate),
      }));
    } catch {
      return [];
    }
  }

  private static saveToStorage(routines: Routine[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.getStorageKey(), JSON.stringify(routines));
  }

  /**
   * Get all routines for the current user
   */
  static getAll(): Routine[] {
    return this.getAllFromStorage();
  }

  /**
   * Get active routines only
   */
  static getActive(): Routine[] {
    return this.getAllFromStorage().filter(r => r.isActive);
  }

  /**
   * Get a routine by ID
   */
  static getById(id: string): Routine | null {
    const routines = this.getAllFromStorage();
    return routines.find(r => r.id === id) || null;
  }

  /**
   * Get routines by type
   */
  static getByType(type: 'morning' | 'evening' | 'custom'): Routine[] {
    return this.getAllFromStorage().filter(r => r.type === type);
  }

  /**
   * Create a new routine
   */
  static create(data: CreateRoutineDTO): Routine {
    const routines = this.getAllFromStorage();

    const newRoutine: Routine = {
      id: `routine_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.getUserId(),
      name: data.name,
      description: data.description,
      type: data.type,
      habitIds: data.habitIds,
      reminderTime: data.reminderTime,
      isActive: data.isActive,
      createdDate: new Date(),
      updatedDate: new Date(),
    };

    routines.push(newRoutine);
    this.saveToStorage(routines);

    return newRoutine;
  }

  /**
   * Update an existing routine
   */
  static update(id: string, data: UpdateRoutineDTO): Routine | null {
    const routines = this.getAllFromStorage();
    const index = routines.findIndex(r => r.id === id);

    if (index === -1) return null;

    routines[index] = {
      ...routines[index],
      ...data,
      updatedDate: new Date(),
    };

    this.saveToStorage(routines);
    return routines[index];
  }

  /**
   * Delete a routine
   */
  static delete(id: string): boolean {
    const routines = this.getAllFromStorage();
    const filtered = routines.filter(r => r.id !== id);

    if (filtered.length === routines.length) return false;

    this.saveToStorage(filtered);
    return true;
  }

  /**
   * Add a habit to a routine
   */
  static addHabit(routineId: string, habitId: string): Routine | null {
    const routines = this.getAllFromStorage();
    const index = routines.findIndex(r => r.id === routineId);

    if (index === -1) return null;

    if (!routines[index].habitIds.includes(habitId)) {
      routines[index].habitIds.push(habitId);
      routines[index].updatedDate = new Date();
      this.saveToStorage(routines);
    }

    return routines[index];
  }

  /**
   * Remove a habit from a routine
   */
  static removeHabit(routineId: string, habitId: string): Routine | null {
    const routines = this.getAllFromStorage();
    const index = routines.findIndex(r => r.id === routineId);

    if (index === -1) return null;

    routines[index].habitIds = routines[index].habitIds.filter(id => id !== habitId);
    routines[index].updatedDate = new Date();
    this.saveToStorage(routines);

    return routines[index];
  }

  /**
   * Toggle routine active status
   */
  static toggleActive(id: string): Routine | null {
    const routines = this.getAllFromStorage();
    const index = routines.findIndex(r => r.id === id);

    if (index === -1) return null;

    routines[index].isActive = !routines[index].isActive;
    routines[index].updatedDate = new Date();
    this.saveToStorage(routines);

    return routines[index];
  }
}
