import { NextResponse } from 'next/server';
import { AchievementService } from '@/app/lib/services/achievement-service';
import { UserAchievementRepository } from '@/app/lib/repositories/user-achievement-repository';

/**
 * GET /api/achievements - Get user's achievements with progress
 */
export async function GET() {
  try {
    const achievementsWithProgress = AchievementService.getAllWithProgress();
    const userAchievement = UserAchievementRepository.get();

    return NextResponse.json({
      achievements: achievementsWithProgress,
      totalPoints: userAchievement.totalPoints,
      level: userAchievement.level,
      pointsForNextLevel: UserAchievementRepository.getPointsForNextLevel(),
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}
