'use client';

import { useTranslations } from 'next-intl';
import { FridgeItem } from '@/app/lib/types/fridge';
import { getExpirationStatus } from '@/app/lib/utils/fridge-helpers';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash2, Edit, AlertTriangle, Clock } from 'lucide-react';

interface FridgeItemCardProps {
  item: FridgeItem;
  onEdit: (item: FridgeItem) => void;
  onDelete: (id: string) => void;
  viewMode: 'list' | 'grid';
}

export default function FridgeItemCard({ item, onEdit, onDelete, viewMode }: FridgeItemCardProps) {
  const t = useTranslations();
  const expirationStatus = getExpirationStatus(item.expirationDate);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Fruits: 'bg-red-100 text-red-800',
      Légumes: 'bg-green-100 text-green-800',
      Viandes: 'bg-pink-100 text-pink-800',
      Poissons: 'bg-blue-100 text-blue-800',
      'Produits laitiers': 'bg-yellow-100 text-yellow-800',
      Céréales: 'bg-amber-100 text-amber-800',
      Condiments: 'bg-purple-100 text-purple-800',
      Autre: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.Autre;
  };

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

  const getExpirationBadge = () => {
    if (!item.expirationDate) return null;

    if (expirationStatus.isExpired) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
          <AlertTriangle className="w-3 h-3" />
          <span>{t('fridge.expired')}</span>
        </div>
      );
    }

    if (expirationStatus.isExpiringSoon) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
          <Clock className="w-3 h-3" />
          <span>{t('fridge.daysRemaining', { days: expirationStatus.daysRemaining })}</span>
        </div>
      );
    }

    if (expirationStatus.daysRemaining !== undefined && expirationStatus.daysRemaining < 7) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
          <Clock className="w-3 h-3" />
          <span>{t('fridge.daysRemaining', { days: expirationStatus.daysRemaining })}</span>
        </div>
      );
    }

    return null;
  };

  if (viewMode === 'grid') {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-800 truncate">{item.name}</h3>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(item)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              aria-label={t('fridge.edit')}
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
              aria-label={t('fridge.delete')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
              {getCategoryLabel(item.category)}
            </span>
            {getExpirationBadge()}
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-medium">{item.quantity} {item.unit}</span>
          </div>

          {item.expirationDate && !expirationStatus.isExpired && (
            <div className="text-xs text-gray-500">
              {t('fridge.expiresOn', { date: format(item.expirationDate, 'dd MMM yyyy', { locale: fr }) })}
            </div>
          )}

          {item.notes && (
            <div className="text-xs text-gray-500 italic truncate">
              {item.notes}
            </div>
          )}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-800 truncate">{item.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
              {getCategoryLabel(item.category)}
            </span>
            {getExpirationBadge()}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="font-medium">{item.quantity} {item.unit}</span>
            {item.expirationDate && !expirationStatus.isExpired && (
              <span className="text-xs">
                {t('fridge.expiresOn', { date: format(item.expirationDate, 'dd MMM yyyy', { locale: fr }) })}
              </span>
            )}
            {item.notes && (
              <span className="text-xs italic truncate">{item.notes}</span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(item)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            aria-label={t('fridge.edit')}
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
            aria-label={t('fridge.delete')}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
