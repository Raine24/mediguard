import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    const clerkUser = await currentUser();

    const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
    if (!email) {
      console.error('Clerk callback error: No email found for user', clerkId);
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const name = `${clerkUser?.firstName || ''} ${clerkUser?.lastName || ''}`.trim() || email;

    // Find or create user in Prisma DB
    let user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      include: { subscription: true }
    });

    if (!user) {
      const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: '',
          phone: `clerk_${Date.now()}`,
          country: 'Unknown',
          timezone: 'UTC',
          whatsappVerified: false,
          referralCode,
          subscription: {
            create: {
              planType: 'BASIC',
              status: 'ACTIVE',
              startDate: new Date(),
              expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            }
          }
        },
        include: { subscription: true }
      });
    }

    if (!user.whatsappVerified) {
      return NextResponse.redirect(new URL('/verify-phone', req.url));
    }

    return NextResponse.redirect(new URL('/dashboard', req.url));
  } catch (error) {
    console.error('Clerk callback error:', error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}
