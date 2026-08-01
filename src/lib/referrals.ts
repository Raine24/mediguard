import { prisma } from '@/lib/prisma';
import { sendWhatsAppMessage } from '@/lib/telnyx';

export async function processReferralReward({
  referredUserId,
  planType,
  billingCycle,
}: {
  referredUserId: string;
  planType: string;
  billingCycle: string; // 'MONTHLY' | 'BIANNUAL' | 'ANNUAL'
}) {
  try {
    // 1. Check if referral program is globally enabled
    const referralSetting = await prisma.systemSetting.findUnique({
      where: { key: 'referral_program_enabled' },
    });
    if (referralSetting && referralSetting.value === 'false') {
      return;
    }

    // 2. Fetch referred user
    const user = await prisma.user.findUnique({
      where: { id: referredUserId },
    });

    if (!user || !user.referredByCode) {
      return;
    }

    // 3. Find referrer by referral code
    const referrer = await prisma.user.findUnique({
      where: { referralCode: user.referredByCode },
      include: { subscription: true },
    });

    if (!referrer || referrer.id === user.id) {
      return; // Prevent missing referrer or self-referral
    }

    // 4. Determine Friend's commitment (in months)
    let friendMonths = 1;
    if (billingCycle === 'ANNUAL') friendMonths = 12;
    else if (billingCycle === 'BIANNUAL') friendMonths = 6;
    else friendMonths = 1;

    // 5. Determine Referrer's commitment (in months)
    let referrerMonths = 1;
    if (referrer.subscription) {
      const subDateDiff = referrer.subscription.expiryDate.getTime() - (referrer.subscription.startDate?.getTime() || Date.now());
      const subDays = subDateDiff / (1000 * 60 * 60 * 24);
      if (subDays >= 300) referrerMonths = 12;
      else if (subDays >= 150) referrerMonths = 6;
      else referrerMonths = 1;
    }

    // 6. Calculate Reward Months: Minimum between Referrer and Friend commitment
    let rewardMonths = Math.min(referrerMonths, friendMonths);

    // Apply cap if 12 months is capped at 6 months as specified in Kaika's rule
    if (friendMonths === 12 && referrerMonths === 6) rewardMonths = 6;
    if (friendMonths === 1 && referrerMonths === 12) rewardMonths = 1;

    // 7. Upsert Referral Record
    await prisma.referral.upsert({
      where: { referredUserId: user.id },
      create: {
        referrerId: referrer.id,
        referredUserId: user.id,
        planType,
        billingCycle,
        status: "PAID",
        rewardContribution: rewardMonths,
      },
      update: {
        status: "PAID",
        planType,
        billingCycle,
        rewardContribution: rewardMonths,
      },
    });

    // 8. Grant Free Months to Referrer
    if (referrer.subscription) {
      const currentExpiry = referrer.subscription.expiryDate && referrer.subscription.expiryDate > new Date()
        ? referrer.subscription.expiryDate
        : new Date();

      const newExpiry = new Date(currentExpiry.getTime() + rewardMonths * 30 * 24 * 60 * 60 * 1000);

      await prisma.subscription.update({
        where: { id: referrer.subscription.id },
        data: { expiryDate: newExpiry },
      });
    }

    // Update Referrer stats
    const totalSuccessful = await prisma.referral.count({
      where: { referrerId: referrer.id, status: "PAID" },
    });

    await prisma.user.update({
      where: { id: referrer.id },
      data: {
        freeMonthsEarned: referrer.freeMonthsEarned + rewardMonths,
        freeMonthsApplied: referrer.freeMonthsApplied + rewardMonths,
        totalSuccessfulReferrals: totalSuccessful,
      },
    });

    // 9. Audit Log & WhatsApp Notification
    await prisma.auditLog.create({
      data: {
        action: "REFERRAL_REWARD_APPLIED",
        targetId: referrer.id,
        details: `Referral reward of ${rewardMonths} free month(s) granted for user ${user.email} (${planType} ${billingCycle}).`,
      },
    });

    if (referrer.phone) {
      const firstName = referrer.name ? referrer.name.split(' ')[0] : 'Friend';
      await sendWhatsAppMessage(
        referrer.phone,
        `🎉 Hi ${firstName}, someone just signed up using your MedicINtime referral link! You earned ${rewardMonths} month(s) of free subscription credit added to your account! — MedicINtime`
      );
    }
  } catch (error) {
    console.error("Error processing referral reward:", error);
  }
}
