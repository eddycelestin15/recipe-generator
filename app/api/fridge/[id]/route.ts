import { NextRequest, NextResponse } from 'next/server';
import { FridgeRepository } from '@/app/lib/repositories/fridge-repository';
import { UpdateFridgeItemDTO } from '@/app/lib/types/fridge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await FridgeRepository.getById(id);

    if (!item) {
      return NextResponse.json(
        { error: 'Fridge item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error fetching fridge item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fridge item' },
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
    const data: UpdateFridgeItemDTO = await request.json();

    if (data.quantity !== undefined && data.quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      );
    }

    const updatedItem = await FridgeRepository.update(id, data);

    if (!updatedItem) {
      return NextResponse.json(
        { error: 'Fridge item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ item: updatedItem });
  } catch (error) {
    console.error('Error updating fridge item:', error);
    return NextResponse.json(
      { error: 'Failed to update fridge item' },
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
    const success = await FridgeRepository.delete(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Fridge item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting fridge item:', error);
    return NextResponse.json(
      { error: 'Failed to delete fridge item' },
      { status: 500 }
    );
  }
}
