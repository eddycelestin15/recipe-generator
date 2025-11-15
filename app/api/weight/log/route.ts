/**
 * Weight Log API Route
 * POST /api/weight/log - Log a new weight entry
 */

import { NextResponse } from 'next/server';
import { WeightLogRepository } from '@/app/lib/repositories/weight-log-repository';
import { UserStatsRepository } from '@/app/lib/repositories/user-stats-repository';
import type { CreateWeightLogDTO } from '@/app/lib/types/health-dashboard';

export async function POST(request: Request) {
  try {
    const body: CreateWeightLogDTO = await request.json();

    // Validate input
    if (!body.date || !body.weight) {
      return NextResponse.json(
        { error: 'Date and weight are required' },
        { status: 400 }
      );
    }

    if (body.weight <= 0 || body.weight > 500) {
      return NextResponse.json(
        { error: 'Invalid weight value' },
        { status: 400 }
      );
    }

    // Create weight log
    const weightLog = WeightLogRepository.create(body);

    // Update user stats (for streak tracking)
    UserStatsRepository.updateStreak();

    return NextResponse.json(weightLog, { status: 201 });
  } catch (error) {
    console.error('Error logging weight:', error);
    return NextResponse.json(
      { error: 'Failed to log weight' },
      { status: 500 }
    );
  }
}
