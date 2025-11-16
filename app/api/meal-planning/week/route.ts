import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Load weekly meal plan from storage (localStorage simulation via user settings)
    // In production, you'd fetch from database
    const plan = null; // Placeholder - would fetch from DB

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Error loading week plan:', error);
    return NextResponse.json(
      { error: 'Failed to load meal plan' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await request.json();

    if (!plan) {
      return NextResponse.json({ error: 'Plan is required' }, { status: 400 });
    }

    // Save weekly meal plan to database
    // In production, you'd save to database
    // For now, just return success

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving week plan:', error);
    return NextResponse.json(
      { error: 'Failed to save meal plan' },
      { status: 500 }
    );
  }
}
