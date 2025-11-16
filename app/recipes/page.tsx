'use client';

import { useState, useEffect } from 'react';
import { RecipeRepository } from '../lib/repositories/recipe-repository';
import { Recipe, RecipeSearchFilters, RecipeSortOptions } from '../lib/types/recipe';
import RecipeCard from '../components/recipes/RecipeCard';
import RecipeFilters from '../components/recipes/RecipeFilters';
import { Plus, Grid, List } from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering - this page uses localStorage
export const dynamic = 'force-dynamic';

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [filters, setFilters] = useState<RecipeSearchFilters>({});
  const [sortOptions, setSortOptions] = useState<RecipeSortOptions>({
    sortBy: 'createdDate',
    sortOrder: 'desc',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [stats, setStats] = useState({ totalRecipes: 0, favoriteCount: 0, generatedCount: 0 });

  useEffect(() => {
    loadRecipes();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [recipes, filters, sortOptions]);

  const loadRecipes = () => {
    const allRecipes = RecipeRepository.getAll();
    setRecipes(allRecipes);

    const tags = RecipeRepository.getAllTags();
    setAvailableTags(tags);

    const recipeStats = RecipeRepository.getStats();
    setStats(recipeStats);
  };

  const applyFiltersAndSort = () => {
    let filtered = RecipeRepository.search(filters);
    filtered = RecipeRepository.sort(filtered, sortOptions);
    setFilteredRecipes(filtered);
  };

  const handleToggleFavorite = (id: string) => {
    RecipeRepository.toggleFavorite(id);
    loadRecipes();
  };

  const handleDelete = (id: string) => {
    RecipeRepository.delete(id);
    loadRecipes();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
                Ma Bibliothèque de Recettes
              </h1>
              <p className="text-gray-600">
                {stats.totalRecipes} recette{stats.totalRecipes !== 1 ? 's' : ''} •
                {' '}{stats.favoriteCount} favori{stats.favoriteCount !== 1 ? 's' : ''} •
                {' '}{stats.generatedCount} générée{stats.generatedCount !== 1 ? 's' : ''} par IA
              </p>
            </div>
            <Link
              href="/recipes/new"
              className="px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Nouvelle recette</span>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-sm text-gray-500 mb-1">Total</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalRecipes}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-sm text-gray-500 mb-1">Favoris</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.favoriteCount}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-sm text-gray-500 mb-1">Générées IA</div>
              <div className="text-2xl font-bold text-purple-600">{stats.generatedCount}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-sm text-gray-500 mb-1">Manuelles</div>
              <div className="text-2xl font-bold text-blue-600">{stats.manualCount}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <RecipeFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableTags={availableTags}
        />

        {/* View Options and Sort */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-label="Grid view"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-label="List view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Trier par:</label>
            <select
              value={sortOptions.sortBy}
              onChange={(e) =>
                setSortOptions({
                  ...sortOptions,
                  sortBy: e.target.value as RecipeSortOptions['sortBy'],
                })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="createdDate">Date de création</option>
              <option value="name">Nom</option>
              <option value="prepTime">Temps de préparation</option>
              <option value="cookTime">Temps de cuisson</option>
            </select>
            <button
              onClick={() =>
                setSortOptions({
                  ...sortOptions,
                  sortOrder: sortOptions.sortOrder === 'asc' ? 'desc' : 'asc',
                })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {sortOptions.sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Recipes Grid/List */}
        {filteredRecipes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🍳</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {recipes.length === 0 ? 'Aucune recette pour le moment' : 'Aucun résultat trouvé'}
            </h3>
            <p className="text-gray-600 mb-6">
              {recipes.length === 0
                ? 'Commencez par générer ou ajouter votre première recette !'
                : 'Essayez de modifier vos filtres de recherche'}
            </p>
            {recipes.length === 0 && (
              <div className="flex gap-4 justify-center">
                <Link
                  href="/"
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600"
                >
                  Générer une recette
                </Link>
                <Link
                  href="/recipes/new"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Ajouter manuellement
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
