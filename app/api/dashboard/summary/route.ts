/**
 * Dashboard Summary API Route
 * GET /api/dashboard/summary - Get today's dashboard summary
 */

import { NextResponse } from 'next/server';
import { HealthAnalyticsService } from '@/app/lib/services/health-analytics-service';

export async function GET() {
  try {
    const summary = HealthAnalyticsService.getDashboardSummary();
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard summary' },
      { status: 500 }
    );
  }
}
