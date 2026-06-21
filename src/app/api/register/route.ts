import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, phone, country, planType, timezone } = body;

    // Basic validation
    if (!name || !email || !password || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' }
      }
    });

    if (existingUser) {
      console.log(`[Register] User already exists in DB. ID: ${existingUser.id}, Email: ${existingUser.email}`);
      return NextResponse.json(
        { error: 'A user with this email already exists, please try a different email.' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 6 digit OTP for WhatsApp verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const payload = JSON.stringify({
      phone,
      code: otp,
      expires: Date.now() + 10 * 60 * 1000 // 10 mins
    });

    // Check for referral cookie
    const cookieStore = await cookies();
    const refCookie = cookieStore.get('medicintime_ref');
    const referredByCode = refCookie?.value || null;

    const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    // Create user and subscription atomically
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        country: country || 'Unknown',
        timezone: timezone || 'UTC',
        whatsappVerified: false,
        twoFactorSecret: payload,
        referredByCode,
        referralCode,

        subscription: {
          create: {
            planType: planType || 'BASIC',
            status: 'ACTIVE', // 7-day free trial
            startDate: new Date(),
            expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        }
      },
      include: {
        subscription: true
      }
    });

    // Send the OTP via Bird.com using a WhatsApp Template to bypass the 24h block
    const { sendWhatsAppTemplate } = await import('@/lib/bird');
    
    try {
      // Expects an approved template named "verification_code" with 1 variable {{1}} for the OTP
      const response = await sendWhatsAppTemplate(phone, "verification_code", [otp]);
      if (response.status === "failed") {
        console.error("Bird API Template Error:", response.error);
        return NextResponse.json({ error: response.error || "Failed to send WhatsApp verification code." }, { status: 400 });
      }
    } catch (e: any) {
      console.error("Failed to send welcome OTP via Bird template", e);
      return NextResponse.json({ error: e.message || "Failed to send WhatsApp verification code." }, { status: 400 });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: 'Registration successful, OTP sent', user: userWithoutPassword, requiresOtp: true },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'Internal server error during registration' },
      { status: 500 }
    );
  }
}
