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

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import type { RecipeGenerationRequest, GeminiRecipeResponse } from '@/app/lib/types/recipe';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

    // Build the enhanced Gemini prompt
    const prompt = buildEnhancedPrompt(body);

    // Generate recipe using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response (handle markdown code blocks)
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const recipe: GeminiRecipeResponse = JSON.parse(cleanedText);

    // Validate the response structure
    if (!recipe.name || !recipe.ingredients || !recipe.steps) {
      return NextResponse.json(
        { error: 'Invalid recipe format received from AI' },
        { status: 500 }
      );
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

/**
 * Build an enhanced prompt for Gemini with all user preferences and filters
 */
function buildEnhancedPrompt(request: RecipeGenerationRequest): string {
  const {
    ingredients,
    filters,
    zeroWasteMode,
    userPreferences,
  } = request;

  let prompt = `You are a professional chef and nutritionist. Generate a detailed recipe based on the following requirements:\n\n`;

  // Main ingredients
  prompt += `INGREDIENTS TO USE:\n`;
  prompt += ingredients.map(ing => `- ${ing}`).join('\n');
  prompt += '\n\n';

  // Zero waste mode
  if (zeroWasteMode) {
    prompt += `ZERO WASTE MODE: Prioritize using ALL provided ingredients to minimize food waste.\n\n`;
  }

  // Filters
  if (filters) {
    prompt += `REQUIREMENTS:\n`;

    if (filters.prepTime) {
      prompt += `- Maximum preparation time: ${filters.prepTime} minutes\n`;
    }

    if (filters.difficulty) {
      prompt += `- Difficulty level: ${filters.difficulty}\n`;
    }

    if (filters.cuisineType) {
      prompt += `- Cuisine type: ${filters.cuisineType}\n`;
    }

    if (filters.mealType) {
      prompt += `- Meal type: ${filters.mealType}\n`;
    }

    prompt += '\n';
  }

  // User preferences
  if (userPreferences) {
    if (userPreferences.dietaryRestrictions && userPreferences.dietaryRestrictions.length > 0) {
      prompt += `DIETARY RESTRICTIONS:\n`;
      prompt += userPreferences.dietaryRestrictions.map(r => `- ${r}`).join('\n');
      prompt += '\n\n';
    }

    if (userPreferences.allergies && userPreferences.allergies.length > 0) {
      prompt += `ALLERGIES (MUST EXCLUDE):\n`;
      prompt += userPreferences.allergies.map(a => `- ${a}`).join('\n');
      prompt += '\n\n';
    }

    if (userPreferences.dislikedIngredients && userPreferences.dislikedIngredients.length > 0) {
      prompt += `DISLIKED INGREDIENTS (AVOID IF POSSIBLE):\n`;
      prompt += userPreferences.dislikedIngredients.map(d => `- ${d}`).join('\n');
      prompt += '\n\n';
    }
  }

  // Response format instructions
  prompt += `Please provide the recipe in the following JSON format:\n\n`;
  prompt += `{
  "name": "Recipe name",
  "description": "Brief description of the dish (2-3 sentences)",
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": 200,
      "unit": "g",
      "optional": false,
      "alternative": "optional alternative if ingredient is hard to find"
    }
  ],
  "steps": [
    "Step 1 instruction",
    "Step 2 instruction"
  ],
  "prepTime": 30,
  "cookTime": 20,
  "servings": 4,
  "difficulty": "easy",
  "cuisineType": "french",
  "mealType": ["lunch", "dinner"],
  "nutritionInfo": {
    "calories": 450,
    "protein": 25,
    "carbs": 40,
    "fat": 15,
    "fiber": 8
  },
  "tags": ["quick", "healthy"],
  "alternatives": [
    {
      "original": "ingredient name",
      "alternatives": ["alternative 1", "alternative 2"],
      "reason": "why these alternatives work"
    }
  ]
}\n\n`;

  prompt += `IMPORTANT INSTRUCTIONS:\n`;
  prompt += `- Return ONLY valid JSON, no additional text\n`;
  prompt += `- Include accurate nutritional information per serving\n`;
  prompt += `- Provide ingredient alternatives when applicable\n`;
  prompt += `- Ensure all measurements are precise and realistic\n`;
  prompt += `- Steps should be clear, detailed, and numbered\n`;
  prompt += `- Difficulty should be: "easy", "medium", or "hard"\n`;
  prompt += `- Cuisine type should be lowercase (e.g., "french", "italian", "asian")\n`;
  prompt += `- Meal type should be array with: "breakfast", "lunch", "dinner", "snack", or "dessert"\n`;
  prompt += `- Include helpful cooking tips in the steps when relevant\n`;

  return prompt;
}
