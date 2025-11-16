'use client';


import { useState, useEffect } from 'react';
import { FridgeRepository } from './lib/repositories/fridge-repository';
import { FridgeItem } from './lib/types/fridge';
import {
  GeminiRecipeResponse,
  RecipeFilters,
  RecipeDifficulty,
  CuisineType,
  MealType,
  PrepTimeFilter,
  CUISINE_TYPES,
} from './lib/types/recipe';
import { Refrigerator, Sparkles, Plus, X, Filter, Save } from 'lucide-react';
import SaveRecipeModal from './components/recipes/SaveRecipeModal';

// Force dynamic rendering - this page uses localStorage
export const dynamic = 'force-dynamic';

export default function Home() {
  // State
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);
  const [selectedFridgeItems, setSelectedFridgeItems] = useState<string[]>([]);
  const [manualIngredients, setManualIngredients] = useState<string>('');
  const [recipe, setRecipe] = useState<GeminiRecipeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<RecipeFilters>({});
  const [zeroWasteMode, setZeroWasteMode] = useState(false);

  // Load fridge items on mount
  useEffect(() => {
    loadFridgeItems();
  }, []);

  const loadFridgeItems = async () => {
    const items = await FridgeRepository.getAll();
    setFridgeItems(items);
  };

  const handleToggleFridgeItem = (itemId: string) => {
    setSelectedFridgeItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleGenerateFromFridge = () => {
    // Select all fridge items
    setSelectedFridgeItems(fridgeItems.map((item) => item.id));
    // Enable zero waste mode
    setZeroWasteMode(true);
  };

  const getSelectedIngredients = (): string[] => {
    const fridgeIngredients = fridgeItems
      .filter((item) => selectedFridgeItems.includes(item.id))
      .map((item) => item.name);

    const manual = manualIngredients
      .split(',')
      .map((ing) => ing.trim())
      .filter((ing) => ing.length > 0);

    return [...fridgeIngredients, ...manual];
  };

  const handleGenerateRecipe = async () => {
    const ingredients = getSelectedIngredients();

    if (ingredients.length === 0) {
      setError('Veuillez sélectionner au moins un ingrédient ou entrer des ingrédients manuellement');
      return;
    }

    setLoading(true);
    setError('');
    setRecipe(null);

    try {
      const response = await fetch('/api/recipes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients,
          fridgeItemIds: selectedFridgeItems,
          filters,
          zeroWasteMode,
          userPreferences: {
            // Placeholder for future user preferences
            dietaryRestrictions: [],
            allergies: [],
            dislikedIngredients: [],
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate recipe');
      }

      const data = await response.json();
      setRecipe(data.recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la génération de la recette');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const expiringItems = fridgeItems.filter((item) => {
    if (!item.expirationDate) return false;
    const daysUntilExpiration = Math.ceil(
      (new Date(item.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiration >= 0 && daysUntilExpiration <= 3;
  });

  return (
    <main className="bg-background min-h-full p-4 md:p-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Générateur de Recettes IA
          </h1>
          <p className="text-foreground-secondary text-base">
            Créez des recettes délicieuses avec vos ingrédients !
          </p>
        </div>

        <div className="space-y-4">
          {/* Fridge Items */}
          <div className="space-y-4">
            {/* Quick Action */}
            <div className="bg-card rounded-lg shadow-md p-4 border border-border">
              <button
                onClick={handleGenerateFromFridge}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2"
              >
                <Refrigerator className="w-5 h-5" />
                Générer depuis mon frigo
              </button>
              {expiringItems.length > 0 && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    ⚠️ {expiringItems.length} article(s) expirent bientôt !
                  </p>
                </div>
              )}
            </div>

            {/* Fridge Items Selection */}
            <div className="bg-card rounded-lg shadow-md p-4 max-h-80 overflow-y-auto border border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Mon Frigo ({fridgeItems.length})</h3>
                <span className="text-sm text-foreground-tertiary">
                  {selectedFridgeItems.length} sélectionné(s)
                </span>
              </div>

              {fridgeItems.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Refrigerator className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Votre frigo est vide</p>
                  <a href="/fridge" className="text-orange-500 hover:underline text-sm">
                    Ajouter des articles
                  </a>
                </div>
              ) : (
                <div className="space-y-2">
                  {fridgeItems.map((item) => {
                    const isExpiringSoon = expiringItems.some(e => e.id === item.id);
                    return (
                      <label
                        key={item.id}
                        className={`flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer ${
                          isExpiringSoon ? 'bg-orange-50 border border-orange-200' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFridgeItems.includes(item.id)}
                          onChange={() => handleToggleFridgeItem(item.id)}
                          className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.quantity} {item.unit}
                          </div>
                        </div>
                        {isExpiringSoon && (
                          <span className="text-xs text-orange-600">⚠️</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-4">
            {/* Manual Ingredients */}
            <div className="bg-card rounded-lg shadow-md p-4 border border-border">
              <label className="block text-foreground font-semibold mb-3 text-sm">
                Ingrédients additionnels (optionnel)
              </label>
              <div className="relative">
                <Plus className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={manualIngredients}
                  onChange={(e) => setManualIngredients(e.target.value)}
                  placeholder="Ex: tomates, ail, basilic (séparés par des virgules)"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="bg-card rounded-lg shadow-md p-4 border border-border">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between mb-4"
              >
                <span className="font-semibold text-gray-900 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtres avancés
                </span>
                <span className="text-sm text-gray-500">
                  {showFilters ? '▲' : '▼'}
                </span>
              </button>

              {showFilters && (
                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  {/* Prep Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temps de préparation max
                    </label>
                    <select
                      value={filters.prepTime || ''}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          prepTime: e.target.value ? (parseInt(e.target.value) as PrepTimeFilter) : undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Peu importe</option>
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 heure</option>
                      <option value="120">2 heures</option>
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulté
                    </label>
                    <select
                      value={filters.difficulty || ''}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          difficulty: (e.target.value as RecipeDifficulty) || undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Peu importe</option>
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
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          cuisineType: (e.target.value as CuisineType) || undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Peu importe</option>
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
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          mealType: (e.target.value as MealType) || undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Peu importe</option>
                      <option value="breakfast">Petit-déjeuner</option>
                      <option value="lunch">Déjeuner</option>
                      <option value="dinner">Dîner</option>
                      <option value="snack">Snack</option>
                      <option value="dessert">Dessert</option>
                    </select>
                  </div>

                  {/* Zero Waste Mode */}
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={zeroWasteMode}
                        onChange={(e) => setZeroWasteMode(e.target.checked)}
                        className="w-4 h-4 text-green-500 focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        ♻️ Mode Zéro Déchet (prioriser les ingrédients qui expirent bientôt)
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <div className="bg-card rounded-lg shadow-md p-4 border border-border">
              {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerateRecipe}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 px-6 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Générer une recette
                  </>
                )}
              </button>

              {getSelectedIngredients().length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    Ingrédients sélectionnés ({getSelectedIngredients().length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {getSelectedIngredients().map((ing, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-white border border-gray-200 rounded text-sm text-gray-700"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recipe Display */}
            {recipe && (
              <div className="bg-card rounded-lg shadow-md p-4 border border-border">
                {/* Recipe Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{recipe.name}</h2>
                    <p className="text-gray-600">{recipe.description}</p>
                  </div>
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="ml-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Sauvegarder
                  </button>
                </div>

                {/* Recipe Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-500">Préparation</div>
                    <div className="font-semibold">{recipe.prepTime} min</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Cuisson</div>
                    <div className="font-semibold">{recipe.cookTime} min</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Portions</div>
                    <div className="font-semibold">{recipe.servings}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Calories</div>
                    <div className="font-semibold">{recipe.nutritionInfo.calories}</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Ingredients */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Ingrédients</h3>
                    <ul className="space-y-2">
                      {recipe.ingredients.map((ing, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-2 h-2 rounded-full bg-orange-500 mt-2" />
                          <span>
                            {ing.quantity} {ing.unit} {ing.name}
                            {ing.optional && <span className="text-gray-500 text-sm ml-1">(optionnel)</span>}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Nutrition */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Informations nutritionnelles</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Protéines: {recipe.nutritionInfo.protein}g</div>
                        <div>Glucides: {recipe.nutritionInfo.carbs}g</div>
                        <div>Lipides: {recipe.nutritionInfo.fat}g</div>
                        {recipe.nutritionInfo.fiber && <div>Fibres: {recipe.nutritionInfo.fiber}g</div>}
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Instructions</h3>
                    <ol className="space-y-3">
                      {recipe.steps.map((step, idx) => (
                        <li key={idx} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center justify-center text-sm font-bold">
                            {idx + 1}
                          </span>
                          <p className="flex-1 text-gray-700">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Alternatives */}
                {recipe.alternatives && recipe.alternatives.length > 0 && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">💡 Alternatives d'ingrédients</h4>
                    <div className="space-y-2">
                      {recipe.alternatives.map((alt, idx) => (
                        <div key={idx} className="text-sm">
                          <span className="font-medium">{alt.original}:</span>{' '}
                          {alt.alternatives.join(', ')}
                          <div className="text-gray-600 text-xs mt-1">{alt.reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Recipe Modal */}
      {showSaveModal && recipe && (
        <SaveRecipeModal
          recipe={recipe}
          fridgeItemIds={selectedFridgeItems}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </main>
  );
}
