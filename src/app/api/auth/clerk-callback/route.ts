import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { encode } from 'next-auth/jwt';

export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    const clerkUser = await currentUser();

    const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
    if (!email) {
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

    const targetUrl = !user.whatsappVerified ? '/verify-phone' : '/dashboard';
    const redirectResponse = NextResponse.redirect(new URL(targetUrl, req.url));

    // Encode NextAuth JWT token directly
    const secret = process.env.NEXTAUTH_SECRET || "mediguard_super_secret_key_12345";
    const token = await encode({
      token: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        sub: user.id,
      },
      secret,
    });

    const isSecure = req.url.startsWith('https://') || process.env.NODE_ENV === 'production';
    
    // Attach NextAuth session cookies directly on the HTTP 307 redirect response
    redirectResponse.cookies.set(
      isSecure ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      token,
      {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isSecure,
        maxAge: 30 * 24 * 60 * 60, // 30 days
      }
    );

    return redirectResponse;
  } catch (error) {
    console.error('Clerk callback error:', error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}
