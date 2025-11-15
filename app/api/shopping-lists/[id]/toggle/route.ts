/**
 * Shopping List Item Toggle API
 *
 * POST /api/shopping-lists/[id]/toggle
 * Toggles the checked status of an item in a shopping list
 */

import { NextRequest, NextResponse } from 'next/server';
import { ShoppingListRepository } from '@/app/lib/repositories/shopping-list-repository';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { itemName } = body;

    if (!itemName) {
      return NextResponse.json(
        { error: 'itemName is required' },
        { status: 400 }
      );
    }

    const shoppingList = ShoppingListRepository.toggleItemChecked(id, itemName);

    if (!shoppingList) {
      return NextResponse.json(
        { error: 'Shopping list or item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(shoppingList);
  } catch (error) {
    console.error('Error toggling item:', error);
    return NextResponse.json(
      { error: 'Failed to toggle item' },
      { status: 500 }
    );
  }
}
