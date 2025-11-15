/**
 * AI Insights API Route
 * POST /api/reports/insights - Generate AI insights
 */

import { NextResponse } from 'next/server';
import { AIInsightsService } from '@/app/lib/services/ai-insights-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Type and data are required' },
        { status: 400 }
      );
    }

    let insights;

    switch (type) {
      case 'weekly':
        insights = await AIInsightsService.generateWeeklyInsights(data);
        break;

      case 'nutrition':
        insights = await AIInsightsService.generateNutritionAdvice(data);
        break;

      case 'workout':
        insights = await AIInsightsService.generateWorkoutMotivation(data.workoutsThisWeek);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid insight type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
