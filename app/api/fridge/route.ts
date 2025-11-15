import { NextRequest, NextResponse } from 'next/server';
import { FridgeRepository } from '@/app/lib/repositories/fridge-repository';
import { CreateFridgeItemDTO } from '@/app/lib/types/fridge';

export async function GET() {
  try {
    const items = await FridgeRepository.getAll();
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching fridge items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fridge items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: CreateFridgeItemDTO = await request.json();

    // Validation
    if (!data.name || !data.quantity || !data.unit || !data.category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, quantity, unit, category' },
        { status: 400 }
      );
    }

    if (data.quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      );
    }

    const newItem = await FridgeRepository.create(data);
    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    console.error('Error creating fridge item:', error);
    return NextResponse.json(
      { error: 'Failed to create fridge item' },
      { status: 500 }
    );
  }
}
