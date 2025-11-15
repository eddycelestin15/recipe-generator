'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import type { DayMealPlan, MealSlot } from '@/app/lib/types/meal-plan';
import type { MealType } from '@/app/lib/types/nutrition';
import { DAYS_OF_WEEK, getWeekStart, getWeekEnd } from '@/app/lib/types/meal-plan';
import { MEAL_TYPE_LABELS } from '@/app/lib/types/nutrition';

interface WeeklyCalendarProps {
  weekStart: Date;
  days: DayMealPlan[];
  onWeekChange: (newWeekStart: Date) => void;
  onMealClick: (date: Date, mealType: MealType, currentMeal?: MealSlot) => void;
  onMealRemove: (date: Date, mealType: MealType) => void;
}

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function WeeklyCalendar({
  weekStart,
  days,
  onWeekChange,
  onMealClick,
  onMealRemove,
}: WeeklyCalendarProps) {
  const weekEnd = getWeekEnd(weekStart);

  const handlePreviousWeek = () => {
    const newWeekStart = new Date(weekStart);
    newWeekStart.setDate(weekStart.getDate() - 7);
    onWeekChange(newWeekStart);
  };

  const handleNextWeek = () => {
    const newWeekStart = new Date(weekStart);
    newWeekStart.setDate(weekStart.getDate() + 7);
    onWeekChange(newWeekStart);
  };

  const getMealForSlot = (day: DayMealPlan, mealType: MealType): MealSlot | undefined => {
    return day.meals.find(meal => meal.mealType === mealType);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header with week navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePreviousWeek}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Semaine précédente"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-800">
          {formatDate(weekStart)} - {formatDate(weekEnd)}
        </h2>

        <button
          onClick={handleNextWeek}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Semaine suivante"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Header row with days */}
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div className="text-sm font-medium text-gray-500 p-2">Repas</div>
            {days.map((day, index) => (
              <div
                key={day.date.toISOString()}
                className={`text-center p-2 rounded-lg ${
                  isToday(day.date)
                    ? 'bg-orange-100 border-2 border-orange-500'
                    : 'bg-gray-50'
                }`}
              >
                <div className="text-xs font-medium text-gray-500">
                  {DAYS_OF_WEEK[index]}
                </div>
                <div className="text-sm font-bold text-gray-800">
                  {day.date.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Meal rows */}
          {MEAL_TYPES.map(mealType => (
            <div key={mealType} className="grid grid-cols-8 gap-2 mb-2">
              {/* Meal type label */}
              <div className="text-sm font-medium text-gray-700 p-2 flex items-center">
                {MEAL_TYPE_LABELS[mealType]}
              </div>

              {/* Meal slots for each day */}
              {days.map(day => {
                const meal = getMealForSlot(day, mealType);

                return (
                  <div
                    key={`${day.date.toISOString()}-${mealType}`}
                    className="relative group"
                  >
                    {meal ? (
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-3 min-h-[100px] cursor-pointer hover:shadow-md transition-all">
                        <div
                          onClick={() => onMealClick(day.date, mealType, meal)}
                          className="flex flex-col h-full"
                        >
                          <p className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1">
                            {meal.recipeName || 'Repas'}
                          </p>
                          {meal.calories && (
                            <p className="text-xs text-gray-600">
                              {meal.calories} kcal
                            </p>
                          )}
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMealRemove(day.date, mealType);
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onMealClick(day.date, mealType)}
                        className="w-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3 min-h-[100px] hover:border-orange-400 hover:bg-orange-50 transition-all flex items-center justify-center"
                      >
                        <Plus className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Week summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">Total repas</p>
            <p className="text-2xl font-bold text-gray-800">
              {days.reduce((sum, day) => sum + day.meals.length, 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Calories totales</p>
            <p className="text-2xl font-bold text-gray-800">
              {days
                .reduce(
                  (sum, day) =>
                    sum +
                    day.meals.reduce((mealSum, meal) => mealSum + (meal.calories || 0), 0),
                  0
                )
                .toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Calories/jour (moy.)</p>
            <p className="text-2xl font-bold text-gray-800">
              {Math.round(
                days.reduce(
                  (sum, day) =>
                    sum +
                    day.meals.reduce((mealSum, meal) => mealSum + (meal.calories || 0), 0),
                  0
                ) / 7
              ).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Recettes uniques</p>
            <p className="text-2xl font-bold text-gray-800">
              {
                new Set(
                  days.flatMap(day =>
                    day.meals.filter(m => m.recipeId).map(m => m.recipeId)
                  )
                ).size
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
