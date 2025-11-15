export type FridgeCategory =
  | 'Fruits'
  | 'Légumes'
  | 'Viandes'
  | 'Poissons'
  | 'Produits laitiers'
  | 'Céréales'
  | 'Condiments'
  | 'Autre';

export type Unit = 'g' | 'kg' | 'ml' | 'L' | 'pcs' | 'cup' | 'tbsp';

export interface FridgeItem {
  id: string;
  userId: string;
  name: string;
  quantity: number;
  unit: Unit;
  category: FridgeCategory;
  expirationDate?: Date;
  addedDate: Date;
  imageUrl?: string;
  notes?: string;
}

export interface CreateFridgeItemDTO {
  name: string;
  quantity: number;
  unit: Unit;
  category: FridgeCategory;
  expirationDate?: string;
  imageUrl?: string;
  notes?: string;
}

export interface UpdateFridgeItemDTO {
  name?: string;
  quantity?: number;
  unit?: Unit;
  category?: FridgeCategory;
  expirationDate?: string;
  imageUrl?: string;
  notes?: string;
}

export type SortOption = 'name' | 'addedDate' | 'expirationDate';
export type ViewMode = 'list' | 'grid';

export interface FridgeStats {
  totalItems: number;
  itemsByCategory: Record<FridgeCategory, number>;
  expiringCount: number;
  expiredCount: number;
  estimatedValue?: number;
}

export interface ExpirationStatus {
  isExpired: boolean;
  isExpiringSoon: boolean; // < 3 days
  daysRemaining?: number;
}
