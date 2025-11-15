/**
 * Central export file for all repositories
 * This allows easy importing of repositories throughout the application
 */

export * from './base.repository';
export * from './user.repository';
export * from './fridge-item.repository';

// Import singleton instances
import { userRepository } from './user.repository';
import { fridgeItemRepository } from './fridge-item.repository';

/**
 * Database repositories
 * Use these instances throughout your application
 *
 * Example:
 * import { db } from '@/lib/db/repositories';
 * const user = await db.users.findById('123');
 */
export const db = {
  users: userRepository,
  fridgeItems: fridgeItemRepository,
  // Add more repositories here as you create them:
  // recipes: recipeRepository,
  // mealLogs: mealLogRepository,
};
