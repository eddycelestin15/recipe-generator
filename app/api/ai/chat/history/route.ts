/**
 * AI Chat History API Route
 * GET /api/ai/chat/history - Get conversation history
 */

import { NextResponse } from 'next/server';
import { ChatMessageRepository } from '@/app/lib/repositories/chat-message-repository';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const messages = ChatMessageRepository.getRecent(limit);

    return NextResponse.json({
      messages,
      count: messages.length,
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    ChatMessageRepository.clearAll();

    return NextResponse.json({
      success: true,
      message: 'Chat history cleared',
    });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    return NextResponse.json(
      { error: 'Failed to clear chat history' },
      { status: 500 }
    );
  }
}
