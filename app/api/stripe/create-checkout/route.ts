/**
 * Create Stripe Checkout Session API Route
 *
 * POST /api/stripe/create-checkout
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe, getStripePriceId } from '@/app/lib/stripe';
import { TRIAL_DAYS } from '@/app/lib/types/subscription';

export async function POST(request: NextRequest) {
  try {
    const { priceId, billingInterval = 'month', userId = 'default_user' } = await request.json();

    // Determine the price ID
    const stripePriceId = priceId || getStripePriceId(billingInterval);

    // Get the origin for redirect URLs
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/account/subscription?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${origin}/pricing?canceled=true`,
      client_reference_id: userId,
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: {
          userId: userId,
        },
      },
      metadata: {
        userId: userId,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
