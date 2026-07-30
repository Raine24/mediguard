import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppTemplate } from '@/lib/bird';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { currentUser } from "@clerk/nextjs/server";

function normalizePhone(p: string): string {
  if (!p) return '';
  const digits = p.replace(/[^\d+]/g, '');
  if (!digits) return '';
  return digits.startsWith('+') ? digits : `+${digits}`;
}

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const cleanPhone = normalizePhone(phone);
    if (cleanPhone.length < 8) {
      return NextResponse.json({ error: 'Please enter a valid phone number with country code' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const payload = JSON.stringify({
      phone: cleanPhone,
      code: otp,
      expires: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    // 1. Identify logged-in user via NextAuth or Clerk
    let targetUser = null;
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      targetUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    }

    if (!targetUser) {
      try {
        const clerkUser = await currentUser();
        const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
        if (email) {
          targetUser = await prisma.user.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } }
          });
        }
      } catch (e) {
        console.error("Clerk user lookup error in send-otp:", e);
      }
    }

    // 2. If no active session user, try finding latest user by phone
    if (!targetUser) {
      targetUser = await prisma.user.findFirst({
        where: { OR: [{ phone: cleanPhone }, { phone: phone.trim() }] },
        orderBy: { createdAt: 'desc' }
      });
    }

    if (!targetUser) {
      return NextResponse.json({ error: 'User account not found. Please sign up first.' }, { status: 404 });
    }

    // 3. Save OTP payload and normalized phone to user
    await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        phone: cleanPhone,
        twoFactorSecret: payload,
        whatsappVerified: false
      }
    });

    // 4. Send OTP via Bird WhatsApp Template
    const response = await sendWhatsAppTemplate(cleanPhone, "verification_code_update", [otp]);
    
    if (response.status === "failed") {
      console.error("Bird API Template Error:", response.error);
      return NextResponse.json({ error: response.error || "Failed to send WhatsApp verification code." }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Verification OTP sent to WhatsApp' });

  } catch (error: any) {
    console.error('Send WhatsApp OTP Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to send WhatsApp verification code' },
      { status: 500 }
    );
  }
}
