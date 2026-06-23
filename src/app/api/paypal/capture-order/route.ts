import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { captureOrder } from "@/lib/paypal";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderID, planType, interval } = await req.json();

    if (!orderID || !planType) {
      return NextResponse.json({ error: "Missing orderID or planType" }, { status: 400 });
    }

    const { jsonResponse, httpStatusCode } = await captureOrder(orderID);

    if (httpStatusCode >= 200 && httpStatusCode < 300 && jsonResponse.status === "COMPLETED") {
      const capturedAmount = jsonResponse.purchase_units[0]?.payments?.captures[0]?.amount?.value || "0";

      // Extend subscription based on interval
      const billingCycle = interval === 'biannual' ? 'BIANNUAL' : interval === 'annual' ? 'ANNUAL' : 'MONTHLY';
      let daysToAdd = 30;
      if (billingCycle === 'BIANNUAL') daysToAdd = 180;
      if (billingCycle === 'ANNUAL') daysToAdd = 365;

      const currentSub = await prisma.subscription.findUnique({ where: { userId: session.user.id } });
      const baseDate = currentSub?.expiryDate && currentSub.expiryDate > new Date() ? currentSub.expiryDate : new Date();
      
      const newExpiryDate = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

      // 1. Update Subscription
      await prisma.subscription.upsert({
        where: { userId: session.user.id },
        update: {
          planType,
          status: "ACTIVE",
          expiryDate: newExpiryDate
        },
        create: {
          userId: session.user.id,
          planType,
          status: "ACTIVE",
          expiryDate: newExpiryDate
        }
      });

      // 2. Record Payment Transaction
      const paymentTx = await prisma.paymentTransaction.create({
        data: {
          userId: session.user.id,
          planType,
          billingCycle,
          amount: parseFloat(capturedAmount),
          method: "PayPal",
          gatewayId: orderID,
          status: "SUCCEEDED"
        }
      });

      // 3. Process Affiliate Commission
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { referredByCode: true }
      });

      if (user?.referredByCode) {
        const affiliate = await prisma.affiliateProfile.findUnique({
          where: { refCode: user.referredByCode }
        });

        if (affiliate && affiliate.status === "ACTIVE") {
          const existingConversions = await prisma.affiliateConversion.count({
            where: { referredUserId: session.user.id }
          });

          if (affiliate.commissionType === "RECURRING" || (affiliate.commissionType === "ONE_TIME" && existingConversions === 0)) {
            let commissionRate = affiliate.customCommissionRate;
            if (!commissionRate) {
              const planRateSetting = await prisma.systemSetting.findUnique({
                where: { key: `affiliate_${planType.toLowerCase()}_rate` }
              });
              commissionRate = planRateSetting ? parseFloat(planRateSetting.value) : 20;
            }

            const commissionAmount = (parseFloat(capturedAmount) * commissionRate) / 100;

            await prisma.affiliateConversion.create({
              data: {
                affiliateId: affiliate.id,
                referredUserId: session.user.id,
                planType,
                paymentAmount: parseFloat(capturedAmount),
                commissionAmount,
                status: "PENDING",
                paymentId: paymentTx.id
              }
            });

            await prisma.affiliateProfile.update({
              where: { id: affiliate.id },
              data: {
                conversions: { increment: existingConversions === 0 ? 1 : 0 },
                pendingEarnings: { increment: commissionAmount },
                totalEarnings: { increment: commissionAmount }
              }
            });
          }
        } else {
          // Process PATIENT Referral Program Reward
          const referralSetting = await prisma.systemSetting.findUnique({
            where: { key: 'referral_program_enabled' }
          });
          const isReferralProgramEnabled = !referralSetting || referralSetting.value === 'true';

          if (isReferralProgramEnabled) {
            const referrer = await prisma.user.findUnique({
              where: { referralCode: user.referredByCode },
              include: { subscription: true }
            });

            // Prevent self-referrals
            if (referrer && referrer.id !== session.user.id) {
              // Calculate contribution based on the new payment
              const rewardContribution = billingCycle === 'ANNUAL' ? 2 : (billingCycle === 'MONTHLY' ? 0.5 : 1);

              // Upsert the Referral record to PAID
              await prisma.referral.upsert({
                where: { referredUserId: session.user.id },
                create: {
                  referrerId: referrer.id,
                  referredUserId: session.user.id,
                  planType,
                  billingCycle,
                  status: "PAID",
                  rewardContribution
                },
                update: {
                  status: "PAID",
                  planType,
                  billingCycle,
                  rewardContribution
                }
              });

              // Get all successful referrals for this referrer, ordered by oldest first
              const successfulReferrals = await prisma.referral.findMany({
                where: { referrerId: referrer.id, status: "PAID" },
                orderBy: { createdAt: 'asc' }
              });

              const count = successfulReferrals.length;
              
              // Tier Calculations
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

              const totalEarnedMonths = tier1Earned + tier2Earned + tier3Earned;
              const newMonthsEarned = totalEarnedMonths - referrer.freeMonthsEarned;

              if (newMonthsEarned > 0) {
                // Grant the free months
                if (referrer.subscription) {
                  const currentRefExpiry = referrer.subscription.expiryDate || new Date();
                  const newRefExpiry = currentRefExpiry > new Date() 
                    ? new Date(currentRefExpiry.getTime() + newMonthsEarned * 30 * 24 * 60 * 60 * 1000) 
                    : new Date(Date.now() + newMonthsEarned * 30 * 24 * 60 * 60 * 1000);

                  await prisma.subscription.update({
                    where: { id: referrer.subscription.id },
                    data: { expiryDate: newRefExpiry }
                  });
                }

                // Update the referrer's tracker
                await prisma.user.update({
                  where: { id: referrer.id },
                  data: {
                    freeMonthsEarned: totalEarnedMonths,
                    freeMonthsApplied: referrer.freeMonthsApplied + newMonthsEarned,
                    totalSuccessfulReferrals: count
                  }
                });

                await prisma.auditLog.create({
                  data: {
                    action: "REFERRAL_REWARD_APPLIED",
                    targetId: referrer.id,
                    details: `Added ${newMonthsEarned} free months. Total Earned: ${totalEarnedMonths}. Tier 1: ${tier1Earned}, Tier 2: ${tier2Earned}, Tier 3: ${tier3Earned}.`
                  }
                });

                // Send WhatsApp Notifications based on the tier just achieved
                const { sendWhatsAppMessage } = await import('@/lib/whatsapp');
                if (referrer.phone) {
                  if (count === 1) {
                    await sendWhatsAppMessage(referrer.phone, `🎉 ${referrer.name.split(' ')[0]}, someone just signed up using your MedicINtime referral link! You now have 1 successful referral. Refer 1 more to earn your first free month! — MedicINtime`);
                  } else if (count === 2) {
                    await sendWhatsAppMessage(referrer.phone, `🎉 Amazing ${referrer.name.split(' ')[0]}! You have referred 2 people and earned 1 FREE month on MedicINtime! Keep going — refer 4 more to unlock even bigger rewards! — MedicINtime`);
                  } else if (count === 6) {
                    await sendWhatsAppMessage(referrer.phone, `🏆 Incredible ${referrer.name.split(' ')[0]}! You have referred 6 people and earned ${newMonthsEarned} FREE months on MedicINtime! You are almost at the top — refer 6 more to earn 12 months free guaranteed! — MedicINtime`);
                  } else if (count === 12) {
                    await sendWhatsAppMessage(referrer.phone, `👑 ${referrer.name.split(' ')[0]}, you are a MedicINtime Champion! You have referred 12 people and earned 12 FREE months — that is a full year on us! Thank you for spreading the word and helping people stay healthy! — MedicINtime`);
                  } else {
                    await sendWhatsAppMessage(referrer.phone, `🎉 Good news ${referrer.name.split(' ')[0]}! Someone just signed up using your MedicINtime referral link. You now have ${count} successful referrals! Keep sharing your link! — MedicINtime`);
                  }
                }
              } else {
                // Update count even if no new reward tier is hit
                await prisma.user.update({
                  where: { id: referrer.id },
                  data: { totalSuccessfulReferrals: count }
                });

                const { sendWhatsAppMessage } = await import('@/lib/whatsapp');
                if (referrer.phone) {
                  if (count === 1) {
                    await sendWhatsAppMessage(referrer.phone, `🎉 ${referrer.name.split(' ')[0]}, someone just signed up using your MedicINtime referral link! You now have 1 successful referral. Refer 1 more to earn your first free month! — MedicINtime`);
                  } else {
                    await sendWhatsAppMessage(referrer.phone, `🎉 Good news ${referrer.name.split(' ')[0]}! Someone just signed up using your MedicINtime referral link. You now have ${count} successful referrals! Keep sharing your link! — MedicINtime`);
                  }
                }
              }
            }
          }
        }
      }

      return NextResponse.json({ success: true, jsonResponse }, { status: 200 });
    }

    return NextResponse.json(jsonResponse, { status: httpStatusCode });
  } catch (error) {
    console.error("Failed to capture order:", error);
    return NextResponse.json({ error: "Failed to capture order." }, { status: 500 });
  }
}
