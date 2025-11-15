import { NextRequest, NextResponse } from 'next/server';
import { RoutineRepository } from '@/app/lib/repositories/routine-repository';
import { HabitRepository } from '@/app/lib/repositories/habit-repository';
import { UpdateRoutineDTO } from '@/app/lib/types/habits';

/**
 * GET /api/daily-routines/[id] - Get a specific daily routine
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const routine = RoutineRepository.getById(id);

    if (!routine) {
      return NextResponse.json(
        { error: 'Routine not found' },
        { status: 404 }
      );
    }

    // Enrich with habit details
    const habits = routine.habitIds
      .map(habitId => HabitRepository.getById(habitId))
      .filter(h => h !== null);

    return NextResponse.json({
      ...routine,
      habits,
    });
  } catch (error) {
    console.error('Error fetching daily routine:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily routine' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/daily-routines/[id] - Update a daily routine
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateRoutineDTO = await request.json();

    // Verify habits exist if provided
    if (body.habitIds && body.habitIds.length > 0) {
      const validHabits = body.habitIds.every(habitId =>
        HabitRepository.getById(habitId) !== null
      );
      if (!validHabits) {
        return NextResponse.json(
          { error: 'One or more habit IDs are invalid' },
          { status: 400 }
        );
      }
    }

    const routine = RoutineRepository.update(id, body);

    if (!routine) {
      return NextResponse.json(
        { error: 'Routine not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(routine);
  } catch (error) {
    console.error('Error updating daily routine:', error);
    return NextResponse.json(
      { error: 'Failed to update daily routine' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/daily-routines/[id] - Delete a daily routine
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = RoutineRepository.delete(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Routine not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Routine deleted successfully' });
  } catch (error) {
    console.error('Error deleting daily routine:', error);
    return NextResponse.json(
      { error: 'Failed to delete daily routine' },
      { status: 500 }
    );
  }
}
