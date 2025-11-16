/**
 * AI Chat API Routes
 * POST /api/ai/chat - Send message to AI nutritionist
 * GET /api/ai/chat - Get chat history
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GeminiAIService } from '@/app/lib/services/gemini-ai-service';
import type { ChatContext } from '@/app/lib/types/ai';
import { db } from '@/lib/db/repositories';

// In-memory chat storage per session (temporary until MongoDB implementation)
const chatSessions = new Map<string, Array<{ role: string; content: string; timestamp: Date }>>();

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const messages = chatSessions.get(session.user.email) || [];
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
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { message } = await request.json();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await db.users.findByEmail(session.user.email);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Build context from user data
    const context: ChatContext = {};

    if (user.profile) {
      context.currentWeight = user.profile.weight;
      context.dietType = user.preferences?.dietType;
      context.goalType = user.goals?.goalType;
    }

    if (user.goals) {
      context.goalCalories = user.goals.dailyCalorieTarget;
      context.goalProtein = user.goals.macroTargets?.protein;
      context.goalWeight = user.goals.targetWeight;
    }

    // Get or create chat session
    const userEmail = session.user.email;
    if (!chatSessions.has(userEmail)) {
      chatSessions.set(userEmail, []);
    }

    const chatHistory = chatSessions.get(userEmail)!;

    // Add user message to history
    const userMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user' as const,
      content: message.trim(),
      timestamp: new Date(),
    };

    chatHistory.push(userMessage);

    // Get recent conversation history for context (last 8 messages)
    const conversationHistory = chatHistory
      .slice(-8)
      .map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

    // Generate AI response
    const aiResponse = await GeminiAIService.generateChatResponse(
      message.trim(),
      context,
      conversationHistory
    );

    // Add AI message to history
    const assistantMessage = {
      id: `msg_${Date.now()}_assistant`,
      role: 'assistant' as const,
      content: aiResponse,
      timestamp: new Date(),
    };

    chatHistory.push(assistantMessage);

    // Keep only last 50 messages per session
    if (chatHistory.length > 50) {
      chatHistory.splice(0, chatHistory.length - 50);
    }

    return NextResponse.json({
      userMessage,
      assistantMessage,
      remaining: 50, // Default limit for now
    });
  } catch (error) {
    console.error('Error processing chat message:', error);

    // Log detailed error for debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }

    return NextResponse.json(
      {
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
