'use client';

import { useState, useEffect } from 'react';
import { X, Search, Clock, ChefHat } from 'lucide-react';
import type { Recipe } from '@/app/lib/types/recipe';
import type { MealType } from '@/app/lib/types/nutrition';
import { MEAL_TYPE_LABELS } from '@/app/lib/types/nutrition';

interface RecipeSelectorProps {
  isOpen: boolean;
  mealType: MealType;
  onClose: () => void;
  onSelect: (recipe: Recipe) => void;
}

export default function RecipeSelector({
  isOpen,
  mealType,
  onClose,
  onSelect,
}: RecipeSelectorProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadRecipes();
    }
  }, [isOpen]);

  useEffect(() => {
    filterRecipes();
  }, [recipes, searchQuery, mealType]);

  const loadRecipes = async () => {
    setIsLoading(true);
    try {
      // Load recipes from localStorage
      const stored = localStorage.getItem('recipes_default_user');
      if (stored) {
        const parsedRecipes = JSON.parse(stored);
        setRecipes(parsedRecipes);
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterRecipes = () => {
    let filtered = recipes;

    // Filter by meal type
    filtered = filtered.filter(recipe =>
      recipe.mealType.includes(mealType)
    );

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        recipe =>
          recipe.name.toLowerCase().includes(query) ||
          recipe.description.toLowerCase().includes(query) ||
          recipe.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredRecipes(filtered);
  };

  const handleSelect = (recipe: Recipe) => {
    onSelect(recipe);
    onClose();
    setSearchQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Sélectionner une recette
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Pour {MEAL_TYPE_LABELS[mealType]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une recette..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Recipe list */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Chargement des recettes...</p>
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="text-center py-12">
              <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchQuery
                  ? 'Aucune recette trouvée'
                  : `Aucune recette disponible pour ${MEAL_TYPE_LABELS[mealType].toLowerCase()}`}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Ajoutez des recettes dans la bibliothèque pour pouvoir les planifier
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecipes.map(recipe => (
                <button
                  key={recipe.id}
                  onClick={() => handleSelect(recipe)}
                  className="text-left bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-orange-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {recipe.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {recipe.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {recipe.prepTime + recipe.cookTime} min
                        </div>
                        <div>{recipe.nutritionInfo.calories} kcal</div>
                        <div className="capitalize">{recipe.difficulty}</div>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        {recipe.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {recipe.imageUrl && (
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            {filteredRecipes.length} recette{filteredRecipes.length > 1 ? 's' : ''} disponible
            {filteredRecipes.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
