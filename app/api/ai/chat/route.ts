/**
 * AI Chat API Routes
 * POST /api/ai/chat - Send message to AI nutritionist
 * GET /api/ai/chat - Get chat history
 */

import { NextResponse } from 'next/server';
import { ChatMessageRepository } from '@/app/lib/repositories/chat-message-repository';
import { GeminiAIService } from '@/app/lib/services/gemini-ai-service';
import { RateLimitService } from '@/app/lib/services/rate-limit-service';
import { UserProfileRepository } from '@/app/lib/repositories/user-profile-repository';
import { NutritionGoalsRepository } from '@/app/lib/repositories/nutrition-goals-repository';
import { DailyNutritionRepository } from '@/app/lib/repositories/daily-nutrition-repository';
import { WeightLogRepository } from '@/app/lib/repositories/weight-log-repository';
import { WorkoutLogRepository } from '@/app/lib/repositories/workout-log-repository';
import type { ChatContext } from '@/app/lib/types/ai';

export async function GET() {
  try {
    const messages = ChatMessageRepository.getRecent(100);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check rate limit
    const rateLimitCheck = RateLimitService.canUseChatMessage();
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Vous avez atteint votre limite de ${rateLimitCheck.limit} messages par jour. Réessayez demain ou passez à Premium.`,
          remaining: 0,
        },
        { status: 429 }
      );
    }

    // Build context from user data
    const context: ChatContext = {};

    // Get user profile
    const profile = UserProfileRepository.get();
    if (profile) {
      context.currentWeight = profile.weight;
      context.dietType = profile.dietType;
      context.goalType = profile.goalType;
    }

    // Get nutrition goals
    const goals = NutritionGoalsRepository.get();
    if (goals) {
      context.goalCalories = goals.dailyCalories;
      context.goalProtein = goals.dailyProtein;
    }

    // Get today's nutrition
    const today = new Date();
    const dailyNutrition = DailyNutritionRepository.getByDate(today);
    if (dailyNutrition) {
      context.todayCalories = dailyNutrition.totalCalories;
      context.todayProtein = dailyNutrition.totalProtein;
    }

    // Get weight goal
    const latestWeight = WeightLogRepository.getLatest();
    if (latestWeight && latestWeight.goalWeight) {
      context.goalWeight = latestWeight.goalWeight;
    }

    // Get weekly workouts
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekWorkouts = WorkoutLogRepository.getByDateRange(weekStart, weekEnd);
    context.weeklyWorkouts = weekWorkouts.length;

    // Save user message
    const userMessage = ChatMessageRepository.create('user', {
      content: message.trim(),
      context,
    });

    // Get conversation history for context
    const history = ChatMessageRepository.getHistory(8);
    const conversationHistory = history.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Generate AI response
    const aiResponse = await GeminiAIService.generateChatResponse(
      message.trim(),
      context,
      conversationHistory
    );

    // Save AI message
    const assistantMessage = ChatMessageRepository.create('assistant', {
      content: aiResponse,
    });

    // Record usage
    RateLimitService.recordChatMessage();

    return NextResponse.json({
      userMessage,
      assistantMessage,
      remaining: rateLimitCheck.remaining - 1,
    });
  } catch (error) {
    console.error('Error processing chat message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
