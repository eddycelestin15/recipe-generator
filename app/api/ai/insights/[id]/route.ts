/**
 * AI Insight Detail API Routes
 * PATCH /api/ai/insights/[id] - Mark insight as read
 * DELETE /api/ai/insights/[id] - Delete insight
 */

import { NextResponse } from 'next/server';
import { AIInsightRepository } from '@/app/lib/repositories/ai-insight-repository';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { read } = await request.json();

    if (read === true) {
      const insight = AIInsightRepository.markAsRead(id);

      if (!insight) {
        return NextResponse.json(
          { error: 'Insight not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ insight });
    }

    return NextResponse.json(
      { error: 'Invalid operation' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating insight:', error);
    return NextResponse.json(
      { error: 'Failed to update insight' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = AIInsightRepository.delete(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Insight not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting insight:', error);
    return NextResponse.json(
      { error: 'Failed to delete insight' },
      { status: 500 }
    );
  }
}
