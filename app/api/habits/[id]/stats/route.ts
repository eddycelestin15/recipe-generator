import { NextRequest, NextResponse } from 'next/server';
import { HabitRepository } from '@/app/lib/repositories/habit-repository';
import { HabitStatsService } from '@/app/lib/services/habit-stats-service';

/**
 * GET /api/habits/[id]/stats - Get statistics for a specific habit
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify habit exists
    const habit = HabitRepository.getById(id);
    if (!habit) {
      return NextResponse.json(
        { error: 'Habit not found' },
        { status: 404 }
      );
    }

    // Get stats
    const stats = HabitStatsService.getStats(id);

    return NextResponse.json({
      habit,
      stats,
    });
  } catch (error) {
    console.error('Error fetching habit stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch habit stats' },
      { status: 500 }
    );
  }
}
