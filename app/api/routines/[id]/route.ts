import { NextRequest, NextResponse } from 'next/server';
import { WorkoutRoutineRepository } from '@/app/lib/repositories/workout-routine-repository';
import type { UpdateWorkoutRoutineDTO } from '@/app/lib/types/fitness';

// GET /api/routines/[id] - Get a single routine by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const routine = WorkoutRoutineRepository.getById(id);

    if (!routine) {
      return NextResponse.json(
        { error: 'Routine not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(routine);
  } catch (error) {
    console.error('Failed to fetch routine:', error);
    return NextResponse.json(
      { error: 'Failed to fetch routine' },
      { status: 500 }
    );
  }
}

// PUT /api/routines/[id] - Update a routine
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateWorkoutRoutineDTO = await request.json();

    const updatedRoutine = WorkoutRoutineRepository.update(id, body);

    if (!updatedRoutine) {
      return NextResponse.json(
        { error: 'Routine not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedRoutine);
  } catch (error: any) {
    console.error('Failed to update routine:', error);

    if (error.message === 'Cannot update template routines') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update routine' },
      { status: 500 }
    );
  }
}

// DELETE /api/routines/[id] - Delete a routine
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = WorkoutRoutineRepository.delete(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Routine not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete routine:', error);

    if (error.message === 'Cannot delete template routines') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete routine' },
      { status: 500 }
    );
  }
}
