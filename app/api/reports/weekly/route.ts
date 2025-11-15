/**
 * Weekly Report API Route
 * GET /api/reports/weekly?date=2025-11-15 - Get weekly report
 */

import { NextResponse } from 'next/server';
import { startOfWeek, endOfWeek } from 'date-fns';
import { WeeklySummaryRepository } from '@/app/lib/repositories/weekly-summary-repository';
import { HealthAnalyticsService } from '@/app/lib/services/health-analytics-service';
import { AIInsightsService } from '@/app/lib/services/ai-insights-service';
import { WeightLogRepository } from '@/app/lib/repositories/weight-log-repository';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const date = dateParam ? new Date(dateParam) : new Date();

    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 }); // Sunday

    // Check if summary already exists
    let summary = WeeklySummaryRepository.getByWeek(date);

    if (!summary) {
      // Generate new summary
      const weekData = HealthAnalyticsService.getWeeklyInsightsData(weekStart, weekEnd);
      const insights = await AIInsightsService.generateWeeklyInsights(weekData);

      summary = WeeklySummaryRepository.create({
        weekStart,
        weekEnd,
        avgCalories: weekData.avgCalories,
        avgProtein: weekData.avgProtein,
        avgCarbs: 0, // Would need to be calculated
        avgFat: 0, // Would need to be calculated
        workoutsDone: weekData.workoutsDone,
        complianceDays: Math.round((weekData.compliance / 100) * 7),
        weightChange: weekData.weightChange,
        insights: [
          insights.summary,
          ...insights.highlights,
          ...insights.suggestions,
        ],
      });
    }

    // Get current weight for context
    const currentWeight = WeightLogRepository.getLatest();

    return NextResponse.json({
      summary,
      currentWeight: currentWeight?.weight,
      period: `Week of ${weekStart.toLocaleDateString()}`,
    });
  } catch (error) {
    console.error('Error generating weekly report:', error);
    return NextResponse.json(
      { error: 'Failed to generate weekly report' },
      { status: 500 }
    );
  }
}
