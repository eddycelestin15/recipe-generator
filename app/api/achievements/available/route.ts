import { NextResponse } from 'next/server';
import { AchievementService } from '@/app/lib/services/achievement-service';

/**
 * GET /api/achievements/available - Get locked achievements (available to unlock)
 */
export async function GET() {
  try {
    const locked = AchievementService.getLocked();
    return NextResponse.json(locked);
  } catch (error) {
    console.error('Error fetching available achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available achievements' },
      { status: 500 }
    );
  }
}
