/**
 * Get Usage Limits API Route
 *
 * GET /api/subscription/usage
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { usageLimitsRepository } from '@/lib/db/repositories/usage-limits.repository';
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

    // Get subscription to determine plan
    const subscription = await subscriptionRepository.getOrCreate(session.user.email);

    // Get or create usage limits for user
    const usageLimits = await usageLimitsRepository.getOrCreate(
      session.user.email,
      subscription.plan
    );

    return NextResponse.json(usageLimits);
  } catch (error: any) {
    console.error('Error fetching usage limits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage limits' },
      { status: 500 }
    );
  }
}
