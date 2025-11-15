/**
 * Water Intake API Routes
 * PATCH /api/nutrition/water - Update water intake
 */

import { NextResponse } from 'next/server';
import { DailyNutritionRepository } from '@/app/lib/repositories/daily-nutrition-repository';
import { NutritionGoalsRepository } from '@/app/lib/repositories/nutrition-goals-repository';

export async function PATCH(request: Request) {
  try {
    const { date, waterIntake } = await request.json();

    if (!date || waterIntake === undefined) {
      return NextResponse.json(
        { error: 'Date and waterIntake are required' },
        { status: 400 }
      );
    }

    const targetDate = new Date(date);

    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Get goals to ensure daily nutrition record exists
    const goals = NutritionGoalsRepository.get();

    if (!goals) {
      return NextResponse.json(
        { error: 'Nutrition goals not found' },
        { status: 404 }
      );
    }

    // Get or create daily nutrition
    DailyNutritionRepository.getOrCreateByDate(targetDate, {
      goalCalories: goals.dailyCalories,
      goalProtein: goals.dailyProtein,
      goalCarbs: goals.dailyCarbs,
      goalFat: goals.dailyFat,
    });

    // Update water intake
    const updated = DailyNutritionRepository.update(targetDate, {
      waterIntake: Number(waterIntake),
    });

    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update water intake' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating water intake:', error);
    return NextResponse.json(
      { error: 'Failed to update water intake' },
      { status: 500 }
    );
  }
}
