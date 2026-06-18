import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This endpoint should be triggered daily via Vercel Cron or a local cron task
export async function GET(req: Request) {
  try {
    // Basic auth check if CRON_SECRET is set
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // Find all pending conversions older than 14 days
    const pendingConversions = await prisma.affiliateConversion.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lte: fourteenDaysAgo
        }
      }
    });

    let clearedCount = 0;

    // Process them
    for (const conversion of pendingConversions) {
      // Mark as CLEARED
      await prisma.affiliateConversion.update({
        where: { id: conversion.id },
        data: {
          status: 'CLEARED',
          clearedAt: new Date()
        }
      });

      // Move funds from pending to available on the Affiliate profile
      await prisma.affiliateProfile.update({
        where: { id: conversion.affiliateId },
        data: {
          pendingEarnings: { decrement: conversion.commissionAmount },
          availableEarnings: { increment: conversion.commissionAmount }
        }
      });

      clearedCount++;
    }

    return NextResponse.json({ success: true, clearedCount });
  } catch (error) {
    console.error("Affiliate clearing cron failed:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
