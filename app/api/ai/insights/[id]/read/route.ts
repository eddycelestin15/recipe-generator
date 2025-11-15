/**
 * Mark Insight as Read API Route
 * POST /api/ai/insights/[id]/read - Mark insight as read
 */

import { NextResponse } from 'next/server';
import { AIInsightRepository } from '@/app/lib/repositories/ai-insight-repository';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const insight = AIInsightRepository.markAsRead(id);

    if (!insight) {
      return NextResponse.json(
        { error: 'Insight not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ insight });
  } catch (error) {
    console.error('Error marking insight as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark insight as read' },
      { status: 500 }
    );
  }
}
