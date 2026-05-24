import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import { UserModel } from '@/models';
import bcrypt from 'bcryptjs';

// Import the shared OTP store
import { resetOtpStore } from '../forgot-password/route';

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'Email, OTP, and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Verify OTP
    const stored = resetOtpStore.get(email.toLowerCase());

    if (!stored) {
      return NextResponse.json({ error: 'No reset code found. Please request a new one.' }, { status: 400 });
    }

    if (Date.now() > stored.expires) {
      resetOtpStore.delete(email.toLowerCase());
      return NextResponse.json({ error: 'Reset code has expired. Please request a new one.' }, { status: 400 });
    }

    if (stored.otp !== otp) {
      return NextResponse.json({ error: 'Invalid reset code' }, { status: 400 });
    }

    // OTP verified — update password
    await connectDB();
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const user = await UserModel.findOneAndUpdate(
      { email: email.toLowerCase() },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Clear OTP after successful reset
    resetOtpStore.delete(email.toLowerCase());

    return NextResponse.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
