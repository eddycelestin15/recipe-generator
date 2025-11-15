/**
 * AI Insights API Routes
 * GET /api/ai/insights - Get user insights (unread or all)
 * POST /api/ai/insights - Create manual insight
 */

import { NextResponse } from 'next/server';
import { AIInsightRepository } from '@/app/lib/repositories/ai-insight-repository';
import type { CreateInsightDTO } from '@/app/lib/types/ai';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');

    let insights;

    if (unreadOnly) {
      insights = AIInsightRepository.getUnread();
    } else if (type) {
      insights = AIInsightRepository.getByType(type as any);
    } else if (priority) {
      insights = AIInsightRepository.getByPriority(priority as any);
    } else {
      insights = AIInsightRepository.getRecent(50);
    }

    const unreadCount = AIInsightRepository.getUnreadCount();

    return NextResponse.json({
      insights,
      unreadCount,
      count: insights.length,
    });
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data: CreateInsightDTO = await request.json();

    if (!data.type || !data.priority || !data.title || !data.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const insight = AIInsightRepository.create(data);

    return NextResponse.json({ insight });
  } catch (error) {
    console.error('Error creating insight:', error);
    return NextResponse.json(
      { error: 'Failed to create insight' },
      { status: 500 }
    );
  }
}
