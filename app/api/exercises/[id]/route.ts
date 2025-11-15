import { NextRequest, NextResponse } from 'next/server';
import { ExerciseRepository } from '@/app/lib/repositories/exercise-repository';
import type { UpdateExerciseDTO } from '@/app/lib/types/fitness';

// GET /api/exercises/[id] - Get a single exercise by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const exercise = ExerciseRepository.getById(id);

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(exercise);
  } catch (error) {
    console.error('Failed to fetch exercise:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercise' },
      { status: 500 }
    );
  }
}

// PUT /api/exercises/[id] - Update an exercise
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateExerciseDTO = await request.json();

    const updatedExercise = ExerciseRepository.update(id, body);

    if (!updatedExercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedExercise);
  } catch (error: any) {
    console.error('Failed to update exercise:', error);

    if (error.message === 'Cannot update predefined exercises') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update exercise' },
      { status: 500 }
    );
  }
}

// DELETE /api/exercises/[id] - Delete an exercise
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = ExerciseRepository.delete(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete exercise:', error);

    if (error.message === 'Cannot delete predefined exercises') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete exercise' },
      { status: 500 }
    );
  }
}
