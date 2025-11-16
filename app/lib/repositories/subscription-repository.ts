/**
 * Subscription Repository
 *
 * Data access layer for user subscriptions using localStorage
 */

import { isBrowser, getItem, setItem, removeItem, getCurrentUserId } from '../utils/storage';
import type {
  Subscription,
  CreateSubscriptionDTO,
  UpdateSubscriptionDTO,
  PlanType,
  TRIAL_DAYS,
} from '../types/subscription';

const STORAGE_KEY_PREFIX = 'subscription_';

export class SubscriptionRepository {
  /**
   * Get the current user ID from localStorage
   */
  private static getUserId(): string {
    let userId = getItem('current_user_id');
    if (!userId) {
      userId = 'default_user';
      setItem('current_user_id', userId);
    }
    return userId;
  }

  /**
   * Get storage key for current user
   */
  private static getStorageKey(): string {
    return `${STORAGE_KEY_PREFIX}${this.getUserId()}`;
  }

  /**
   * Get subscription from localStorage
   */
  private static getSubscriptionFromStorage(): Subscription | null {
    const data = getItem(this.getStorageKey());
    if (!data) return null;

    try {
      const subscription = JSON.parse(data);
      return {
        ...subscription,
        currentPeriodStart: new Date(subscription.currentPeriodStart),
        currentPeriodEnd: new Date(subscription.currentPeriodEnd),
        trialEnd: subscription.trialEnd ? new Date(subscription.trialEnd) : undefined,
        createdAt: new Date(subscription.createdAt),
        updatedAt: new Date(subscription.updatedAt),
      };
    } catch (error) {
      console.error('Error parsing subscription from localStorage:', error);
      return null;
    }
  }

  /**
   * Save subscription to localStorage
   */
  private static saveSubscriptionToStorage(subscription: Subscription): void {
    setItem(this.getStorageKey(), JSON.stringify(subscription));
  }

  /**
   * Get user subscription
   */
  static get(): Subscription | null {
    return this.getSubscriptionFromStorage();
  }

  /**
   * Get or create default free subscription
   */
  static getOrCreate(): Subscription {
    let subscription = this.getSubscriptionFromStorage();

    if (!subscription) {
      const now = new Date();
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + 7); // 7 days trial

      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      subscription = {
        userId: this.getUserId(),
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        status: 'trialing',
        plan: 'free',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        trialEnd: trialEnd,
        createdAt: now,
        updatedAt: now,
      };

      this.saveSubscriptionToStorage(subscription);
    }

    return subscription;
  }

  /**
   * Create a new subscription
   */
  static create(data: CreateSubscriptionDTO): Subscription {
    const now = new Date();
    const trialEnd = data.trialEnd || (() => {
      const date = new Date(now);
      date.setDate(date.getDate() + 7);
      return date;
    })();

    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const subscription: Subscription = {
      userId: data.userId,
      stripeCustomerId: data.stripeCustomerId || null,
      stripeSubscriptionId: data.stripeSubscriptionId || null,
      status: data.status || 'trialing',
      plan: data.plan || 'free',
      billingInterval: data.billingInterval,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      trialEnd: trialEnd,
      createdAt: now,
      updatedAt: now,
    };

    this.saveSubscriptionToStorage(subscription);
    return subscription;
  }

  /**
   * Update subscription
   */
  static update(data: UpdateSubscriptionDTO): Subscription | null {
    const subscription = this.getSubscriptionFromStorage();
    if (!subscription) return null;

    const updatedSubscription: Subscription = {
      ...subscription,
      ...data,
      updatedAt: new Date(),
    };

    this.saveSubscriptionToStorage(updatedSubscription);
    return updatedSubscription;
  }

  /**
   * Delete subscription
   */
  static delete(): boolean {
    const subscription = this.getSubscriptionFromStorage();
    if (!subscription) return false;

    removeItem(this.getStorageKey());
    return true;
  }

  /**
   * Check if user has active premium subscription
   */
  static isPremium(): boolean {
    const subscription = this.getOrCreate();
    return (
      subscription.plan === 'premium' &&
      (subscription.status === 'active' || subscription.status === 'trialing')
    );
  }

  /**
   * Check if user is in trial period
   */
  static isInTrial(): boolean {
    const subscription = this.getOrCreate();
    if (subscription.status !== 'trialing' || !subscription.trialEnd) {
      return false;
    }
    return new Date() < subscription.trialEnd;
  }

  /**
   * Get days remaining in trial
   */
  static getTrialDaysRemaining(): number {
    const subscription = this.getOrCreate();
    if (!subscription.trialEnd || subscription.status !== 'trialing') {
      return 0;
    }

    const now = new Date();
    const trialEnd = subscription.trialEnd;
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }

  /**
   * Check if subscription exists
   */
  static exists(): boolean {
    return this.getSubscriptionFromStorage() !== null;
  }

  /**
   * Cancel subscription (will remain active until period end)
   */
  static cancel(): Subscription | null {
    return this.update({
      cancelAtPeriodEnd: true,
    });
  }

  /**
   * Reactivate canceled subscription
   */
  static reactivate(): Subscription | null {
    return this.update({
      cancelAtPeriodEnd: false,
    });
  }
}
