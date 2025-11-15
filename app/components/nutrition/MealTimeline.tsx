'use client';

import { Coffee, Sun, Moon, Cookie, Trash2 } from 'lucide-react';
import type { MealLog } from '@/app/lib/types/nutrition';
import { MEAL_TYPE_LABELS } from '@/app/lib/types/nutrition';

interface MealTimelineProps {
  meals: Array<MealLog & {
    nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    displayName: string;
  }>;
  onDelete?: (mealId: string) => void;
}

const mealIcons = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snack: Cookie,
};

const mealColors = {
  breakfast: 'bg-yellow-100 text-yellow-700',
  lunch: 'bg-blue-100 text-blue-700',
  dinner: 'bg-purple-100 text-purple-700',
  snack: 'bg-green-100 text-green-700',
};

export function MealTimeline({ meals, onDelete }: MealTimelineProps) {
  if (meals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Aucun repas enregistré pour aujourd&apos;hui</p>
        <p className="text-sm mt-2">Commencez à logger vos repas!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {meals.map((meal) => {
        const Icon = mealIcons[meal.mealType];
        const colorClass = mealColors[meal.mealType];

        return (
          <div
            key={meal.id}
            className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className={`p-3 rounded-full ${colorClass}`}>
              <Icon className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{meal.displayName}</h4>
                  <p className="text-sm text-gray-500">
                    {MEAL_TYPE_LABELS[meal.mealType]}
                    {meal.servings !== 1 && ` • ${meal.servings} portion(s)`}
                  </p>
                </div>
                {onDelete && (
                  <button
                    onClick={() => onDelete(meal.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                <span className="text-gray-600">
                  <span className="font-medium">{Math.round(meal.nutrition.calories * meal.servings)}</span> cal
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">
                  P: <span className="font-medium">{Math.round(meal.nutrition.protein * meal.servings)}g</span>
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">
                  G: <span className="font-medium">{Math.round(meal.nutrition.carbs * meal.servings)}g</span>
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">
                  L: <span className="font-medium">{Math.round(meal.nutrition.fat * meal.servings)}g</span>
                </span>
              </div>

              {meal.notes && (
                <p className="mt-2 text-sm text-gray-500 italic">{meal.notes}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
