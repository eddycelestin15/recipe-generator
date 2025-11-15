import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * GET /api/users/:id
 */
export async function GET(request: NextRequest, props: Params) {
  try {
    const params = await props.params;
    const user = await db.users.findById(params.id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/:id
 * Body: Partial user data
 */
export async function PATCH(request: NextRequest, props: Params) {
  try {
    const params = await props.params;
    const body = await request.json();
    const user = await db.users.update(params.id, body);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/:id
 */
export async function DELETE(request: NextRequest, props: Params) {
  try {
    const params = await props.params;
    await db.users.delete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
