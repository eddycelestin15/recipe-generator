/**
 * Health Goal Details API Route
 * GET /api/goals/[id] - Get goal by ID
 * PATCH /api/goals/[id] - Update goal
 * DELETE /api/goals/[id] - Delete goal
 */

import { NextResponse } from 'next/server';
import { HealthGoalRepository } from '@/app/lib/repositories/health-goal-repository';
import type { UpdateHealthGoalDTO } from '@/app/lib/types/health-dashboard';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const goal = HealthGoalRepository.getById(id);

    if (!goal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    const progress = HealthGoalRepository.getProgressPercentage(id);
    const daysRemaining = HealthGoalRepository.getDaysRemaining(id);
    const achievedMilestones = HealthGoalRepository.getAchievedMilestones(id);
    const pendingMilestones = HealthGoalRepository.getPendingMilestones(id);

    return NextResponse.json({
      goal,
      progress,
      daysRemaining,
      milestones: {
        achieved: achievedMilestones,
        pending: pendingMilestones,
      },
    });
  } catch (error) {
    console.error('Error fetching goal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goal' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateHealthGoalDTO = await request.json();

    const updatedGoal = HealthGoalRepository.update(id, body);

    if (!updatedGoal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json(
      { error: 'Failed to update goal' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = HealthGoalRepository.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { error: 'Failed to delete goal' },
      { status: 500 }
    );
  }
}
