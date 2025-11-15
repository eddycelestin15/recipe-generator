// Common Types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User Model
export interface UserProfile {
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  height?: number; // in cm
  weight?: number; // in kg
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  dietaryRestrictions?: string[];
  allergies?: string[];
  avatar?: string; // URL to avatar image
}

export interface UserPreferences {
  preferredCuisines?: string[];
  dislikedIngredients?: string[];
  cookingSkillLevel?: 'beginner' | 'intermediate' | 'advanced';
  maxCookingTime?: number; // in minutes
  dietType?: 'none' | 'vegan' | 'vegetarian' | 'keto' | 'paleo' | 'mediterranean' | 'low_carb' | 'gluten_free';
}

export interface UserGoals {
  targetWeight?: number; // in kg
  targetDate?: Date;
  dailyCalorieTarget?: number;
  macroTargets?: {
    protein?: number; // in grams
    carbs?: number; // in grams
    fat?: number; // in grams
  };
  goalType?: 'lose_weight' | 'gain_weight' | 'maintain' | 'build_muscle';
}

export interface UserSettings {
  units?: 'metric' | 'imperial';
  language?: string;
  notifications?: {
    email?: boolean;
    mealReminders?: boolean;
    expirationAlerts?: boolean;
  };
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  password?: string; // Hashed password (optional for OAuth users)
  emailVerified?: Date;
  image?: string; // OAuth provider image
  provider?: 'credentials' | 'google' | 'github';
  profile?: UserProfile;
  preferences?: UserPreferences;
  goals?: UserGoals;
  settings?: UserSettings;
  onboardingCompleted?: boolean;
}

// FridgeItem Model
export interface FridgeItem extends BaseEntity {
  userId: string;
  name: string;
  quantity: number;
  unit: string; // e.g., 'pieces', 'kg', 'g', 'ml', 'l'
  category?: 'vegetables' | 'fruits' | 'dairy' | 'meat' | 'grains' | 'condiments' | 'other';
  expirationDate?: Date;
  addedDate: Date;
  imageUrl?: string;
}

// Recipe Model
export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
  fiber?: number; // in grams
  sugar?: number; // in grams
  sodium?: number; // in mg
}

export interface Recipe extends BaseEntity {
  userId: string;
  name: string;
  description?: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  nutritionInfo?: NutritionInfo;
  tags?: string[];
  cuisineType?: string;
  servings: number;
  prepTime?: number; // in minutes
  cookTime?: number; // in minutes
  difficulty?: 'easy' | 'medium' | 'hard';
  isFavorite: boolean;
  imageUrl?: string;
}

// MealLog Model
export interface CustomNutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface MealLog extends BaseEntity {
  userId: string;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipeId?: string; // optional if custom meal
  recipeName?: string;
  servings?: number;
  customNutrition?: CustomNutrition; // for manually logged meals
  notes?: string;
}
