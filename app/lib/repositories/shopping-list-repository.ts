/**
 * Shopping List Repository
 *
 * Data access layer for shopping list management using localStorage
 * Provides CRUD operations and item management
 */

import type {
  ShoppingList,
  CreateShoppingListDTO,
  UpdateShoppingListDTO,
  ShoppingListItem,
} from '../types/meal-plan';

/**
 * Generate a unique ID for shopping lists
 */
function generateId(): string {
  return `shopping_list_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

const STORAGE_KEY_PREFIX = 'shopping_lists_';

export class ShoppingListRepository {
  /**
   * Get the current user ID from localStorage
   */
  private static getUserId(): string {
    let userId = localStorage.getItem('current_user_id');
    if (!userId) {
      userId = 'default_user';
      localStorage.setItem('current_user_id', userId);
    }
    return userId;
  }

  /**
   * Get storage key for current user
   */
  private static getStorageKey(): string {
    return `${STORAGE_KEY_PREFIX}${this.getUserId()}`;
  }

  /**
   * Get all shopping lists from localStorage
   */
  private static getAllShoppingListsFromStorage(): ShoppingList[] {
    const data = localStorage.getItem(this.getStorageKey());
    if (!data) return [];

    try {
      const shoppingLists = JSON.parse(data);
      // Convert date strings back to Date objects
      return shoppingLists.map((list: any) => ({
        ...list,
        createdDate: new Date(list.createdDate),
      }));
    } catch (error) {
      console.error('Error parsing shopping lists from localStorage:', error);
      return [];
    }
  }

  /**
   * Save all shopping lists to localStorage
   */
  private static saveAllShoppingListsToStorage(shoppingLists: ShoppingList[]): void {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(shoppingLists));
  }

  /**
   * Get all shopping lists for the current user
   */
  static getAll(): ShoppingList[] {
    return this.getAllShoppingListsFromStorage();
  }

  /**
   * Get a shopping list by ID
   */
  static getById(id: string): ShoppingList | null {
    const shoppingLists = this.getAllShoppingListsFromStorage();
    return shoppingLists.find(list => list.id === id) || null;
  }

  /**
   * Get shopping list by meal plan ID
   */
  static getByMealPlanId(mealPlanId: string): ShoppingList | null {
    const shoppingLists = this.getAllShoppingListsFromStorage();
    return shoppingLists.find(list => list.mealPlanId === mealPlanId) || null;
  }

  /**
   * Get recent shopping lists
   */
  static getRecent(limit: number = 5): ShoppingList[] {
    const shoppingLists = this.getAllShoppingListsFromStorage();
    return shoppingLists
      .sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime())
      .slice(0, limit);
  }

  /**
   * Get active shopping lists (not completed)
   */
  static getActive(): ShoppingList[] {
    const shoppingLists = this.getAllShoppingListsFromStorage();
    return shoppingLists.filter(list => !list.isCompleted);
  }

  /**
   * Create a new shopping list
   */
  static create(data: CreateShoppingListDTO): ShoppingList {
    const shoppingLists = this.getAllShoppingListsFromStorage();

    const newShoppingList: ShoppingList = {
      id: generateId(),
      userId: this.getUserId(),
      mealPlanId: data.mealPlanId,
      name: data.name,
      createdDate: new Date(),
      items: data.items || [],
      totalEstimated: this.calculateTotalEstimated(data.items || []),
      isCompleted: false,
    };

    shoppingLists.push(newShoppingList);
    this.saveAllShoppingListsToStorage(shoppingLists);

    return newShoppingList;
  }

  /**
   * Update a shopping list
   */
  static update(id: string, data: UpdateShoppingListDTO): ShoppingList | null {
    const shoppingLists = this.getAllShoppingListsFromStorage();
    const index = shoppingLists.findIndex(list => list.id === id);

    if (index === -1) return null;

    const updatedShoppingList: ShoppingList = {
      ...shoppingLists[index],
      ...data,
    };

    // Recalculate total estimated if items were updated
    if (data.items) {
      updatedShoppingList.totalEstimated = this.calculateTotalEstimated(data.items);
    }

    shoppingLists[index] = updatedShoppingList;
    this.saveAllShoppingListsToStorage(shoppingLists);

    return updatedShoppingList;
  }

  /**
   * Toggle item checked status
   */
  static toggleItemChecked(id: string, itemName: string): ShoppingList | null {
    const shoppingList = this.getById(id);
    if (!shoppingList) return null;

    const itemIndex = shoppingList.items.findIndex(item => item.name === itemName);
    if (itemIndex === -1) return null;

    shoppingList.items[itemIndex].checked = !shoppingList.items[itemIndex].checked;

    return this.update(id, { items: shoppingList.items });
  }

  /**
   * Add item to shopping list
   */
  static addItem(id: string, item: ShoppingListItem): ShoppingList | null {
    const shoppingList = this.getById(id);
    if (!shoppingList) return null;

    // Check if item already exists
    const existingItemIndex = shoppingList.items.findIndex(
      existing => existing.name.toLowerCase() === item.name.toLowerCase()
    );

    if (existingItemIndex !== -1) {
      // Update quantity of existing item
      shoppingList.items[existingItemIndex].quantity += item.quantity;
      shoppingList.items[existingItemIndex].recipeIds = [
        ...new Set([...shoppingList.items[existingItemIndex].recipeIds, ...item.recipeIds]),
      ];
    } else {
      // Add new item
      shoppingList.items.push(item);
    }

    return this.update(id, { items: shoppingList.items });
  }

  /**
   * Remove item from shopping list
   */
  static removeItem(id: string, itemName: string): ShoppingList | null {
    const shoppingList = this.getById(id);
    if (!shoppingList) return null;

    shoppingList.items = shoppingList.items.filter(item => item.name !== itemName);

    return this.update(id, { items: shoppingList.items });
  }

  /**
   * Mark shopping list as completed
   */
  static markCompleted(id: string): ShoppingList | null {
    return this.update(id, { isCompleted: true });
  }

  /**
   * Delete a shopping list
   */
  static delete(id: string): boolean {
    const shoppingLists = this.getAllShoppingListsFromStorage();
    const filteredShoppingLists = shoppingLists.filter(list => list.id !== id);

    if (filteredShoppingLists.length === shoppingLists.length) {
      return false; // Shopping list not found
    }

    this.saveAllShoppingListsToStorage(filteredShoppingLists);
    return true;
  }

  /**
   * Calculate total estimated price
   */
  private static calculateTotalEstimated(items: ShoppingListItem[]): number {
    return items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);
  }

  /**
   * Get statistics about a shopping list
   */
  static getStats(id: string): {
    totalItems: number;
    checkedItems: number;
    uncheckedItems: number;
    totalEstimated: number;
    itemsByCategory: Record<string, number>;
  } | null {
    const shoppingList = this.getById(id);
    if (!shoppingList) return null;

    const itemsByCategory = shoppingList.items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalItems: shoppingList.items.length,
      checkedItems: shoppingList.items.filter(item => item.checked).length,
      uncheckedItems: shoppingList.items.filter(item => !item.checked).length,
      totalEstimated: shoppingList.totalEstimated || 0,
      itemsByCategory,
    };
  }

  /**
   * Delete all shopping lists (for testing/reset purposes)
   */
  static deleteAll(): void {
    localStorage.removeItem(this.getStorageKey());
  }
}
