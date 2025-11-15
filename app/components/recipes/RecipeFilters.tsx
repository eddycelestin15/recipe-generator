'use client';

import { useState } from 'react';
import { RecipeSearchFilters, CUISINE_TYPES, MealType, RecipeDifficulty } from '@/app/lib/types/recipe';
import { Search, Filter, X } from 'lucide-react';

interface RecipeFiltersProps {
  filters: RecipeSearchFilters;
  onFiltersChange: (filters: RecipeSearchFilters) => void;
  availableTags: string[];
}

export default function RecipeFilters({ filters, onFiltersChange, availableTags }: RecipeFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

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
            placeholder="Rechercher une recette..."
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
          <span className="hidden sm:inline">Filtres</span>
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            <span className="hidden sm:inline">Effacer</span>
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulté
            </label>
            <select
              value={filters.difficulty || ''}
              onChange={(e) => handleDifficultyChange(e.target.value as RecipeDifficulty || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Toutes</option>
              <option value="easy">Facile</option>
              <option value="medium">Moyen</option>
              <option value="hard">Difficile</option>
            </select>
          </div>

          {/* Cuisine Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de cuisine
            </label>
            <select
              value={filters.cuisineType || ''}
              onChange={(e) => handleCuisineTypeChange(e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Toutes</option>
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
              Type de repas
            </label>
            <select
              value={filters.mealType || ''}
              onChange={(e) => handleMealTypeChange(e.target.value as MealType || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Tous</option>
              <option value="breakfast">Petit-déjeuner</option>
              <option value="lunch">Déjeuner</option>
              <option value="dinner">Dîner</option>
              <option value="snack">Snack</option>
              <option value="dessert">Dessert</option>
            </select>
          </div>

          {/* Max Prep Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temps de préparation max
            </label>
            <select
              value={filters.maxPrepTime || ''}
              onChange={(e) => handleMaxPrepTimeChange(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Tous</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 heure</option>
              <option value="120">2 heures</option>
            </select>
          </div>

          {/* Quick Filters */}
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtres rapides
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
                ⭐ Favoris
              </button>
              <button
                onClick={handleToggleGenerated}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filters.isGenerated === true
                    ? 'bg-purple-100 text-purple-800 border-2 border-purple-500'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🤖 IA Générées
              </button>
            </div>
          </div>

          {/* Tags */}
          {availableTags.length > 0 && (
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
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
