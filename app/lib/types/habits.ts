/**
 * Types for Habits & Routines System
 */

export type RoutineType = 'morning' | 'evening' | 'custom';
export type HabitType = 'boolean' | 'number';
export type HabitFrequency = 'daily' | 'weekly';
export type HabitCategory = 'health' | 'fitness' | 'productivity' | 'mindfulness' | 'other';

/**
 * Routine - Collection of habits to complete at specific times
 */
export interface Routine {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: RoutineType;
  habitIds: string[]; // IDs of associated habits
  reminderTime?: string; // HH:mm format (e.g., "07:00")
  isActive: boolean;
  createdDate: Date;
  updatedDate: Date;
}

/**
 * Habit - Individual trackable habit
 */
export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: HabitType;
  target?: number; // Target value for number type (e.g., 2000 for 2000ml water)
  unit?: string; // Unit for number type (e.g., 'ml', 'steps', 'minutes')
  frequency: HabitFrequency;
  specificDays?: number[]; // 0-6 (Sunday-Saturday) - used when frequency is 'weekly'
  reminderEnabled: boolean;
  reminderTime?: string; // HH:mm format
  category: HabitCategory;
  iconEmoji?: string;
  color?: string; // Hex color for UI
  createdDate: Date;
  isActive: boolean;
}

/**
 * HabitLog - Daily log entry for a habit
 */
export interface HabitLog {
  id: string;
  userId: string;
  habitId: string;
  date: Date; // Date at midnight (normalized)
  completed: boolean;
  value?: number; // Actual value for number type habits
  notes?: string;
  loggedAt: Date; // Timestamp when logged
}

/**
 * DailyCheckIn - Daily mood, energy, and sleep tracking
 */
export interface DailyCheckIn {
  id: string;
  userId: string;
  date: Date;
  mood: 1 | 2 | 3 | 4 | 5; // 1=terrible, 5=excellent
  energy: 1 | 2 | 3 | 4 | 5; // 1=exhausted, 5=energized
  sleepHours: number;
  sleepQuality: 1 | 2 | 3 | 4 | 5; // 1=terrible, 5=excellent
  notes?: string;
  createdAt: Date;
}

/**
 * Achievement - Predefined achievement/badge
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconEmoji: string;
  requirement: string; // Requirement type (e.g., "7_day_streak", "first_habit")
  points: number;
  category: 'streak' | 'milestone' | 'routine' | 'special';
}

/**
 * UserAchievement - User's unlocked achievements
 */
export interface UserAchievement {
  userId: string;
  achievements: {
    achievementId: string;
    unlockedDate: Date;
    habitId?: string; // Optional: specific habit that unlocked this
  }[];
  totalPoints: number;
  level: number; // Calculated from total points
}

/**
 * HabitStats - Statistics for a specific habit
 */
export interface HabitStats {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number; // Percentage (0-100)
  averageValue?: number; // For number type habits
  lastCompletedDate?: Date;
  streakHistory: {
    date: Date;
    streak: number;
  }[];
}

/**
 * DTOs for API requests
 */

export interface CreateRoutineDTO {
  name: string;
  description?: string;
  type: RoutineType;
  habitIds: string[];
  reminderTime?: string;
  isActive: boolean;
}

export interface UpdateRoutineDTO {
  name?: string;
  description?: string;
  habitIds?: string[];
  reminderTime?: string;
  isActive?: boolean;
}

export interface CreateHabitDTO {
  name: string;
  description?: string;
  type: HabitType;
  target?: number;
  unit?: string;
  frequency: HabitFrequency;
  specificDays?: number[];
  reminderEnabled: boolean;
  reminderTime?: string;
  category: HabitCategory;
  iconEmoji?: string;
  color?: string;
}

export interface UpdateHabitDTO {
  name?: string;
  description?: string;
  target?: number;
  unit?: string;
  frequency?: HabitFrequency;
  specificDays?: number[];
  reminderEnabled?: boolean;
  reminderTime?: string;
  category?: HabitCategory;
  iconEmoji?: string;
  color?: string;
  isActive?: boolean;
}

export interface LogHabitDTO {
  habitId: string;
  date: Date;
  completed: boolean;
  value?: number;
  notes?: string;
}

export interface CreateCheckInDTO {
  date: Date;
  mood: 1 | 2 | 3 | 4 | 5;
  energy: 1 | 2 | 3 | 4 | 5;
  sleepHours: number;
  sleepQuality: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

/**
 * Response types
 */

export interface HabitWithStats extends Habit {
  stats: HabitStats;
  todayLog?: HabitLog;
}

export interface TodayHabitsResponse {
  date: Date;
  habits: {
    habit: Habit;
    log?: HabitLog;
    isScheduledToday: boolean;
  }[];
  completionRate: number;
  streak: number;
}

export interface RoutineWithHabits extends Routine {
  habits: Habit[];
}

export interface AchievementProgress {
  achievement: Achievement;
  unlocked: boolean;
  unlockedDate?: Date;
  progress: number; // 0-100 percentage
  progressDetails?: string; // Human-readable progress (e.g., "5/7 days")
}
