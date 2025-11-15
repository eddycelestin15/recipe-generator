import type {
  WorkoutLog,
  CreateWorkoutLogDTO,
  UpdateWorkoutLogDTO,
  WorkoutStats,
  ExerciseProgress,
  WorkoutHistoryFilter,
  WorkoutCalendarDay,
} from '../types/fitness';
import { ExerciseRepository } from './exercise-repository';

const STORAGE_KEY_PREFIX = 'workout_logs_';

export class WorkoutLogRepository {
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

  private static getFromStorage(): WorkoutLog[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.getStorageKey());
    if (!data) return [];
    try {
      return JSON.parse(data).map((item: any) => ({
        ...item,
        date: new Date(item.date),
        createdAt: new Date(item.createdAt),
      }));
    } catch (error) {
      console.error('Failed to parse workout logs from storage:', error);
      return [];
    }
  }

  private static saveToStorage(logs: WorkoutLog[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.getStorageKey(), JSON.stringify(logs));
  }

  static getAll(): WorkoutLog[] {
    return this.getFromStorage().sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
  }

  static getById(id: string): WorkoutLog | null {
    const logs = this.getFromStorage();
    return logs.find(log => log.id === id) || null;
  }

  static getByDate(date: Date): WorkoutLog[] {
    const logs = this.getFromStorage();
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return logs.filter(log => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === targetDate.getTime();
    });
  }

  static getByDateRange(startDate: Date, endDate: Date): WorkoutLog[] {
    const logs = this.getFromStorage();
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return logs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= start && logDate <= end;
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  static search(filter: WorkoutHistoryFilter): WorkoutLog[] {
    let logs = this.getFromStorage();

    if (filter.startDate && filter.endDate) {
      logs = this.getByDateRange(filter.startDate, filter.endDate);
    }

    if (filter.routineId) {
      logs = logs.filter(log => log.routineId === filter.routineId);
    }

    if (filter.category) {
      logs = logs.filter(log =>
        log.exercises.some(ex => {
          const exercise = ExerciseRepository.getById(ex.exerciseId);
          return exercise?.category === filter.category;
        })
      );
    }

    return logs.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  static create(data: CreateWorkoutLogDTO): WorkoutLog {
    const logs = this.getFromStorage();
    const newLog: WorkoutLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId: this.getUserId(),
      date: data.date || new Date(),
      routineId: data.routineId,
      routineName: data.routineName,
      exercises: data.exercises,
      totalDuration: data.totalDuration,
      totalCalories: data.totalCalories,
      mood: data.mood,
      notes: data.notes,
      createdAt: new Date(),
    };
    logs.push(newLog);
    this.saveToStorage(logs);
    return newLog;
  }

  static update(id: string, data: UpdateWorkoutLogDTO): WorkoutLog | null {
    const logs = this.getFromStorage();
    const index = logs.findIndex(log => log.id === id);

    if (index === -1) return null;

    logs[index] = {
      ...logs[index],
      ...data,
    };

    this.saveToStorage(logs);
    return logs[index];
  }

  static delete(id: string): boolean {
    const logs = this.getFromStorage();
    const index = logs.findIndex(log => log.id === id);

    if (index === -1) return false;

    logs.splice(index, 1);
    this.saveToStorage(logs);
    return true;
  }

  static getStats(): WorkoutStats {
    const logs = this.getFromStorage();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalWorkouts = logs.length;
    const totalDuration = logs.reduce((sum, log) => sum + log.totalDuration, 0);
    const totalCalories = logs.reduce((sum, log) => sum + log.totalCalories, 0);

    // Calculate streaks
    const sortedLogs = [...logs].sort((a, b) => b.date.getTime() - a.date.getTime());
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    sortedLogs.forEach(log => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);

      if (!lastDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

        if (logDate.getTime() === today.getTime() || logDate.getTime() === yesterday.getTime()) {
          currentStreak = 1;
          tempStreak = 1;
        }
      } else {
        const daysDiff = Math.floor((lastDate.getTime() - logDate.getTime()) / (24 * 60 * 60 * 1000));
        if (daysDiff === 1) {
          tempStreak++;
          if (currentStreak > 0) currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }

      lastDate = logDate;
    });

    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    // Workouts by category
    const workoutsByCategory: Record<string, number> = {
      cardio: 0,
      strength: 0,
      flexibility: 0,
      sport: 0,
    };

    logs.forEach(log => {
      log.exercises.forEach(ex => {
        const exercise = ExerciseRepository.getById(ex.exerciseId);
        if (exercise) {
          workoutsByCategory[exercise.category]++;
        }
      });
    });

    const recentWorkouts = this.getByDateRange(thirtyDaysAgo, now).slice(0, 10);

    return {
      totalWorkouts,
      totalDuration,
      totalCalories,
      currentStreak,
      longestStreak,
      averageWorkoutDuration: totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0,
      averageCaloriesPerWorkout: totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0,
      workoutsByCategory,
      recentWorkouts,
    };
  }

  static getExerciseProgress(exerciseId: string): ExerciseProgress {
    const logs = this.getFromStorage();
    const exercise = ExerciseRepository.getById(exerciseId);

    let maxWeight = 0;
    let maxReps = 0;
    let maxDuration = 0;
    let prDate = new Date();
    let timesPerformed = 0;
    let lastPerformed: Date | undefined;

    const volumeHistory: { date: Date; totalVolume: number }[] = [];

    logs.forEach(log => {
      const exerciseLog = log.exercises.find(ex => ex.exerciseId === exerciseId);
      if (exerciseLog) {
        timesPerformed++;
        lastPerformed = lastPerformed
          ? new Date(Math.max(lastPerformed.getTime(), log.date.getTime()))
          : log.date;

        let dailyVolume = 0;
        exerciseLog.sets.forEach(set => {
          if (set.weight && set.weight > maxWeight) {
            maxWeight = set.weight;
            prDate = log.date;
          }
          if (set.reps && set.reps > maxReps) {
            maxReps = set.reps;
            prDate = log.date;
          }
          if (set.duration && set.duration > maxDuration) {
            maxDuration = set.duration;
            prDate = log.date;
          }

          // Calculate volume (sets × reps × weight)
          const volume = (set.reps || 1) * (set.weight || 0);
          dailyVolume += volume;
        });

        if (dailyVolume > 0) {
          volumeHistory.push({
            date: log.date,
            totalVolume: dailyVolume,
          });
        }
      }
    });

    return {
      exerciseId,
      exerciseName: exercise?.name || 'Unknown Exercise',
      personalRecords: {
        maxWeight: maxWeight > 0 ? maxWeight : undefined,
        maxReps: maxReps > 0 ? maxReps : undefined,
        maxDuration: maxDuration > 0 ? maxDuration : undefined,
        date: prDate,
      },
      volumeHistory: volumeHistory.sort((a, b) => a.date.getTime() - b.date.getTime()),
      lastPerformed,
      timesPerformed,
    };
  }

  static getCalendarDays(month: number, year: number): WorkoutCalendarDay[] {
    const logs = this.getFromStorage();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendar: WorkoutCalendarDay[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayLogs = this.getByDate(date);

      calendar.push({
        date,
        hasWorkout: dayLogs.length > 0,
        totalCalories: dayLogs.reduce((sum, log) => sum + log.totalCalories, 0),
        totalDuration: dayLogs.reduce((sum, log) => sum + log.totalDuration, 0),
      });
    }

    return calendar;
  }
}
