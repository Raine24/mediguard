"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function requestPayout() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const affiliate = await prisma.affiliateProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!affiliate || affiliate.status !== "ACTIVE") {
    return { error: "Invalid affiliate account" };
  }

  // Get minimum payout threshold
  let minPayout = 20;
  const setting = await prisma.systemSetting.findUnique({
    where: { key: "affiliate_min_payout" }
  });
  if (setting && !isNaN(parseFloat(setting.value))) {
    minPayout = parseFloat(setting.value);
  }

  if (affiliate.availableEarnings < minPayout) {
    return { error: `You must have at least $${minPayout.toFixed(2)} in available earnings to request a payout.` };
  }

  // Prevent multiple pending payouts
  const pendingRequests = await prisma.affiliatePayout.count({
    where: {
      affiliateId: affiliate.id,
      status: "PENDING"
    }
  });

  if (pendingRequests > 0) {
    return { error: "You already have a pending payout request." };
  }

  try {
    const amountToPayout = affiliate.availableEarnings;

    // Transaction to request payout and deduct available earnings
    await prisma.$transaction([
      prisma.affiliatePayout.create({
        data: {
          affiliateId: affiliate.id,
          amount: amountToPayout,
          status: "PENDING",
          method: affiliate.payoutMethod,
          details: affiliate.payoutDetails
        }
      }),
      prisma.affiliateProfile.update({
        where: { id: affiliate.id },
        data: {
          availableEarnings: 0
        }
      })
    ]);

    revalidatePath("/affiliate/dashboard/payouts");
    return { success: true, message: "Payout requested successfully." };

  } catch (error) {
    console.error("Payout request failed:", error);
    return { error: "Failed to request payout." };
  }
}
