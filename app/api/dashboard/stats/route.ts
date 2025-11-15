/**
 * Dashboard Stats API Route
 * GET /api/dashboard/stats - Get user global stats
 */

import { NextResponse } from 'next/server';
import { UserStatsRepository } from '@/app/lib/repositories/user-stats-repository';
import { HealthGoalRepository } from '@/app/lib/repositories/health-goal-repository';
import { WeightLogRepository } from '@/app/lib/repositories/weight-log-repository';

export async function GET() {
  try {
    const stats = UserStatsRepository.get();
    const activeGoals = HealthGoalRepository.getActive();
    const completedGoals = HealthGoalRepository.getByStatus('completed');
    const unlockedAchievements = UserStatsRepository.getUnlockedAchievements();
    const lockedAchievements = UserStatsRepository.getLockedAchievements();

    // Get weight progress
    const latestWeight = WeightLogRepository.getLatest();
    const weightGoal = activeGoals.find(g => g.category === 'weight');

    return NextResponse.json({
      stats,
      goals: {
        active: activeGoals.length,
        completed: completedGoals.length,
        activeGoals,
      },
      achievements: {
        unlocked: unlockedAchievements.length,
        total: unlockedAchievements.length + lockedAchievements.length,
        recent: unlockedAchievements.slice(0, 3),
      },
      weight: {
        current: latestWeight?.weight,
        goal: weightGoal?.targetValue,
        progress: weightGoal ? HealthGoalRepository.getProgressPercentage(weightGoal.id) : null,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
