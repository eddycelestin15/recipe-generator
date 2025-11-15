import type {
  Exercise,
  CreateExerciseDTO,
  UpdateExerciseDTO,
  ExerciseFilter,
} from '../types/fitness';

const STORAGE_KEY_PREFIX = 'exercises_';

export class ExerciseRepository {
  private static getUserId(): string {
    if (typeof window === 'undefined') return 'default_user';
    let userId = localStorage.getItem('current_user_id');
    if (!userId) {
      userId = 'default_user';
      localStorage.setItem('current_user_id', userId);
    }
    return userId;
  }

  private static getStorageKey(): string {
    return `${STORAGE_KEY_PREFIX}${this.getUserId()}`;
  }

  private static getFromStorage(): Exercise[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.getStorageKey());
    if (!data) return [];
    try {
      return JSON.parse(data).map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
      }));
    } catch (error) {
      console.error('Failed to parse exercises from storage:', error);
      return [];
    }
  }

  private static saveToStorage(exercises: Exercise[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.getStorageKey(), JSON.stringify(exercises));
  }

  static getAll(): Exercise[] {
    return this.getFromStorage();
  }

  static getById(id: string): Exercise | null {
    const exercises = this.getFromStorage();
    return exercises.find(ex => ex.id === id) || null;
  }

  static getByCategory(category: string): Exercise[] {
    const exercises = this.getFromStorage();
    return exercises.filter(ex => ex.category === category);
  }

  static getByMuscleGroup(muscleGroup: string): Exercise[] {
    const exercises = this.getFromStorage();
    return exercises.filter(
      ex => ex.muscleGroup?.toLowerCase() === muscleGroup.toLowerCase()
    );
  }

  static search(filter: ExerciseFilter): Exercise[] {
    let exercises = this.getFromStorage();

    if (filter.category) {
      exercises = exercises.filter(ex => ex.category === filter.category);
    }

    if (filter.difficulty) {
      exercises = exercises.filter(ex => ex.difficulty === filter.difficulty);
    }

    if (filter.muscleGroup) {
      exercises = exercises.filter(
        ex => ex.muscleGroup?.toLowerCase() === filter.muscleGroup?.toLowerCase()
      );
    }

    if (filter.equipment) {
      exercises = exercises.filter(ex =>
        ex.equipment.some(eq => eq.toLowerCase() === filter.equipment?.toLowerCase())
      );
    }

    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      exercises = exercises.filter(
        ex =>
          ex.name.toLowerCase().includes(term) ||
          ex.description.toLowerCase().includes(term) ||
          ex.muscleGroup?.toLowerCase().includes(term)
      );
    }

    return exercises;
  }

  static create(data: CreateExerciseDTO): Exercise {
    const exercises = this.getFromStorage();
    const newExercise: Exercise = {
      id: `ex_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      ...data,
      isCustom: true,
      userId: this.getUserId(),
      createdAt: new Date(),
    };
    exercises.push(newExercise);
    this.saveToStorage(exercises);
    return newExercise;
  }

  static update(id: string, data: UpdateExerciseDTO): Exercise | null {
    const exercises = this.getFromStorage();
    const index = exercises.findIndex(ex => ex.id === id);

    if (index === -1) return null;

    // Only allow updating custom exercises
    if (!exercises[index].isCustom || exercises[index].userId !== this.getUserId()) {
      throw new Error('Cannot update predefined exercises');
    }

    exercises[index] = {
      ...exercises[index],
      ...data,
    };

    this.saveToStorage(exercises);
    return exercises[index];
  }

  static delete(id: string): boolean {
    const exercises = this.getFromStorage();
    const index = exercises.findIndex(ex => ex.id === id);

    if (index === -1) return false;

    // Only allow deleting custom exercises
    if (!exercises[index].isCustom || exercises[index].userId !== this.getUserId()) {
      throw new Error('Cannot delete predefined exercises');
    }

    exercises.splice(index, 1);
    this.saveToStorage(exercises);
    return true;
  }

  static getCustomExercises(): Exercise[] {
    const exercises = this.getFromStorage();
    return exercises.filter(ex => ex.isCustom && ex.userId === this.getUserId());
  }

  static getPredefinedExercises(): Exercise[] {
    const exercises = this.getFromStorage();
    return exercises.filter(ex => !ex.isCustom);
  }

  static getAllEquipment(): string[] {
    const exercises = this.getFromStorage();
    const equipmentSet = new Set<string>();
    exercises.forEach(ex => {
      ex.equipment.forEach(eq => equipmentSet.add(eq));
    });
    return Array.from(equipmentSet).sort();
  }

  static getAllMuscleGroups(): string[] {
    const exercises = this.getFromStorage();
    const muscleSet = new Set<string>();
    exercises.forEach(ex => {
      if (ex.muscleGroup) muscleSet.add(ex.muscleGroup);
    });
    return Array.from(muscleSet).sort();
  }
}
