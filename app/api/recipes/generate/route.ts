/**
 * Enhanced Recipe Generation API
 *
 * POST /api/recipes/generate
 * Generates recipes using Gemini AI with advanced features:
 * - Fridge integration
 * - Advanced filters
 * - Zero waste mode
 * - User preferences and allergies
 * - Nutritional information
 * - Ingredient alternatives
 */

import { NextRequest, NextResponse } from 'next/server';
import { GeminiAIService } from '@/app/lib/services/gemini-ai-service';
import { FridgeRepository } from '@/app/lib/repositories/fridge-repository';
import type { RecipeGenerationRequest } from '@/app/lib/types/recipe';

export async function POST(request: NextRequest) {
  try {
    const body: RecipeGenerationRequest = await request.json();

    // Validate request
    if (!body.ingredients || body.ingredients.length === 0) {
      return NextResponse.json(
        { error: 'At least one ingredient is required' },
        { status: 400 }
      );
    }

    // Get fridge items if IDs provided
    let fridgeItems = [];
    if (body.fridgeItemIds && body.fridgeItemIds.length > 0) {
      const allFridgeItems = await FridgeRepository.getAll();
      fridgeItems = allFridgeItems.filter((item) =>
        body.fridgeItemIds!.includes(item.id)
      );
    }

    // Determine mode based on zeroWasteMode
    const mode = body.zeroWasteMode ? 'smart' : 'flexible';

    // Generate recipe using enhanced Gemini AI service
    const recipe = await GeminiAIService.generateSmartRecipe({
      ingredients: body.ingredients,
      fridgeItems,
      mode,
      filters: body.filters,
      userPreferences: body.userPreferences,
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
      recipe,
      usedIngredients: body.ingredients,
      fridgeItemIds: body.fridgeItemIds || [],
    });
  } catch (error) {
    console.error('Error generating recipe:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate recipe',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
