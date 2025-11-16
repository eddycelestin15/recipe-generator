import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GeminiAIService } from '@/app/lib/services/gemini-ai-service';
import type { ChatContext } from '@/app/lib/types/ai';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Fetch user context data
    const [nutritionGoalsRes, mealLogsRes, userProfileRes] = await Promise.allSettled([
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/nutrition/goals`, {
        headers: { cookie: request.headers.get('cookie') || '' },
      }),
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/nutrition/logs/today`, {
        headers: { cookie: request.headers.get('cookie') || '' },
      }),
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/users/${session.user.id}`, {
        headers: { cookie: request.headers.get('cookie') || '' },
      }),
    ]);

    // Build context from available data
    const context: ChatContext = {};

    // Extract nutrition goals
    if (nutritionGoalsRes.status === 'fulfilled' && nutritionGoalsRes.value.ok) {
      const goals = await nutritionGoalsRes.value.json();
      context.goalCalories = goals.calories;
      context.goalProtein = goals.protein;
      context.goalWeight = goals.targetWeight;
    }

    // Extract today's nutrition
    if (mealLogsRes.status === 'fulfilled' && mealLogsRes.value.ok) {
      const logs = await mealLogsRes.value.json();
      context.todayCalories = logs.totalCalories || 0;
      context.todayProtein = logs.totalProtein || 0;
    }

    // Extract user profile data
    if (userProfileRes.status === 'fulfilled' && userProfileRes.value.ok) {
      const profile = await userProfileRes.value.json();
      context.currentWeight = profile.currentWeight;
      context.dietType = profile.dietType;
      context.goalType = profile.goalType;
    }

    // Generate AI response using Gemini
    const response = await GeminiAIService.generateChatResponse(
      message,
      context,
      conversationHistory || []
    );

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in AI Nutritionist API:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
