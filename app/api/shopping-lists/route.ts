/**
 * Shopping Lists API Routes
 *
 * GET /api/shopping-lists - Get all shopping lists
 * POST /api/shopping-lists - Create a new shopping list
 */

import { NextRequest, NextResponse } from 'next/server';
import { ShoppingListRepository } from '@/app/lib/repositories/shopping-list-repository';
import type { CreateShoppingListDTO } from '@/app/lib/types/meal-plan';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mealPlanId = searchParams.get('mealPlanId');
    const active = searchParams.get('active');

    if (mealPlanId) {
      // Get shopping list for specific meal plan
      const shoppingList = ShoppingListRepository.getByMealPlanId(mealPlanId);
      return NextResponse.json(shoppingList);
    }

    if (active === 'true') {
      // Get active shopping lists (not completed)
      const shoppingLists = ShoppingListRepository.getActive();
      return NextResponse.json(shoppingLists);
    }

    // Get all shopping lists
    const shoppingLists = ShoppingListRepository.getAll();
    return NextResponse.json(shoppingLists);
  } catch (error) {
    console.error('Error fetching shopping lists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shopping lists' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateShoppingListDTO = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    const shoppingList = ShoppingListRepository.create(body);
    return NextResponse.json(shoppingList, { status: 201 });
  } catch (error) {
    console.error('Error creating shopping list:', error);
    return NextResponse.json(
      { error: 'Failed to create shopping list' },
      { status: 500 }
    );
  }
}
