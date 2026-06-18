"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getSubscriberProfile(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      subscription: true,
      medicines: {
        include: { reminders: true },
        orderBy: { createdAt: "desc" }
      },
      messageLogs: {
        include: { medicine: true },
        orderBy: { sentAt: "desc" },
        take: 50
      },
      adminNotesReceived: {
        include: { admin: { select: { name: true } } },
        orderBy: { createdAt: "desc" }
      },
      supportTickets: {
        orderBy: { createdAt: "desc" }
      },
      auditLogs: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!user) return null;

  const payments = await prisma.paymentTransaction.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" }
  });

  const totalPaid = payments
    .filter(p => p.status === "SUCCEEDED")
    .reduce((sum, p) => sum + p.amount, 0);

  return {
    ...user,
    payments,
    totalPaid
  };
}

export async function addAdminNote(patientId: string, noteText: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    await prisma.adminNote.create({
      data: {
        patientId,
        adminId: session.user.id,
        note: noteText
      }
    });
    
    revalidatePath(`/admin/subscribers/${patientId}`);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}
