/**
 * Subscription and Usage Types
 *
 * Type definitions for premium subscription management
 */

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired';
export type PlanType = 'free' | 'premium';
export type BillingInterval = 'month' | 'year';

export interface Subscription {
  userId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  status: SubscriptionStatus;
  plan: PlanType;
  billingInterval?: BillingInterval;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageLimits {
  userId: string;
  plan: PlanType;

  // Monthly counters (reset on the 1st of each month)
  recipesGeneratedThisMonth: number;
  photoAnalysesThisMonth: number;
  aiChatMessagesThisMonth: number;

  // Absolute counters
  totalSavedRecipes: number;
  totalFridgeItems: number;
  totalHabits: number;
  totalRoutines: number;

  // Tracking
  lastResetDate: Date;
  updatedAt: Date;
}

// Feature limits configuration
export const PLAN_LIMITS = {
  free: {
    fridgeItems: 50,
    recipesPerMonth: 10,
    savedRecipes: 20,
    workoutHistoryDays: 30,
    aiChatMessagesPerMonth: 20,
    photoAnalysisPerMonth: 5,
    customRoutines: 1,
    simultaneousHabits: 3,
    mealPlanDays: 7,
  },
  premium: {
    fridgeItems: Infinity,
    recipesPerMonth: Infinity,
    savedRecipes: Infinity,
    workoutHistoryDays: Infinity,
    aiChatMessagesPerMonth: Infinity,
    photoAnalysisPerMonth: Infinity,
    customRoutines: Infinity,
    simultaneousHabits: Infinity,
    mealPlanDays: 30,
  },
} as const;

// Premium-exclusive features
export const PREMIUM_FEATURES = {
  mealPrepPlanning: true,
  wearableIntegrations: true,
  dataExport: true,
  pdfReports: true,
  offlineMode: true,
  prioritySupport: true,
  earlyAccess: true,
  exclusiveRecipes: true,
} as const;

export type PremiumFeature = keyof typeof PREMIUM_FEATURES;

// DTOs
export interface CreateSubscriptionDTO {
  userId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  plan?: PlanType;
  status?: SubscriptionStatus;
  billingInterval?: BillingInterval;
  trialEnd?: Date;
}

export interface UpdateSubscriptionDTO {
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  status?: SubscriptionStatus;
  plan?: PlanType;
  billingInterval?: BillingInterval;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  trialEnd?: Date;
}

export interface UsageIncrementDTO {
  recipesGenerated?: number;
  photoAnalyses?: number;
  aiChatMessages?: number;
  savedRecipes?: number;
  fridgeItems?: number;
  habits?: number;
  routines?: number;
}

export interface FeatureAccessResult {
  allowed: boolean;
  reason?: string;
  limit?: number;
  current?: number;
  upgradeRequired?: boolean;
}

// Stripe configuration
export const STRIPE_PRICES = {
  monthly: 'price_monthly', // À remplacer par le vrai Stripe Price ID
  yearly: 'price_yearly',   // À remplacer par le vrai Stripe Price ID
} as const;

export const PRICING = {
  monthly: {
    amount: 9.99,
    currency: 'EUR',
    interval: 'month' as BillingInterval,
  },
  yearly: {
    amount: 89,
    currency: 'EUR',
    interval: 'year' as BillingInterval,
    discount: 25, // -25%
  },
} as const;

export const TRIAL_DAYS = 7;
