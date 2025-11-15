import { NextRequest, NextResponse } from 'next/server';
import { RoutineRepository } from '@/app/lib/repositories/routine-repository';
import { HabitRepository } from '@/app/lib/repositories/habit-repository';
import { CreateRoutineDTO, RoutineWithHabits } from '@/app/lib/types/habits';

/**
 * GET /api/daily-routines - Get all daily routines for the current user
 */
export async function GET() {
  try {
    const routines = RoutineRepository.getAll();

    // Enrich routines with habit details
    const routinesWithHabits: RoutineWithHabits[] = routines.map(routine => {
      const habits = routine.habitIds
        .map(id => HabitRepository.getById(id))
        .filter(h => h !== null) as any[];

      return {
        ...routine,
        habits,
      };
    });

    return NextResponse.json(routinesWithHabits);
  } catch (error) {
    console.error('Error fetching daily routines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily routines' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/daily-routines - Create a new daily routine
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateRoutineDTO = await request.json();

    // Validation
    if (!body.name || !body.type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    // Verify habits exist
    if (body.habitIds && body.habitIds.length > 0) {
      const validHabits = body.habitIds.every(id => HabitRepository.getById(id) !== null);
      if (!validHabits) {
        return NextResponse.json(
          { error: 'One or more habit IDs are invalid' },
          { status: 400 }
        );
      }
    }

    const routine = RoutineRepository.create(body);

    return NextResponse.json(routine, { status: 201 });
  } catch (error) {
    console.error('Error creating daily routine:', error);
    return NextResponse.json(
      { error: 'Failed to create daily routine' },
      { status: 500 }
    );
  }
}
