'use client';

import { useState } from 'react';
import { RecipeSearchFilters, CUISINE_TYPES, MealType, RecipeDifficulty } from '@/app/lib/types/recipe';
import { Search, Filter, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface RecipeFiltersProps {
  filters: RecipeSearchFilters;
  onFiltersChange: (filters: RecipeSearchFilters) => void;
  availableTags: string[];
}

export default function RecipeFilters({ filters, onFiltersChange, availableTags }: RecipeFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const t = useTranslations();

  const handleQueryChange = (query: string) => {
    onFiltersChange({ ...filters, query });
  };

  const handleDifficultyChange = (difficulty: RecipeDifficulty | undefined) => {
    onFiltersChange({ ...filters, difficulty });
  };

  const handleCuisineTypeChange = (cuisineType: string | undefined) => {
    onFiltersChange({ ...filters, cuisineType });
  };

  const handleMealTypeChange = (mealType: MealType | undefined) => {
    onFiltersChange({ ...filters, mealType });
  };

  const handleMaxPrepTimeChange = (maxPrepTime: number | undefined) => {
    onFiltersChange({ ...filters, maxPrepTime });
  };

  const handleTagsChange = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    onFiltersChange({ ...filters, tags: newTags.length > 0 ? newTags : undefined });
  };

  const handleToggleFavorite = () => {
    onFiltersChange({
      ...filters,
      isFavorite: filters.isFavorite === undefined ? true : filters.isFavorite ? false : undefined,
    });
  };

  const handleToggleGenerated = () => {
    onFiltersChange({
      ...filters,
      isGenerated: filters.isGenerated === undefined ? true : filters.isGenerated ? false : undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {/* Search Bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t('recipes.searchPlaceholder')}
            value={filters.query || ''}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            hasActiveFilters
              ? 'bg-orange-500 text-white'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span className="hidden sm:inline">{t('recipes.filters')}</span>
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            <span className="hidden sm:inline">{t('common.clear')}</span>
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('recipes.difficulty')}
            </label>
            <select
              value={filters.difficulty || ''}
              onChange={(e) => handleDifficultyChange(e.target.value as RecipeDifficulty || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">{t('recipes.allDifficulties')}</option>
              <option value="easy">{t('recipes.difficultyEasy')}</option>
              <option value="medium">{t('recipes.difficultyMedium')}</option>
              <option value="hard">{t('recipes.difficultyHard')}</option>
            </select>
          </div>

          {/* Cuisine Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('recipes.cuisineType')}
            </label>
            <select
              value={filters.cuisineType || ''}
              onChange={(e) => handleCuisineTypeChange(e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">{t('recipes.allCuisines')}</option>
              {CUISINE_TYPES.map((cuisine) => (
                <option key={cuisine.value} value={cuisine.value}>
                  {cuisine.label}
                </option>
              ))}
            </select>
          </div>

          {/* Meal Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('recipes.mealType')}
            </label>
            <select
              value={filters.mealType || ''}
              onChange={(e) => handleMealTypeChange(e.target.value as MealType || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">{t('recipes.allMealTypes')}</option>
              <option value="breakfast">{t('recipes.breakfast')}</option>
              <option value="lunch">{t('recipes.lunch')}</option>
              <option value="dinner">{t('recipes.dinner')}</option>
              <option value="snack">{t('recipes.snack')}</option>
              <option value="dessert">{t('recipes.dessert')}</option>
            </select>
          </div>

          {/* Max Prep Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('recipes.maxPrepTime')}
            </label>
            <select
              value={filters.maxPrepTime || ''}
              onChange={(e) => handleMaxPrepTimeChange(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">{t('recipes.allTimes')}</option>
              <option value="15">{t('recipes.time15min')}</option>
              <option value="30">{t('recipes.time30min')}</option>
              <option value="60">{t('recipes.time1hour')}</option>
              <option value="120">{t('recipes.time2hours')}</option>
            </select>
          </div>

          {/* Quick Filters */}
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('recipes.quickFilters')}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleToggleFavorite}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filters.isFavorite === true
                    ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-500'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('recipes.favorites')}
              </button>
              <button
                onClick={handleToggleGenerated}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filters.isGenerated === true
                    ? 'bg-purple-100 text-purple-800 border-2 border-purple-500'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('recipes.aiGenerated')}
              </button>
            </div>
          </div>

          {/* Tags */}
          {availableTags.length > 0 && (
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('recipes.tags')}
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagsChange(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      filters.tags?.includes(tag)
                        ? 'bg-orange-100 text-orange-800 border-2 border-orange-500'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
