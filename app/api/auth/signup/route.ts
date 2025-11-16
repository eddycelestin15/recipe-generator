import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { connectToDatabase } from '@/lib/db/db-client';
import { UsageLimitsModel } from '@/lib/db/schemas/usage-limits.schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.users.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await db.users.create({
      email,
      name,
      password: hashedPassword,
      provider: 'credentials',
      onboardingCompleted: false,
    });

    // Create usage limits with FREE tier
    await connectToDatabase();
    await UsageLimitsModel.create({
      userId: user.id,
      plan: 'free',
      recipesGeneratedThisMonth: 0,
      photoAnalysesThisMonth: 0,
      aiChatMessagesThisMonth: 0,
      totalSavedRecipes: 0,
      totalFridgeItems: 0,
      totalHabits: 0,
      totalRoutines: 0,
      lastResetDate: new Date(),
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user as any;

    return NextResponse.json(
      {
        user: userWithoutPassword,
        message: 'User created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
