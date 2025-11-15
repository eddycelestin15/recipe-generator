import { NextRequest, NextResponse } from 'next/server';
import { ExerciseRepository } from '@/app/lib/repositories/exercise-repository';
import type { CreateExerciseDTO, ExerciseFilter } from '@/app/lib/types/fitness';

// GET /api/exercises - Get all exercises or search with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const muscleGroup = searchParams.get('muscleGroup');
    const equipment = searchParams.get('equipment');
    const searchTerm = searchParams.get('search');
    const customOnly = searchParams.get('customOnly') === 'true';

    // If no filters, return all exercises
    if (!category && !difficulty && !muscleGroup && !equipment && !searchTerm && !customOnly) {
      const exercises = ExerciseRepository.getAll();
      return NextResponse.json(exercises);
    }

    // Apply filters
    if (customOnly) {
      const exercises = ExerciseRepository.getCustomExercises();
      return NextResponse.json(exercises);
    }

    const filter: ExerciseFilter = {
      category: category as any,
      difficulty: difficulty as any,
      muscleGroup: muscleGroup || undefined,
      equipment: equipment || undefined,
      searchTerm: searchTerm || undefined,
    };

    const exercises = ExerciseRepository.search(filter);
    return NextResponse.json(exercises);
  } catch (error) {
    console.error('Failed to fetch exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}

// POST /api/exercises - Create a new custom exercise
export async function POST(request: NextRequest) {
  try {
    const body: CreateExerciseDTO = await request.json();

    // Validate required fields
    if (!body.name || !body.description || !body.category || !body.equipment || !body.difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (body.caloriesPerMinute < 0) {
      return NextResponse.json(
        { error: 'Calories per minute must be positive' },
        { status: 400 }
      );
    }

    const exercise = ExerciseRepository.create(body);
    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error('Failed to create exercise:', error);
    return NextResponse.json(
      { error: 'Failed to create exercise' },
      { status: 500 }
    );
  }
}
