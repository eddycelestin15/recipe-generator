/**
 * Meal Plan Service
 *
 * Handles meal plan generation using Gemini AI with smart optimization:
 * - Respects calorie goals
 * - Varies recipes
 * - Uses fridge items
 * - Considers prep time
 * - Balances nutrition
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Recipe } from '../types/recipe';
import type { FridgeItem } from '../types/fridge';
import type { NutritionGoals } from '../types/nutrition';
import type {
  MealPlanGenerationCriteria,
  MealPlanSuggestion,
  MealPrepRecommendation,
  LeftoverSuggestion,
  ShoppingListItem,
  DayMealPlan,
} from '../types/meal-plan';
import { categorizeIngredient, generateWeekDays, MEAL_PREP_FRIENDLY_TAGS } from '../types/meal-plan';
import { RecipeRepository } from '../repositories/recipe-repository';
import { FridgeRepository } from '../repositories/fridge-repository';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface GeminiMealPlanResponse {
  weekPlan: {
    date: string; // ISO date
    breakfast?: string; // recipeId
    lunch?: string;
    dinner?: string;
    snack?: string;
    reasoning: string;
  }[];
  totalCalories: number;
  nutritionBalance: {
    protein: number;
    carbs: number;
    fat: number;
  };
  varietyScore: number;
  fridgeUsagePercentage: number;
}

export class MealPlanService {
  /**
   * Generate a weekly meal plan using Gemini AI
   */
  static async generateWeeklyPlan(
    weekStart: Date,
    criteria: MealPlanGenerationCriteria
  ): Promise<DayMealPlan[]> {
    try {
      // Get available recipes
      const allRecipes = RecipeRepository.getAll();

      // Filter out excluded recipes
      const availableRecipes = allRecipes.filter(
        recipe => !criteria.excludeRecipeIds?.includes(recipe.id)
      );

      if (availableRecipes.length === 0) {
        throw new Error('No recipes available for meal planning');
      }

      // Get fridge items if using fridge mode
      let fridgeItems: FridgeItem[] = [];
      if (criteria.useFridgeItems) {
        fridgeItems = await FridgeRepository.getAll();
      }

      // Build prompt for Gemini
      const prompt = this.buildMealPlanPrompt(
        weekStart,
        availableRecipes,
        fridgeItems,
        criteria
      );

      // Generate plan using Gemini
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse response
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      const geminiPlan: GeminiMealPlanResponse = JSON.parse(cleanedText);

      // Convert Gemini response to DayMealPlan format
      const days = this.convertGeminiPlanToDays(
        geminiPlan,
        weekStart,
        availableRecipes
      );

      return days;
    } catch (error) {
      console.error('Error generating meal plan:', error);
      throw new Error('Failed to generate meal plan');
    }
  }

  /**
   * Build prompt for Gemini meal plan generation
   */
  private static buildMealPlanPrompt(
    weekStart: Date,
    recipes: Recipe[],
    fridgeItems: FridgeItem[],
    criteria: MealPlanGenerationCriteria
  ): string {
    const weekDays = generateWeekDays(weekStart);

    let prompt = `You are a professional nutritionist and meal planner. Create an optimized weekly meal plan.\n\n`;

    // Criteria
    prompt += `PLANNING CRITERIA:\n`;
    prompt += `- Daily calorie target: ${criteria.dailyCalorieTarget} calories\n`;
    prompt += `- Avoid repetition: ${criteria.avoidRepetition ? 'Yes (vary recipes throughout week)' : 'No'}\n`;
    prompt += `- Use fridge items: ${criteria.useFridgeItems ? 'Yes (prioritize available ingredients)' : 'No'}\n`;
    prompt += `- Consider prep time: ${criteria.considerPrepTime ? 'Yes (match prep time to daily schedule)' : 'No'}\n`;
    prompt += `- Balance nutrition: ${criteria.balanceNutrition ? 'Yes (balance macros over the week)' : 'No'}\n`;

    if (criteria.dietaryPreferences && criteria.dietaryPreferences.length > 0) {
      prompt += `- Dietary preferences: ${criteria.dietaryPreferences.join(', ')}\n`;
    }

    prompt += '\n';

    // Week structure
    prompt += `WEEK STRUCTURE (${weekDays[0].toLocaleDateString()} to ${weekDays[6].toLocaleDateString()}):\n`;
    weekDays.forEach((day, index) => {
      const dayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index];
      prompt += `- ${dayName} (${day.toISOString().split('T')[0]})`;

      if (criteria.maxPrepTimePerDay && criteria.maxPrepTimePerDay[dayName.toLowerCase()]) {
        prompt += ` - Max prep time: ${criteria.maxPrepTimePerDay[dayName.toLowerCase()]} minutes`;
      }

      prompt += '\n';
    });
    prompt += '\n';

    // Preferred meal types
    if (criteria.preferredMealTypes) {
      prompt += `PREFERRED MEALS PER DAY:\n`;
      Object.entries(criteria.preferredMealTypes).forEach(([mealType, count]) => {
        if (count > 0) {
          prompt += `- ${mealType}: ${count} times per week\n`;
        }
      });
      prompt += '\n';
    }

    // Available recipes
    prompt += `AVAILABLE RECIPES (${recipes.length} total):\n`;
    recipes.slice(0, 50).forEach(recipe => { // Limit to 50 recipes to avoid token limit
      prompt += `\nRecipe ID: ${recipe.id}\n`;
      prompt += `Name: ${recipe.name}\n`;
      prompt += `Meal Types: ${recipe.mealType.join(', ')}\n`;
      prompt += `Prep + Cook Time: ${recipe.prepTime + recipe.cookTime} minutes\n`;
      prompt += `Servings: ${recipe.servings}\n`;
      prompt += `Calories per serving: ${recipe.nutritionInfo.calories}\n`;
      prompt += `Macros: P:${recipe.nutritionInfo.protein}g C:${recipe.nutritionInfo.carbs}g F:${recipe.nutritionInfo.fat}g\n`;
      prompt += `Ingredients: ${recipe.ingredients.map(i => i.name).join(', ')}\n`;
      prompt += `Difficulty: ${recipe.difficulty}\n`;
    });
    prompt += '\n';

    // Fridge items
    if (criteria.useFridgeItems && fridgeItems.length > 0) {
      prompt += `AVAILABLE FRIDGE ITEMS (prioritize using these):\n`;
      fridgeItems.forEach(item => {
        const daysUntilExpiry = Math.ceil(
          (new Date(item.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        prompt += `- ${item.name} (${item.quantity} ${item.unit})`;
        if (daysUntilExpiry <= 3) {
          prompt += ` [EXPIRING SOON: ${daysUntilExpiry} days]`;
        }
        prompt += '\n';
      });
      prompt += '\n';
    }

    // Response format
    prompt += `RESPONSE FORMAT (JSON only, no additional text):\n`;
    prompt += `{
  "weekPlan": [
    {
      "date": "2025-11-18",
      "breakfast": "recipe_id_here or null",
      "lunch": "recipe_id_here or null",
      "dinner": "recipe_id_here or null",
      "snack": "recipe_id_here or null",
      "reasoning": "Why these recipes were chosen for this day"
    }
  ],
  "totalCalories": 14000,
  "nutritionBalance": {
    "protein": 450,
    "carbs": 1200,
    "fat": 350
  },
  "varietyScore": 85,
  "fridgeUsagePercentage": 70
}\n\n`;

    prompt += `PLANNING RULES:\n`;
    prompt += `1. Total daily calories should be close to ${criteria.dailyCalorieTarget} (±200 calories)\n`;
    prompt += `2. Vary recipes throughout the week - don't repeat the same recipe too often\n`;
    prompt += `3. Prioritize recipes using fridge items, especially expiring ones\n`;
    prompt += `4. Match prep time to daily constraints (busy days = quick recipes)\n`;
    prompt += `5. Balance macronutrients across the week\n`;
    prompt += `6. Consider meal types (breakfast recipes for breakfast slot, etc.)\n`;
    prompt += `7. Provide reasoning for each day's selection\n`;
    prompt += `8. Only use recipe IDs from the available recipes list\n`;
    prompt += `9. You can leave meals as null if no suitable recipe is available\n`;
    prompt += `10. Calculate varietyScore (0-100) based on recipe diversity\n`;

    return prompt;
  }

  /**
   * Convert Gemini response to DayMealPlan format
   */
  private static convertGeminiPlanToDays(
    geminiPlan: GeminiMealPlanResponse,
    weekStart: Date,
    recipes: Recipe[]
  ): DayMealPlan[] {
    const weekDays = generateWeekDays(weekStart);

    return geminiPlan.weekPlan.map((dayPlan, index) => {
      const date = weekDays[index];
      const meals = [];

      // Helper function to get recipe info
      const getRecipeInfo = (recipeId: string | undefined | null) => {
        if (!recipeId) return null;
        return recipes.find(r => r.id === recipeId);
      };

      // Add meals
      if (dayPlan.breakfast) {
        const recipe = getRecipeInfo(dayPlan.breakfast);
        if (recipe) {
          meals.push({
            mealType: 'breakfast' as const,
            recipeId: recipe.id,
            recipeName: recipe.name,
            servings: 1,
            calories: recipe.nutritionInfo.calories,
          });
        }
      }

      if (dayPlan.lunch) {
        const recipe = getRecipeInfo(dayPlan.lunch);
        if (recipe) {
          meals.push({
            mealType: 'lunch' as const,
            recipeId: recipe.id,
            recipeName: recipe.name,
            servings: 1,
            calories: recipe.nutritionInfo.calories,
          });
        }
      }

      if (dayPlan.dinner) {
        const recipe = getRecipeInfo(dayPlan.dinner);
        if (recipe) {
          meals.push({
            mealType: 'dinner' as const,
            recipeId: recipe.id,
            recipeName: recipe.name,
            servings: 1,
            calories: recipe.nutritionInfo.calories,
          });
        }
      }

      if (dayPlan.snack) {
        const recipe = getRecipeInfo(dayPlan.snack);
        if (recipe) {
          meals.push({
            mealType: 'snack' as const,
            recipeId: recipe.id,
            recipeName: recipe.name,
            servings: 1,
            calories: recipe.nutritionInfo.calories,
          });
        }
      }

      return {
        date,
        meals,
      };
    });
  }

  /**
   * Generate shopping list from meal plan
   */
  static async generateShoppingList(
    days: DayMealPlan[],
    subtractFridge: boolean = true
  ): Promise<ShoppingListItem[]> {
    const items: Map<string, ShoppingListItem> = new Map();

    // Get all recipes from meal plan
    const recipeIds = new Set<string>();
    days.forEach(day => {
      day.meals.forEach(meal => {
        if (meal.recipeId) {
          recipeIds.add(meal.recipeId);
        }
      });
    });

    // Collect ingredients from all recipes
    recipeIds.forEach(recipeId => {
      const recipe = RecipeRepository.getById(recipeId);
      if (!recipe) return;

      recipe.ingredients.forEach(ingredient => {
        const key = ingredient.name.toLowerCase();

        if (items.has(key)) {
          // Add to existing item
          const existing = items.get(key)!;
          existing.quantity += ingredient.quantity;
          existing.recipeIds.push(recipeId);
        } else {
          // Create new item
          items.set(key, {
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            category: categorizeIngredient(ingredient.name),
            checked: false,
            recipeIds: [recipeId],
            inFridge: false,
          });
        }
      });
    });

    // Subtract fridge items if requested
    if (subtractFridge) {
      const fridgeItems = await FridgeRepository.getAll();

      fridgeItems.forEach(fridgeItem => {
        const key = fridgeItem.name.toLowerCase();
        const item = items.get(key);

        if (item) {
          // Mark as in fridge
          item.inFridge = true;

          // Subtract quantity (convert units if needed - simplified for now)
          if (item.unit === fridgeItem.unit) {
            item.quantity = Math.max(0, item.quantity - fridgeItem.quantity);

            // Remove item if quantity is 0
            if (item.quantity === 0) {
              items.delete(key);
            }
          }
        }
      });
    }

    // Convert to array and sort by category
    return Array.from(items.values()).sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Get meal prep recommendations
   */
  static getMealPrepRecommendations(days: DayMealPlan[]): MealPrepRecommendation[] {
    const recommendations: MealPrepRecommendation[] = [];

    // Get all recipes from meal plan
    const recipeUsage = new Map<string, { recipe: Recipe; dates: Date[]; mealTypes: string[] }>();

    days.forEach(day => {
      day.meals.forEach(meal => {
        if (!meal.recipeId) return;

        const recipe = RecipeRepository.getById(meal.recipeId);
        if (!recipe) return;

        if (recipeUsage.has(recipe.id)) {
          const usage = recipeUsage.get(recipe.id)!;
          usage.dates.push(day.date);
          usage.mealTypes.push(meal.mealType);
        } else {
          recipeUsage.set(recipe.id, {
            recipe,
            dates: [day.date],
            mealTypes: [meal.mealType],
          });
        }
      });
    });

    // Find recipes that appear multiple times or are meal-prep friendly
    recipeUsage.forEach(({ recipe, dates, mealTypes }) => {
      const isMealPrepFriendly = recipe.tags.some(tag =>
        MEAL_PREP_FRIENDLY_TAGS.includes(tag)
      );

      const appearsMultipleTimes = dates.length > 1;

      if (isMealPrepFriendly || appearsMultipleTimes) {
        // Suggest batch cooking
        const batchSize = Math.max(dates.length * 2, recipe.servings);

        recommendations.push({
          recipeId: recipe.id,
          recipeName: recipe.name,
          batchSize,
          prepDay: 'Sunday', // Default to Sunday for meal prep
          storageInstructions: this.getStorageInstructions(recipe),
          shelfLife: this.estimateShelfLife(recipe),
          plannedMeals: dates.map((date, idx) => ({
            date,
            mealType: mealTypes[idx] as any,
          })),
        });
      }
    });

    return recommendations;
  }

  /**
   * Get storage instructions for a recipe
   */
  private static getStorageInstructions(recipe: Recipe): string {
    // This is a simplified version - could be enhanced with AI
    const hasProtein = recipe.ingredients.some(ing =>
      /poulet|boeuf|porc|poisson|viande/i.test(ing.name)
    );

    if (hasProtein) {
      return 'Conserver au réfrigérateur dans un contenant hermétique. Peut être congelé pour une conservation plus longue.';
    }

    return 'Conserver au réfrigérateur dans un contenant hermétique.';
  }

  /**
   * Estimate shelf life in days
   */
  private static estimateShelfLife(recipe: Recipe): number {
    // Simplified estimation
    const hasProtein = recipe.ingredients.some(ing =>
      /poulet|boeuf|porc|poisson|viande/i.test(ing.name)
    );

    const hasDairy = recipe.ingredients.some(ing =>
      /lait|fromage|yaourt|crème/i.test(ing.name)
    );

    if (hasProtein) return 3;
    if (hasDairy) return 4;
    return 5;
  }

  /**
   * Detect potential leftovers and suggest recipes
   */
  static async getLeftoverSuggestions(
    recipeId: string,
    servingsLeft: number
  ): Promise<LeftoverSuggestion | null> {
    const recipe = RecipeRepository.getById(recipeId);
    if (!recipe) return null;

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + this.estimateShelfLife(recipe));

    // Find recipes that could use similar ingredients
    const allRecipes = RecipeRepository.getAll();
    const suggestedRecipes = allRecipes
      .filter(r => r.id !== recipeId)
      .filter(r => {
        // Check if recipes share ingredients
        const sharedIngredients = recipe.ingredients.filter(ing1 =>
          r.ingredients.some(ing2 =>
            ing1.name.toLowerCase().includes(ing2.name.toLowerCase()) ||
            ing2.name.toLowerCase().includes(ing1.name.toLowerCase())
          )
        );
        return sharedIngredients.length >= 2;
      })
      .slice(0, 3)
      .map(r => ({
        recipeId: r.id,
        recipeName: r.name,
        reason: `Utilise des ingrédients similaires à ${recipe.name}`,
      }));

    if (suggestedRecipes.length === 0) return null;

    return {
      originalRecipeId: recipe.id,
      originalRecipeName: recipe.name,
      servingsLeft,
      expiryDate,
      suggestedRecipes,
    };
  }
}
