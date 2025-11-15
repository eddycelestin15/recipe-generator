import { NextRequest, NextResponse } from 'next/server';
import { WorkoutLogRepository } from '@/app/lib/repositories/workout-log-repository';
import type { CreateWorkoutLogDTO } from '@/app/lib/types/fitness';

// GET /api/workouts - Get all workout logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (date) {
      const logs = WorkoutLogRepository.getByDate(new Date(date));
      return NextResponse.json(logs);
    }

    const logs = WorkoutLogRepository.getAll();
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Failed to fetch workout logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout logs' },
      { status: 500 }
    );
  }
}

// POST /api/workouts - Create a new workout log
export async function POST(request: NextRequest) {
  try {
    const body: CreateWorkoutLogDTO = await request.json();

    // Validate required fields
    if (!body.exercises || body.exercises.length === 0) {
      return NextResponse.json(
        { error: 'At least one exercise is required' },
        { status: 400 }
      );
    }

    if (body.totalDuration < 0 || body.totalCalories < 0) {
      return NextResponse.json(
        { error: 'Duration and calories must be positive' },
        { status: 400 }
      );
    }

    const log = WorkoutLogRepository.create(body);
    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('Failed to create workout log:', error);
    return NextResponse.json(
      { error: 'Failed to create workout log' },
      { status: 500 }
    );
  }
}
