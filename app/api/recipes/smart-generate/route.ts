import { NextRequest, NextResponse } from 'next/server';
import { GeminiAIService } from '@/app/lib/services/gemini-ai-service';
import { FridgeRepository } from '@/app/lib/repositories/fridge-repository';
import type { RecipeFilters } from '@/app/lib/types/recipe';

/**
 * POST /api/recipes/smart-generate
 * Generate recipe with smart modes: exact (only fridge items), smart (prioritize expiring), flexible
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      ingredients = [],
      fridgeItemIds = [],
      mode = 'flexible',
      filters,
      userPreferences,
    } = body as {
      ingredients: string[];
      fridgeItemIds?: string[];
      mode?: 'exact' | 'smart' | 'flexible';
      filters?: RecipeFilters;
      userPreferences?: {
        dietaryRestrictions?: string[];
        allergies?: string[];
        dislikedIngredients?: string[];
        servings?: number;
      };
    };

    // Validate inputs
    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'At least one ingredient is required' },
        { status: 400 }
      );
    }

    // Get fridge items if IDs provided
    let fridgeItems = [];
    if (fridgeItemIds && fridgeItemIds.length > 0) {
      const allFridgeItems = await FridgeRepository.getAll();
      fridgeItems = allFridgeItems.filter((item) =>
        fridgeItemIds.includes(item.id)
      );
    }

    // Generate recipe with smart mode
    const recipe = await GeminiAIService.generateSmartRecipe({
      ingredients,
      fridgeItems,
      mode,
      filters,
      userPreferences,
    });

    // Auto-generate tags if not present
    if (!recipe.tags || recipe.tags.length === 0) {
      try {
        recipe.tags = await GeminiAIService.generateRecipeTags(recipe);
      } catch (error) {
        console.error('Failed to generate tags:', error);
        recipe.tags = ['recipe'];
      }
    }

    return NextResponse.json({
      success: true,
      recipe,
      mode,
    });
  } catch (error) {
    console.error('Error generating smart recipe:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate recipe',
      },
      { status: 500 }
    );
  }
}
