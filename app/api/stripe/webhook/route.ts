/**
 * Stripe Webhook Handler API Route
 *
 * POST /api/stripe/webhook
 *
 * Handles Stripe webhook events and updates subscription status in MongoDB
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe, getStripeWebhookSecret } from '@/app/lib/stripe';
import { subscriptionRepository } from '@/lib/db/repositories/subscription.repository';
import { usageLimitsRepository } from '@/lib/db/repositories/usage-limits.repository';
import type Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      getStripeWebhookSecret()
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId || session.client_reference_id;

        console.log('Checkout completed:', {
          customerId: session.customer,
          subscriptionId: session.subscription,
          userId: userId,
        });

        if (userId && session.subscription) {
          // Get subscription details from Stripe
          const stripeSubscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          // Extract properties
          const periodStart = (stripeSubscription as any).current_period_start as number;
          const periodEnd = (stripeSubscription as any).current_period_end as number;

          // Create or update subscription in database
          const existingSubscription = await subscriptionRepository.findByUserId(userId);

          if (existingSubscription) {
            await subscriptionRepository.updateByUserId(userId, {
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              status: stripeSubscription.status as any,
              plan: 'premium',
              billingInterval: stripeSubscription.items.data[0]?.plan.interval as 'month' | 'year',
              currentPeriodStart: new Date(periodStart * 1000),
              currentPeriodEnd: new Date(periodEnd * 1000),
            });
          } else {
            await subscriptionRepository.create({
              userId,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              status: stripeSubscription.status as any,
              plan: 'premium',
              billingInterval: stripeSubscription.items.data[0]?.plan.interval as 'month' | 'year',
              currentPeriodStart: new Date(periodStart * 1000),
              currentPeriodEnd: new Date(periodEnd * 1000),
              cancelAtPeriodEnd: false,
            });
          }

          // Update usage limits plan
          await usageLimitsRepository.updatePlan(userId, 'premium');
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as any;
        const periodStart = subscription.current_period_start as number;
        const periodEnd = subscription.current_period_end as number;

        console.log('Subscription created:', {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
          currentPeriodEnd: new Date(periodEnd * 1000),
        });

        // Find subscription by Stripe customer ID
        const existingSub = await subscriptionRepository.findByStripeCustomerId(
          subscription.customer as string
        );

        if (existingSub) {
          await subscriptionRepository.updateByUserId(existingSub.userId, {
            stripeSubscriptionId: subscription.id,
            status: subscription.status as any,
            plan: 'premium',
            billingInterval: subscription.items.data[0]?.plan.interval as 'month' | 'year',
            currentPeriodStart: new Date(periodStart * 1000),
            currentPeriodEnd: new Date(periodEnd * 1000),
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const periodStart = subscription.current_period_start as number;
        const periodEnd = subscription.current_period_end as number;

        console.log('Subscription updated:', {
          subscriptionId: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });

        // Update subscription status in database
        await subscriptionRepository.updateByStripeSubscriptionId(subscription.id, {
          status: subscription.status as any,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          currentPeriodStart: new Date(periodStart * 1000),
          currentPeriodEnd: new Date(periodEnd * 1000),
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription deleted:', {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
        });

        // Mark subscription as canceled in database
        const existingSub = await subscriptionRepository.findByStripeSubscriptionId(subscription.id);
        if (existingSub) {
          await subscriptionRepository.updateByUserId(existingSub.userId, {
            status: 'canceled',
            plan: 'free',
          });
          // Downgrade usage limits to free plan
          await usageLimitsRepository.updatePlan(existingSub.userId, 'free');
        }
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Trial will end soon:', {
          subscriptionId: subscription.id,
          trialEnd: new Date(subscription.trial_end! * 1000),
        });
        // Send trial ending email
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment succeeded:', {
          invoiceId: invoice.id,
          customerId: invoice.customer,
          amountPaid: invoice.amount_paid / 100,
        });
        // Send receipt email
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment failed:', {
          invoiceId: invoice.id,
          customerId: invoice.customer,
        });
        // Send payment failed email
        // Mark subscription as past_due
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
