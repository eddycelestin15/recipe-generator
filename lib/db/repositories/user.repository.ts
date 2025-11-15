import { User } from '../models';
import { IExtendedRepository, QueryOptions } from './base.repository';
import { UserModel } from '../schemas/user.schema';
import { connectToDatabase } from '../db-client';

/**
 * User-specific repository interface
 */
export interface IUserRepository extends IExtendedRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  updateProfile(userId: string, profile: Partial<User['profile']>): Promise<User | null>;
  updatePreferences(userId: string, preferences: Partial<User['preferences']>): Promise<User | null>;
  updateGoals(userId: string, goals: Partial<User['goals']>): Promise<User | null>;
}

/**
 * MongoDB implementation of User Repository
 */
export class MongoUserRepository implements IUserRepository {
  /**
   * Creates a new user
   */
  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    await connectToDatabase();

    const user = await UserModel.create(data);
    return user.toObject() as User;
  }

  /**
   * Finds a user by ID
   */
  async findById(id: string): Promise<User | null> {
    await connectToDatabase();

    const user = await UserModel.findById(id).lean();
    if (!user) return null;

    return this.transformDocument(user);
  }

  /**
   * Finds a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    await connectToDatabase();

    const user = await UserModel.findOne({ email: email.toLowerCase() }).lean();
    if (!user) return null;

    return this.transformDocument(user);
  }

  /**
   * Finds multiple users matching the filter
   */
  async findMany(filter?: Partial<User>): Promise<User[]> {
    await connectToDatabase();

    const users = await UserModel.find(filter || {}).lean();
    return users.map(user => this.transformDocument(user));
  }

  /**
   * Finds multiple users with query options
   */
  async findManyWithOptions(filter?: Partial<User>, options?: QueryOptions): Promise<User[]> {
    await connectToDatabase();

    let query = UserModel.find(filter || {});

    if (options?.limit) query = query.limit(options.limit);
    if (options?.skip) query = query.skip(options.skip);
    if (options?.sort) query = query.sort(options.sort);

    const users = await query.lean();
    return users.map(user => this.transformDocument(user));
  }

  /**
   * Finds one user matching the filter
   */
  async findOne(filter: Partial<User>): Promise<User | null> {
    await connectToDatabase();

    const user = await UserModel.findOne(filter).lean();
    if (!user) return null;

    return this.transformDocument(user);
  }

  /**
   * Updates a user by ID
   */
  async update(
    id: string,
    data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<User | null> {
    await connectToDatabase();

    const user = await UserModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();

    if (!user) return null;

    return this.transformDocument(user);
  }

  /**
   * Updates user profile
   */
  async updateProfile(userId: string, profile: Partial<User['profile']>): Promise<User | null> {
    await connectToDatabase();

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { profile } },
      { new: true, runValidators: true }
    ).lean();

    if (!user) return null;

    return this.transformDocument(user);
  }

  /**
   * Updates user preferences
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<User['preferences']>
  ): Promise<User | null> {
    await connectToDatabase();

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { preferences } },
      { new: true, runValidators: true }
    ).lean();

    if (!user) return null;

    return this.transformDocument(user);
  }

  /**
   * Updates user goals
   */
  async updateGoals(userId: string, goals: Partial<User['goals']>): Promise<User | null> {
    await connectToDatabase();

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { goals } },
      { new: true, runValidators: true }
    ).lean();

    if (!user) return null;

    return this.transformDocument(user);
  }

  /**
   * Deletes a user by ID
   */
  async delete(id: string): Promise<void> {
    await connectToDatabase();

    await UserModel.findByIdAndDelete(id);
  }

  /**
   * Counts users matching the filter
   */
  async count(filter?: Partial<User>): Promise<number> {
    await connectToDatabase();

    return await UserModel.countDocuments(filter || {});
  }

  /**
   * Checks if a user exists
   */
  async exists(filter: Partial<User>): Promise<boolean> {
    await connectToDatabase();

    const count = await UserModel.countDocuments(filter).limit(1);
    return count > 0;
  }

  /**
   * Transforms MongoDB document to User entity
   */
  private transformDocument(doc: any): User {
    return {
      id: doc._id.toString(),
      email: doc.email,
      name: doc.name,
      profile: doc.profile,
      preferences: doc.preferences,
      goals: doc.goals,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}

// Export singleton instance
export const userRepository = new MongoUserRepository();
