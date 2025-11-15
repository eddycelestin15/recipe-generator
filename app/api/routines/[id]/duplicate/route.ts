import { NextRequest, NextResponse } from 'next/server';
import { WorkoutRoutineRepository } from '@/app/lib/repositories/workout-routine-repository';

// POST /api/routines/[id]/duplicate - Duplicate a routine (useful for templates)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const newName = body.name;

    const duplicated = WorkoutRoutineRepository.duplicate(id, newName);

    if (!duplicated) {
      return NextResponse.json(
        { error: 'Routine not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(duplicated, { status: 201 });
  } catch (error) {
    console.error('Failed to duplicate routine:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate routine' },
      { status: 500 }
    );
  }
}
