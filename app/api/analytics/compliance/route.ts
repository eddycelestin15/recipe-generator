/**
 * Analytics Compliance API Route
 * GET /api/analytics/compliance?days=7 - Get compliance data
 */

import { NextResponse } from 'next/server';
import { HealthAnalyticsService } from '@/app/lib/services/health-analytics-service';
import { subDays } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7', 10);

    if (days <= 0 || days > 90) {
      return NextResponse.json(
        { error: 'Days must be between 1 and 90' },
        { status: 400 }
      );
    }

    const endDate = new Date();
    const startDate = subDays(endDate, days);

    const complianceDays = HealthAnalyticsService.getComplianceDays(startDate, endDate);

    const totalDays = complianceDays.length;
    const compliantDays = complianceDays.filter(d => d.overallCompliance >= 70).length;
    const complianceRate = totalDays > 0 ? Math.round((compliantDays / totalDays) * 100) : 0;

    return NextResponse.json({
      complianceDays,
      summary: {
        totalDays,
        compliantDays,
        complianceRate,
        avgCompliance: Math.round(
          complianceDays.reduce((sum, d) => sum + d.overallCompliance, 0) / totalDays
        ),
      },
    });
  } catch (error) {
    console.error('Error fetching compliance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compliance data' },
      { status: 500 }
    );
  }
}
