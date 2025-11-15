/**
 * Health Dashboard Type Definitions
 *
 * Defines all TypeScript interfaces and types for the Health Dashboard System
 */

// ============================================================================
// WEIGHT & BODY TRACKING
// ============================================================================

export interface WeightLog {
  id: string;
  userId: string;
  date: Date;
  weight: number; // kg
  bmi: number; // calculated
  bodyFat?: number; // % if available
  notes?: string;
  createdAt: Date;
}

export interface BodyMeasurements {
  id: string;
  userId: string;
  date: Date;
  chest?: number; // cm
  waist?: number; // cm
  hips?: number; // cm
  arms?: number; // cm
  thighs?: number; // cm
  calves?: number; // cm
  neck?: number; // cm
  notes?: string;
  createdAt: Date;
}

export type PhotoAngle = 'front' | 'side' | 'back';

export interface ProgressPhoto {
  id: string;
  userId: string;
  date: Date;
  imageUrl: string;
  weight?: number;
  notes?: string;
  angle: PhotoAngle;
  createdAt: Date;
}

// ============================================================================
// USER STATS & ACHIEVEMENTS
// ============================================================================

export interface UserStats {
  userId: string;
  currentStreak: number; // consecutive tracking days
  longestStreak: number;
  totalWorkouts: number;
  totalRecipesGenerated: number;
  totalMealsLogged: number;
  memberSince: Date;
  achievements: string[]; // achievement IDs
  lastActivityDate: Date;
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'nutrition' | 'fitness' | 'consistency' | 'milestone';
  requirement: number;
  unlockedAt?: Date;
}

// ============================================================================
// GOALS & MILESTONES
// ============================================================================

export type GoalStatus = 'active' | 'completed' | 'paused' | 'abandoned';
export type GoalCategory = 'weight' | 'nutrition' | 'fitness' | 'health';

