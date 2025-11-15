/**
 * Meal Slot Update API
 *
 * PUT /api/meal-plans/[id]/slot
 * Updates a specific meal slot in a meal plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { MealPlanRepository } from '@/app/lib/repositories/meal-plan-repository';
import type { UpdateMealSlotDTO } from '@/app/lib/types/meal-plan';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateMealSlotDTO = await request.json();

    if (!body.date || !body.mealType) {
      return NextResponse.json(
        { error: 'date and mealType are required' },
        { status: 400 }
      );
    }

    const mealPlan = MealPlanRepository.updateMealSlot(id, body);

    if (!mealPlan) {
      return NextResponse.json(
        { error: 'Meal plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(mealPlan);
  } catch (error) {
    console.error('Error updating meal slot:', error);
    return NextResponse.json(
      { error: 'Failed to update meal slot' },
      { status: 500 }
    );
  }
}
