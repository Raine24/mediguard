"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function removeReferral(referralId: string, reason: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const adminUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!adminUser || (adminUser.role !== 'ADMIN' && adminUser.role !== 'SUPER_ADMIN')) {
    throw new Error("Forbidden");
  }

  const referral = await prisma.referral.findUnique({ where: { id: referralId }, include: { referrer: true } });
  if (!referral) throw new Error("Referral not found");

  if (referral.status === "REFUNDED") throw new Error("Referral is already marked as refunded.");

  // Update referral status
  await prisma.referral.update({
    where: { id: referralId },
    data: { status: "REFUNDED" }
  });

  // Log action
  await prisma.auditLog.create({
    data: {
      action: "REFERRAL_REMOVED",
      adminId: session.user.id,
      targetId: referral.referrerId,
      details: `Referral ${referral.id} manually removed. Reason: ${reason}`
    }
  });

  // Re-evaluate the referrer's tiers and total successful referrals
  const successfulReferrals = await prisma.referral.findMany({
    where: { referrerId: referral.referrerId, status: "PAID" },
    orderBy: { createdAt: 'asc' }
  });

  const count = successfulReferrals.length;
  let tier1Earned = 0;
  let tier2Earned = 0;
  let tier3Earned = 0;

  if (count >= 2) tier1Earned = 1;
  if (count >= 6) {
    const t2Refs = successfulReferrals.slice(0, 6);
    const sum = t2Refs.reduce((acc, r) => acc + r.rewardContribution, 0);
    tier2Earned = Math.min(12, Math.ceil(sum));
  }
  if (count >= 12) tier3Earned = 12;

  const newTotalEarnedMonths = tier1Earned + tier2Earned + tier3Earned;
  
  // Calculate how many months need to be removed
  const monthsToDeduct = referral.referrer.freeMonthsEarned - newTotalEarnedMonths;

  if (monthsToDeduct > 0) {
    const sub = await prisma.subscription.findUnique({ where: { userId: referral.referrerId } });
    if (sub && sub.expiryDate) {
      const currentExpiry = sub.expiryDate;
      const newExpiry = new Date(currentExpiry.getTime() - monthsToDeduct * 30 * 24 * 60 * 60 * 1000);
      
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { expiryDate: newExpiry }
      });
    }

    await prisma.user.update({
      where: { id: referral.referrerId },
      data: {
        totalSuccessfulReferrals: count,
        freeMonthsEarned: newTotalEarnedMonths,
        freeMonthsApplied: Math.max(0, referral.referrer.freeMonthsApplied - monthsToDeduct)
      }
    });
    
    // Notify referrer that referral was removed
    const { sendWhatsAppMessage } = await import('@/lib/whatsapp');
    if (referral.referrer.phone) {
      await sendWhatsAppMessage(referral.referrer.phone, `⚠️ Hi ${referral.referrer.name.split(' ')[0]}, one of your recent referrals has cancelled or refunded their account. We have updated your referral count to ${count}. — MedicINtime`);
    }

  } else {
    // Just update the count
    await prisma.user.update({
      where: { id: referral.referrerId },
      data: { totalSuccessfulReferrals: count }
    });
  }

  revalidatePath("/admin/referrals");
  return { success: true };
}

export async function awardFreeMonths(userId: string, months: number, reason: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const adminUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!adminUser || (adminUser.role !== 'ADMIN' && adminUser.role !== 'SUPER_ADMIN')) {
    throw new Error("Forbidden");
  }

  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) throw new Error("User does not have an active subscription record.");

  const currentExpiry = sub.expiryDate && sub.expiryDate > new Date() ? sub.expiryDate : new Date();
  const newExpiry = new Date(currentExpiry.getTime() + months * 30 * 24 * 60 * 60 * 1000);

  await prisma.subscription.update({
    where: { id: sub.id },
    data: { expiryDate: newExpiry }
  });

  const userToUpdate = await prisma.user.findUnique({ where: { id: userId } });
  if (userToUpdate) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        freeMonthsEarned: userToUpdate.freeMonthsEarned + months,
        freeMonthsApplied: userToUpdate.freeMonthsApplied + months
      }
    });
  }

  await prisma.auditLog.create({
    data: {
      action: "MANUAL_REWARD_APPLIED",
      adminId: session.user.id,
      targetId: userId,
      details: `Manually awarded ${months} free months. Reason: ${reason}`
    }
  });

  revalidatePath("/admin/referrals");
  return { success: true };
}
