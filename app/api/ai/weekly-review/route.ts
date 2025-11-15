/**
 * AI Weekly Review API Route
 * POST /api/ai/weekly-review - Generate AI-powered weekly analysis
 */

import { NextResponse } from 'next/server';
import { GeminiAIService } from '@/app/lib/services/gemini-ai-service';
import { DailyNutritionRepository } from '@/app/lib/repositories/daily-nutrition-repository';
import { NutritionGoalsRepository } from '@/app/lib/repositories/nutrition-goals-repository';
import { WorkoutLogRepository } from '@/app/lib/repositories/workout-log-repository';
import { AIInsightRepository } from '@/app/lib/repositories/ai-insight-repository';
import type { WeeklyAnalysisData } from '@/app/lib/types/ai';

export async function POST() {
  try {
    // Calculate date range (last 7 days)
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    // Get nutrition data for the week
    const dailyNutritionLogs = DailyNutritionRepository.getByDateRange(startDate, endDate);

    if (dailyNutritionLogs.length === 0) {
      return NextResponse.json(
        { error: 'Pas assez de données pour générer une analyse. Trackez vos repas pendant quelques jours.' },
        { status: 400 }
      );
    }

    // Calculate averages
    const avgCalories =
      dailyNutritionLogs.reduce((sum, log) => sum + log.totalCalories, 0) /
      dailyNutritionLogs.length;
    const avgProtein =
      dailyNutritionLogs.reduce((sum, log) => sum + log.totalProtein, 0) /
      dailyNutritionLogs.length;
    const avgCarbs =
      dailyNutritionLogs.reduce((sum, log) => sum + log.totalCarbs, 0) /
      dailyNutritionLogs.length;
    const avgFat =
      dailyNutritionLogs.reduce((sum, log) => sum + log.totalFat, 0) /
      dailyNutritionLogs.length;

    // Get goals
    const goals = NutritionGoalsRepository.get();
    const goalCalories = goals?.dailyCalories || 2000;
    const goalProtein = goals?.dailyProtein || 150;
    const goalCarbs = goals?.dailyCarbs || 200;
    const goalFat = goals?.dailyFat || 65;

    // Get workout data
    const workouts = WorkoutLogRepository.getByDateRange(startDate, endDate);
    const workoutsDone = workouts.length;

    // Calculate compliance score
    const calorieCompliance = Math.max(
      0,
      100 - Math.abs((avgCalories - goalCalories) / goalCalories) * 100
    );
    const proteinCompliance = Math.max(
      0,
      100 - Math.abs((avgProtein - goalProtein) / goalProtein) * 100
    );
    const complianceScore = Math.round((calorieCompliance + proteinCompliance) / 2);

    // Prepare analysis data
    const analysisData: WeeklyAnalysisData = {
      startDate,
      endDate,
      avgCalories: Math.round(avgCalories),
      goalCalories,
      avgProtein: Math.round(avgProtein),
      goalProtein,
      avgCarbs: Math.round(avgCarbs),
      goalCarbs,
      avgFat: Math.round(avgFat),
      goalFat,
      workoutsDone,
      daysTracked: dailyNutritionLogs.length,
      complianceScore,
    };

    // Generate AI analysis
    const analysis = await GeminiAIService.generateWeeklyAnalysis(analysisData);

    // Create insights from the analysis
    // Achievement insight if compliance is high
    if (analysis.complianceScore >= 80) {
      AIInsightRepository.create({
        type: 'achievement',
        priority: 'low',
        title: 'Excellente semaine !',
        message: analysis.motivationalMessage,
        actionable: 'Voir le rapport complet',
        actionLink: '/insights',
      });
    }

    // Alert insights for improvements
    if (analysis.improvements.length > 0) {
      analysis.improvements.forEach((improvement, index) => {
        if (index === 0) {
          // Only create insight for the first improvement
          AIInsightRepository.create({
            type: 'suggestion',
            priority: analysis.complianceScore < 60 ? 'high' : 'medium',
            title: improvement.issue,
            message: improvement.action,
            actionable: 'Voir les détails',
            actionLink: '/insights',
          });
        }
      });
    }

    return NextResponse.json({
      analysis,
      data: analysisData,
    });
  } catch (error) {
    console.error('Error generating weekly review:', error);
    return NextResponse.json(
      { error: 'Failed to generate weekly review' },
      { status: 500 }
    );
  }
}
