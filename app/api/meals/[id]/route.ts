/**
 * Individual Meal Log API Routes
 * GET /api/meals/[id] - Get a specific meal log
 * PATCH /api/meals/[id] - Update a meal log
 * DELETE /api/meals/[id] - Delete a meal log
 */

import { NextResponse } from 'next/server';
import { MealLogRepository } from '@/app/lib/repositories/meal-log-repository';
import type { UpdateMealLogDTO } from '@/app/lib/types/nutrition';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const meal = MealLogRepository.getById(params.id);

    if (!meal) {
      return NextResponse.json(
        { error: 'Meal log not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(meal);
  } catch (error) {
    console.error('Error fetching meal log:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meal log' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data: UpdateMealLogDTO = await request.json();

    const updatedMeal = MealLogRepository.update(params.id, data);

    if (!updatedMeal) {
      return NextResponse.json(
        { error: 'Meal log not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedMeal);
  } catch (error) {
    console.error('Error updating meal log:', error);
    return NextResponse.json(
      { error: 'Failed to update meal log' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const success = MealLogRepository.delete(params.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Meal log not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting meal log:', error);
    return NextResponse.json(
      { error: 'Failed to delete meal log' },
      { status: 500 }
    );
  }
}
