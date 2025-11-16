import { UsageLimitsModel, IUsageLimits } from '../schemas/usage-limits.schema';
import { connectToDatabase } from '../db-client';

type PlanType = 'free' | 'premium';

interface UsageIncrementDTO {
  recipesGenerated?: number;
  photoAnalyses?: number;
  aiChatMessages?: number;
  savedRecipes?: number;
  fridgeItems?: number;
  habits?: number;
  routines?: number;
}

/**
 * MongoDB implementation of Usage Limits Repository
 */
export class MongoUsageLimitsRepository {
  /**
   * Check if monthly reset is needed
   */
  private shouldResetMonthlyCounters(lastResetDate: Date): boolean {
    const now = new Date();
    const lastReset = new Date(lastResetDate);

    // Reset if it's a new month
    return (
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear()
    );
  }

  /**
   * Get usage limits by user ID (auto-creates if doesn't exist)
   */
  async getOrCreate(userId: string, plan: PlanType = 'free'): Promise<IUsageLimits> {
    await connectToDatabase();

    let limits = await UsageLimitsModel.findOne({ userId }).lean();

    if (!limits) {
      const now = new Date();
      const newLimits = await UsageLimitsModel.create({
        userId,
        plan,
        recipesGeneratedThisMonth: 0,
        photoAnalysesThisMonth: 0,
        aiChatMessagesThisMonth: 0,
        totalSavedRecipes: 0,
        totalFridgeItems: 0,
        totalHabits: 0,
        totalRoutines: 0,
        lastResetDate: now,
      });

      return newLimits.toObject();
    }

    // Check if monthly counters need reset
    if (this.shouldResetMonthlyCounters(limits.lastResetDate)) {
      limits = await UsageLimitsModel.findOneAndUpdate(
        { userId },
        {
          $set: {
            recipesGeneratedThisMonth: 0,
            photoAnalysesThisMonth: 0,
            aiChatMessagesThisMonth: 0,
            lastResetDate: new Date(),
          },
        },
        { new: true }
      ).lean();
    }

    return limits!;
  }

  /**
   * Update plan type
   */
  async updatePlan(userId: string, plan: PlanType): Promise<IUsageLimits | null> {
    await connectToDatabase();

    const limits = await UsageLimitsModel.findOneAndUpdate(
      { userId },
      { $set: { plan } },
      { new: true, upsert: true }
    ).lean();

    return limits;
  }

  /**
   * Increment usage counters
   */
  async increment(userId: string, data: UsageIncrementDTO): Promise<IUsageLimits | null> {
    await connectToDatabase();

    // First ensure the document exists
    await this.getOrCreate(userId);

    const updateFields: any = {};

    if (data.recipesGenerated) updateFields.recipesGeneratedThisMonth = data.recipesGenerated;
    if (data.photoAnalyses) updateFields.photoAnalysesThisMonth = data.photoAnalyses;
    if (data.aiChatMessages) updateFields.aiChatMessagesThisMonth = data.aiChatMessages;
    if (data.savedRecipes) updateFields.totalSavedRecipes = data.savedRecipes;
    if (data.fridgeItems) updateFields.totalFridgeItems = data.fridgeItems;
    if (data.habits) updateFields.totalHabits = data.habits;
    if (data.routines) updateFields.totalRoutines = data.routines;

    const limits = await UsageLimitsModel.findOneAndUpdate(
      { userId },
      { $inc: updateFields },
      { new: true }
    ).lean();

    return limits;
  }

  /**
   * Decrement usage counters (for when items are deleted)
   */
  async decrement(userId: string, data: UsageIncrementDTO): Promise<IUsageLimits | null> {
    await connectToDatabase();

    const updateFields: any = {};

    if (data.savedRecipes) updateFields.totalSavedRecipes = -data.savedRecipes;
    if (data.fridgeItems) updateFields.totalFridgeItems = -data.fridgeItems;
    if (data.habits) updateFields.totalHabits = -data.habits;
    if (data.routines) updateFields.totalRoutines = -data.routines;

    const limits = await UsageLimitsModel.findOneAndUpdate(
      { userId },
      { $inc: updateFields },
      { new: true }
    ).lean();

    // Ensure no negative values
    if (limits) {
      const updates: any = {};
      if (limits.totalSavedRecipes < 0) updates.totalSavedRecipes = 0;
      if (limits.totalFridgeItems < 0) updates.totalFridgeItems = 0;
      if (limits.totalHabits < 0) updates.totalHabits = 0;
      if (limits.totalRoutines < 0) updates.totalRoutines = 0;

      if (Object.keys(updates).length > 0) {
        return await UsageLimitsModel.findOneAndUpdate(
          { userId },
          { $set: updates },
          { new: true }
        ).lean();
      }
    }

    return limits;
  }

  /**
   * Set absolute count for a counter
   */
  async setCount(
    userId: string,
    counter: keyof UsageIncrementDTO,
    value: number
  ): Promise<IUsageLimits | null> {
    await connectToDatabase();

    const updateField: any = {};

    switch (counter) {
      case 'savedRecipes':
        updateField.totalSavedRecipes = value;
        break;
      case 'fridgeItems':
        updateField.totalFridgeItems = value;
        break;
      case 'habits':
        updateField.totalHabits = value;
        break;
      case 'routines':
        updateField.totalRoutines = value;
        break;
    }

    const limits = await UsageLimitsModel.findOneAndUpdate(
      { userId },
      { $set: updateField },
      { new: true }
    ).lean();

    return limits;
  }

  /**
   * Reset monthly counters manually
   */
  async resetMonthlyCounters(userId: string): Promise<IUsageLimits | null> {
    await connectToDatabase();

    const limits = await UsageLimitsModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          recipesGeneratedThisMonth: 0,
          photoAnalysesThisMonth: 0,
          aiChatMessagesThisMonth: 0,
          lastResetDate: new Date(),
        },
      },
      { new: true }
    ).lean();

    return limits;
  }

  /**
   * Delete usage limits by user ID
   */
  async deleteByUserId(userId: string): Promise<boolean> {
    await connectToDatabase();
    const result = await UsageLimitsModel.findOneAndDelete({ userId });
    return !!result;
  }

  /**
   * Get current usage percentage for a limit
   */
  getUsagePercentage(current: number, limit: number): number {
    if (limit === Infinity) return 0;
    return Math.min(100, (current / limit) * 100);
  }
}

// Export singleton instance
export const usageLimitsRepository = new MongoUsageLimitsRepository();
