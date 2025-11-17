'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';
import type { MealPlanGenerationCriteria } from '@/app/lib/types/meal-plan';

interface GenerateMealPlanProps {
  weekStart: Date;
  onGenerate: (criteria: MealPlanGenerationCriteria) => Promise<void>;
  defaultCalorieTarget?: number;
}

export default function GenerateMealPlan({
  weekStart,
  onGenerate,
  defaultCalorieTarget = 2000,
}: GenerateMealPlanProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form state
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState(defaultCalorieTarget);
  const [avoidRepetition, setAvoidRepetition] = useState(true);
  const [useFridgeItems, setUseFridgeItems] = useState(true);
  const [considerPrepTime, setConsiderPrepTime] = useState(true);
  const [balanceNutrition, setBalanceNutrition] = useState(true);
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);

  const handleGenerate = async () => {
    const criteria: MealPlanGenerationCriteria = {
      dailyCalorieTarget,
      avoidRepetition,
      useFridgeItems,
      considerPrepTime,
      balanceNutrition,
      dietaryPreferences,
      maxPrepTimePerDay: considerPrepTime
        ? {
            monday: 45,
            tuesday: 45,
            wednesday: 45,
            thursday: 45,
            friday: 60,
            saturday: 90,
            sunday: 90,
          }
        : undefined,
      preferredMealTypes: {
        breakfast: 7,
        lunch: 7,
        dinner: 7,
        snack: 3,
      },
    };

    setIsGenerating(true);
    try {
      await onGenerate(criteria);
      setIsOpen(false);
    } catch (error) {
      console.error('Error generating meal plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleDietaryPreference = (preference: string) => {
    setDietaryPreferences(prev =>
      prev.includes(preference)
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };

  const dietaryOptions = [
    'vegetarian',
    'vegan',
    'low-carb',
    'high-protein',
    'keto',
    'paleo',
    'gluten-free',
    'dairy-free',
  ];

  return (
    <>
      {/* Generate button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
      >
        <Sparkles className="w-5 h-5" />
        {t('mealPlanning.generateWeeklyPlan')}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-orange-500" />
                <h2 className="text-2xl font-bold text-gray-800">
                  {t('mealPlanning.generatePlanTitle')}
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isGenerating}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Calorie target */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('mealPlanning.dailyCalorieTarget')}
                </label>
                <input
                  type="number"
                  value={dailyCalorieTarget}
                  onChange={(e) => setDailyCalorieTarget(Number(e.target.value))}
                  min="1000"
                  max="5000"
                  step="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={isGenerating}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('mealPlanning.calorieTargetHelp')}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={avoidRepetition}
                    onChange={(e) => setAvoidRepetition(e.target.checked)}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                    disabled={isGenerating}
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      {t('mealPlanning.varyRecipes')}
                    </span>
                    <p className="text-xs text-gray-500">
                      {t('mealPlanning.varyRecipesHelp')}
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useFridgeItems}
                    onChange={(e) => setUseFridgeItems(e.target.checked)}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                    disabled={isGenerating}
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      {t('mealPlanning.useFridgeItems')}
                    </span>
                    <p className="text-xs text-gray-500">
                      {t('mealPlanning.useFridgeItemsHelp')}
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={considerPrepTime}
                    onChange={(e) => setConsiderPrepTime(e.target.checked)}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                    disabled={isGenerating}
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      {t('mealPlanning.adaptPrepTime')}
                    </span>
                    <p className="text-xs text-gray-500">
                      {t('mealPlanning.adaptPrepTimeHelp')}
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={balanceNutrition}
                    onChange={(e) => setBalanceNutrition(e.target.checked)}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                    disabled={isGenerating}
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      {t('mealPlanning.balanceNutrition')}
                    </span>
                    <p className="text-xs text-gray-500">
                      {t('mealPlanning.balanceNutritionHelp')}
                    </p>
                  </div>
                </label>
              </div>

              {/* Dietary preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('mealPlanning.dietaryPreferences')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map(option => (
                    <button
                      key={option}
                      onClick={() => toggleDietaryPreference(option)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        dietaryPreferences.includes(option)
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      disabled={isGenerating}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  {t('mealPlanning.generationNote')}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isGenerating}
              >
                {t('mealPlanning.cancel')}
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('mealPlanning.generatingInProgress')}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {t('mealPlanning.generate')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
