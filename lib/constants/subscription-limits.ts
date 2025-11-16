/**
 * Subscription plan limits configuration
 * Defines the usage limits for free and premium tiers
 */

export const SUBSCRIPTION_LIMITS = {
  free: {
    // Fridge management
    maxFridgeItems: 50,

    // Recipe management
    maxSavedRecipes: 30,
    maxRecipesPerMonth: 20,

    // Meal planning
    maxMealPlanWeeks: 1, // 1 week at a time

    // AI features
    maxAIChatMessagesPerMonth: 30,
    maxPhotoAnalysesPerMonth: 20,

    // Health tracking
    maxHabits: 10,
    maxRoutines: 5,

    // General
    displayBadge: true, // Show "Free" badge
    upgradePrompt: true, // Show upgrade CTA
  },

  premium: {
    // Unlimited for all features
    maxFridgeItems: Infinity,
    maxSavedRecipes: Infinity,
    maxRecipesPerMonth: Infinity,
    maxMealPlanWeeks: Infinity,
    maxAIChatMessagesPerMonth: Infinity,
    maxPhotoAnalysesPerMonth: Infinity,
    maxHabits: Infinity,
    maxRoutines: Infinity,

    displayBadge: true, // Show "Premium" badge
    upgradePrompt: false,
  }
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_LIMITS;

/**
 * Check if user has reached the limit for a specific feature
 */
export function hasReachedLimit(
  plan: SubscriptionPlan,
  feature: keyof typeof SUBSCRIPTION_LIMITS.free,
  currentUsage: number
): boolean {
  const limit = SUBSCRIPTION_LIMITS[plan][feature] as number;

  if (limit === Infinity) {
    return false;
  }

  return currentUsage >= limit;
}

/**
 * Get remaining usage for a feature
 */
export function getRemainingUsage(
  plan: SubscriptionPlan,
  feature: keyof typeof SUBSCRIPTION_LIMITS.free,
  currentUsage: number
): number {
  const limit = SUBSCRIPTION_LIMITS[plan][feature] as number;

  if (limit === Infinity) {
    return Infinity;
  }

  return Math.max(0, limit - currentUsage);
}

/**
 * Get usage percentage for a feature
 */
export function getUsagePercentage(
  plan: SubscriptionPlan,
  feature: keyof typeof SUBSCRIPTION_LIMITS.free,
  currentUsage: number
): number {
  const limit = SUBSCRIPTION_LIMITS[plan][feature] as number;

  if (limit === Infinity) {
    return 0;
  }

  return Math.min(100, (currentUsage / limit) * 100);
}
