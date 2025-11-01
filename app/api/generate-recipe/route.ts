import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyDcq6FIjeIyWGcAddxBYVYzlmj5dY7Wvhs');

export async function POST(request: NextRequest) {
  try {
    const { ingredients } = await request.json();

    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'Please provide at least one ingredient' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a professional chef assistant that creates delicious recipes. Create a detailed recipe using the following ingredients: ${ingredients.join(', ')}.

Please respond with ONLY valid JSON in the following structure (no markdown, no code blocks, just the JSON):
{
  "title": "Recipe name",
  "description": "Brief description of the dish",
  "ingredients": ["ingredient 1 with measurements", "ingredient 2 with measurements"],
  "instructions": ["step 1", "step 2", "step 3"],
  "cookingTime": "estimated time",
  "servings": "number of servings",
  "difficulty": "easy/medium/hard"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let recipeText = response.text();

    // Clean up the response - remove markdown code blocks if present
    recipeText = recipeText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const recipe = JSON.parse(recipeText);

    return NextResponse.json({ recipe });
  } catch (error) {
    console.error('Error generating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to generate recipe. Please try again.' },
      { status: 500 }
    );
  }
}
