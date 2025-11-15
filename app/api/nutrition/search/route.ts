/**
 * Nutrition Search API Routes
 * POST /api/nutrition/search - Search nutrition data for foods
 */

import { NextResponse } from 'next/server';
import { nutritionixService } from '@/app/lib/services/nutritionix-service';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const nutritionData = await nutritionixService.searchNaturalLanguage(query);

    if (!nutritionData) {
      return NextResponse.json(
        { error: 'No nutrition data found' },
        { status: 404 }
      );
    }

    return NextResponse.json(nutritionData);
  } catch (error) {
    console.error('Error searching nutrition data:', error);
    return NextResponse.json(
      { error: 'Failed to search nutrition data' },
      { status: 500 }
    );
  }
}
