import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { recipeTitle, recipeDescription } = await request.json();

    if (!recipeTitle) {
      return NextResponse.json(
        { error: 'Recipe title is required' },
        { status: 400 }
      );
    }

    // Gemini model for generating image descriptions
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Create a detailed and appetizing description for a food photography image of: ${recipeTitle}. ${recipeDescription || ''}. The image should show the finished dish in a professional, appetizing presentation with natural lighting and appealing composition.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const imageDescription = response.text();

    // Note: Gemini AI doesn't directly generate images in the same way as DALL-E
    // This endpoint generates an enhanced image prompt that can be used with image generation services
    // For actual image generation, you would need to use Google's Imagen API or another service

    return NextResponse.json({
      imagePrompt: imageDescription,
      message: 'Image prompt generated successfully. You can use this with an image generation service.'
    });
  } catch (error) {
    console.error('Error generating image prompt:', error);
    return NextResponse.json(
      { error: 'Failed to generate image prompt. Please try again.' },
      { status: 500 }
    );
  }
}
