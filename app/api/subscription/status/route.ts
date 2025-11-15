/**
 * Get Subscription Status API Route
 *
 * GET /api/subscription/status
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Since we're using localStorage client-side, we'll return
    // a simple response. The actual data fetching happens client-side.
    // This endpoint is here for future backend integration.

    return NextResponse.json({
      message: 'Use client-side SubscriptionRepository for localStorage-based apps',
      clientSide: true,
    });
  } catch (error: any) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    );
  }
}
