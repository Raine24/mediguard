import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (code) {
    try {
      const affiliate = await prisma.affiliateProfile.findUnique({
        where: { refCode: code }
      });
      
      if (affiliate && affiliate.status === 'ACTIVE') {
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
        const userAgent = request.headers.get('user-agent') || '';
        
        await prisma.affiliateClick.create({
          data: {
            affiliateId: affiliate.id,
            ipAddress: ip,
            userAgent: userAgent
          }
        });
        
        await prisma.affiliateProfile.update({
          where: { id: affiliate.id },
          data: { clicks: { increment: 1 } }
        });
        
        let cookieDuration = 30;
        const setting = await prisma.systemSetting.findUnique({
          where: { key: 'affiliate_cookie_duration' }
        });
        if (setting && !isNaN(parseInt(setting.value))) {
          cookieDuration = parseInt(setting.value);
        }

        const cookieStore = await cookies();
        cookieStore.set('mediguard_ref', code, {
          maxAge: cookieDuration * 24 * 60 * 60,
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
        });
      }
    } catch (error) {
      console.error("Error tracking affiliate click:", error);
    }
  }

  const url = new URL('/', request.url);
  return NextResponse.redirect(url);
}
