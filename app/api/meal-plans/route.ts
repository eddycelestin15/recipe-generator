/**
 * Meal Plans API Routes
 *
 * GET /api/meal-plans - Get all meal plans or filter by week
 * POST /api/meal-plans - Create a new meal plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { MealPlanRepository } from '@/app/lib/repositories/meal-plan-repository';
import type { CreateMealPlanDTO } from '@/app/lib/types/meal-plan';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get('weekStart');
    const active = searchParams.get('active');

    if (weekStart) {
      // Get meal plan for specific week
      const mealPlan = MealPlanRepository.getByWeek(new Date(weekStart));
      return NextResponse.json(mealPlan);
    }

    if (active === 'true') {
      // Get active meal plan
      const mealPlan = MealPlanRepository.getActive();
      return NextResponse.json(mealPlan);
    }

    // Get all meal plans
    const mealPlans = MealPlanRepository.getAll();
    return NextResponse.json(mealPlans);
  } catch (error) {
    console.error('Error fetching meal plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meal plans' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateMealPlanDTO = await request.json();

    if (!body.weekStart) {
      return NextResponse.json(
        { error: 'weekStart is required' },
        { status: 400 }
      );
    }

    const mealPlan = MealPlanRepository.create(body);
    return NextResponse.json(mealPlan, { status: 201 });
  } catch (error) {
    console.error('Error creating meal plan:', error);
    return NextResponse.json(
      { error: 'Failed to create meal plan' },
      { status: 500 }
    );
  }
}
