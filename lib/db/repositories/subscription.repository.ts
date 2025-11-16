import { SubscriptionModel, ISubscription } from '../schemas/subscription.schema';
import { connectToDatabase } from '../db-client';

/**
 * MongoDB implementation of Subscription Repository
 */
export class MongoSubscriptionRepository {
  /**
   * Get subscription by user ID
   */
  async findByUserId(userId: string): Promise<ISubscription | null> {
    await connectToDatabase();
    const subscription = await SubscriptionModel.findOne({ userId }).lean();
    return subscription;
  }

  /**
   * Get subscription by Stripe customer ID
   */
  async findByStripeCustomerId(customerId: string): Promise<ISubscription | null> {
    await connectToDatabase();
    const subscription = await SubscriptionModel.findOne({ stripeCustomerId: customerId }).lean();
    return subscription;
  }

  /**
   * Get subscription by Stripe subscription ID
   */
  async findByStripeSubscriptionId(subscriptionId: string): Promise<ISubscription | null> {
    await connectToDatabase();
    const subscription = await SubscriptionModel.findOne({ stripeSubscriptionId: subscriptionId }).lean();
    return subscription;
  }

  /**
   * Get or create default free subscription for user
   */
  async getOrCreate(userId: string): Promise<ISubscription> {
    await connectToDatabase();

    let subscription = await SubscriptionModel.findOne({ userId }).lean();

    if (!subscription) {
      const now = new Date();
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + 7); // 7 days trial

      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      subscription = await SubscriptionModel.create({
        userId,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        status: 'trialing',
        plan: 'free',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        trialEnd: trialEnd,
      });
    }

    return subscription;
  }

  /**
   * Create a new subscription
   */
  async create(data: Partial<ISubscription> & { userId: string }): Promise<ISubscription> {
    await connectToDatabase();

    const now = new Date();
    const trialEnd = data.trialEnd || (() => {
      const date = new Date(now);
      date.setDate(date.getDate() + 7);
      return date;
    })();

    const periodEnd = data.currentPeriodEnd || (() => {
      const date = new Date(now);
      date.setMonth(date.getMonth() + 1);
      return date;
    })();

    const subscription = await SubscriptionModel.create({
      userId: data.userId,
      stripeCustomerId: data.stripeCustomerId || null,
      stripeSubscriptionId: data.stripeSubscriptionId || null,
      status: data.status || 'trialing',
      plan: data.plan || 'free',
      billingInterval: data.billingInterval,
      currentPeriodStart: data.currentPeriodStart || now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
      trialEnd: trialEnd,
    });

    return subscription.toObject();
  }

  /**
   * Update subscription by user ID
   */
  async updateByUserId(userId: string, data: Partial<ISubscription>): Promise<ISubscription | null> {
    await connectToDatabase();

    const subscription = await SubscriptionModel.findOneAndUpdate(
      { userId },
      { $set: data },
      { new: true, runValidators: true }
    ).lean();

    return subscription;
  }

  /**
   * Update subscription by Stripe subscription ID
   */
  async updateByStripeSubscriptionId(
    subscriptionId: string,
    data: Partial<ISubscription>
  ): Promise<ISubscription | null> {
    await connectToDatabase();

    const subscription = await SubscriptionModel.findOneAndUpdate(
      { stripeSubscriptionId: subscriptionId },
      { $set: data },
      { new: true, runValidators: true }
    ).lean();

    return subscription;
  }

  /**
   * Delete subscription by user ID
   */
  async deleteByUserId(userId: string): Promise<boolean> {
    await connectToDatabase();
    const result = await SubscriptionModel.findOneAndDelete({ userId });
    return !!result;
  }

  /**
   * Check if user has premium subscription
   */
  async isPremium(userId: string): Promise<boolean> {
    await connectToDatabase();
    const subscription = await this.getOrCreate(userId);
    return (
      subscription.plan === 'premium' &&
      (subscription.status === 'active' || subscription.status === 'trialing')
    );
  }

  /**
   * Check if user is in trial period
   */
  async isInTrial(userId: string): Promise<boolean> {
    await connectToDatabase();
    const subscription = await this.getOrCreate(userId);

    if (subscription.status !== 'trialing' || !subscription.trialEnd) {
      return false;
    }

    return new Date() < subscription.trialEnd;
  }

  /**
   * Get days remaining in trial
   */
  async getTrialDaysRemaining(userId: string): Promise<number> {
    await connectToDatabase();
    const subscription = await this.getOrCreate(userId);

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
   * Cancel subscription (will remain active until period end)
   */
  async cancel(userId: string): Promise<ISubscription | null> {
    return this.updateByUserId(userId, { cancelAtPeriodEnd: true });
  }

  /**
   * Reactivate canceled subscription
   */
  async reactivate(userId: string): Promise<ISubscription | null> {
    return this.updateByUserId(userId, { cancelAtPeriodEnd: false });
  }
}

// Export singleton instance
export const subscriptionRepository = new MongoSubscriptionRepository();
