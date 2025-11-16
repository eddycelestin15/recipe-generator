/**
 * Get Subscription Status API Route
 *
 * GET /api/subscription/status
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { subscriptionRepository } from '@/lib/db/repositories/subscription.repository';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user session
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get or create subscription for user
    const subscription = await subscriptionRepository.getOrCreate(session.user.email);

    return NextResponse.json(subscription);
  } catch (error: any) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    );
  }
}
