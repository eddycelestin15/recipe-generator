/**
 * Meal Logs API Routes
 * POST /api/meals - Create a new meal log
 * GET /api/meals - Get all meal logs or filter by date
 */

import { NextResponse } from 'next/server';
import { MealLogRepository } from '@/app/lib/repositories/meal-log-repository';
import type { CreateMealLogDTO } from '@/app/lib/types/nutrition';

export async function POST(request: Request) {
  try {
    const data: CreateMealLogDTO = await request.json();

    // Validate required fields
    if (!data.date || !data.mealType || data.servings === undefined) {
      return NextResponse.json(
        { error: 'Date, mealType, and servings are required' },
        { status: 400 }
      );
    }

    // Validate that either recipeId or customFood is provided
    if (!data.recipeId && !data.customFood) {
      return NextResponse.json(
        { error: 'Either recipeId or customFood must be provided' },
        { status: 400 }
      );
    }

    // Create meal log
    const mealLog = MealLogRepository.create(data);

    return NextResponse.json(mealLog, { status: 201 });
  } catch (error) {
    console.error('Error creating meal log:', error);
    return NextResponse.json(
      { error: 'Failed to create meal log' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (date) {
      const targetDate = new Date(date);

      if (isNaN(targetDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format' },
          { status: 400 }
        );
      }

      const meals = MealLogRepository.getByDate(targetDate);
      return NextResponse.json(meals);
    }

    // Return all meals if no date specified
    const meals = MealLogRepository.getAll();
    return NextResponse.json(meals);
  } catch (error) {
    console.error('Error fetching meal logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meal logs' },
      { status: 500 }
    );
  }
}
