/**
 * Get Usage Limits API Route
 *
 * GET /api/subscription/usage
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Since we're using localStorage client-side, we'll return
    // a simple response. The actual data fetching happens client-side.
    // This endpoint is here for future backend integration.

    return NextResponse.json({
      message: 'Use client-side UsageLimitsRepository for localStorage-based apps',
      clientSide: true,
    });
  } catch (error: any) {
    console.error('Error fetching usage limits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage limits' },
      { status: 500 }
    );
  }
}
