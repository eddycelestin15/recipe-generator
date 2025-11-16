import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/db/db-client';
import { UserModel } from '@/lib/db/schemas/user.schema';
import { PasswordResetModel } from '@/lib/db/schemas/password-reset.schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find user by email
    const user = await UserModel.findOne({ email: email.toLowerCase() });

    // Don't reveal if user exists or not for security
    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: 'If an account exists, a password reset link has been sent.',
      });
    }

    // Only allow password reset for credentials users
    if (user.provider !== 'credentials') {
      return NextResponse.json({
        message: 'If an account exists, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Delete any existing reset tokens for this user
    await PasswordResetModel.deleteMany({ userId: user._id.toString() });

    // Create new reset token (expires in 1 hour)
    await PasswordResetModel.create({
      userId: user._id.toString(),
      token: hashedToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      used: false,
    });

    // In production, send email with reset link here
    // For now, we'll return the reset link in the response
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

    // TODO: Send email with Resend or other email service
    // await sendPasswordResetEmail(user.email, user.name, resetUrl);

    return NextResponse.json({
      message: 'If an account exists, a password reset link has been sent.',
      // In development, include the reset link
      ...(process.env.NODE_ENV === 'development' && {
        resetLink: resetUrl,
      }),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
