/**
 * AI Rate Limit API Route
 * GET /api/ai/rate-limit - Get current rate limit status
 */

import { NextResponse } from 'next/server';
import { RateLimitService } from '@/app/lib/services/rate-limit-service';

export async function GET() {
  try {
    const rateLimitInfo = RateLimitService.getRateLimitInfo();
    const tier = RateLimitService.getUserTier();

    return NextResponse.json({
      tier,
      ...rateLimitInfo,
    });
  } catch (error) {
    console.error('Error fetching rate limit info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rate limit info' },
      { status: 500 }
    );
  }
}
