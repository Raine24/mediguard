"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function updateAffiliateSettings(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || (session.user as any).role !== "AFFILIATE") {
      return { error: "Unauthorized" };
    }

    const payoutMethod = formData.get("payoutMethod") as string;
    const payoutDetails = formData.get("payoutDetails") as string;

    if (!payoutMethod || !payoutDetails) {
      return { error: "All fields are required" };
    }

    await prisma.affiliateProfile.update({
      where: { userId: session.user.id },
      data: {
        payoutMethod,
        payoutDetails,
      }
    });

    return { success: true, message: "Settings updated successfully" };
  } catch (error: any) {
    console.error("Update settings error:", error);
    return { error: "Failed to update settings" };
  }
}
