import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/fridge-items
 * Query params:
 *   - userId: Filter by user ID (required)
 *   - category: Filter by category
 *   - expiring: Number of days ahead to check for expiring items
 *
 * Examples:
 *   GET /api/fridge-items?userId=123
 *   GET /api/fridge-items?userId=123&category=vegetables
 *   GET /api/fridge-items?userId=123&expiring=3
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const expiring = searchParams.get('expiring');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get expiring items
    if (expiring) {
      const items = await db.fridgeItems.findExpiringSoon(
        userId,
        parseInt(expiring)
      );
      return NextResponse.json(items);
    }

    // Get items by category
    if (category) {
      const items = await db.fridgeItems.findByUserIdAndCategory(userId, category);
      return NextResponse.json(items);
    }

    // Get all items for user
    const items = await db.fridgeItems.findByUserId(userId);
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching fridge items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fridge items' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/fridge-items
 * Body: { userId, name, quantity, unit, category?, expirationDate?, imageUrl? }
 *
 * Example:
 * {
 *   "userId": "123",
 *   "name": "Tomatoes",
 *   "quantity": 5,
 *   "unit": "pieces",
 *   "category": "vegetables",
 *   "expirationDate": "2024-01-20"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic validation
    if (!body.userId || !body.name || !body.quantity || !body.unit) {
      return NextResponse.json(
        { error: 'userId, name, quantity, and unit are required' },
        { status: 400 }
      );
    }

    const item = await db.fridgeItems.create({
      ...body,
      addedDate: new Date(),
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating fridge item:', error);
    return NextResponse.json(
      { error: 'Failed to create fridge item' },
      { status: 500 }
    );
  }
}
