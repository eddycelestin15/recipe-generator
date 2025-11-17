import { NextRequest, NextResponse } from 'next/server';
import { GeminiAIService } from '@/app/lib/services/gemini-ai-service';
import { FridgeRepository } from '@/app/lib/repositories/fridge-repository';

/**
 * GET /api/fridge/suggestions
 * Generate suggestions for items expiring soon
 */
export async function GET(request: NextRequest) {
  try {
    // Get all fridge items
    const fridgeItems = await FridgeRepository.getAll();

    // Filter items expiring in next 3 days
    const now = Date.now();
    const threeDaysFromNow = now + 3 * 24 * 60 * 60 * 1000;

    const expiringItems = fridgeItems.filter((item) => {
      if (!item.expirationDate) return false;
      const expirationTime = new Date(item.expirationDate).getTime();
      return expirationTime >= now && expirationTime <= threeDaysFromNow;
    });

    if (expiringItems.length === 0) {
      return NextResponse.json({
        hasExpiring: false,
        message: 'Aucun article expire dans les 3 prochains jours',
        suggestions: null,
      });
    }

    // Generate suggestions using Gemini AI
    const suggestions = await GeminiAIService.generateFridgeSuggestions({
      expiringItems,
      daysUntilExpiration: 3,
    });

    return NextResponse.json({
      hasExpiring: true,
      expiringCount: expiringItems.length,
      expiringItems: expiringItems.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        expirationDate: item.expirationDate,
        daysUntilExpiration: Math.ceil(
          (new Date(item.expirationDate!).getTime() - now) /
            (1000 * 60 * 60 * 24)
        ),
      })),
      suggestions,
    });
  } catch (error) {
    console.error('Error generating fridge suggestions:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate suggestions',
      },
      { status: 500 }
    );
  }
}
