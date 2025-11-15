import { NextRequest, NextResponse } from 'next/server';
import { WorkoutRoutineRepository } from '@/app/lib/repositories/workout-routine-repository';
import type { CreateWorkoutRoutineDTO } from '@/app/lib/types/fitness';

// GET /api/routines - Get all routines or filter by templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templatesOnly = searchParams.get('templatesOnly') === 'true';
    const userOnly = searchParams.get('userOnly') === 'true';

    if (templatesOnly) {
      const routines = WorkoutRoutineRepository.getTemplates();
      return NextResponse.json(routines);
    }

    if (userOnly) {
      const routines = WorkoutRoutineRepository.getUserRoutines();
      return NextResponse.json(routines);
    }

    const routines = WorkoutRoutineRepository.getAll();
    return NextResponse.json(routines);
  } catch (error) {
    console.error('Failed to fetch routines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch routines' },
      { status: 500 }
    );
  }
}

// POST /api/routines - Create a new workout routine
export async function POST(request: NextRequest) {
  try {
    const body: CreateWorkoutRoutineDTO = await request.json();

    // Validate required fields
    if (!body.name || !body.exercises || body.exercises.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields (name, exercises)' },
        { status: 400 }
      );
    }

    // Validate exercises
    for (const ex of body.exercises) {
      if (!ex.exerciseId || ex.sets < 1) {
        return NextResponse.json(
          { error: 'Invalid exercise configuration' },
          { status: 400 }
        );
      }
    }

    const routine = WorkoutRoutineRepository.create(body);
    return NextResponse.json(routine, { status: 201 });
  } catch (error) {
    console.error('Failed to create routine:', error);
    return NextResponse.json(
      { error: 'Failed to create routine' },
      { status: 500 }
    );
  }
}
