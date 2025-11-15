'use client';

import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import type { MealType, CustomFood } from '@/app/lib/types/nutrition';
import { MEAL_TYPE_LABELS } from '@/app/lib/types/nutrition';

interface QuickAddFoodProps {
  onAdd: (data: {
    mealType: MealType;
    customFood: CustomFood;
    servings: number;
    notes?: string;
  }) => void;
}

export function QuickAddFood({ onAdd }: QuickAddFoodProps) {
  const [query, setQuery] = useState('');
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [servings, setServings] = useState(1);
  const [notes, setNotes] = useState('');
  const [nutritionData, setNutritionData] = useState<CustomFood | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch('/api/nutrition/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (response.ok) {
        const data = await response.json();
        setNutritionData(data);
      }
    } catch (error) {
      console.error('Error searching nutrition data:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = () => {
    if (!nutritionData) return;

    onAdd({
      mealType,
      customFood: nutritionData,
      servings,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setQuery('');
    setNutritionData(null);
    setServings(1);
    setNotes('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Ajout rapide d&apos;aliment</h3>

      <div className="space-y-4">
        {/* Search input */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Ex: 1 pomme, 200ml lait..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Nutrition data display */}
        {nutritionData && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <h4 className="font-medium">{nutritionData.name}</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Calories:</span>{' '}
                <span className="font-medium">{nutritionData.calories} cal</span>
              </div>
              <div>
                <span className="text-gray-600">Protéines:</span>{' '}
                <span className="font-medium">{nutritionData.protein}g</span>
              </div>
              <div>
                <span className="text-gray-600">Glucides:</span>{' '}
                <span className="font-medium">{nutritionData.carbs}g</span>
              </div>
              <div>
                <span className="text-gray-600">Lipides:</span>{' '}
                <span className="font-medium">{nutritionData.fat}g</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de repas
                </label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as MealType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(MEAL_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Portions
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optionnel)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes additionnelles..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleAdd}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Ajouter au journal</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
