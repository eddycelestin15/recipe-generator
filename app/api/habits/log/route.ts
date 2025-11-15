import { NextRequest, NextResponse } from 'next/server';
import { HabitLogRepository } from '@/app/lib/repositories/habit-log-repository';
import { HabitRepository } from '@/app/lib/repositories/habit-repository';
import { AchievementService } from '@/app/lib/services/achievement-service';
import { LogHabitDTO, Achievement } from '@/app/lib/types/habits';

/**
 * POST /api/habits/log - Log a habit completion
 */
export async function POST(request: NextRequest) {
  try {
    const body: LogHabitDTO = await request.json();

    // Validation
    if (!body.habitId || !body.date || body.completed === undefined) {
      return NextResponse.json(
        { error: 'habitId, date, and completed are required' },
        { status: 400 }
      );
    }

    // Verify habit exists
    const habit = HabitRepository.getById(body.habitId);
    if (!habit) {
      return NextResponse.json(
        { error: 'Habit not found' },
        { status: 404 }
      );
    }

    // Validate number type has value
    if (habit.type === 'number' && body.completed && body.value === undefined) {
      return NextResponse.json(
        { error: 'Value is required for number type habits' },
        { status: 400 }
      );
    }

    // Create/update log
    const log = HabitLogRepository.log({
      habitId: body.habitId,
      date: new Date(body.date),
      completed: body.completed,
      value: body.value,
      notes: body.notes,
    });

    // Check for new achievements if habit was completed
    let newAchievements: Achievement[] = [];
    if (body.completed) {
      newAchievements = AchievementService.checkAndUnlock(body.habitId);
    }

    return NextResponse.json({
      log,
      newAchievements,
    }, { status: 201 });
  } catch (error) {
    console.error('Error logging habit:', error);
    return NextResponse.json(
      { error: 'Failed to log habit' },
      { status: 500 }
    );
  }
}
