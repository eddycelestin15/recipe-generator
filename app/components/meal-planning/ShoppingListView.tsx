'use client';

import { useState } from 'react';
import { ShoppingCart, Check, Download, Trash2 } from 'lucide-react';
import type { ShoppingList, ShoppingListItem } from '@/app/lib/types/meal-plan';
import { FOOD_CATEGORIES } from '@/app/lib/types/meal-plan';

interface ShoppingListViewProps {
  shoppingList: ShoppingList;
  onToggleItem: (itemName: string) => void;
  onDelete: () => void;
  onExport?: () => void;
}

export default function ShoppingListView({
  shoppingList,
  onToggleItem,
  onDelete,
  onExport,
}: ShoppingListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Group items by category
  const itemsByCategory = shoppingList.items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShoppingListItem[]>);

  // Filter items based on search
  const filteredCategories = Object.entries(itemsByCategory).reduce((acc, [category, items]) => {
    const filteredItems = items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filteredItems.length > 0) {
      acc[category] = filteredItems;
    }
    return acc;
  }, {} as Record<string, ShoppingListItem[]>);

  const totalItems = shoppingList.items.length;
  const checkedItems = shoppingList.items.filter(item => item.checked).length;
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  const getCategoryInfo = (category: string) => {
    return FOOD_CATEGORIES.find(cat => cat.value === category) || {
      label: category,
      emoji: '📦',
    };
  };

  const handleExport = () => {
    // Generate text version
    let text = `Liste de courses - ${shoppingList.name}\n`;
    text += `Créée le ${shoppingList.createdDate.toLocaleDateString()}\n\n`;

    Object.entries(itemsByCategory).forEach(([category, items]) => {
      const categoryInfo = getCategoryInfo(category);
      text += `\n${categoryInfo.emoji} ${categoryInfo.label}:\n`;
      items.forEach(item => {
        const checked = item.checked ? '✓' : '☐';
        text += `  ${checked} ${item.name} - ${item.quantity} ${item.unit}\n`;
      });
    });

    // Create download
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `liste-courses-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (onExport) onExport();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-6 h-6 text-orange-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{shoppingList.name}</h2>
            <p className="text-sm text-gray-500">
              Créée le {shoppingList.createdDate.toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progression: {checkedItems}/{totalItems} articles
          </span>
          <span className="text-sm font-bold text-orange-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-500 to-red-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher un article..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      {/* Items by category */}
      <div className="space-y-6">
        {Object.entries(filteredCategories).map(([category, items]) => {
          const categoryInfo = getCategoryInfo(category);
          const categoryChecked = items.filter(item => item.checked).length;

          return (
            <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Category header */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span className="text-2xl">{categoryInfo.emoji}</span>
                    {categoryInfo.label}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {categoryChecked}/{items.length}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-100">
                {items.map(item => (
                  <label
                    key={item.name}
                    className={`flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                      item.checked ? 'opacity-60' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => onToggleItem(item.name)}
                      className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${
                            item.checked ? 'line-through text-gray-500' : 'text-gray-800'
                          }`}
                        >
                          {item.name}
                        </span>
                        {item.inFridge && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Dans le frigo
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-600">
                          {item.quantity} {item.unit}
                        </span>
                        {item.estimatedPrice && (
                          <span className="text-sm text-gray-500">
                            ~{item.estimatedPrice.toFixed(2)}€
                          </span>
                        )}
                        {item.recipeIds.length > 0 && (
                          <span className="text-xs text-gray-400">
                            Pour {item.recipeIds.length} recette
                            {item.recipeIds.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    {item.checked && (
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Total estimated */}
      {shoppingList.totalEstimated && shoppingList.totalEstimated > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-gray-700">Total estimé</span>
            <span className="text-2xl font-bold text-orange-600">
              {shoppingList.totalEstimated.toFixed(2)}€
            </span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {Object.keys(filteredCategories).length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchQuery
              ? 'Aucun article trouvé'
              : 'Liste de courses vide'}
          </p>
        </div>
      )}
    </div>
  );
}
