import { Habit, CreateHabitDTO, UpdateHabitDTO } from '../types/habits';

const STORAGE_KEY = 'habits';

export class HabitRepository {
  private static getUserId(): string {
    if (typeof window === 'undefined') return 'default_user';
    return localStorage.getItem('current_user_id') || 'default_user';
  }

  private static getStorageKey(): string {
    return `${STORAGE_KEY}_${this.getUserId()}`;
  }

  private static getAllFromStorage(): Habit[] {
    if (typeof window === 'undefined') return [];

    const data = localStorage.getItem(this.getStorageKey());
    if (!data) return [];

    try {
      const parsed = JSON.parse(data);
      return parsed.map((habit: any) => ({
        ...habit,
        createdDate: new Date(habit.createdDate),
      }));
    } catch {
      return [];
    }
  }

  private static saveToStorage(habits: Habit[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.getStorageKey(), JSON.stringify(habits));
  }

  /**
   * Get all habits for the current user
   */
  static getAll(): Habit[] {
    return this.getAllFromStorage();
  }

  /**
   * Get active habits only
   */
  static getActive(): Habit[] {
    return this.getAllFromStorage().filter(h => h.isActive);
  }

  /**
   * Get a habit by ID
   */
  static getById(id: string): Habit | null {
    const habits = this.getAllFromStorage();
    return habits.find(h => h.id === id) || null;
  }

  /**
   * Get habits by category
   */
  static getByCategory(category: string): Habit[] {
    return this.getAllFromStorage().filter(h => h.category === category);
  }

  /**
   * Create a new habit
   */
  static create(data: CreateHabitDTO): Habit {
    const habits = this.getAllFromStorage();

    const newHabit: Habit = {
      id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.getUserId(),
      ...data,
      createdDate: new Date(),
      isActive: true,
    };

    habits.push(newHabit);
    this.saveToStorage(habits);

    return newHabit;
  }

  /**
   * Update an existing habit
   */
  static update(id: string, data: UpdateHabitDTO): Habit | null {
    const habits = this.getAllFromStorage();
    const index = habits.findIndex(h => h.id === id);

    if (index === -1) return null;

    habits[index] = {
      ...habits[index],
      ...data,
    };

    this.saveToStorage(habits);
    return habits[index];
  }

  /**
   * Delete a habit (soft delete - set isActive to false)
   */
  static delete(id: string): boolean {
    const habits = this.getAllFromStorage();
    const index = habits.findIndex(h => h.id === id);

    if (index === -1) return false;

    habits[index].isActive = false;
    this.saveToStorage(habits);

    return true;
  }

  /**
   * Hard delete a habit (permanently remove)
   */
  static hardDelete(id: string): boolean {
    const habits = this.getAllFromStorage();
    const filtered = habits.filter(h => h.id !== id);

    if (filtered.length === habits.length) return false;

    this.saveToStorage(filtered);
    return true;
  }

  /**
   * Get habits scheduled for a specific day of week
   * @param dayOfWeek 0-6 (Sunday-Saturday)
   */
  static getScheduledForDay(dayOfWeek: number): Habit[] {
    return this.getAllFromStorage().filter(habit => {
      if (!habit.isActive) return false;

      if (habit.frequency === 'daily') return true;

      if (habit.frequency === 'weekly' && habit.specificDays) {
        return habit.specificDays.includes(dayOfWeek);
      }

      return false;
    });
  }

  /**
   * Get habits scheduled for today
   */
  static getScheduledForToday(): Habit[] {
    const today = new Date().getDay(); // 0-6
    return this.getScheduledForDay(today);
  }

  /**
   * Search habits by name
   */
  static search(query: string): Habit[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllFromStorage().filter(habit =>
      habit.name.toLowerCase().includes(lowerQuery) ||
      habit.description?.toLowerCase().includes(lowerQuery)
    );
  }
}
