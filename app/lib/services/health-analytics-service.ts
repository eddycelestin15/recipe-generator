/**
 * Health Analytics Service
 *
 * Business logic for calculating health analytics, trends, and insights
 */

import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, format } from 'date-fns';
import type {
  DashboardSummary,
  AnalyticsTrends,
  ComplianceDay,
  WeeklyInsights,
} from '../types/health-dashboard';
import { WeightLogRepository } from '../repositories/weight-log-repository';
import { UserStatsRepository } from '../repositories/user-stats-repository';
import { HealthGoalRepository } from '../repositories/health-goal-repository';
import { DailyNutritionRepository } from '../repositories/daily-nutrition-repository';
import { WorkoutLogRepository } from '../repositories/workout-log-repository';
import { MealLogRepository } from '../repositories/meal-log-repository';
import { NutritionGoalsRepository } from '../repositories/nutrition-goals-repository';
import { RecipeRepository } from '../repositories/recipe-repository';

export class HealthAnalyticsService {
  /**
   * Get dashboard summary for today
   */
  static getDashboardSummary(): DashboardSummary {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get nutrition data
    const dailyNutrition = DailyNutritionRepository.getByDate(today);
    const nutritionGoals = NutritionGoalsRepository.get();

    // Get weight data
    const latestWeight = WeightLogRepository.getLatest();
    const weekAgo = subDays(today, 7);
    const weekWeightChange = WeightLogRepository.getWeightChange(weekAgo, today);

    // Get stats
    const stats = UserStatsRepository.get();

    // Get today's workout
    const todayWorkouts = WorkoutLogRepository.getByDate(today);
    const todayWorkout = todayWorkouts.length > 0 ? todayWorkouts[0] : undefined;

    // Get favorite recipes this week
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekMealLogs = MealLogRepository.getByDateRange(weekStart, today);
    const recipeCount = new Map<string, number>();

    weekMealLogs.forEach(meal => {
      if (meal.recipeId) {
        recipeCount.set(meal.recipeId, (recipeCount.get(meal.recipeId) || 0) + 1);
      }
    });

    const topRecipeIds = Array.from(recipeCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);

    const favoriteRecipes = topRecipeIds
      .map(id => {
        const recipe = RecipeRepository.getById(id);
        return recipe
          ? {
              id: recipe.id,
              name: recipe.name,
              timesCooked: recipeCount.get(id) || 0,
            }
          : null;
      })
      .filter(Boolean) as { id: string; name: string; timesCooked: number }[];

    // Calculate hydration (if tracked)
    const hydrationGoal = 2000; // ml
    const currentHydration = dailyNutrition?.waterIntake || 0;

    return {
      date: today,
      calories: {
        consumed: dailyNutrition?.totalCalories || 0,
        goal: nutritionGoals?.dailyCalories || 2000,
        remaining: Math.max(
          0,
          (nutritionGoals?.dailyCalories || 2000) - (dailyNutrition?.totalCalories || 0)
        ),
        percentage: Math.min(
          100,
          ((dailyNutrition?.totalCalories || 0) / (nutritionGoals?.dailyCalories || 2000)) * 100
        ),
      },
      macros: {
        protein: {
          consumed: dailyNutrition?.totalProtein || 0,
          goal: nutritionGoals?.dailyProtein || 150,
          percentage: Math.min(
            100,
            ((dailyNutrition?.totalProtein || 0) / (nutritionGoals?.dailyProtein || 150)) * 100
          ),
        },
        carbs: {
          consumed: dailyNutrition?.totalCarbs || 0,
          goal: nutritionGoals?.dailyCarbs || 200,
          percentage: Math.min(
            100,
            ((dailyNutrition?.totalCarbs || 0) / (nutritionGoals?.dailyCarbs || 200)) * 100
          ),
        },
        fat: {
          consumed: dailyNutrition?.totalFat || 0,
          goal: nutritionGoals?.dailyFat || 60,
          percentage: Math.min(
            100,
            ((dailyNutrition?.totalFat || 0) / (nutritionGoals?.dailyFat || 60)) * 100
          ),
        },
      },
      hydration: {
        current: currentHydration,
        goal: hydrationGoal,
        percentage: Math.min(100, (currentHydration / hydrationGoal) * 100),
      },
      todayWorkout: todayWorkout
        ? {
            id: todayWorkout.id,
            name: todayWorkout.routineName || 'Workout',
            completed: true, // If it exists in the log, it's completed
            duration: todayWorkout.totalDuration,
          }
        : undefined,
      currentWeight: latestWeight?.weight,
      weekWeightChange,
      currentStreak: stats.currentStreak,
      favoriteRecipes,
    };
  }

