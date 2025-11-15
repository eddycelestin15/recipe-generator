'use client';

import { FridgeItem } from '@/app/lib/types/fridge';
import { getExpirationStatus } from '@/app/lib/utils/fridge-helpers';
import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

interface ExpirationAlertsProps {
  items: FridgeItem[];
}

export default function ExpirationAlerts({ items }: ExpirationAlertsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

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
              <p className="font-medium text-red-800">Article expiré</p>
              <p className="text-sm text-red-700">
                <span className="font-semibold">{item.name}</span> ({item.category}) a expiré et devrait être retiré du frigo.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleDismiss(item.id)}
            className="p-1 hover:bg-red-100 rounded-full transition-colors flex-shrink-0"
            aria-label="Masquer l'alerte"
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
                <p className="font-medium text-orange-800">Article expirant bientôt</p>
                <p className="text-sm text-orange-700">
                  <span className="font-semibold">{item.name}</span> ({item.category}) expire dans{' '}
                  <span className="font-semibold">{status.daysRemaining} jour{status.daysRemaining! > 1 ? 's' : ''}</span>.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDismiss(item.id)}
              className="p-1 hover:bg-orange-100 rounded-full transition-colors flex-shrink-0"
              aria-label="Masquer l'alerte"
            >
              <X className="w-4 h-4 text-orange-500" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
