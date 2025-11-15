/**
 * User Profile API Routes
 * GET /api/nutrition/profile - Get user profile
 * POST /api/nutrition/profile - Create/update user profile
 */

import { NextResponse } from 'next/server';
import { UserProfileRepository } from '@/app/lib/repositories/user-profile-repository';
import { NutritionGoalsRepository } from '@/app/lib/repositories/nutrition-goals-repository';
import { calculateNutritionGoals } from '@/app/lib/utils/nutrition-calculator';
import type { CreateUserProfileDTO, UpdateUserProfileDTO } from '@/app/lib/types/nutrition';

export async function GET() {
  try {
    const profile = UserProfileRepository.get();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Check if profile exists
    const existingProfile = UserProfileRepository.get();

    let profile;
    if (existingProfile) {
      // Update existing profile
      profile = UserProfileRepository.update(data as UpdateUserProfileDTO);
    } else {
      // Create new profile
      profile = UserProfileRepository.create(data as CreateUserProfileDTO);
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'Failed to save profile' },
        { status: 500 }
      );
    }

    // Recalculate nutrition goals based on new profile
    const goals = calculateNutritionGoals(profile);
    NutritionGoalsRepository.save(goals);

    return NextResponse.json({
      profile,
      goals,
    });
  } catch (error) {
    console.error('Error saving profile:', error);
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    );
  }
}
