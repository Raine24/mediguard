import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
    const { phone, code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Missing verification code' }, { status: 400 });
    }

    const cleanPhone = phone ? normalizePhone(phone) : '';
    const cleanCode = code.trim();

    let user = null;

    // 1. Identify logged-in user via NextAuth
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, twoFactorSecret: true, phone: true }
      });
    }

    // 2. Fallback to Clerk user
    if (!user) {
      try {
        const clerkUser = await currentUser();
        const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
        if (email) {
          user = await prisma.user.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } },
            select: { id: true, twoFactorSecret: true, phone: true }
          });
        }
      } catch (e) {
        console.error("Clerk user lookup error in verify-phone:", e);
      }
    }

    // 3. Fallback to finding user by the provided phone number (crucial for normal registration flow where session isn't set yet)
    if (!user && cleanPhone) {
      user = await prisma.user.findFirst({
        where: { OR: [{ phone: cleanPhone }, { phone: phone.trim() }] },
        orderBy: { createdAt: 'desc' },
        select: { id: true, twoFactorSecret: true, phone: true }
      });
    }

    console.log("[Verify Phone Debug] Inputs:", { phone, cleanPhone, cleanCode });
    console.log("[Verify Phone Debug] Found User:", user ? { id: user.id, phone: user.phone, hasSecret: !!user.twoFactorSecret } : null);

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ error: 'Invalid request or code expired. Please click "Resend WhatsApp OTP".' }, { status: 400 });
    }

    let payload: { phone?: string; code: string; expires: number };
    try {
      payload = JSON.parse(user.twoFactorSecret);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid verification payload' }, { status: 400 });
    }

    if (Date.now() > payload.expires) {
      return NextResponse.json({ error: 'Verification code expired. Please click "Resend WhatsApp OTP".' }, { status: 400 });
    }

    if (payload.code !== cleanCode) {
      return NextResponse.json({ error: 'Invalid verification code. Please check your WhatsApp.' }, { status: 400 });
    }

    // Revoke this phone number from any other previous accounts
    const targetPhone = cleanPhone || payload.phone || user.phone;
    if (targetPhone) {
      await prisma.user.updateMany({
        where: { 
          phone: targetPhone,
          id: { not: user.id }
        },
        data: {
          whatsappVerified: false,
          phone: `revoked_${Date.now()}`
        }
      });
    }

    // Success! Update the user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        phone: targetPhone,
        whatsappVerified: true,
        twoFactorSecret: null // clear the OTP payload
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('OTP Verification Error:', error);
    return NextResponse.json(
      { error: 'Internal server error during verification' },
      { status: 500 }
    );
  }
}
