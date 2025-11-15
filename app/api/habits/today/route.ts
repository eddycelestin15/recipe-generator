import { NextResponse } from 'next/server';
import { HabitStatsService } from '@/app/lib/services/habit-stats-service';
import { TodayHabitsResponse } from '@/app/lib/types/habits';

/**
 * GET /api/habits/today - Get today's habit checklist
 */
export async function GET() {
  try {
    const todayHabits = HabitStatsService.getTodayHabits();
    const completionRate = HabitStatsService.getTodayCompletionRate();
    const streak = HabitStatsService.getOverallStreak();

    const response: TodayHabitsResponse = {
      date: new Date(),
      habits: todayHabits,
      completionRate,
      streak,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching today\'s habits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch today\'s habits' },
      { status: 500 }
    );
  }
}
