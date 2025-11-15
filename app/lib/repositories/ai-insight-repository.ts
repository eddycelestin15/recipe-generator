/**
 * AI Insight Repository
 *
 * Data access layer for AI-generated insights and alerts using localStorage
 */

import type { AIInsight, CreateInsightDTO, InsightType, InsightPriority } from '../types/ai';

function generateId(): string {
  return `insight_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

const STORAGE_KEY_PREFIX = 'ai_insights_';

export class AIInsightRepository {
  private static getUserId(): string {
    let userId = localStorage.getItem('current_user_id');
    if (!userId) {
      userId = 'default_user';
      localStorage.setItem('current_user_id', userId);
    }
    return userId;
  }

  private static getStorageKey(): string {
    return `${STORAGE_KEY_PREFIX}${this.getUserId()}`;
  }

  private static getAllInsightsFromStorage(): AIInsight[] {
    const data = localStorage.getItem(this.getStorageKey());
    if (!data) return [];

    try {
      const insights = JSON.parse(data);
      return insights.map((insight: any) => ({
        ...insight,
        createdDate: new Date(insight.createdDate),
      }));
    } catch (error) {
      console.error('Error parsing AI insights from localStorage:', error);
      return [];
    }
  }

  private static saveInsightsToStorage(insights: AIInsight[]): void {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(insights));
  }

  /**
   * Create a new AI insight
   */
  static create(data: CreateInsightDTO): AIInsight {
    const insights = this.getAllInsightsFromStorage();

    const newInsight: AIInsight = {
      id: generateId(),
      userId: this.getUserId(),
      type: data.type,
      priority: data.priority,
      title: data.title,
      message: data.message,
      actionable: data.actionable,
      actionLink: data.actionLink,
      createdDate: new Date(),
      read: false,
    };

    insights.push(newInsight);
    this.saveInsightsToStorage(insights);

    return newInsight;
  }

  /**
   * Get all insights
   */
  static getAll(): AIInsight[] {
    return this.getAllInsightsFromStorage();
  }

  /**
   * Get insight by ID
   */
  static getById(id: string): AIInsight | null {
    const insights = this.getAllInsightsFromStorage();
    return insights.find(insight => insight.id === id) || null;
  }

  /**
   * Get unread insights
   */
  static getUnread(): AIInsight[] {
    const insights = this.getAllInsightsFromStorage();
    return insights
      .filter(insight => !insight.read)
      .sort((a, b) => {
        // Sort by priority (high first) then by date (newest first)
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return b.createdDate.getTime() - a.createdDate.getTime();
      });
  }

  /**
   * Get recent insights
   */
  static getRecent(limit: number = 10): AIInsight[] {
    const insights = this.getAllInsightsFromStorage();
    return insights
      .sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime())
      .slice(0, limit);
  }

  /**
   * Get insights by type
   */
  static getByType(type: InsightType): AIInsight[] {
    const insights = this.getAllInsightsFromStorage();
    return insights
      .filter(insight => insight.type === type)
      .sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime());
  }

  /**
   * Get insights by priority
   */
  static getByPriority(priority: InsightPriority): AIInsight[] {
    const insights = this.getAllInsightsFromStorage();
    return insights
      .filter(insight => insight.priority === priority)
      .sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime());
  }

  /**
   * Mark insight as read
   */
  static markAsRead(id: string): AIInsight | null {
    const insights = this.getAllInsightsFromStorage();
    const index = insights.findIndex(insight => insight.id === id);

    if (index === -1) return null;

    insights[index].read = true;
    this.saveInsightsToStorage(insights);

    return insights[index];
  }

  /**
   * Mark all insights as read
   */
  static markAllAsRead(): number {
    const insights = this.getAllInsightsFromStorage();
    let count = 0;

    insights.forEach(insight => {
      if (!insight.read) {
        insight.read = true;
        count++;
      }
    });

    this.saveInsightsToStorage(insights);
    return count;
  }

  /**
   * Delete an insight
   */
  static delete(id: string): boolean {
    const insights = this.getAllInsightsFromStorage();
    const filteredInsights = insights.filter(insight => insight.id !== id);

    if (filteredInsights.length === insights.length) {
      return false;
    }

    this.saveInsightsToStorage(filteredInsights);
    return true;
  }

  /**
   * Delete old read insights (older than X days)
   */
  static deleteOldRead(days: number = 30): number {
    const insights = this.getAllInsightsFromStorage();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filteredInsights = insights.filter(
      insight => !insight.read || insight.createdDate >= cutoffDate
    );

    const deletedCount = insights.length - filteredInsights.length;
    this.saveInsightsToStorage(filteredInsights);

    return deletedCount;
  }

  /**
   * Get unread count
   */
  static getUnreadCount(): number {
    const insights = this.getAllInsightsFromStorage();
    return insights.filter(insight => !insight.read).length;
  }

  /**
   * Clear all insights
   */
  static clearAll(): void {
    localStorage.removeItem(this.getStorageKey());
  }
}
