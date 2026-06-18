"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateAffiliateStatus(id: string, status: "ACTIVE" | "SUSPENDED" | "PENDING") {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes((session.user as any).role)) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.affiliateProfile.update({
      where: { id },
      data: { status }
    });
    
    revalidatePath("/admin/affiliates");
    revalidatePath(`/admin/affiliates/${id}`);
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update affiliate:", error);
    return { error: "Failed to update affiliate" };
  }
}

export async function updateAffiliateCommission(id: string, customRate: number | null, commissionType: "RECURRING" | "ONE_TIME") {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes((session.user as any).role)) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.affiliateProfile.update({
      where: { id },
      data: { 
        customCommissionRate: customRate,
        commissionType
      }
    });
    
    revalidatePath(`/admin/affiliates/${id}`);
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update affiliate commission:", error);
    return { error: "Failed to update affiliate commission" };
  }
}
