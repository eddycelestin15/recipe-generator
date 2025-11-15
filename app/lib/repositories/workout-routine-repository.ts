import type {
  WorkoutRoutine,
  CreateWorkoutRoutineDTO,
  UpdateWorkoutRoutineDTO,
} from '../types/fitness';
import { ExerciseRepository } from './exercise-repository';

const STORAGE_KEY_PREFIX = 'workout_routines_';

export class WorkoutRoutineRepository {
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

  private static getFromStorage(): WorkoutRoutine[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.getStorageKey());
    if (!data) return [];
    try {
      return JSON.parse(data).map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to parse workout routines from storage:', error);
      return [];
    }
  }

  private static saveToStorage(routines: WorkoutRoutine[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.getStorageKey(), JSON.stringify(routines));
  }

  private static calculateEstimatedDuration(routine: CreateWorkoutRoutineDTO | UpdateWorkoutRoutineDTO): number {
    if (!routine.exercises) return 0;

    let totalMinutes = 0;
    routine.exercises.forEach(ex => {
      // Time for sets
      const setTime = (ex.duration || 60) / 60; // convert seconds to minutes, default 60 sec per set
      const restTime = (ex.restBetweenSets / 60); // convert seconds to minutes
      totalMinutes += (setTime + restTime) * ex.sets;
    });
    return Math.ceil(totalMinutes);
  }

  private static calculateEstimatedCalories(routine: CreateWorkoutRoutineDTO | UpdateWorkoutRoutineDTO): number {
    if (!routine.exercises) return 0;

    let totalCalories = 0;
    routine.exercises.forEach(ex => {
      const exercise = ExerciseRepository.getById(ex.exerciseId);
      if (exercise) {
        const durationMinutes = ex.duration ? ex.duration / 60 : 1;
        const caloriesPerSet = exercise.caloriesPerMinute * durationMinutes;
        totalCalories += caloriesPerSet * ex.sets;
      }
    });
    return Math.round(totalCalories);
  }

  static getAll(): WorkoutRoutine[] {
    return this.getFromStorage();
  }

  static getById(id: string): WorkoutRoutine | null {
    const routines = this.getFromStorage();
    return routines.find(r => r.id === id) || null;
  }

  static getUserRoutines(): WorkoutRoutine[] {
    const routines = this.getFromStorage();
    return routines.filter(r => !r.isTemplate);
  }

  static getTemplates(): WorkoutRoutine[] {
    const routines = this.getFromStorage();
    return routines.filter(r => r.isTemplate);
  }

  static create(data: CreateWorkoutRoutineDTO): WorkoutRoutine {
    const routines = this.getFromStorage();
    const newRoutine: WorkoutRoutine = {
      id: `routine_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId: this.getUserId(),
      name: data.name,
      description: data.description,
      exercises: data.exercises,
      estimatedDuration: this.calculateEstimatedDuration(data),
      estimatedCalories: this.calculateEstimatedCalories(data),
      isTemplate: data.isTemplate || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    routines.push(newRoutine);
    this.saveToStorage(routines);
    return newRoutine;
  }

  static update(id: string, data: UpdateWorkoutRoutineDTO): WorkoutRoutine | null {
    const routines = this.getFromStorage();
    const index = routines.findIndex(r => r.id === id);

    if (index === -1) return null;

    // Don't allow updating templates
    if (routines[index].isTemplate) {
      throw new Error('Cannot update template routines');
    }

    const updatedRoutine: WorkoutRoutine = {
      ...routines[index],
      ...data,
      updatedAt: new Date(),
    };

    // Recalculate estimates if exercises changed
    if (data.exercises) {
      updatedRoutine.estimatedDuration = this.calculateEstimatedDuration(data);
      updatedRoutine.estimatedCalories = this.calculateEstimatedCalories(data);
    }

    routines[index] = updatedRoutine;
    this.saveToStorage(routines);
    return updatedRoutine;
  }

  static delete(id: string): boolean {
    const routines = this.getFromStorage();
    const index = routines.findIndex(r => r.id === id);

    if (index === -1) return false;

    // Don't allow deleting templates
    if (routines[index].isTemplate) {
      throw new Error('Cannot delete template routines');
    }

    routines.splice(index, 1);
    this.saveToStorage(routines);
    return true;
  }

  static duplicate(id: string, newName?: string): WorkoutRoutine | null {
    const original = this.getById(id);
    if (!original) return null;

    const routines = this.getFromStorage();
    const duplicated: WorkoutRoutine = {
      ...original,
      id: `routine_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId: this.getUserId(),
      name: newName || `${original.name} (Copy)`,
      isTemplate: false, // Duplicates are never templates
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    routines.push(duplicated);
    this.saveToStorage(routines);
    return duplicated;
  }
}
