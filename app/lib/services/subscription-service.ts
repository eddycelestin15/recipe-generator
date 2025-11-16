/**
 * Subscription Service
 *
 * Business logic for subscription and feature gating
 */

import { SubscriptionRepository } from '../repositories/subscription-repository';
import { UsageLimitsRepository } from '../repositories/usage-limits-repository';
import { PLAN_LIMITS } from '../types/subscription';
import type {
  FeatureAccessResult,
  PremiumFeature,
  PREMIUM_FEATURES,
  PlanType,
} from '../types/subscription';

export class SubscriptionService {
  /**
   * Check if user has access to a premium-exclusive feature
   */
  static checkPremiumFeature(feature: PremiumFeature): FeatureAccessResult {
    const subscription = SubscriptionRepository.getOrCreate();
    const isPremium = SubscriptionRepository.isPremium();

    if (isPremium) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: `${feature} is a premium-only feature`,
      upgradeRequired: true,
    };
  }

  /**
   * Check if user can generate a recipe
   */
  static checkRecipeGeneration(): FeatureAccessResult {
    const subscription = SubscriptionRepository.getOrCreate();
    const isPremium = SubscriptionRepository.isPremium();

    if (isPremium) {
      return { allowed: true };
    }

    const limits = UsageLimitsRepository.getOrCreate(subscription.plan);
    const limit = PLAN_LIMITS.free.recipesPerMonth;
    const current = limits.recipesGeneratedThisMonth;

    if (current >= limit) {
      return {
        allowed: false,
        reason: 'Monthly recipe generation limit reached',
        limit,
        current,
        upgradeRequired: true,
      };
    }

    return {
      allowed: true,
      limit,
      current,
    };
  }

  /**
   * Check if user can save a recipe
   */
  static checkSaveRecipe(): FeatureAccessResult {
    const subscription = SubscriptionRepository.getOrCreate();
    const isPremium = SubscriptionRepository.isPremium();

    if (isPremium) {
      return { allowed: true };
    }

    const limits = UsageLimitsRepository.getOrCreate(subscription.plan);
    const limit = PLAN_LIMITS.free.savedRecipes;
    const current = limits.totalSavedRecipes;

    if (current >= limit) {
      return {
        allowed: false,
        reason: 'Maximum saved recipes limit reached',
        limit,
        current,
        upgradeRequired: true,
      };
    }

    return {
      allowed: true,
      limit,
      current,
    };
  }

  /**
   * Check if user can add a fridge item
   */
  static checkAddFridgeItem(): FeatureAccessResult {
    const subscription = SubscriptionRepository.getOrCreate();
    const isPremium = SubscriptionRepository.isPremium();

    if (isPremium) {
      return { allowed: true };
    }

    const limits = UsageLimitsRepository.getOrCreate(subscription.plan);
    const limit = PLAN_LIMITS.free.fridgeItems;
    const current = limits.totalFridgeItems;

    if (current >= limit) {
      return {
        allowed: false,
        reason: 'Maximum fridge items limit reached',
        limit,
        current,
        upgradeRequired: true,
      };
    }

    return {
      allowed: true,
      limit,
      current,
    };
  }

  /**
   * Check if user can send AI chat message
   */
  static checkAIChatMessage(): FeatureAccessResult {
    const subscription = SubscriptionRepository.getOrCreate();
    const isPremium = SubscriptionRepository.isPremium();

    if (isPremium) {
      return { allowed: true };
    }

    const limits = UsageLimitsRepository.getOrCreate(subscription.plan);
    const limit = PLAN_LIMITS.free.aiChatMessagesPerMonth;
    const current = limits.aiChatMessagesThisMonth;

    if (current >= limit) {
      return {
        allowed: false,
        reason: 'Monthly AI chat messages limit reached',
        limit,
        current,
        upgradeRequired: true,
      };
    }

    return {
      allowed: true,
      limit,
      current,
    };
  }

  /**
   * Check if user can analyze a photo
   */
  static checkPhotoAnalysis(): FeatureAccessResult {
    const subscription = SubscriptionRepository.getOrCreate();
    const isPremium = SubscriptionRepository.isPremium();

    if (isPremium) {
      return { allowed: true };
    }

    const limits = UsageLimitsRepository.getOrCreate(subscription.plan);
    const limit = PLAN_LIMITS.free.photoAnalysisPerMonth;
    const current = limits.photoAnalysesThisMonth;

    if (current >= limit) {
      return {
        allowed: false,
        reason: 'Monthly photo analysis limit reached',
        limit,
        current,
        upgradeRequired: true,
      };
    }

    return {
      allowed: true,
      limit,
      current,
    };
  }

  /**
   * Check if user can create a habit
   */
  static checkCreateHabit(): FeatureAccessResult {
    const subscription = SubscriptionRepository.getOrCreate();
    const isPremium = SubscriptionRepository.isPremium();

    if (isPremium) {
      return { allowed: true };
    }

    const limits = UsageLimitsRepository.getOrCreate(subscription.plan);
    const limit = PLAN_LIMITS.free.simultaneousHabits;
    const current = limits.totalHabits;

    if (current >= limit) {
      return {
        allowed: false,
        reason: 'Maximum simultaneous habits limit reached',
        limit,
        current,
        upgradeRequired: true,
      };
    }

    return {
      allowed: true,
      limit,
      current,
    };
  }

  /**
   * Check if user can create a routine
   */
  static checkCreateRoutine(): FeatureAccessResult {
    const subscription = SubscriptionRepository.getOrCreate();
    const isPremium = SubscriptionRepository.isPremium();

    if (isPremium) {
      return { allowed: true };
    }

    const limits = UsageLimitsRepository.getOrCreate(subscription.plan);
    const limit = PLAN_LIMITS.free.customRoutines;
    const current = limits.totalRoutines;

    if (current >= limit) {
      return {
        allowed: false,
        reason: 'Maximum custom routines limit reached',
        limit,
        current,
        upgradeRequired: true,
      };
    }

    return {
      allowed: true,
      limit,
      current,
    };
  }

  /**
   * Track recipe generation usage
   */
  static trackRecipeGeneration(): void {
    UsageLimitsRepository.increment({ recipesGenerated: 1 });
  }

  /**
   * Track photo analysis usage
   */
  static trackPhotoAnalysis(): void {
    UsageLimitsRepository.increment({ photoAnalyses: 1 });
  }

  /**
   * Track AI chat message usage
   */
  static trackAIChatMessage(): void {
    UsageLimitsRepository.increment({ aiChatMessages: 1 });
  }

  /**
   * Track recipe save
   */
  static trackRecipeSave(): void {
    UsageLimitsRepository.increment({ savedRecipes: 1 });
  }

  /**
   * Track recipe delete
   */
  static trackRecipeDelete(): void {
    UsageLimitsRepository.decrement({ savedRecipes: 1 });
  }

  /**
   * Track fridge item add
   */
  static trackFridgeItemAdd(): void {
    UsageLimitsRepository.increment({ fridgeItems: 1 });
  }

  /**
   * Track fridge item delete
   */
  static trackFridgeItemDelete(): void {
    UsageLimitsRepository.decrement({ fridgeItems: 1 });
  }

  /**
   * Track habit creation
   */
  static trackHabitCreate(): void {
    UsageLimitsRepository.increment({ habits: 1 });
  }

  /**
   * Track habit deletion
   */
  static trackHabitDelete(): void {
    UsageLimitsRepository.decrement({ habits: 1 });
  }

  /**
   * Track routine creation
   */
  static trackRoutineCreate(): void {
    UsageLimitsRepository.increment({ routines: 1 });
  }

  /**
   * Track routine deletion
   */
  static trackRoutineDelete(): void {
    UsageLimitsRepository.decrement({ routines: 1 });
  }

  /**
   * Get current usage summary
   */
  static getUsageSummary() {
    const subscription = SubscriptionRepository.getOrCreate();
    const limits = UsageLimitsRepository.getOrCreate(subscription.plan);
    const isPremium = SubscriptionRepository.isPremium();
    const isInTrial = SubscriptionRepository.isInTrial();
    const trialDaysRemaining = SubscriptionRepository.getTrialDaysRemaining();

    const planLimits = isPremium ? PLAN_LIMITS.premium : PLAN_LIMITS.free;

    return {
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        isPremium,
        isInTrial,
        trialDaysRemaining,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      },
      usage: {
        recipesGenerated: {
          current: limits.recipesGeneratedThisMonth,
          limit: planLimits.recipesPerMonth,
          percentage: UsageLimitsRepository.getUsagePercentage(
            limits.recipesGeneratedThisMonth,
            planLimits.recipesPerMonth
          ),
        },
        savedRecipes: {
          current: limits.totalSavedRecipes,
          limit: planLimits.savedRecipes,
          percentage: UsageLimitsRepository.getUsagePercentage(
            limits.totalSavedRecipes,
            planLimits.savedRecipes
          ),
        },
        fridgeItems: {
          current: limits.totalFridgeItems,
          limit: planLimits.fridgeItems,
          percentage: UsageLimitsRepository.getUsagePercentage(
            limits.totalFridgeItems,
            planLimits.fridgeItems
          ),
        },
        photoAnalyses: {
          current: limits.photoAnalysesThisMonth,
          limit: planLimits.photoAnalysisPerMonth,
          percentage: UsageLimitsRepository.getUsagePercentage(
            limits.photoAnalysesThisMonth,
            planLimits.photoAnalysisPerMonth
          ),
        },
        aiChatMessages: {
          current: limits.aiChatMessagesThisMonth,
          limit: planLimits.aiChatMessagesPerMonth,
          percentage: UsageLimitsRepository.getUsagePercentage(
            limits.aiChatMessagesThisMonth,
            planLimits.aiChatMessagesPerMonth
          ),
        },
        habits: {
          current: limits.totalHabits,
          limit: planLimits.simultaneousHabits,
          percentage: UsageLimitsRepository.getUsagePercentage(
            limits.totalHabits,
            planLimits.simultaneousHabits
          ),
        },
        routines: {
          current: limits.totalRoutines,
          limit: planLimits.customRoutines,
          percentage: UsageLimitsRepository.getUsagePercentage(
            limits.totalRoutines,
            planLimits.customRoutines
          ),
        },
      },
    };
  }
}
