/**
 * Meal Plan Generation API
 *
 * POST /api/meal-plans/generate
 * Generates a weekly meal plan using Gemini AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { MealPlanService } from '@/app/lib/services/meal-plan-service';
import type { MealPlanGenerationRequest } from '@/app/lib/types/meal-plan';
import { getWeekStart } from '@/app/lib/types/meal-plan';

export async function POST(request: NextRequest) {
  try {
    const body: MealPlanGenerationRequest = await request.json();

    if (!body.weekStart) {
      return NextResponse.json(
        { error: 'weekStart is required' },
        { status: 400 }
      );
    }

    if (!body.criteria) {
      return NextResponse.json(
        { error: 'criteria is required' },
        { status: 400 }
      );
    }

    const weekStart = getWeekStart(new Date(body.weekStart));
    const days = await MealPlanService.generateWeeklyPlan(
      weekStart,
      body.criteria
    );

    return NextResponse.json({
      weekStart,
      days,
      success: true,
    });
  } catch (error) {
    console.error('Error generating meal plan:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate meal plan',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
