// Fitness tracking types

export type ExerciseCategory = 'cardio' | 'strength' | 'flexibility' | 'sport';
export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type WorkoutMood = 'great' | 'good' | 'okay' | 'tired';
export type IntensityLevel = 'light' | 'moderate' | 'intense';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: ExerciseCategory;
  muscleGroup?: string; // for strength exercises
  equipment: string[]; // 'none', 'dumbbells', 'barbell', 'resistance-band', etc.
  difficulty: ExerciseDifficulty;
  caloriesPerMinute: number;
  videoUrl?: string;
  imageUrl?: string;
  isCustom: boolean; // true if user-created
  userId?: string; // only for custom exercises
  createdAt: Date;
}

export interface WorkoutRoutineExercise {
  exerciseId: string;
  order: number;
  sets: number;
  reps?: number; // for strength
  duration?: number; // seconds for cardio/holds
  restBetweenSets: number; // seconds
  notes?: string;
}

export interface WorkoutRoutine {
  id: string;
  userId: string;
  name: string;
  description?: string;
  exercises: WorkoutRoutineExercise[];
  estimatedDuration: number; // minutes
  estimatedCalories: number;
  isTemplate: boolean; // true for predefined templates
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutSet {
  reps?: number;
  weight?: number; // kg
  duration?: number; // seconds
  completed: boolean;
}

export interface WorkoutLogExercise {
  exerciseId: string;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  date: Date;
  routineId?: string;
  routineName?: string; // denormalized for easy display
  exercises: WorkoutLogExercise[];
  totalDuration: number; // minutes
  totalCalories: number;
  mood?: WorkoutMood;
  notes?: string;
  createdAt: Date;
}

// DTOs for creating/updating
export interface CreateExerciseDTO {
  name: string;
  description: string;
  category: ExerciseCategory;
  muscleGroup?: string;
  equipment: string[];
  difficulty: ExerciseDifficulty;
  caloriesPerMinute: number;
  videoUrl?: string;
  imageUrl?: string;
}

export interface UpdateExerciseDTO {
  name?: string;
  description?: string;
  category?: ExerciseCategory;
  muscleGroup?: string;
  equipment?: string[];
  difficulty?: ExerciseDifficulty;
  caloriesPerMinute?: number;
  videoUrl?: string;
  imageUrl?: string;
}

export interface CreateWorkoutRoutineDTO {
  name: string;
  description?: string;
  exercises: WorkoutRoutineExercise[];
  isTemplate?: boolean;
}

export interface UpdateWorkoutRoutineDTO {
  name?: string;
  description?: string;
  exercises?: WorkoutRoutineExercise[];
}

export interface CreateWorkoutLogDTO {
  routineId?: string;
  routineName?: string;
  exercises: WorkoutLogExercise[];
  totalDuration: number;
  totalCalories: number;
  mood?: WorkoutMood;
  notes?: string;
  date?: Date; // optional, defaults to today
}

export interface UpdateWorkoutLogDTO {
  exercises?: WorkoutLogExercise[];
  totalDuration?: number;
  totalCalories?: number;
  mood?: WorkoutMood;
  notes?: string;
}

// Stats and analytics types
export interface WorkoutStats {
  totalWorkouts: number;
  totalDuration: number; // minutes
  totalCalories: number;
  currentStreak: number; // consecutive days
  longestStreak: number;
  averageWorkoutDuration: number;
  averageCaloriesPerWorkout: number;
  workoutsByCategory: Record<ExerciseCategory, number>;
  recentWorkouts: WorkoutLog[];
}

export interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  personalRecords: {
    maxWeight?: number;
    maxReps?: number;
    maxDuration?: number;
    date: Date;
  };
  volumeHistory: {
    date: Date;
    totalVolume: number; // sets × reps × weight
  }[];
  lastPerformed?: Date;
  timesPerformed: number;
}

export interface WorkoutCalendarDay {
  date: Date;
  hasWorkout: boolean;
  totalCalories?: number;
  totalDuration?: number;
}

// Filter/query types
export interface ExerciseFilter {
  category?: ExerciseCategory;
  difficulty?: ExerciseDifficulty;
  muscleGroup?: string;
  equipment?: string;
  searchTerm?: string;
}

export interface WorkoutHistoryFilter {
  startDate?: Date;
  endDate?: Date;
  routineId?: string;
  category?: ExerciseCategory;
}

// Calculation utilities
export interface CalorieCalculation {
  exercise: Exercise;
  duration: number; // minutes
  intensity: IntensityLevel;
  estimatedCalories: number;
}

export interface VolumeCalculation {
  sets: number;
  reps: number;
  weight: number;
  totalVolume: number;
}
