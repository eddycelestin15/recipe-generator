/**
 * Shopping List API Routes (by ID)
 *
 * GET /api/shopping-lists/[id] - Get a specific shopping list
 * PUT /api/shopping-lists/[id] - Update a shopping list
 * DELETE /api/shopping-lists/[id] - Delete a shopping list
 */

import { NextRequest, NextResponse } from 'next/server';
import { ShoppingListRepository } from '@/app/lib/repositories/shopping-list-repository';
import type { UpdateShoppingListDTO } from '@/app/lib/types/meal-plan';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const shoppingList = ShoppingListRepository.getById(id);

    if (!shoppingList) {
      return NextResponse.json(
        { error: 'Shopping list not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(shoppingList);
  } catch (error) {
    console.error('Error fetching shopping list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shopping list' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateShoppingListDTO = await request.json();
    const shoppingList = ShoppingListRepository.update(id, body);

    if (!shoppingList) {
      return NextResponse.json(
        { error: 'Shopping list not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(shoppingList);
  } catch (error) {
    console.error('Error updating shopping list:', error);
    return NextResponse.json(
      { error: 'Failed to update shopping list' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = ShoppingListRepository.delete(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Shopping list not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shopping list:', error);
    return NextResponse.json(
      { error: 'Failed to delete shopping list' },
      { status: 500 }
    );
  }
}
