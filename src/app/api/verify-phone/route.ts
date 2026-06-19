import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json({ error: 'Missing phone or code' }, { status: 400 });
    }

    // Find the latest unverified user with this phone number
    const user = await prisma.user.findFirst({
      where: { phone },
      orderBy: { createdAt: 'desc' },
      select: { id: true, twoFactorSecret: true }
    });

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ error: 'Invalid request or code expired' }, { status: 400 });
    }

    let payload;
    try {
      payload = JSON.parse(user.twoFactorSecret);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid verification payload' }, { status: 400 });
    }

    if (Date.now() > payload.expires) {
      return NextResponse.json({ error: 'Verification code expired' }, { status: 400 });
    }

    if (payload.code !== code) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Revoke this phone number from any other users
    await prisma.user.updateMany({
      where: { 
        phone,
        id: { not: user.id }
      },
      data: {
        whatsappVerified: false,
        phone: `revoked_${Date.now()}`
      }
    });

    // Success! Update the user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        whatsappVerified: true,
        twoFactorSecret: null // clear the OTP
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
