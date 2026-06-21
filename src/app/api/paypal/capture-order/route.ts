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
          // Process Referral Program Reward
          const referrer = await prisma.user.findUnique({
            where: { referralCode: user.referredByCode },
            include: { subscription: true }
          });

          if (referrer && referrer.subscription) {
            let updateData: any = {};
            let shouldAddFreeTime = false;
            let freeDays = 0;

            if (billingCycle === 'MONTHLY') {
              const newCount = referrer.referralsMonthlyCount + 1;
              if (newCount >= 2) {
                updateData = { referralsMonthlyCount: 0 };
                shouldAddFreeTime = true;
                freeDays = 30;
              } else {
                updateData = { referralsMonthlyCount: newCount };
              }
            } else if (billingCycle === 'BIANNUAL') {
              const newCount = referrer.referralsBiannualCount + 1;
              if (newCount >= 2) {
                updateData = { referralsBiannualCount: 0 };
                shouldAddFreeTime = true;
                freeDays = 180;
              } else {
                updateData = { referralsBiannualCount: newCount };
              }
            } else if (billingCycle === 'ANNUAL') {
              const newCount = referrer.referralsAnnualCount + 1;
              if (newCount >= 2) {
                updateData = { referralsAnnualCount: 0 };
                shouldAddFreeTime = true;
                freeDays = 365;
              } else {
                updateData = { referralsAnnualCount: newCount };
              }
            }

            if (shouldAddFreeTime) {
              const currentRefExpiry = referrer.subscription.expiryDate || new Date();
              const newRefExpiry = currentRefExpiry > new Date() 
                ? new Date(currentRefExpiry.getTime() + freeDays * 24 * 60 * 60 * 1000) 
                : new Date(Date.now() + freeDays * 24 * 60 * 60 * 1000);

              await prisma.subscription.update({
                where: { id: referrer.subscription.id },
                data: { expiryDate: newRefExpiry }
              });

              await prisma.auditLog.create({
                data: {
                  action: "REFERRAL_REWARD_APPLIED",
                  targetId: referrer.id,
                  details: `Added ${freeDays} free days for 2 successful referrals.`
                }
              });
            }

            await prisma.user.update({
              where: { id: referrer.id },
              data: updateData
            });
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
