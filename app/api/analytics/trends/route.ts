/**
 * Analytics Trends API Route
 * GET /api/analytics/trends?period=month - Get analytics trends
 */

import { NextResponse } from 'next/server';
import { HealthAnalyticsService } from '@/app/lib/services/health-analytics-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || 'month') as 'week' | 'month' | 'quarter' | 'year';

    const validPeriods = ['week', 'month', 'quarter', 'year'];
    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Must be: week, month, quarter, or year' },
        { status: 400 }
      );
    }

    const trends = HealthAnalyticsService.getAnalyticsTrends(period);

    return NextResponse.json(trends);
  } catch (error) {
    console.error('Error fetching analytics trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics trends' },
      { status: 500 }
    );
  }
}
