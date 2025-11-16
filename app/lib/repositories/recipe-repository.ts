/**
 * Recipe Repository
 *
 * Data access layer for recipe management using localStorage
 * Provides CRUD operations and advanced querying capabilities
 */

import { isBrowser, getItem, setItem, getCurrentUserId } from '../utils/storage';
import type {
  Recipe,
  CreateRecipeDTO,
  UpdateRecipeDTO,
  RecipeSearchFilters,
  RecipeSortOptions,
  RecipeStats,
} from '../types/recipe';

/**
 * Generate a unique ID for recipes
 */
function generateId(): string {
  return `recipe_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

const STORAGE_KEY_PREFIX = 'recipes_';

export class RecipeRepository {
  /**
   * Get storage key for current user
   */
  private static getStorageKey(): string {
    return `${STORAGE_KEY_PREFIX}${getCurrentUserId()}`;
  }

  /**
   * Get all recipes from localStorage
   */
  private static getAllRecipesFromStorage(): Recipe[] {
    if (!isBrowser()) {
      return [];
    }
    const data = getItem(this.getStorageKey());
    if (!data) return [];

    try {
      const recipes = JSON.parse(data);
      // Convert date strings back to Date objects
      return recipes.map((recipe: any) => ({
        ...recipe,
        createdDate: new Date(recipe.createdDate),
        generatedDate: recipe.generatedDate ? new Date(recipe.generatedDate) : undefined,
        lastModifiedDate: recipe.lastModifiedDate ? new Date(recipe.lastModifiedDate) : undefined,
      }));
    } catch (error) {
      console.error('Error parsing recipes from localStorage:', error);
      return [];
    }
  }

  /**
   * Save all recipes to localStorage
   */
  private static saveAllRecipesToStorage(recipes: Recipe[]): void {
    if (!isBrowser()) {
      return;
    }
    setItem(this.getStorageKey(), JSON.stringify(recipes));
  }

  /**
   * Get all recipes for the current user
   */
  static getAll(): Recipe[] {
    return this.getAllRecipesFromStorage();
  }

  /**
   * Get a recipe by ID
   */
  static getById(id: string): Recipe | null {
    const recipes = this.getAllRecipesFromStorage();
    return recipes.find(recipe => recipe.id === id) || null;
  }

  /**
   * Create a new recipe
   */
  static create(data: CreateRecipeDTO): Recipe {
    const recipes = this.getAllRecipesFromStorage();

    const newRecipe: Recipe = {
      id: generateId(),
      userId: getCurrentUserId(),
      name: data.name,
      description: data.description,
      ingredients: data.ingredients,
      steps: data.steps,
      prepTime: data.prepTime,
      cookTime: data.cookTime,
      servings: data.servings,
      difficulty: data.difficulty,
      cuisineType: data.cuisineType,
      mealType: data.mealType,
      tags: data.tags || [],
      nutritionInfo: {
        calories: data.nutritionInfo?.calories || 0,
        protein: data.nutritionInfo?.protein || 0,
        carbs: data.nutritionInfo?.carbs || 0,
        fat: data.nutritionInfo?.fat || 0,
        fiber: data.nutritionInfo?.fiber,
      },
      isFavorite: false,
      isGenerated: data.isGenerated || false,
      generatedDate: data.isGenerated ? new Date() : undefined,
      createdDate: new Date(),
      personalNotes: data.personalNotes,
      imageUrl: data.imageUrl,
      usedFridgeItems: data.usedFridgeItems || [],
    };

    recipes.push(newRecipe);
    this.saveAllRecipesToStorage(recipes);

    return newRecipe;
  }

  /**
   * Update a recipe
   */
  static update(id: string, data: UpdateRecipeDTO): Recipe | null {
    const recipes = this.getAllRecipesFromStorage();
    const index = recipes.findIndex(recipe => recipe.id === id);

    if (index === -1) return null;

    const updatedRecipe = {
      ...recipes[index],
      ...data,
      lastModifiedDate: new Date(),
    } as Recipe;

    recipes[index] = updatedRecipe;
    this.saveAllRecipesToStorage(recipes);

    return updatedRecipe;
  }

  /**
   * Delete a recipe
   */
  static delete(id: string): boolean {
    const recipes = this.getAllRecipesFromStorage();
    const filteredRecipes = recipes.filter(recipe => recipe.id !== id);

    if (filteredRecipes.length === recipes.length) {
      return false; // Recipe not found
    }

    this.saveAllRecipesToStorage(filteredRecipes);
    return true;
  }

  /**
   * Toggle favorite status
   */
  static toggleFavorite(id: string): Recipe | null {
    const recipes = this.getAllRecipesFromStorage();
    const index = recipes.findIndex(recipe => recipe.id === id);

    if (index === -1) return null;

    recipes[index].isFavorite = !recipes[index].isFavorite;
    recipes[index].lastModifiedDate = new Date();

    this.saveAllRecipesToStorage(recipes);
    return recipes[index];
  }

  /**
   * Search and filter recipes
   */
  static search(filters: RecipeSearchFilters = {}): Recipe[] {
    let recipes = this.getAllRecipesFromStorage();

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      recipes = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(query) ||
        recipe.description.toLowerCase().includes(query) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(query)) ||
        recipe.ingredients.some(ing => ing.name.toLowerCase().includes(query))
      );
    }

    // Filter by difficulty
    if (filters.difficulty) {
      recipes = recipes.filter(recipe => recipe.difficulty === filters.difficulty);
    }

    // Filter by cuisine type
    if (filters.cuisineType) {
      recipes = recipes.filter(recipe => recipe.cuisineType === filters.cuisineType);
    }

    // Filter by meal type
    if (filters.mealType) {
      recipes = recipes.filter(recipe => recipe.mealType.includes(filters.mealType!));
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      recipes = recipes.filter(recipe =>
        filters.tags!.some(tag => recipe.tags.includes(tag))
      );
    }

    // Filter by favorite status
    if (filters.isFavorite !== undefined) {
      recipes = recipes.filter(recipe => recipe.isFavorite === filters.isFavorite);
    }

    // Filter by generated status
    if (filters.isGenerated !== undefined) {
      recipes = recipes.filter(recipe => recipe.isGenerated === filters.isGenerated);
    }

    // Filter by max prep time
    if (filters.maxPrepTime) {
      recipes = recipes.filter(recipe => recipe.prepTime <= filters.maxPrepTime!);
    }

    return recipes;
  }

  /**
   * Sort recipes
   */
  static sort(recipes: Recipe[], options: RecipeSortOptions): Recipe[] {
    const { sortBy, sortOrder } = options;

    return [...recipes].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'createdDate':
          comparison = a.createdDate.getTime() - b.createdDate.getTime();
          break;
        case 'prepTime':
          comparison = a.prepTime - b.prepTime;
          break;
        case 'cookTime':
          comparison = a.cookTime - b.cookTime;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Get recipes statistics
   */
  static getStats(): RecipeStats {
    const recipes = this.getAllRecipesFromStorage();

    const recipesByDifficulty = recipes.reduce((acc, recipe) => {
      acc[recipe.difficulty] = (acc[recipe.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recipesByCuisine = recipes.reduce((acc, recipe) => {
      acc[recipe.cuisineType] = (acc[recipe.cuisineType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalPrepTime = recipes.reduce((sum, recipe) => sum + recipe.prepTime, 0);

    return {
      totalRecipes: recipes.length,
      favoriteCount: recipes.filter(r => r.isFavorite).length,
      generatedCount: recipes.filter(r => r.isGenerated).length,
      manualCount: recipes.filter(r => !r.isGenerated).length,
      averagePrepTime: recipes.length > 0 ? Math.round(totalPrepTime / recipes.length) : 0,
      recipesByDifficulty: recipesByDifficulty as any,
      recipesByCuisine,
    };
  }

  /**
   * Get recent recipes (last N recipes)
   */
  static getRecent(limit: number = 5): Recipe[] {
    const recipes = this.getAllRecipesFromStorage();
    return recipes
      .sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime())
      .slice(0, limit);
  }

  /**
   * Get favorite recipes
   */
  static getFavorites(): Recipe[] {
    return this.getAllRecipesFromStorage().filter(recipe => recipe.isFavorite);
  }

  /**
   * Get all unique tags
   */
  static getAllTags(): string[] {
    const recipes = this.getAllRecipesFromStorage();
    const allTags = recipes.flatMap(recipe => recipe.tags);
    return Array.from(new Set(allTags)).sort();
  }

  /**
   * Delete all recipes (for testing/reset purposes)
   */
  static deleteAll(): void {
    localStorage.removeItem(this.getStorageKey());
  }
}
