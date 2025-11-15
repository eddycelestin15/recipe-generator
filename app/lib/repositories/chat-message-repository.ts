/**
 * Chat Message Repository
 *
 * Data access layer for AI chat messages using localStorage
 */

import type { ChatMessage, CreateChatMessageDTO, ChatContext } from '../types/ai';

function generateId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

const STORAGE_KEY_PREFIX = 'chat_messages_';

export class ChatMessageRepository {
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

  private static getAllMessagesFromStorage(): ChatMessage[] {
    const data = localStorage.getItem(this.getStorageKey());
    if (!data) return [];

    try {
      const messages = JSON.parse(data);
      return messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    } catch (error) {
      console.error('Error parsing chat messages from localStorage:', error);
      return [];
    }
  }

  private static saveMessagesToStorage(messages: ChatMessage[]): void {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(messages));
  }

  /**
   * Create a new chat message
   */
  static create(role: 'user' | 'assistant', data: CreateChatMessageDTO): ChatMessage {
    const messages = this.getAllMessagesFromStorage();

    const newMessage: ChatMessage = {
      id: generateId(),
      userId: this.getUserId(),
      role,
      content: data.content,
      timestamp: new Date(),
      context: data.context,
    };

    messages.push(newMessage);
    this.saveMessagesToStorage(messages);

    return newMessage;
  }

  /**
   * Get all chat messages
   */
  static getAll(): ChatMessage[] {
    return this.getAllMessagesFromStorage();
  }

  /**
   * Get recent chat messages
   */
  static getRecent(limit: number = 50): ChatMessage[] {
    const messages = this.getAllMessagesFromStorage();
    return messages
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
      .reverse(); // Most recent at the end for chat display
  }

  /**
   * Get chat history for context (last N messages)
   */
  static getHistory(limit: number = 10): ChatMessage[] {
    const messages = this.getAllMessagesFromStorage();
    return messages
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(-limit);
  }

  /**
   * Clear all chat messages
   */
  static clearAll(): void {
    localStorage.removeItem(this.getStorageKey());
  }

  /**
   * Delete messages older than X days
   */
  static deleteOlderThan(days: number): number {
    const messages = this.getAllMessagesFromStorage();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filteredMessages = messages.filter(
      msg => msg.timestamp >= cutoffDate
    );

    const deletedCount = messages.length - filteredMessages.length;
    this.saveMessagesToStorage(filteredMessages);

    return deletedCount;
  }

  /**
   * Get message count for today (for rate limiting)
   */
  static getTodayMessageCount(): number {
    const messages = this.getAllMessagesFromStorage();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return messages.filter(msg => {
      const msgDate = new Date(msg.timestamp);
      msgDate.setHours(0, 0, 0, 0);
      return msgDate.getTime() === today.getTime() && msg.role === 'user';
    }).length;
  }
}
