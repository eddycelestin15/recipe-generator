import { NextRequest, NextResponse } from 'next/server';
import { WorkoutLogRepository } from '@/app/lib/repositories/workout-log-repository';

// GET /api/workouts/progress?exerciseId=... - Get exercise progress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const exerciseId = searchParams.get('exerciseId');

    if (!exerciseId) {
      return NextResponse.json(
        { error: 'exerciseId is required' },
        { status: 400 }
      );
    }

    const progress = WorkoutLogRepository.getExerciseProgress(exerciseId);
    return NextResponse.json(progress);
  } catch (error) {
    console.error('Failed to fetch exercise progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercise progress' },
      { status: 500 }
    );
  }
}
