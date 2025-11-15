import { BaseEntity } from '../models';

/**
 * Generic Repository Interface
 * This abstraction allows switching between different database implementations
 * (MongoDB, PostgreSQL, etc.) without changing application code
 */
export interface IRepository<T extends BaseEntity> {
  /**
   * Creates a new entity
   */
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;

  /**
   * Finds an entity by ID
   */
  findById(id: string): Promise<T | null>;

  /**
   * Finds all entities matching the filter
   */
  findMany(filter?: Partial<T>): Promise<T[]>;

  /**
   * Finds one entity matching the filter
   */
  findOne(filter: Partial<T>): Promise<T | null>;

  /**
   * Updates an entity by ID
   */
  update(id: string, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T | null>;

  /**
   * Deletes an entity by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Counts entities matching the filter
   */
  count(filter?: Partial<T>): Promise<number>;

  /**
   * Checks if an entity exists
   */
  exists(filter: Partial<T>): Promise<boolean>;
}

/**
 * Query options for pagination and sorting
 */
export interface QueryOptions {
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1>;
}

/**
 * Extended repository interface with query options
 */
export interface IExtendedRepository<T extends BaseEntity> extends IRepository<T> {
  /**
   * Finds all entities with query options
   */
  findManyWithOptions(filter?: Partial<T>, options?: QueryOptions): Promise<T[]>;
}
