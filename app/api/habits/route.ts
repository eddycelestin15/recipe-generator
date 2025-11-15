import { NextRequest, NextResponse } from 'next/server';
import { HabitRepository } from '@/app/lib/repositories/habit-repository';
import { CreateHabitDTO } from '@/app/lib/types/habits';

/**
 * GET /api/habits - Get all habits for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const active = searchParams.get('active');
    const search = searchParams.get('search');

    let habits = HabitRepository.getAll();

    // Filter by category
    if (category) {
      habits = habits.filter(h => h.category === category);
    }

    // Filter by active status
    if (active === 'true') {
      habits = habits.filter(h => h.isActive);
    }

    // Search by name
    if (search) {
      const lowerSearch = search.toLowerCase();
      habits = habits.filter(h =>
        h.name.toLowerCase().includes(lowerSearch) ||
        h.description?.toLowerCase().includes(lowerSearch)
      );
    }

    return NextResponse.json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch habits' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/habits - Create a new habit
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateHabitDTO = await request.json();

    // Validation
    if (!body.name || !body.type || !body.frequency || !body.category) {
      return NextResponse.json(
        { error: 'Name, type, frequency, and category are required' },
        { status: 400 }
      );
    }

    // Validate number type has target
    if (body.type === 'number' && !body.target) {
      return NextResponse.json(
        { error: 'Target is required for number type habits' },
        { status: 400 }
      );
    }

    // Validate weekly frequency has specific days
    if (body.frequency === 'weekly' && (!body.specificDays || body.specificDays.length === 0)) {
      return NextResponse.json(
        { error: 'Specific days are required for weekly frequency' },
        { status: 400 }
      );
    }

    const habit = HabitRepository.create(body);

    return NextResponse.json(habit, { status: 201 });
  } catch (error) {
    console.error('Error creating habit:', error);
    return NextResponse.json(
      { error: 'Failed to create habit' },
      { status: 500 }
    );
  }
}
