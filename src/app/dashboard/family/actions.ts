"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addFamilyMember(formData: {
  name: string;
  phone: string;
  relationship: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { subscription: true, _count: { select: { familyMembers: true } } },
  });

  if (!user) throw new Error("User not found");

  if (user.subscription?.planType !== "FAMILY") {
    throw new Error("PLAN_LIMIT_REACHED");
  }

  // Family plan typically supports 4 members
  if (user._count.familyMembers >= 4) {
    throw new Error("MEMBER_LIMIT_REACHED");
  }

  await prisma.familyMember.create({
    data: {
      accountHolderId: user.id,
      name: formData.name,
      phone: formData.phone,
      relationship: formData.relationship,
    },
  });

  revalidatePath("/dashboard/family");
  return { success: true };
}

export async function addFamilyMedicine(familyMemberId: string, formData: {
  name: string;
  dosage: string;
  daysActive: string;
  note: string;
  times: string[];
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify the family member belongs to the current user
  const member = await prisma.familyMember.findFirst({
    where: { id: familyMemberId, accountHolderId: session.user.id },
  });

  if (!member) throw new Error("Family member not found");

  await prisma.medicine.create({
    data: {
      userId: session.user.id, // Still technically owned by main account holder for billing/dashboard
      familyMemberId: member.id, // But explicitly assigned to this family member
      name: formData.name,
      dosage: formData.dosage || null,
      daysActive: formData.daysActive,
      note: formData.note || null,
      reminders: {
        create: formData.times.map((time) => ({ time })),
      },
    },
  });

  revalidatePath("/dashboard/family");
  return { success: true };
}
