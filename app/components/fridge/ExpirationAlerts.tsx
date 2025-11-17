'use client';

import { useTranslations } from 'next-intl';
import { FridgeItem } from '@/app/lib/types/fridge';
import { getExpirationStatus } from '@/app/lib/utils/fridge-helpers';
import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

interface ExpirationAlertsProps {
  items: FridgeItem[];
}

export default function ExpirationAlerts({ items }: ExpirationAlertsProps) {
  const t = useTranslations();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const getCategoryLabel = (category: string): string => {
    const categoryMap: Record<string, string> = {
      'Fruits': t('fridge.categories.fruits'),
      'Légumes': t('fridge.categories.vegetables'),
      'Viandes': t('fridge.categories.meats'),
      'Poissons': t('fridge.categories.fish'),
      'Produits laitiers': t('fridge.categories.dairy'),
      'Céréales': t('fridge.categories.grains'),
      'Condiments': t('fridge.categories.condiments'),
      'Autre': t('fridge.categories.other'),
    };
    return categoryMap[category] || category;
  };

  const expiringItems = items.filter((item) => {
    if (!item.expirationDate || dismissed.has(item.id)) return false;
    const status = getExpirationStatus(item.expirationDate);
    return status.isExpiringSoon && status.daysRemaining !== undefined && status.daysRemaining <= 2;
  });

  const expiredItems = items.filter((item) => {
    if (!item.expirationDate || dismissed.has(item.id)) return false;
    return getExpirationStatus(item.expirationDate).isExpired;
  });

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
  };

  if (expiringItems.length === 0 && expiredItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {expiredItems.map((item) => (
        <div
          key={item.id}
          className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start justify-between"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800">{t('fridge.itemExpired')}</p>
              <p className="text-sm text-red-700">
                {t('fridge.expiredMessage', { name: item.name, category: getCategoryLabel(item.category) })}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleDismiss(item.id)}
            className="p-1 hover:bg-red-100 rounded-full transition-colors flex-shrink-0"
            aria-label={t('fridge.dismissAlert')}
          >
            <X className="w-4 h-4 text-red-500" />
          </button>
        </div>
      ))}

      {expiringItems.map((item) => {
        const status = getExpirationStatus(item.expirationDate);
        return (
          <div
            key={item.id}
            className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg flex items-start justify-between"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-orange-800">{t('fridge.itemExpiringSoon')}</p>
                <p className="text-sm text-orange-700">
                  {t('fridge.expiringSoonMessage', {
                    name: item.name,
                    category: getCategoryLabel(item.category),
                    days: status.daysRemaining
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDismiss(item.id)}
              className="p-1 hover:bg-orange-100 rounded-full transition-colors flex-shrink-0"
              aria-label={t('fridge.dismissAlert')}
            >
              <X className="w-4 h-4 text-orange-500" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
