/**
 * Main entry point for database access
 * Import everything you need from here
 */

// Export database connection utilities
export { connectToDatabase, disconnectFromDatabase, getConnectionStatus } from './db-client';

// Export all models/interfaces
export * from './models';

// Export all repositories
export { db } from './repositories';

// Export repository interfaces for type checking
export type {
  IRepository,
  IExtendedRepository,
  QueryOptions,
} from './repositories/base.repository';

export type { IUserRepository } from './repositories/user.repository';
export type { IFridgeItemRepository } from './repositories/fridge-item.repository';
