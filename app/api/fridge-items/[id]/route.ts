import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type Params = {
  params: {
    id: string;
  };
};

/**
 * GET /api/fridge-items/:id
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const item = await db.fridgeItems.findById(params.id);

    if (!item) {
      return NextResponse.json(
        { error: 'Fridge item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching fridge item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fridge item' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/fridge-items/:id
 * Body: Partial fridge item data
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json();
    const item = await db.fridgeItems.update(params.id, body);

    if (!item) {
      return NextResponse.json(
        { error: 'Fridge item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating fridge item:', error);
    return NextResponse.json(
      { error: 'Failed to update fridge item' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/fridge-items/:id
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await db.fridgeItems.delete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting fridge item:', error);
    return NextResponse.json(
      { error: 'Failed to delete fridge item' },
      { status: 500 }
    );
  }
}
