# Stripe Integration Setup Guide

This guide explains how to set up the Stripe integration for the freemium subscription system.

## Overview

The app uses a freemium model with two tiers:

### Free Tier (with limitations)
- 50 fridge items max
- 10 AI-generated recipes/month
- Meal plans (1 week)
- 20 saved recipes max
- Workout history (30 days)
- 20 AI chat messages/month
- 5 photo analyses/month
- 1 custom routine
- 3 simultaneous habits

### Premium Tier (€9.99/month or €89/year)
- **Everything unlimited**
- Exclusive features:
  - Meal prep planning
  - Wearable integrations
  - Data export (CSV/JSON)
  - PDF reports
  - Offline mode
  - Priority support
  - Early access to new features
  - Exclusive premium recipes

## Stripe Configuration Steps

### 1. Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com) and create an account
2. Complete the account verification process
3. Switch to **Test Mode** during development

### 2. Get API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)
4. Add them to your `.env.local` file:

```bash
STRIPE_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

### 3. Create Products and Prices

1. Go to [Stripe Products](https://dashboard.stripe.com/products)
2. Click **+ Add product**
3. Create the Premium product:
   - **Name**: Health App Premium
   - **Description**: Full access to all premium features
   - **Pricing**: Recurring

4. Create two prices for this product:

   **Monthly Price:**
   - **Amount**: €9.99
   - **Billing period**: Monthly
   - **Price ID**: Copy this (e.g., `price_abc123...`)

   **Yearly Price:**
   - **Amount**: €89
   - **Billing period**: Yearly
   - **Price ID**: Copy this (e.g., `price_xyz789...`)

5. Add the price IDs to `.env.local`:

```bash
STRIPE_PRICE_MONTHLY=price_your_monthly_id
STRIPE_PRICE_YEARLY=price_your_yearly_id
```

### 4. Configure Webhooks

Webhooks allow Stripe to notify your app about subscription events.

#### Local Development (using Stripe CLI)

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Login: `stripe login`
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. Copy the webhook signing secret (starts with `whsec_`)
5. Add to `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

#### Production

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **+ Add endpoint**
3. Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.trial_will_end`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret**
6. Add to production environment variables

### 5. Configure Customer Portal

The Customer Portal allows users to manage their subscriptions.

1. Go to [Stripe Customer Portal](https://dashboard.stripe.com/settings/billing/portal)
2. Enable the portal
3. Configure allowed actions:
   - ✅ Cancel subscriptions
   - ✅ Update payment method
   - ✅ View invoice history
4. Set the **Business information** and **Support details**
5. Save settings

### 6. Test the Integration

#### Test Cards

Use these test card numbers in Test Mode:

| Scenario | Card Number | CVC | Expiry |
|----------|-------------|-----|--------|
| Success | 4242 4242 4242 4242 | Any | Future date |
| Decline | 4000 0000 0000 0002 | Any | Future date |
| 3D Secure | 4000 0027 6000 3184 | Any | Future date |

#### Testing Flow

1. Go to `/pricing`
2. Click "Start 7-Day Trial"
3. Enter test card details
4. Complete checkout
5. Verify redirect to `/account/subscription`
6. Check that Premium features are now unlocked
7. Test the Customer Portal from `/account/subscription`

### 7. Environment Variables Summary

Create a `.env.local` file with:

```bash
# Gemini AI
GEMINI_API_KEY=your_gemini_key

# Stripe
STRIPE_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_MONTHLY=price_monthly_id
STRIPE_PRICE_YEARLY=price_yearly_id

# Resend (for emails - optional)
RESEND_API_KEY=re_your_resend_key
```

## Architecture

### Key Components

**Repositories (localStorage-based):**
- `SubscriptionRepository`: Manages subscription data
- `UsageLimitsRepository`: Tracks feature usage

**Services:**
- `SubscriptionService`: Feature gating and usage tracking

**API Routes:**
- `/api/stripe/create-checkout`: Creates Stripe Checkout session
- `/api/stripe/create-portal`: Creates Customer Portal session
- `/api/stripe/webhook`: Handles Stripe webhooks

**Pages:**
- `/pricing`: Pricing comparison and checkout
- `/account/subscription`: Subscription management

**Hooks:**
- `useSubscription()`: Access subscription status
- `useUsageLimits()`: Access usage limits
- `useFeatureAccess()`: Check feature access

### Feature Gating Example

```typescript
import { SubscriptionService } from '@/app/lib/services/subscription-service';

// Check if user can generate a recipe
const access = SubscriptionService.checkRecipeGeneration();

if (!access.allowed) {
  // Show upgrade modal
  console.log(access.reason); // "Monthly recipe generation limit reached"
}

// Track usage
SubscriptionService.trackRecipeGeneration();
```

## Migration to Production Database

**Note**: This implementation uses localStorage for simplicity. For production with multiple users, you should:

1. Set up a database (PostgreSQL, MongoDB, etc.)
2. Store subscriptions and usage limits in the database
3. Update repositories to use database queries instead of localStorage
4. Implement proper user authentication
5. Link Stripe Customer IDs to user accounts

The current implementation is perfect for:
- Single-user apps
- Prototypes and MVPs
- Testing and development

## Support

For issues or questions:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com/)

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit API keys** to version control
2. Use `.env.local` for local development (not tracked by git)
3. Always verify webhook signatures
4. Use HTTPS in production
5. Keep Stripe libraries up to date
6. Implement rate limiting on API routes
7. Validate all inputs server-side

## Next Steps

1. ✅ Complete Stripe setup
2. ✅ Test the checkout flow
3. ✅ Test webhooks with Stripe CLI
4. ✅ Test the Customer Portal
5. 🔄 Implement email notifications (using Resend)
6. 🔄 Add analytics tracking
7. 🔄 Migrate to production database (if needed)
8. 🔄 Go live!
