import { NextRequest, NextResponse } from 'next/server';
import { DailyCheckInRepository } from '@/app/lib/repositories/daily-checkin-repository';
import { CreateCheckInDTO } from '@/app/lib/types/habits';

/**
 * GET /api/checkin - Get check-ins (with optional date filtering)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const daysParam = searchParams.get('days');

    if (dateParam) {
      // Get specific date
      const checkIn = DailyCheckInRepository.getByDate(new Date(dateParam));
      return NextResponse.json(checkIn);
    }

    if (daysParam) {
      // Get recent days
      const days = parseInt(daysParam);
      const checkIns = DailyCheckInRepository.getRecent(days);
      return NextResponse.json(checkIns);
    }

    // Get all
    const checkIns = DailyCheckInRepository.getAll();
    return NextResponse.json(checkIns);
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch check-ins' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/checkin - Create or update a daily check-in
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateCheckInDTO = await request.json();

    // Validation
    if (!body.date || !body.mood || !body.energy || !body.sleepHours || !body.sleepQuality) {
      return NextResponse.json(
        { error: 'All fields (date, mood, energy, sleepHours, sleepQuality) are required' },
        { status: 400 }
      );
    }

    // Validate ranges
    if (body.mood < 1 || body.mood > 5 || body.energy < 1 || body.energy > 5 ||
        body.sleepQuality < 1 || body.sleepQuality > 5) {
      return NextResponse.json(
        { error: 'Mood, energy, and sleepQuality must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (body.sleepHours < 0 || body.sleepHours > 24) {
      return NextResponse.json(
        { error: 'Sleep hours must be between 0 and 24' },
        { status: 400 }
      );
    }

    const checkIn = DailyCheckInRepository.createOrUpdate({
      date: new Date(body.date),
      mood: body.mood,
      energy: body.energy,
      sleepHours: body.sleepHours,
      sleepQuality: body.sleepQuality,
      notes: body.notes,
    });

    return NextResponse.json(checkIn, { status: 201 });
  } catch (error) {
    console.error('Error creating check-in:', error);
    return NextResponse.json(
      { error: 'Failed to create check-in' },
      { status: 500 }
    );
  }
}
