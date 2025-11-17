import { NextRequest, NextResponse } from 'next/server';
import { GeminiAIService } from '@/app/lib/services/gemini-ai-service';
import type { GeminiRecipeResponse } from '@/app/lib/types/recipe';

/**
 * POST /api/recipes/variations
 * Generate 3 variations of a recipe (healthier, faster, alternative)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipe } = body as { recipe: GeminiRecipeResponse };

    if (!recipe || !recipe.name || !recipe.ingredients) {
      return NextResponse.json(
        { error: 'Recipe with name and ingredients is required' },
        { status: 400 }
      );
    }

    // Generate variations using Gemini AI
    const variations = await GeminiAIService.generateRecipeVariations(recipe);

    return NextResponse.json({
      success: true,
      variations,
    });
  } catch (error) {
    console.error('Error generating recipe variations:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate variations',
      },
      { status: 500 }
    );
  }
}
