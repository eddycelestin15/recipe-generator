import { NextRequest, NextResponse } from 'next/server';
import { ExerciseRepository } from '@/app/lib/repositories/exercise-repository';

// GET /api/exercises/metadata - Get metadata like available equipment, muscle groups
export async function GET(request: NextRequest) {
  try {
    const equipment = ExerciseRepository.getAllEquipment();
    const muscleGroups = ExerciseRepository.getAllMuscleGroups();

    return NextResponse.json({
      equipment,
      muscleGroups,
      categories: ['cardio', 'strength', 'flexibility', 'sport'],
      difficulties: ['beginner', 'intermediate', 'advanced'],
    });
  } catch (error) {
    console.error('Failed to fetch exercise metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
}
