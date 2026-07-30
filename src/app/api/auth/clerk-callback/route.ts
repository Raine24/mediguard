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

    const targetUrl = !user.whatsappVerified ? '/verify-phone' : '/dashboard';

    // HTML Auto-Bridge to issue NextAuth session cookie
    const html = `<!DOCTYPE html>
<html>
  <head>
    <title>Logging in...</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-slate-900 min-h-screen flex items-center justify-center font-sans text-white p-4">
    <div class="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl text-center max-w-sm w-full">
      <div class="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <h2 class="text-lg font-bold text-white mb-1">Authenticating Session</h2>
      <p class="text-xs text-slate-400">Taking you to MedicINtime...</p>
    </div>
    <script>
      async function syncNextAuthSession() {
        try {
          const csrfRes = await fetch('/api/auth/csrf');
          const csrfData = await csrfRes.json();
          
          await fetch('/api/auth/callback/credentials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              email: ${JSON.stringify(email)},
              isSsoLogin: 'true',
              csrfToken: csrfData.csrfToken,
              json: 'true'
            })
          });
          window.location.href = ${JSON.stringify(targetUrl)};
        } catch (err) {
          console.error("NextAuth sync error:", err);
          window.location.href = ${JSON.stringify(targetUrl)};
        }
      }
      syncNextAuthSession();
    </script>
  </body>
</html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    console.error('Clerk callback error:', error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}
