import { FridgeItem } from '../models';
import { IExtendedRepository, QueryOptions } from './base.repository';
import { FridgeItemModel } from '../schemas/fridge-item.schema';
import { connectToDatabase } from '../db-client';

/**
 * FridgeItem-specific repository interface
 */
export interface IFridgeItemRepository extends IExtendedRepository<FridgeItem> {
  findByUserId(userId: string): Promise<FridgeItem[]>;
  findByUserIdAndCategory(userId: string, category: string): Promise<FridgeItem[]>;
  findExpiringSoon(userId: string, daysAhead: number): Promise<FridgeItem[]>;
  findExpired(userId: string): Promise<FridgeItem[]>;
  deleteByUserId(userId: string): Promise<void>;
}

/**
 * MongoDB implementation of FridgeItem Repository
 */
export class MongoFridgeItemRepository implements IFridgeItemRepository {
  /**
   * Creates a new fridge item
   */
  async create(data: Omit<FridgeItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<FridgeItem> {
    await connectToDatabase();

    const item = await FridgeItemModel.create(data);
    return item.toObject() as FridgeItem;
  }

  /**
   * Finds a fridge item by ID
   */
  async findById(id: string): Promise<FridgeItem | null> {
    await connectToDatabase();

    const item = await FridgeItemModel.findById(id).lean();
    if (!item) return null;

    return this.transformDocument(item);
  }

  /**
   * Finds all fridge items for a specific user
   */
  async findByUserId(userId: string): Promise<FridgeItem[]> {
    await connectToDatabase();

    const items = await FridgeItemModel.find({ userId }).sort({ addedDate: -1 }).lean();
    return items.map(item => this.transformDocument(item));
  }

  /**
   * Finds fridge items by user ID and category
   */
  async findByUserIdAndCategory(userId: string, category: string): Promise<FridgeItem[]> {
    await connectToDatabase();

    const items = await FridgeItemModel.find({ userId, category })
      .sort({ addedDate: -1 })
      .lean();
    return items.map(item => this.transformDocument(item));
  }

  /**
   * Finds items expiring within the specified number of days
   */
  async findExpiringSoon(userId: string, daysAhead: number): Promise<FridgeItem[]> {
    await connectToDatabase();

    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const items = await FridgeItemModel.find({
      userId,
      expirationDate: {
        $gte: now,
        $lte: futureDate,
      },
    })
      .sort({ expirationDate: 1 })
      .lean();

    return items.map(item => this.transformDocument(item));
  }

  /**
   * Finds expired items
   */
  async findExpired(userId: string): Promise<FridgeItem[]> {
    await connectToDatabase();

    const now = new Date();

    const items = await FridgeItemModel.find({
      userId,
      expirationDate: { $lt: now },
    })
      .sort({ expirationDate: 1 })
      .lean();

    return items.map(item => this.transformDocument(item));
  }

  /**
   * Finds multiple fridge items matching the filter
   */
  async findMany(filter?: Partial<FridgeItem>): Promise<FridgeItem[]> {
    await connectToDatabase();

    const items = await FridgeItemModel.find(filter || {}).lean();
    return items.map(item => this.transformDocument(item));
  }

  /**
   * Finds multiple fridge items with query options
   */
  async findManyWithOptions(
    filter?: Partial<FridgeItem>,
    options?: QueryOptions
  ): Promise<FridgeItem[]> {
    await connectToDatabase();

    let query = FridgeItemModel.find(filter || {});

    if (options?.limit) query = query.limit(options.limit);
    if (options?.skip) query = query.skip(options.skip);
    if (options?.sort) query = query.sort(options.sort);

    const items = await query.lean();
    return items.map(item => this.transformDocument(item));
  }

  /**
   * Finds one fridge item matching the filter
   */
  async findOne(filter: Partial<FridgeItem>): Promise<FridgeItem | null> {
    await connectToDatabase();

    const item = await FridgeItemModel.findOne(filter).lean();
    if (!item) return null;

    return this.transformDocument(item);
  }

  /**
   * Updates a fridge item by ID
   */
  async update(
    id: string,
    data: Partial<Omit<FridgeItem, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<FridgeItem | null> {
    await connectToDatabase();

    const item = await FridgeItemModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();

    if (!item) return null;

    return this.transformDocument(item);
  }

  /**
   * Deletes a fridge item by ID
   */
  async delete(id: string): Promise<void> {
    await connectToDatabase();

    await FridgeItemModel.findByIdAndDelete(id);
  }

  /**
   * Deletes all fridge items for a user
   */
  async deleteByUserId(userId: string): Promise<void> {
    await connectToDatabase();

    await FridgeItemModel.deleteMany({ userId });
  }

  /**
   * Counts fridge items matching the filter
   */
  async count(filter?: Partial<FridgeItem>): Promise<number> {
    await connectToDatabase();

    return await FridgeItemModel.countDocuments(filter || {});
  }

  /**
   * Checks if a fridge item exists
   */
  async exists(filter: Partial<FridgeItem>): Promise<boolean> {
    await connectToDatabase();

    const count = await FridgeItemModel.countDocuments(filter).limit(1);
    return count > 0;
  }

  /**
   * Transforms MongoDB document to FridgeItem entity
   */
  private transformDocument(doc: any): FridgeItem {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      name: doc.name,
      quantity: doc.quantity,
      unit: doc.unit,
      category: doc.category,
      expirationDate: doc.expirationDate,
      addedDate: doc.addedDate,
      imageUrl: doc.imageUrl,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}

// Export singleton instance
export const fridgeItemRepository = new MongoFridgeItemRepository();
