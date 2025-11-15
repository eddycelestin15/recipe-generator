import { NextRequest, NextResponse } from 'next/server';
import { WorkoutLogRepository } from '@/app/lib/repositories/workout-log-repository';

// GET /api/workouts/stats - Get workout statistics
export async function GET(request: NextRequest) {
  try {
    const stats = WorkoutLogRepository.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to fetch workout stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout stats' },
      { status: 500 }
    );
  }
}
