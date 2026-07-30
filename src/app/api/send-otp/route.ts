import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppTemplate } from '@/lib/bird';

export async function POST(req: Request) {
  try {
    const { phone, userId, email } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Format & validate phone number (digits only with optional +)
    const cleanPhone = phone.trim().startsWith('+') ? phone.trim() : `+${phone.trim()}`;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const payload = JSON.stringify({
      phone: cleanPhone,
      code: otp,
      expires: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    // Update or find user by userId or email
    let targetUser = null;

    if (userId) {
      targetUser = await prisma.user.findUnique({ where: { id: userId } });
    } else if (email) {
      targetUser = await prisma.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } }
      });
    }

    if (targetUser) {
      await prisma.user.update({
        where: { id: targetUser.id },
        data: {
          phone: cleanPhone,
          twoFactorSecret: payload,
          whatsappVerified: false
        }
      });
    }

    // Send OTP via Bird WhatsApp Template
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
