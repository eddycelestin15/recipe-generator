import { NextRequest, NextResponse } from 'next/server';
import { GeminiAIService } from '@/app/lib/services/gemini-ai-service';
import { FridgeRepository } from '@/app/lib/repositories/fridge-repository';

/**
 * POST /api/shopping/generate
 * Generate shopping list by comparing fridge items vs meal plan recipes
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mealPlanRecipes, servings } = body as {
      mealPlanRecipes: Array<{
        ingredients: Array<{ name: string; quantity: number; unit: string }>;
      }>;
      servings?: number;
    };

    if (
      !mealPlanRecipes ||
      !Array.isArray(mealPlanRecipes) ||
      mealPlanRecipes.length === 0
    ) {
      return NextResponse.json(
        { error: 'Meal plan recipes are required' },
        { status: 400 }
      );
    }

    // Get current fridge items
    const fridgeItems = await FridgeRepository.getAll();

    // Generate shopping list using Gemini AI
    const shoppingList = await GeminiAIService.generateShoppingList({
      fridgeItems,
      mealPlanRecipes,
      servings,
    });

    return NextResponse.json({
      success: true,
      shoppingList,
    });
  } catch (error) {
    console.error('Error generating shopping list:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate shopping list',
      },
      { status: 500 }
    );
  }
}
