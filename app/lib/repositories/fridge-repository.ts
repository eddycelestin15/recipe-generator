import { FridgeItem, CreateFridgeItemDTO, UpdateFridgeItemDTO } from '../types/fridge';

const STORAGE_KEY = 'smart_fridge_items';

export class FridgeRepository {
  private static getUserId(): string {
    // Pour le moment, on utilise un userId par défaut
    // À remplacer par l'authentification réelle plus tard
    let userId = localStorage.getItem('current_user_id');
    if (!userId) {
      userId = 'default_user';
      localStorage.setItem('current_user_id', userId);
    }
    return userId;
  }

  private static getStorageKey(userId: string): string {
    return `${STORAGE_KEY}_${userId}`;
  }

  private static loadItems(userId: string): FridgeItem[] {
    if (typeof window === 'undefined') return [];

    const key = this.getStorageKey(userId);
    const data = localStorage.getItem(key);

    if (!data) return [];

    try {
      const items = JSON.parse(data);
      // Convertir les dates string en objets Date
      return items.map((item: any) => ({
        ...item,
        addedDate: new Date(item.addedDate),
        expirationDate: item.expirationDate ? new Date(item.expirationDate) : undefined,
      }));
    } catch (error) {
      console.error('Error loading fridge items:', error);
      return [];
    }
  }

  private static saveItems(userId: string, items: FridgeItem[]): void {
    if (typeof window === 'undefined') return;

    const key = this.getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(items));
  }

  static async getAll(): Promise<FridgeItem[]> {
    const userId = this.getUserId();
    return this.loadItems(userId);
  }

  static async getById(id: string): Promise<FridgeItem | null> {
    const items = await this.getAll();
    return items.find((item) => item.id === id) || null;
  }

  static async create(data: CreateFridgeItemDTO): Promise<FridgeItem> {
    const userId = this.getUserId();
    const items = this.loadItems(userId);

    const newItem: FridgeItem = {
      id: crypto.randomUUID(),
      userId,
      name: data.name,
      quantity: data.quantity,
      unit: data.unit,
      category: data.category,
      expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
      addedDate: new Date(),
      imageUrl: data.imageUrl,
      notes: data.notes,
    };

    items.push(newItem);
    this.saveItems(userId, items);

    return newItem;
  }

  static async update(id: string, data: UpdateFridgeItemDTO): Promise<FridgeItem | null> {
    const userId = this.getUserId();
    const items = this.loadItems(userId);
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) return null;

    const updatedItem: FridgeItem = {
      ...items[index],
      ...(data.name && { name: data.name }),
      ...(data.quantity !== undefined && { quantity: data.quantity }),
      ...(data.unit && { unit: data.unit }),
      ...(data.category && { category: data.category }),
      ...(data.expirationDate !== undefined && {
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
      }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.notes !== undefined && { notes: data.notes }),
    };

    items[index] = updatedItem;
    this.saveItems(userId, items);

    return updatedItem;
  }

  static async delete(id: string): Promise<boolean> {
    const userId = this.getUserId();
    const items = this.loadItems(userId);
    const filteredItems = items.filter((item) => item.id !== id);

    if (filteredItems.length === items.length) {
      return false; // Item not found
    }

    this.saveItems(userId, filteredItems);
    return true;
  }

  static async getExpiring(daysThreshold: number = 2): Promise<FridgeItem[]> {
    const items = await this.getAll();
    const now = new Date();

    return items.filter((item) => {
      if (!item.expirationDate) return false;

      const daysUntilExpiration = Math.ceil(
        (item.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      return daysUntilExpiration >= 0 && daysUntilExpiration <= daysThreshold;
    });
  }

  static async deleteAll(): Promise<void> {
    const userId = this.getUserId();
    const key = this.getStorageKey(userId);
    localStorage.removeItem(key);
  }
}
