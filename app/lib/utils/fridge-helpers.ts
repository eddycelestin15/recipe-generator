import { differenceInDays, isPast } from 'date-fns';
import { ExpirationStatus, FridgeItem, FridgeCategory, FridgeStats } from '../types/fridge';

export function getExpirationStatus(expirationDate?: Date): ExpirationStatus {
  if (!expirationDate) {
    return {
      isExpired: false,
      isExpiringSoon: false,
    };
  }

  const now = new Date();
  const isExpired = isPast(expirationDate);
  const daysRemaining = differenceInDays(expirationDate, now);
  const isExpiringSoon = daysRemaining >= 0 && daysRemaining < 3;

  return {
    isExpired,
    isExpiringSoon,
    daysRemaining: isExpired ? undefined : daysRemaining,
  };
}

export function calculateFridgeStats(items: FridgeItem[]): FridgeStats {
  const stats: FridgeStats = {
    totalItems: items.length,
    itemsByCategory: {
      Fruits: 0,
      Légumes: 0,
      Viandes: 0,
      Poissons: 0,
      'Produits laitiers': 0,
      Céréales: 0,
      Condiments: 0,
      Autre: 0,
    },
    expiringCount: 0,
    expiredCount: 0,
    estimatedValue: 0,
  };

  items.forEach((item) => {
    stats.itemsByCategory[item.category]++;

    const expirationStatus = getExpirationStatus(item.expirationDate);
    if (expirationStatus.isExpired) {
      stats.expiredCount++;
    } else if (expirationStatus.isExpiringSoon) {
      stats.expiringCount++;
    }
  });

  // Valeur estimée basée sur des prix moyens par catégorie (en euros)
  const categoryPrices: Record<FridgeCategory, number> = {
    Fruits: 3,
    Légumes: 2.5,
    Viandes: 8,
    Poissons: 10,
    'Produits laitiers': 4,
    Céréales: 3,
    Condiments: 5,
    Autre: 3,
  };

  stats.estimatedValue = items.reduce((total, item) => {
    const pricePerItem = categoryPrices[item.category] || 3;
    return total + pricePerItem;
  }, 0);

  return stats;
}

export function getExpiringItems(items: FridgeItem[], daysThreshold: number = 2): FridgeItem[] {
  return items.filter((item) => {
    if (!item.expirationDate) return false;
    const status = getExpirationStatus(item.expirationDate);
    return !status.isExpired && status.daysRemaining !== undefined && status.daysRemaining <= daysThreshold;
  });
}

export function getExpiredItems(items: FridgeItem[]): FridgeItem[] {
  return items.filter((item) => {
    if (!item.expirationDate) return false;
    return getExpirationStatus(item.expirationDate).isExpired;
  });
}

export function sortItems(items: FridgeItem[], sortBy: 'name' | 'addedDate' | 'expirationDate'): FridgeItem[] {
  const sorted = [...items];

  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'addedDate':
      return sorted.sort((a, b) => b.addedDate.getTime() - a.addedDate.getTime());
    case 'expirationDate':
      return sorted.sort((a, b) => {
        if (!a.expirationDate && !b.expirationDate) return 0;
        if (!a.expirationDate) return 1;
        if (!b.expirationDate) return -1;
        return a.expirationDate.getTime() - b.expirationDate.getTime();
      });
    default:
      return sorted;
  }
}

export function filterItems(
  items: FridgeItem[],
  category?: FridgeCategory,
  searchQuery?: string
): FridgeItem[] {
  let filtered = [...items];

  if (category) {
    filtered = filtered.filter((item) => item.category === category);
  }

  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.notes?.toLowerCase().includes(query)
    );
  }

  return filtered;
}
