import { NextRequest, NextResponse } from 'next/server';
import { FridgeRepository } from '@/app/lib/repositories/fridge-repository';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const daysThreshold = parseInt(searchParams.get('days') || '2');

    if (daysThreshold < 0 || daysThreshold > 30) {
      return NextResponse.json(
        { error: 'Days threshold must be between 0 and 30' },
        { status: 400 }
      );
    }

    const items = await FridgeRepository.getExpiring(daysThreshold);
    return NextResponse.json({ items, count: items.length });
  } catch (error) {
    console.error('Error fetching expiring items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expiring items' },
      { status: 500 }
    );
  }
}
