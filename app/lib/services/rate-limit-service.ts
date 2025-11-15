/**
 * Rate Limit Service
 *
 * Manages rate limiting for AI features based on user tier
 */

import type { RateLimitInfo, UserTier } from '../types/ai';
import { USER_TIERS } from '../types/ai';

const RATE_LIMIT_KEY_PREFIX = 'rate_limit_';

export class RateLimitService {
  private static getUserId(): string {
    let userId = localStorage.getItem('current_user_id');
    if (!userId) {
      userId = 'default_user';
      localStorage.setItem('current_user_id', userId);
    }
    return userId;
  }

  private static getStorageKey(feature: string): string {
    return `${RATE_LIMIT_KEY_PREFIX}${this.getUserId()}_${feature}`;
  }

  /**
   * Get user tier (default to free for now)
   */
  static getUserTier(): 'free' | 'premium' {
    const tier = localStorage.getItem(`user_tier_${this.getUserId()}`);
    return (tier as 'free' | 'premium') || 'free';
  }

  /**
   * Set user tier
   */
  static setUserTier(tier: 'free' | 'premium'): void {
    localStorage.setItem(`user_tier_${this.getUserId()}`, tier);
  }

  /**
   * Get today's date string for tracking
   */
  private static getTodayString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  /**
   * Get usage count for a feature today
   */
  private static getUsageToday(feature: 'photo' | 'chat'): number {
    const key = this.getStorageKey(feature);
    const data = localStorage.getItem(key);

    if (!data) return 0;

    try {
      const usage = JSON.parse(data);
      if (usage.date !== this.getTodayString()) {
        // Old data, reset
        return 0;
      }
      return usage.count || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Increment usage count
   */
  private static incrementUsage(feature: 'photo' | 'chat'): void {
    const key = this.getStorageKey(feature);
    const today = this.getTodayString();
    const currentCount = this.getUsageToday(feature);

    const usage = {
      date: today,
      count: currentCount + 1,
    };

    localStorage.setItem(key, JSON.stringify(usage));
  }

  /**
   * Check if user can use photo analysis
   */
  static canUsePhotoAnalysis(): { allowed: boolean; remaining: number; limit: number } {
    const tier = this.getUserTier();
    const limit = USER_TIERS[tier].photoAnalysisPerDay;
    const used = this.getUsageToday('photo');
    const remaining = Math.max(0, limit - used);

    return {
      allowed: used < limit,
      remaining,
      limit,
    };
  }

  /**
   * Check if user can send chat message
   */
  static canUseChatMessage(): { allowed: boolean; remaining: number; limit: number } {
    const tier = this.getUserTier();
    const limit = USER_TIERS[tier].chatMessagesPerDay;
    const used = this.getUsageToday('chat');
    const remaining = Math.max(0, limit - used);

    return {
      allowed: used < limit,
      remaining,
      limit,
    };
  }

  /**
   * Record photo analysis usage
   */
  static recordPhotoAnalysis(): void {
    this.incrementUsage('photo');
  }

  /**
   * Record chat message usage
   */
  static recordChatMessage(): void {
    this.incrementUsage('chat');
  }

  /**
   * Get full rate limit info
   */
  static getRateLimitInfo(): RateLimitInfo {
    const tier = this.getUserTier();
    const limits = USER_TIERS[tier];

    const photoUsed = this.getUsageToday('photo');
    const chatUsed = this.getUsageToday('chat');

    // Calculate reset date (tomorrow at midnight)
    const resetDate = new Date();
    resetDate.setDate(resetDate.getDate() + 1);
    resetDate.setHours(0, 0, 0, 0);

    return {
      photoAnalysisLimit: limits.photoAnalysisPerDay,
      photoAnalysisUsed: photoUsed,
      photoAnalysisRemaining: Math.max(0, limits.photoAnalysisPerDay - photoUsed),
      chatLimit: limits.chatMessagesPerDay,
      chatUsed: chatUsed,
      chatRemaining: Math.max(0, limits.chatMessagesPerDay - chatUsed),
      resetDate,
    };
  }

  /**
   * Reset all usage (for testing or manual reset)
   */
  static resetUsage(): void {
    localStorage.removeItem(this.getStorageKey('photo'));
    localStorage.removeItem(this.getStorageKey('chat'));
  }
}
