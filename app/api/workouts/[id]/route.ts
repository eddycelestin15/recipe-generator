import { NextRequest, NextResponse } from 'next/server';
import { WorkoutLogRepository } from '@/app/lib/repositories/workout-log-repository';
import type { UpdateWorkoutLogDTO } from '@/app/lib/types/fitness';

// GET /api/workouts/[id] - Get a single workout log by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const log = WorkoutLogRepository.getById(id);

    if (!log) {
      return NextResponse.json(
        { error: 'Workout log not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(log);
  } catch (error) {
    console.error('Failed to fetch workout log:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout log' },
      { status: 500 }
    );
  }
}

// PUT /api/workouts/[id] - Update a workout log
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateWorkoutLogDTO = await request.json();

    const updatedLog = WorkoutLogRepository.update(id, body);

    if (!updatedLog) {
      return NextResponse.json(
        { error: 'Workout log not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedLog);
  } catch (error) {
    console.error('Failed to update workout log:', error);
    return NextResponse.json(
      { error: 'Failed to update workout log' },
      { status: 500 }
    );
  }
}

// DELETE /api/workouts/[id] - Delete a workout log
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = WorkoutLogRepository.delete(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Workout log not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete workout log:', error);
    return NextResponse.json(
      { error: 'Failed to delete workout log' },
      { status: 500 }
    );
  }
}
