/**
 * Shopping List Generation API
 *
 * POST /api/shopping-lists/generate
 * Generates a shopping list from a meal plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { MealPlanService } from '@/app/lib/services/meal-plan-service';
import { MealPlanRepository } from '@/app/lib/repositories/meal-plan-repository';
import { ShoppingListRepository } from '@/app/lib/repositories/shopping-list-repository';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mealPlanId, subtractFridge = true, name } = body;

    if (!mealPlanId) {
      return NextResponse.json(
        { error: 'mealPlanId is required' },
        { status: 400 }
      );
    }

    // Get meal plan
    const mealPlan = MealPlanRepository.getById(mealPlanId);
    if (!mealPlan) {
      return NextResponse.json(
        { error: 'Meal plan not found' },
        { status: 404 }
      );
    }

    // Generate shopping list items
    const items = await MealPlanService.generateShoppingList(mealPlan.days, subtractFridge);

    // Create shopping list
    const shoppingList = ShoppingListRepository.create({
      mealPlanId,
      name: name || `Liste de courses - ${new Date().toLocaleDateString()}`,
      items,
    });

    return NextResponse.json(shoppingList, { status: 201 });
  } catch (error) {
    console.error('Error generating shopping list:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate shopping list',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