export interface HealthGoal {
  id: string;
  userId: string;
  category: GoalCategory;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: Date;
  targetDate: Date;
  status: GoalStatus;
  milestones: Milestone[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  targetValue: number;
  achieved: boolean;
  achievedAt?: Date;
  reward?: string;
}

// ============================================================================
// WEEKLY & MONTHLY SUMMARIES
// ============================================================================

export interface WeeklySummary {
  id: string;
  userId: string;
  weekStart: Date;
  weekEnd: Date;
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  workoutsDone: number;
  complianceDays: number; // out of 7
  weightChange: number; // kg
  insights: string[]; // AI-generated text
  createdAt: Date;
}

export interface MonthlySummary {
  id: string;
  userId: string;
  month: number; // 1-12
  year: number;
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  totalWorkouts: number;
  complianceDays: number; // out of ~30
  weightChange: number; // kg
  goalsCompleted: number;
  insights: string[];
  createdAt: Date;
}

// ============================================================================
// DASHBOARD DATA
// ============================================================================

export interface DashboardSummary {
  date: Date;
  // Nutrition
  calories: {
    consumed: number;
    goal: number;
    remaining: number;
    percentage: number;
  };
  macros: {
    protein: { consumed: number; goal: number; percentage: number };
    carbs: { consumed: number; goal: number; percentage: number };
    fat: { consumed: number; goal: number; percentage: number };
  };
  hydration: {
    current: number; // ml
    goal: number; // ml
    percentage: number;
  };
  // Fitness
  todayWorkout?: {
    id: string;
    name: string;
    completed: boolean;
    duration?: number; // minutes
  };
  // Stats
  currentWeight?: number;
  weekWeightChange?: number;
  currentStreak: number;
  favoriteRecipes: {
    id: string;
    name: string;
    timesCooked: number;
  }[];
}

export interface AnalyticsTrends {
  period: 'week' | 'month' | 'quarter' | 'year';
  // Nutrition trends
  nutritionTrends: {
    labels: string[];
    calories: number[];
    protein: number[];
    carbs: number[];
    fat: number[];
  };
  // Weight trends
  weightTrends: {
    labels: string[];
    weight: number[];
    bmi: number[];
    predictedWeight?: number[]; // linear regression
  };
  // Workout consistency
  workoutConsistency: {
    labels: string[];
    workouts: number[];
    avgDuration: number[];
  };
  // Compliance
  compliance: {
    labels: string[];
    complianceRate: number[]; // %
  };
  // Correlations
  correlations: {
    weightVsCalories: number; // correlation coefficient
    workoutVsMood?: number;
  };
}

export interface ComplianceDay {
  date: Date;
  caloriesGoalMet: boolean;
  proteinGoalMet: boolean;
  workoutCompleted: boolean;
  mealsLogged: number;
  overallCompliance: number; // 0-100
}

// ============================================================================
// DATA TRANSFER OBJECTS (DTOs)
// ============================================================================

export interface CreateWeightLogDTO {
  date: string; // ISO date string
  weight: number;
  bodyFat?: number;
  notes?: string;
}

export interface UpdateWeightLogDTO {
  weight?: number;
  bodyFat?: number;
  notes?: string;
}

export interface CreateBodyMeasurementsDTO {
  date: string;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  calves?: number;
  neck?: number;
  notes?: string;
}

export interface CreateProgressPhotoDTO {
  date: string;
  imageUrl: string;
  weight?: number;
  notes?: string;
  angle: PhotoAngle;
}

export interface CreateHealthGoalDTO {
  category: GoalCategory;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate: string; // ISO date string
  milestones?: Omit<Milestone, 'id' | 'goalId' | 'achieved' | 'achievedAt'>[];
}

export interface UpdateHealthGoalDTO {
  title?: string;
  description?: string;
  targetValue?: number;
  currentValue?: number;
  targetDate?: string;
  status?: GoalStatus;
}

// ============================================================================
// INSIGHTS & RECOMMENDATIONS
// ============================================================================

export interface AIInsight {
  id: string;
  userId: string;
  date: Date;
  category: 'nutrition' | 'fitness' | 'progress' | 'motivation';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  suggestions?: string[];
  createdAt: Date;
}

export interface WeeklyInsights {
  period: string; // e.g., "Nov 8 - Nov 14, 2025"
  summary: string;
  highlights: string[];
  concerns: string[];
  suggestions: string[];
  motivationalMessage: string;
}

// ============================================================================
// EXPORT DATA
// ============================================================================

export interface ExportData {
  userId: string;
  exportDate: Date;
  dateRange: {
    start: Date;
    end: Date;
  };
  weightLogs: WeightLog[];
  bodyMeasurements: BodyMeasurements[];
  progressPhotos: ProgressPhoto[];
  goals: HealthGoal[];
  weeklySummaries: WeeklySummary[];
  userStats: UserStats;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const PHOTO_ANGLE_LABELS: Record<PhotoAngle, string> = {
  front: 'Face',
  side: 'Profil',
  back: 'Dos',
};

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  active: 'Actif',
  completed: 'Complété',
  paused: 'En pause',
  abandoned: 'Abandonné',
};

export const GOAL_CATEGORY_LABELS: Record<GoalCategory, string> = {
  weight: 'Poids',
  nutrition: 'Nutrition',
  fitness: 'Fitness',
  health: 'Santé',
};

export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  {
    id: 'first_meal',
    title: 'Premier repas',
    description: 'Logger votre premier repas',
    icon: '🍽️',
    category: 'nutrition',
    requirement: 1,
  },
  {
    id: 'week_streak',
    title: 'Une semaine',
    description: 'Maintenir un streak de 7 jours',
    icon: '🔥',
    category: 'consistency',
    requirement: 7,
  },
  {
    id: 'month_streak',
    title: 'Un mois',
    description: 'Maintenir un streak de 30 jours',
    icon: '🏆',
    category: 'consistency',
    requirement: 30,
  },
  {
    id: 'first_goal',
    title: 'Premier objectif',
    description: 'Atteindre votre premier objectif',
    icon: '🎯',
    category: 'milestone',
    requirement: 1,
  },
  {
    id: 'weight_5kg',
    title: '5kg perdus',
    description: 'Perdre 5kg depuis le début',
    icon: '📉',
    category: 'milestone',
    requirement: 5,
  },
  {
    id: '50_workouts',
    title: '50 entraînements',
    description: 'Compléter 50 entraînements',
    icon: '💪',
    category: 'fitness',
    requirement: 50,
  },
  {
    id: '100_meals',
    title: '100 repas',
    description: 'Logger 100 repas',
    icon: '📊',
    category: 'nutrition',
    requirement: 100,
  },
];

// Default hydration goal in ml
export const DEFAULT_HYDRATION_GOAL = 2000;

// Weight change thresholds for insights (kg per week)
export const HEALTHY_WEIGHT_LOSS_RANGE = { min: 0.25, max: 1.0 };
export const HEALTHY_WEIGHT_GAIN_RANGE = { min: 0.25, max: 0.5 };
