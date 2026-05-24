import { NextResponse } from 'next/server';
import { resend, TEST_EMAIL, IS_SANDBOX_MODE } from '@/lib/resend';
import { connectDB } from '@/lib/mongoose';
import { UserModel } from '@/models';

// In-memory OTP store (use Redis in production)
const resetOtpStore = new Map<string, { otp: string; expires: number }>();

export { resetOtpStore };

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await connectDB();
    const user = await UserModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email address' }, { status: 404 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    resetOtpStore.set(email.toLowerCase(), { otp, expires });

    const recipientEmail = IS_SANDBOX_MODE ? TEST_EMAIL : email;
    const senderEmail = IS_SANDBOX_MODE
      ? "Nature's Nook Duo <onboarding@resend.dev>"
      : "Nature's Nook Duo <auth@naturesnookduo.com>";

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; color: #333; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #16a34a; margin: 0;">Password Reset Code</h2>
          <p style="color: #718096; font-size: 14px;">Nature's Nook Duo</p>
        </div>
        
        <p>Hello ${user.name},</p>
        <p>We received a request to reset the password for your account. Use the following code to reset your password:</p>
        
        <div style="background: #f7fafc; padding: 30px; text-align: center; border-radius: 10px; margin: 20px 0; border: 1px dashed #cbd5e0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #16a34a;">${otp}</span>
        </div>
        
        <p style="font-size: 12px; color: #718096; text-align: center;">
          This code will expire in 10 minutes. If you did not request this, please ignore this email.
        </p>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          Nature's Nook Duo - Premium Exotics & Supplies<br>
          Quality is our primary goal.
        </p>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: senderEmail,
      to: [recipientEmail],
      subject: `${otp} is your password reset code`,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send reset code' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Reset code sent to your email' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
