/**
 * Recipe Type Definitions
 *
 * Defines all TypeScript interfaces and types for the Recipe Management System
 */

// ============================================================================
// CORE RECIPE INTERFACE
// ============================================================================

export interface Recipe {
  id: string;
  userId: string;
  name: string;
  description: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  difficulty: RecipeDifficulty;
  cuisineType: string;
  mealType: MealType[];
  tags: string[];
  nutritionInfo: NutritionInfo;
  isFavorite: boolean;
  isGenerated: boolean; // true if AI-generated, false if manual
  generatedDate?: Date;
  createdDate: Date;
  lastModifiedDate?: Date;
  personalNotes?: string;
  imageUrl?: string;
  usedFridgeItems?: string[]; // IDs of fridge items used
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  optional?: boolean;
  alternative?: string; // Alternative ingredient suggestion
}

export interface NutritionInfo {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber?: number; // grams
}

// ============================================================================
// ENUMS & TYPES
// ============================================================================

export type RecipeDifficulty = 'easy' | 'medium' | 'hard';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';

export type CuisineType =
  | 'french'
  | 'italian'
  | 'asian'
  | 'mexican'
  | 'mediterranean'
  | 'american'
  | 'indian'
  | 'japanese'
  | 'other';

export type PrepTimeFilter = 15 | 30 | 60 | 120; // minutes

// ============================================================================
// DATA TRANSFER OBJECTS (DTOs)
// ============================================================================

export interface CreateRecipeDTO {
  name: string;
  description: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: RecipeDifficulty;
  cuisineType: string;
  mealType: MealType[];
  tags?: string[];
  nutritionInfo?: Partial<NutritionInfo>;
  personalNotes?: string;
  imageUrl?: string;
  isGenerated?: boolean;
  usedFridgeItems?: string[];
}

export interface UpdateRecipeDTO {
  name?: string;
  description?: string;
  ingredients?: RecipeIngredient[];
  steps?: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: RecipeDifficulty;
  cuisineType?: string;
  mealType?: MealType[];
  tags?: string[];
  nutritionInfo?: Partial<NutritionInfo>;
  personalNotes?: string;
  imageUrl?: string;
}

// ============================================================================
// RECIPE GENERATION INTERFACES
// ============================================================================

export interface RecipeGenerationRequest {
  ingredients: string[]; // List of ingredient names
  fridgeItemIds?: string[]; // IDs of fridge items to use
  filters?: RecipeFilters;
  zeroWasteMode?: boolean; // Prioritize expiring items
  userPreferences?: UserPreferences;
}

export interface RecipeFilters {
  prepTime?: PrepTimeFilter; // Maximum prep time in minutes
  difficulty?: RecipeDifficulty;
  cuisineType?: CuisineType;
  mealType?: MealType;
  equipment?: string[]; // Available equipment (e.g., "oven", "blender", "slow-cooker")
  batchCooking?: boolean; // Generate recipe in large quantities for meal prep
}

export interface UserPreferences {
  dietaryRestrictions?: string[]; // e.g., "vegetarian", "vegan", "gluten-free"
  allergies?: string[]; // e.g., "nuts", "dairy", "shellfish"
  dislikedIngredients?: string[];
}

// ============================================================================
// GEMINI API RESPONSE INTERFACE
// ============================================================================

export interface GeminiRecipeResponse {
  name: string;
  description: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  prepTime: number;
  cookTime: number;
  totalTime?: number; // Total time (prep + cook)
  servings: number;
  difficulty: RecipeDifficulty;
  cuisineType: string;
  mealType: MealType[] | MealType;
  nutritionInfo: NutritionInfo;
  tags?: string[];
  alternatives?: IngredientAlternative[];
  tips?: string[]; // Cooking tips and tricks
}

export interface IngredientAlternative {
  original: string;
  alternatives: string[];
  reason: string;
}

// ============================================================================
// RECIPE LIBRARY INTERFACES
// ============================================================================

export interface RecipeSearchFilters {
  query?: string; // Search query
  difficulty?: RecipeDifficulty;
  cuisineType?: string;
  mealType?: MealType;
  tags?: string[];
  isFavorite?: boolean;
  isGenerated?: boolean;
  maxPrepTime?: number;
}

export interface RecipeSortOptions {
  sortBy: 'name' | 'createdDate' | 'prepTime' | 'cookTime';
  sortOrder: 'asc' | 'desc';
}

export interface RecipeStats {
  totalRecipes: number;
  favoriteCount: number;
  generatedCount: number;
  manualCount: number;
  averagePrepTime: number;
  recipesByDifficulty: Record<RecipeDifficulty, number>;
  recipesByCuisine: Record<string, number>;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export const VALID_DIFFICULTIES: RecipeDifficulty[] = ['easy', 'medium', 'hard'];
export const VALID_MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];
export const VALID_PREP_TIMES: PrepTimeFilter[] = [15, 30, 60, 120];

export const CUISINE_TYPES: { value: CuisineType; label: string }[] = [
  { value: 'french', label: 'Française' },
  { value: 'italian', label: 'Italienne' },
  { value: 'asian', label: 'Asiatique' },
  { value: 'mexican', label: 'Mexicaine' },
  { value: 'mediterranean', label: 'Méditerranéenne' },
  { value: 'american', label: 'Américaine' },
  { value: 'indian', label: 'Indienne' },
  { value: 'japanese', label: 'Japonaise' },
  { value: 'other', label: 'Autre' },
];

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type RecipeWithoutId = Omit<Recipe, 'id'>;
export type RecipePreview = Pick<Recipe, 'id' | 'name' | 'description' | 'imageUrl' | 'prepTime' | 'cookTime' | 'difficulty' | 'isFavorite' | 'cuisineType'>;
