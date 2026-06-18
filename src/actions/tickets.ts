"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function createUserTicket(subject: string, message: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    if (!subject.trim() || !message.trim()) {
      return { error: "Subject and message are required" };
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.user.id,
        subject,
        status: "OPEN",
        messages: {
          create: {
            senderId: session.user.id,
            message: message,
            isInternal: false,
          }
        }
      }
    });

    return { success: true, ticketId: ticket.id };
  } catch (error) {
    console.error("Error creating ticket:", error);
    return { error: "Failed to submit ticket" };
  }
}
