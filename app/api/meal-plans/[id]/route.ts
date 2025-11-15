/**
 * Meal Plan API Routes (by ID)
 *
 * GET /api/meal-plans/[id] - Get a specific meal plan
 * PUT /api/meal-plans/[id] - Update a meal plan
 * DELETE /api/meal-plans/[id] - Delete a meal plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { MealPlanRepository } from '@/app/lib/repositories/meal-plan-repository';
import type { UpdateMealPlanDTO } from '@/app/lib/types/meal-plan';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mealPlan = MealPlanRepository.getById(id);

    if (!mealPlan) {
      return NextResponse.json(
        { error: 'Meal plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(mealPlan);
  } catch (error) {
    console.error('Error fetching meal plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meal plan' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateMealPlanDTO = await request.json();
    const mealPlan = MealPlanRepository.update(id, body);

    if (!mealPlan) {
      return NextResponse.json(
        { error: 'Meal plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(mealPlan);
  } catch (error) {
    console.error('Error updating meal plan:', error);
    return NextResponse.json(
      { error: 'Failed to update meal plan' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = MealPlanRepository.delete(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Meal plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete meal plan' },
      { status: 500 }
    );
  }
}
