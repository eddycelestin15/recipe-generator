/**
 * AI Photo Analysis API Route
 * POST /api/ai/analyze-photo - Analyze food photo with Gemini Vision
 * GET /api/ai/analyze-photo - Get recent analyses
 */

import { NextResponse } from 'next/server';
import { FoodPhotoRepository } from '@/app/lib/repositories/food-photo-repository';
import { GeminiAIService } from '@/app/lib/services/gemini-ai-service';
import { RateLimitService } from '@/app/lib/services/rate-limit-service';

export async function GET() {
  try {
    const analyses = FoodPhotoRepository.getRecent(20);

    return NextResponse.json({
      analyses,
      count: analyses.length,
    });
  } catch (error) {
    console.error('Error fetching photo analyses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photo analyses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { imageBase64, imageUrl } = await request.json();

    if (!imageBase64 && !imageUrl) {
      return NextResponse.json(
        { error: 'Image data is required (imageBase64 or imageUrl)' },
        { status: 400 }
      );
    }

    // Check rate limit
    const rateLimitCheck = RateLimitService.canUsePhotoAnalysis();
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Vous avez atteint votre limite de ${rateLimitCheck.limit} analyses par jour. Réessayez demain ou passez à Premium.`,
          remaining: 0,
        },
        { status: 429 }
      );
    }

    // Analyze photo with Gemini Vision
    const imageData = imageBase64 || imageUrl;
    let base64Data = imageBase64;

    // If imageUrl provided, we'd need to fetch and convert to base64
    // For now, we'll require imageBase64
    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Please provide imageBase64 for now. URL support coming soon.' },
        { status: 400 }
      );
    }

    // Remove data URL prefix if present
    if (base64Data.startsWith('data:')) {
      base64Data = base64Data.split(',')[1];
    }

    const analysis = await GeminiAIService.analyzePhotoFood(base64Data);

    // Save analysis to repository
    const savedAnalysis = FoodPhotoRepository.create(
      imageUrl || `data:image/jpeg;base64,${base64Data.substring(0, 100)}...`, // Store truncated version
      analysis.identifiedFoods,
      analysis.totalEstimated,
      analysis.overallAssessment
    );

    // Record usage
    RateLimitService.recordPhotoAnalysis();

    return NextResponse.json({
      analysis: savedAnalysis,
      remaining: rateLimitCheck.remaining - 1,
    });
  } catch (error) {
    console.error('Error analyzing photo:', error);
    return NextResponse.json(
      { error: 'Failed to analyze photo' },
      { status: 500 }
    );
  }
}
