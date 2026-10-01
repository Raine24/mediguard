'use server';

import { prisma } from "@/lib/prisma";
import { getAppUserId } from "@/lib/auth";

export async function updateTimezoneAction(timezone: string) {
  try {
    const userId = await getAppUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    await prisma.user.update({
      where: { id: userId },
      data: { timezone },
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/dashboard/settings");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to auto-update timezone:", error);
    return { success: false, error: error.message };
  }
}
