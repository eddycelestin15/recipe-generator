/**
 * Stripe Configuration
 *
 * Server-side Stripe instance and helpers
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
});

/**
 * Get Stripe price ID based on billing interval
 */
export function getStripePriceId(interval: 'month' | 'year'): string {
  if (interval === 'year') {
    return process.env.STRIPE_PRICE_YEARLY || 'price_yearly_placeholder';
  }
  return process.env.STRIPE_PRICE_MONTHLY || 'price_monthly_placeholder';
}

/**
 * Get Stripe webhook secret
 */
export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set in environment variables');
  }
  return secret;
}
