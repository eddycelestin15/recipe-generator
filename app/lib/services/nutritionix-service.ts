/**
 * Nutritionix API Service
 *
 * Service to fetch nutrition data from Nutritionix API
 * Free tier: 500 requests/day
 *
 * To use this service:
 * 1. Sign up at https://www.nutritionix.com/business/api
 * 2. Get your API credentials (App ID and App Key)
 * 3. Add them to your .env.local file:
 *    NUTRITIONIX_APP_ID=your_app_id
 *    NUTRITIONIX_APP_KEY=your_app_key
 */

import type { NutritionixResponse, CustomFood } from '../types/nutrition';

const NUTRITIONIX_API_URL = 'https://trackapi.nutritionix.com/v2';

interface NutritionixConfig {
  appId: string;
  appKey: string;
}

export class NutritionixService {
  private config: NutritionixConfig;

  constructor(config?: NutritionixConfig) {
    this.config = config || {
      appId: process.env.NUTRITIONIX_APP_ID || '',
      appKey: process.env.NUTRITIONIX_APP_KEY || '',
    };
  }

  /**
   * Search for nutrition data using natural language
   * Example: "1 apple", "200ml milk", "2 eggs"
   */
  async searchNaturalLanguage(query: string): Promise<CustomFood | null> {
    if (!this.config.appId || !this.config.appKey) {
      console.error('Nutritionix API credentials not configured');
      return this.getFallbackNutrition(query);
    }

    try {
      const response = await fetch(`${NUTRITIONIX_API_URL}/natural/nutrients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-id': this.config.appId,
          'x-app-key': this.config.appKey,
        },
        body: JSON.stringify({
          query,
        }),
      });

      if (!response.ok) {
        throw new Error(`Nutritionix API error: ${response.status}`);
      }

      const data: NutritionixResponse = await response.json();

      if (!data.foods || data.foods.length === 0) {
        return this.getFallbackNutrition(query);
      }

      // Get the first food item
      const food = data.foods[0];

      return {
        name: food.food_name,
        calories: Math.round(food.nf_calories),
        protein: Math.round(food.nf_protein),
        carbs: Math.round(food.nf_total_carbohydrate),
        fat: Math.round(food.nf_total_fat),
        fiber: Math.round(food.nf_dietary_fiber),
      };
    } catch (error) {
      console.error('Error fetching from Nutritionix API:', error);
      return this.getFallbackNutrition(query);
    }
  }

  /**
   * Fallback nutrition data for common foods
   * Used when API is not available or configured
   */
  private getFallbackNutrition(query: string): CustomFood {
    const lowerQuery = query.toLowerCase();

    // Common foods database (per 100g or standard serving)
    const commonFoods: Record<string, CustomFood> = {
      apple: { name: 'Pomme', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 },
      banana: { name: 'Banane', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
      egg: { name: 'Œuf', calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
      milk: { name: 'Lait', calories: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0 },
      chicken: { name: 'Poulet', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
      rice: { name: 'Riz', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
      bread: { name: 'Pain', calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7 },
      pasta: { name: 'Pâtes', calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8 },
      salmon: { name: 'Saumon', calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 },
      avocado: { name: 'Avocat', calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7 },
    };

    // Try to find matching food
    for (const [key, value] of Object.entries(commonFoods)) {
      if (lowerQuery.includes(key)) {
        return value;
      }
    }

    // Default fallback
    return {
      name: query,
      calories: 100,
      protein: 5,
      carbs: 15,
      fat: 3,
      fiber: 2,
    };
  }

  /**
   * Get nutrition for multiple items
   */
  async searchMultiple(queries: string[]): Promise<CustomFood[]> {
    const results = await Promise.all(
      queries.map(query => this.searchNaturalLanguage(query))
    );

    return results.filter((item): item is CustomFood => item !== null);
  }
}

// Export a singleton instance
export const nutritionixService = new NutritionixService();
