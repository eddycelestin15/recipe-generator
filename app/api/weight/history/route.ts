/**
 * Weight History API Route
 * GET /api/weight/history?days=30 - Get weight history
 */

import { NextResponse } from 'next/server';
import { WeightLogRepository } from '@/app/lib/repositories/weight-log-repository';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);

    if (days <= 0 || days > 365) {
      return NextResponse.json(
        { error: 'Days must be between 1 and 365' },
        { status: 400 }
      );
    }

    const weightLogs = WeightLogRepository.getLastNDays(days);

    // Calculate additional stats
    const latest = WeightLogRepository.getLatest();
    const averageWeight = WeightLogRepository.getAverageWeight(
      new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      new Date()
    );
    const weightChange = WeightLogRepository.getWeightChange(
      new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      new Date()
    );

    return NextResponse.json({
      logs: weightLogs,
      stats: {
        currentWeight: latest?.weight,
        currentBMI: latest?.bmi,
        averageWeight,
        weightChange,
        totalEntries: weightLogs.length,
      },
    });
  } catch (error) {
    console.error('Error fetching weight history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weight history' },
      { status: 500 }
    );
  }
}
