/**
 * Health Goals API Route
 * POST /api/goals - Create a new goal
 * GET /api/goals - Get all goals
 */

import { NextResponse } from 'next/server';
import { HealthGoalRepository } from '@/app/lib/repositories/health-goal-repository';
import type { CreateHealthGoalDTO } from '@/app/lib/types/health-dashboard';

export async function POST(request: Request) {
  try {
    const body: CreateHealthGoalDTO = await request.json();

    if (!body.category || !body.title || !body.targetValue || !body.unit || !body.targetDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const goal = HealthGoalRepository.create(body);

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    let goals;

    if (status) {
      goals = HealthGoalRepository.getByStatus(status as any);
    } else if (category) {
      goals = HealthGoalRepository.getByCategory(category as any);
    } else {
      goals = HealthGoalRepository.getAll();
    }

    return NextResponse.json({
      goals,
      total: goals.length,
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}
