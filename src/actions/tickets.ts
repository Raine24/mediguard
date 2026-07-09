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

export async function getUserTickets() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" }
    });

    return { tickets };
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    return { error: "Failed to fetch tickets" };
  }
}

export async function getUserTicketDetails(ticketId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId, userId: session.user.id },
      include: {
        messages: {
          where: { isInternal: false }, // Prevent patient from seeing internal notes
          orderBy: { createdAt: "asc" },
          include: { sender: { select: { id: true, name: true, role: true } } }
        }
      }
    });

    if (!ticket) return { error: "Ticket not found" };
    return { ticket };
  } catch (error) {
    console.error("Error fetching user ticket details:", error);
    return { error: "Failed to fetch ticket details" };
  }
}

export async function replyToTicketPatient(ticketId: string, message: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    if (!message.trim()) return { error: "Message cannot be empty" };

    // Verify ticket ownership
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId, userId: session.user.id }
    });

    if (!ticket) return { error: "Ticket not found" };

    await prisma.$transaction([
      prisma.supportTicketMessage.create({
        data: {
          ticketId,
          senderId: session.user.id,
          message,
          isInternal: false,
        }
      }),
      prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          updatedAt: new Date(),
          status: ticket.status === "RESOLVED" ? "OPEN" : ticket.status // Reopen if they reply
        }
      })
    ]);

    return { success: true };
  } catch (error) {
    console.error("Error replying to ticket:", error);
    return { error: "Failed to send reply" };
  }
}