  /**
   * Get analytics trends for a period
   */
  static getAnalyticsTrends(
    period: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ): AnalyticsTrends {
    const today = new Date();
    let startDate: Date;
    let days: number;

    switch (period) {
      case 'week':
        startDate = subDays(today, 7);
        days = 7;
        break;
      case 'month':
        startDate = subDays(today, 30);
        days = 30;
        break;
      case 'quarter':
        startDate = subDays(today, 90);
        days = 90;
        break;
      case 'year':
        startDate = subDays(today, 365);
        days = 365;
        break;
    }

    // Get nutrition trends
    const nutritionData = this.getNutritionTrends(startDate, today, days);

    // Get weight trends
    const weightData = this.getWeightTrends(startDate, today, days);

    // Get workout consistency
    const workoutData = this.getWorkoutTrends(startDate, today, days);

    // Get compliance data
    const complianceData = this.getComplianceTrends(startDate, today, days);

    // Calculate correlations
    const correlations = this.calculateCorrelations(startDate, today);

    return {
      period,
      nutritionTrends: nutritionData,
      weightTrends: weightData,
      workoutConsistency: workoutData,
      compliance: complianceData,
      correlations,
    };
  }

  /**
   * Get nutrition trends
   */
  private static getNutritionTrends(startDate: Date, endDate: Date, days: number) {
    const dailyData = DailyNutritionRepository.getByDateRange(startDate, endDate);

    // Group by appropriate interval
    const interval = days > 90 ? 7 : days > 30 ? 3 : 1;
    const labels: string[] = [];
    const calories: number[] = [];
    const protein: number[] = [];
    const carbs: number[] = [];
    const fat: number[] = [];

    for (let i = 0; i < days; i += interval) {
      const date = subDays(endDate, days - i);
      const intervalEnd = subDays(date, -interval);

      const intervalData = dailyData.filter(
        d => d.date >= date && d.date < intervalEnd
      );

      if (intervalData.length > 0) {
        labels.push(format(date, interval === 1 ? 'MMM d' : 'MMM d'));
        calories.push(
          Math.round(
            intervalData.reduce((sum, d) => sum + d.totalCalories, 0) / intervalData.length
          )
        );
        protein.push(
          Math.round(
            intervalData.reduce((sum, d) => sum + d.totalProtein, 0) / intervalData.length
          )
        );
        carbs.push(
          Math.round(
            intervalData.reduce((sum, d) => sum + d.totalCarbs, 0) / intervalData.length
          )
        );
        fat.push(
          Math.round(
            intervalData.reduce((sum, d) => sum + d.totalFat, 0) / intervalData.length
          )
        );
      }
    }

    return { labels, calories, protein, carbs, fat };
  }

  /**
   * Get weight trends with prediction
   */
  private static getWeightTrends(startDate: Date, endDate: Date, days: number) {
    const weightLogs = WeightLogRepository.getByDateRange(startDate, endDate);

    const labels: string[] = [];
    const weight: number[] = [];
    const bmi: number[] = [];

    weightLogs.forEach(log => {
      labels.push(format(log.date, 'MMM d'));
      weight.push(log.weight);
      bmi.push(log.bmi);
    });

    // Add prediction for next 30 days
    const predictedWeight: number[] = [...weight];
    const prediction = WeightLogRepository.predictWeight(30);

    if (prediction !== null) {
      predictedWeight.push(prediction);
    }

    return { labels, weight, bmi, predictedWeight };
  }

