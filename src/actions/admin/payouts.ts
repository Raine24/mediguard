"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markPayoutPaid(payoutId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes((session.user as any).role)) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.affiliatePayout.update({
      where: { id: payoutId },
      data: { 
        status: "PAID",
        paidAt: new Date()
      }
    });
    
    revalidatePath("/admin/affiliates/payouts");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to mark payout paid:", error);
    return { error: "Failed to mark payout paid" };
  }
}
