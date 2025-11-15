/**
 * AI Meal Plan Optimization API Route
 * POST /api/ai/optimize-plan - Get AI suggestions to optimize meal plan
 */

import { NextResponse } from 'next/server';
import { GeminiAIService } from '@/app/lib/services/gemini-ai-service';
import { MealPlanRepository } from '@/app/lib/repositories/meal-plan-repository';
import { NutritionGoalsRepository } from '@/app/lib/repositories/nutrition-goals-repository';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { mealPlanId, weekDate } = await request.json();

    if (!mealPlanId && !weekDate) {
      return NextResponse.json(
        { error: 'Either mealPlanId or weekDate is required' },
        { status: 400 }
      );
    }

    // Get meal plan
    let mealPlans: any[];
    if (mealPlanId) {
      const plan = MealPlanRepository.getById(mealPlanId);
      mealPlans = plan ? [plan] : [];
    } else {
      const date = new Date(weekDate);
      const plan = MealPlanRepository.getByWeek(date);
      mealPlans = plan ? [plan] : [];
    }

    if (mealPlans.length === 0) {
      return NextResponse.json(
        { error: 'Meal plan not found' },
        { status: 404 }
      );
    }

    // Get nutrition goals
    const goals = NutritionGoalsRepository.get();
    if (!goals) {
      return NextResponse.json(
        { error: 'Nutrition goals not set. Please set up your profile first.' },
        { status: 400 }
      );
    }

    // Calculate current nutrition totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const meals = mealPlans.map(plan => {
      const calories = plan.totalCalories || 0;
      const protein = plan.totalProtein || 0;
      const carbs = plan.totalCarbs || 0;
      const fat = plan.totalFat || 0;

      totalCalories += calories;
      totalProtein += protein;
      totalCarbs += carbs;
      totalFat += fat;

      return {
        id: plan.id,
        date: plan.weekStartDate,
        slot: `Day ${new Date(plan.weekStartDate).getDay()}`,
        calories,
        protein,
        carbs,
        fat,
      };
    });

    const daysCount = mealPlans.length;
    const avgCalories = totalCalories / daysCount;
    const avgProtein = totalProtein / daysCount;
    const avgCarbs = totalCarbs / daysCount;
    const avgFat = totalFat / daysCount;

    // Generate optimization suggestions with Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analyse ce plan de repas et suggère des optimisations:

Plan actuel (moyenne quotidienne):
- Calories: ${avgCalories.toFixed(0)} cal (objectif: ${goals.dailyCalories} cal)
- Protéines: ${avgProtein.toFixed(0)}g (objectif: ${goals.dailyProtein}g)
- Glucides: ${avgCarbs.toFixed(0)}g (objectif: ${goals.dailyCarbs}g)
- Lipides: ${avgFat.toFixed(0)}g (objectif: ${goals.dailyFat}g)

Jours trackés: ${daysCount}

Génère des suggestions d'optimisation en JSON:
{
  "overallAssessment": "évaluation globale du plan",
  "suggestions": [
    {
      "issue": "problème identifié",
      "recommendation": "suggestion concrète",
      "priority": "high|medium|low"
    }
  ],
  "swapIdeas": [
    {
      "original": "type d'aliment actuel",
      "replacement": "aliment de remplacement suggéré",
      "benefit": "bénéfice nutritionnel (ex: +10g protéines, -100 cal)"
    }
  ]
}

Règles:
- Maximum 3 suggestions
- Maximum 3 swap ideas
- Sois spécifique et actionnable
- Focus sur les plus gros écarts par rapport aux objectifs
- Retourne UNIQUEMENT le JSON`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response');
    }

    const optimization = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      currentPlan: {
        daysCount,
        avgCalories: Math.round(avgCalories),
        avgProtein: Math.round(avgProtein),
        avgCarbs: Math.round(avgCarbs),
        avgFat: Math.round(avgFat),
      },
      goals: {
        calories: goals.dailyCalories,
        protein: goals.dailyProtein,
        carbs: goals.dailyCarbs,
        fat: goals.dailyFat,
      },
      optimization: {
        assessment: optimization.overallAssessment || 'Plan analysé',
        suggestions: optimization.suggestions || [],
        swapIdeas: optimization.swapIdeas || [],
      },
    });
  } catch (error) {
    console.error('Error optimizing meal plan:', error);
    return NextResponse.json(
      { error: 'Failed to optimize meal plan' },
      { status: 500 }
    );
  }
}
