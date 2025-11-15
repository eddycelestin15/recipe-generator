import { NextRequest, NextResponse } from 'next/server';
import { WorkoutLogRepository } from '@/app/lib/repositories/workout-log-repository';
import type { WorkoutHistoryFilter } from '@/app/lib/types/fitness';

// GET /api/workouts/history - Get workout history with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const routineId = searchParams.get('routineId');
    const category = searchParams.get('category');

    const filter: WorkoutHistoryFilter = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      routineId: routineId || undefined,
      category: category as any,
    };

    const history = WorkoutLogRepository.search(filter);
    return NextResponse.json(history);
  } catch (error) {
    console.error('Failed to fetch workout history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout history' },
      { status: 500 }
    );
  }
}
