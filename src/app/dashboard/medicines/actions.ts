"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addMedicine(formData: {
  name: string;
  dosage: string;
  daysActive: string;
  note: string;
  times: string[];
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { subscription: true, _count: { select: { medicines: true } } },
  });

  if (!user) throw new Error("User not found");

  // Plan Limit Enforcement
  const isBasic = user.subscription?.planType === "BASIC" || !user.subscription;
  const isStandard = user.subscription?.planType === "STANDARD";
  
  if (isBasic) {
    if (user._count.medicines >= 3) {
      throw new Error("PLAN_LIMIT_REACHED");
    }
    if (formData.times.length > 3) {
      throw new Error("PLAN_LIMIT_REACHED_REMINDERS");
    }
  } else if (isStandard) {
    if (user._count.medicines >= 10) {
      throw new Error("PLAN_LIMIT_REACHED");
    }
  }

  await prisma.medicine.create({
    data: {
      userId: user.id,
      name: formData.name,
      dosage: formData.dosage || null,
      daysActive: formData.daysActive,
      note: formData.note || null,
      reminders: {
        create: formData.times.map((time) => ({ time })),
      },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/medicines");
  return { success: true };
}

export async function toggleMedicineStatus(medicineId: string, status: "ACTIVE" | "PAUSED") {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Ensure user owns this medicine
  const med = await prisma.medicine.findFirst({
    where: { id: medicineId, userId: session.user.id },
  });

  if (!med) throw new Error("Medicine not found");

  await prisma.medicine.update({
    where: { id: medicineId },
    data: { status },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/medicines");
}

export async function deleteMedicine(medicineId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Delete will cascade to ReminderTime automatically due to onDelete: Cascade
  await prisma.medicine.deleteMany({
    where: { id: medicineId, userId: session.user.id },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/medicines");
}