  /**
   * Get workout trends
   */
  private static getWorkoutTrends(startDate: Date, endDate: Date, days: number) {
    const workouts = WorkoutLogRepository.getByDateRange(startDate, endDate);

    // Group by week
    const weeklyData = new Map<string, { count: number; totalDuration: number }>();

    workouts.forEach(workout => {
      const weekStart = format(startOfWeek(workout.date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const existing = weeklyData.get(weekStart) || { count: 0, totalDuration: 0 };

      weeklyData.set(weekStart, {
        count: existing.count + 1,
        totalDuration: existing.totalDuration + (workout.totalDuration || 0),
      });
    });

    const sorted = Array.from(weeklyData.entries()).sort((a, b) => a[0].localeCompare(b[0]));

    return {
      labels: sorted.map(([date]) => format(new Date(date), 'MMM d')),
      workouts: sorted.map(([, data]) => data.count),
      avgDuration: sorted.map(([, data]) =>
        data.count > 0 ? Math.round(data.totalDuration / data.count) : 0
      ),
    };
  }

  /**
   * Get compliance trends
   */
  private static getComplianceTrends(startDate: Date, endDate: Date, days: number) {
    const labels: string[] = [];
    const complianceRate: number[] = [];

    // Group by week
    const weeksCount = Math.ceil(days / 7);

    for (let i = 0; i < weeksCount; i++) {
      const weekEnd = subDays(endDate, i * 7);
      const weekStart = subDays(weekEnd, 7);

      const complianceDays = this.getComplianceDays(weekStart, weekEnd);
      const compliantCount = complianceDays.filter(d => d.overallCompliance >= 70).length;

      labels.unshift(format(weekStart, 'MMM d'));
      complianceRate.unshift(Math.round((compliantCount / 7) * 100));
    }

    return { labels, complianceRate };
  }

  /**
   * Get compliance days
   */
  static getComplianceDays(startDate: Date, endDate: Date): ComplianceDay[] {
    const dailyData = DailyNutritionRepository.getByDateRange(startDate, endDate);
    const nutritionGoals = NutritionGoalsRepository.get();
    const workouts = WorkoutLogRepository.getByDateRange(startDate, endDate);
    const mealLogs = MealLogRepository.getByDateRange(startDate, endDate);

    const complianceDays: ComplianceDay[] = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = format(d, 'yyyy-MM-dd');
      const nutrition = dailyData.find(n => format(n.date, 'yyyy-MM-dd') === dateStr);
      const hasWorkout = workouts.some(w => format(w.date, 'yyyy-MM-dd') === dateStr);
      const mealsCount = mealLogs.filter(m => format(m.date, 'yyyy-MM-dd') === dateStr).length;

      const caloriesGoalMet =
        nutrition && nutritionGoals
          ? Math.abs(nutrition.totalCalories - nutritionGoals.dailyCalories) <=
            nutritionGoals.dailyCalories * 0.1
          : false;

      const proteinGoalMet =
        nutrition && nutritionGoals
          ? nutrition.totalProtein >= nutritionGoals.dailyProtein * 0.9
          : false;

      let compliance = 0;
      if (caloriesGoalMet) compliance += 40;
      if (proteinGoalMet) compliance += 30;
      if (hasWorkout) compliance += 20;
      if (mealsCount >= 3) compliance += 10;

      complianceDays.push({
        date: new Date(d),
        caloriesGoalMet,
        proteinGoalMet,
        workoutCompleted: hasWorkout,
        mealsLogged: mealsCount,
        overallCompliance: compliance,
      });
    }

    return complianceDays;
  }

  /**
   * Calculate correlations
   */
  private static calculateCorrelations(startDate: Date, endDate: Date) {
    const weightLogs = WeightLogRepository.getByDateRange(startDate, endDate);
    const nutritionData = DailyNutritionRepository.getByDateRange(startDate, endDate);

    // Weight vs Calories correlation
    const weightVsCalories = this.calculatePearsonCorrelation(
      weightLogs.map(w => w.weight),
      weightLogs.map(w => {
        const nutrition = nutritionData.find(
          n => format(n.date, 'yyyy-MM-dd') === format(w.date, 'yyyy-MM-dd')
        );
        return nutrition?.totalCalories || 0;
      })
    );

    return {
      weightVsCalories: parseFloat(weightVsCalories.toFixed(2)),
    };
  }

  /**
   * Calculate Pearson correlation coefficient
   */
  private static calculatePearsonCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Get weekly insights data (for AI generation)
   */
  static getWeeklyInsightsData(weekStart: Date, weekEnd: Date) {
    const nutritionData = DailyNutritionRepository.getByDateRange(weekStart, weekEnd);
    const workouts = WorkoutLogRepository.getByDateRange(weekStart, weekEnd);
    const complianceDays = this.getComplianceDays(weekStart, weekEnd);
    const weightChange = WeightLogRepository.getWeightChange(weekStart, weekEnd);

    const avgCalories =
      nutritionData.length > 0
        ? Math.round(
            nutritionData.reduce((sum, d) => sum + d.totalCalories, 0) / nutritionData.length
          )
        : 0;

    const avgProtein =
      nutritionData.length > 0
        ? Math.round(
            nutritionData.reduce((sum, d) => sum + d.totalProtein, 0) / nutritionData.length
          )
        : 0;

    const complianceCount = complianceDays.filter(d => d.overallCompliance >= 70).length;
    const compliancePercentage = Math.round((complianceCount / 7) * 100);

    return {
      period: `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`,
      avgCalories,
      avgProtein,
      workoutsDone: workouts.length,
      compliance: compliancePercentage,
      weightChange,
    };
  }
}
