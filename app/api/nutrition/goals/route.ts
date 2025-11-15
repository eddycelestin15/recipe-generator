/**
 * Nutrition Goals API Routes
 * GET /api/nutrition/goals - Get current nutrition goals
 * POST /api/nutrition/goals - Calculate and save nutrition goals
 */

import { NextResponse } from 'next/server';
import { UserProfileRepository } from '@/app/lib/repositories/user-profile-repository';
import { NutritionGoalsRepository } from '@/app/lib/repositories/nutrition-goals-repository';
import { calculateNutritionGoals } from '@/app/lib/utils/nutrition-calculator';

export async function GET() {
  try {
    const goals = NutritionGoalsRepository.get();

    if (!goals) {
      return NextResponse.json(
        { error: 'Goals not found. Please create a profile first.' },
        { status: 404 }
      );
    }

    return NextResponse.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Get user profile
    const profile = UserProfileRepository.get();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found. Please create a profile first.' },
        { status: 404 }
      );
    }

    // Calculate goals
    const goalsData = calculateNutritionGoals(profile);

    // Save goals
    const goals = NutritionGoalsRepository.save(goalsData);

    return NextResponse.json(goals);
  } catch (error) {
    console.error('Error calculating goals:', error);
    return NextResponse.json(
      { error: 'Failed to calculate goals' },
      { status: 500 }
    );
  }
}
