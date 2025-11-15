/**
 * Daily Nutrition API Routes
 * GET /api/nutrition/daily/[date] - Get daily nutrition stats
 */

import { NextResponse } from 'next/server';
import { DailyNutritionRepository } from '@/app/lib/repositories/daily-nutrition-repository';
import { MealLogRepository } from '@/app/lib/repositories/meal-log-repository';
import { NutritionGoalsRepository } from '@/app/lib/repositories/nutrition-goals-repository';
import { RecipeRepository } from '@/app/lib/repositories/recipe-repository';
import { calculateTotalNutrition, calculateProgress } from '@/app/lib/utils/nutrition-calculator';
import type { DailyNutritionStats } from '@/app/lib/types/nutrition';

export async function GET(
  request: Request,
  { params }: { params: { date: string } }
) {
  try {
    const date = new Date(params.date);

    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Get nutrition goals
    const goals = NutritionGoalsRepository.get();

    if (!goals) {
      return NextResponse.json(
        { error: 'Nutrition goals not found. Please create a profile first.' },
        { status: 404 }
      );
    }

    // Get or create daily nutrition record
    const dailyNutrition = DailyNutritionRepository.getOrCreateByDate(date, {
      goalCalories: goals.dailyCalories,
      goalProtein: goals.dailyProtein,
      goalCarbs: goals.dailyCarbs,
      goalFat: goals.dailyFat,
    });

    // Get meal logs for the day
    const mealLogs = MealLogRepository.getByDate(date);

    // Calculate totals from meal logs
    const mealsWithNutrition = mealLogs.map(meal => {
      if (meal.customFood) {
        return {
          ...meal.customFood,
          servings: meal.servings,
        };
      } else if (meal.recipeId) {
        const recipe = RecipeRepository.getById(meal.recipeId);
        if (recipe) {
          return {
            calories: recipe.nutritionInfo.calories / recipe.servings,
            protein: recipe.nutritionInfo.protein / recipe.servings,
            carbs: recipe.nutritionInfo.carbs / recipe.servings,
            fat: recipe.nutritionInfo.fat / recipe.servings,
            fiber: recipe.nutritionInfo.fiber || 0 / recipe.servings,
            servings: meal.servings,
          };
        }
      }
      return null;
    }).filter((m): m is NonNullable<typeof m> => m !== null);

    const totals = calculateTotalNutrition(mealsWithNutrition);

    // Update daily nutrition record
    const updatedDaily = DailyNutritionRepository.update(date, {
      totalCalories: totals.totalCalories,
      totalProtein: totals.totalProtein,
      totalCarbs: totals.totalCarbs,
      totalFat: totals.totalFat,
      totalFiber: totals.totalFiber,
      mealsLogged: mealLogs.length,
    });

    // Calculate progress
    const stats: DailyNutritionStats = {
      calories: calculateProgress(totals.totalCalories, goals.dailyCalories),
      protein: calculateProgress(totals.totalProtein, goals.dailyProtein),
      carbs: calculateProgress(totals.totalCarbs, goals.dailyCarbs),
      fat: calculateProgress(totals.totalFat, goals.dailyFat),
      waterIntake: updatedDaily?.waterIntake || 0,
      mealsLogged: mealLogs,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching daily nutrition:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily nutrition' },
      { status: 500 }
    );
  }
}
