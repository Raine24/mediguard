"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { sendWhatsAppMessage } from "@/lib/bird";

export async function getTicketMetrics() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const openCount = await prisma.supportTicket.count({
    where: { status: "OPEN" }
  });

  const resolvedToday = await prisma.supportTicket.count({
    where: {
      status: "RESOLVED",
      updatedAt: { gte: startOfDay }
    }
  });

  // For a real app, you would calculate actual duration between creation and resolution.
  // We'll mock the averages for this sprint.
  return {
    openCount,
    resolvedToday,
    avgResponseTime: "1h 45m",
    avgResolutionTime: "4h 20m",
    busiestTopic: "Billing & Renewals"
  };
}

export async function getTickets(searchQuery = "", filters: { status?: string, assignee?: string } = {}, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  let where: any = {};

  if (searchQuery) {
    where.OR = [
      { subject: { contains: searchQuery, mode: "insensitive" } },
      { user: { name: { contains: searchQuery, mode: "insensitive" } } },
      { user: { email: { contains: searchQuery, mode: "insensitive" } } }
    ];
  }

  if (filters.status && filters.status !== "All") {
    where.status = filters.status.toUpperCase();
  }

  if (filters.assignee && filters.assignee !== "All") {
    if (filters.assignee === "Unassigned") {
      where.assigneeId = null;
    } else {
      where.assigneeId = filters.assignee;
    }
  }

  const [total, tickets] = await Promise.all([
    prisma.supportTicket.count({ where }),
    prisma.supportTicket.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, subscription: { select: { planType: true, status: true } } } },
        assignee: { select: { name: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          where: { isInternal: false } // Check if latest public message is unread (simple approximation)
        }
      }
    })
  ]);

  return {
    tickets,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

export async function getTicketDetails(ticketId: string) {
  return await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          subscription: true
        }
      },
      assignee: { select: { id: true, name: true } },
      messages: {
        include: { sender: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "asc" }
      }
    }
  });
}

export async function getAdminUsers() {
  return await prisma.user.findMany({
    where: { role: { in: ["SUPER_ADMIN", "ADMIN", "SUPPORT_AGENT"] } },
    select: { id: true, name: true, role: true }
  });
}

export async function replyToTicket(ticketId: string, messageText: string, isInternal: boolean, sendWhatsapp: boolean) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: { user: true }
    });

    if (!ticket) return { error: "Ticket not found" };

    await prisma.supportTicketMessage.create({
      data: {
        ticketId,
        senderId: session.user.id,
        message: messageText,
        isInternal
      }
    });

    // Update ticket updated time and possibly change status if open
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { 
        status: ticket.status === "OPEN" && !isInternal ? "IN_PROGRESS" : undefined,
        updatedAt: new Date()
      }
    });

    if (!isInternal) {
      // Mock Email Sending
      console.log(`[MOCK EMAIL] Sent to ${ticket.user.email}: ${messageText}`);

      // Optional WhatsApp Sending
      if (sendWhatsapp && ticket.user.phone) {
        const waRes = await sendWhatsAppMessage(ticket.user.phone, `Support Reply for Ticket #${ticket.id.slice(-4)}: ${messageText}`);
        if (waRes.status === "failed") {
          console.error("Failed to send WhatsApp reply:", waRes.error);
          // We won't block the reply, but we'll log it.
        }
      }
    }

    revalidatePath(`/admin/tickets/${ticketId}`);
    return { success: true };

  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateTicketStatus(ticketId: string, status: string) {
  try {
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status }
    });
    revalidatePath(`/admin/tickets/${ticketId}`);
    revalidatePath(`/admin/tickets`);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function assignTicket(ticketId: string, assigneeId: string | null) {
  try {
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { assigneeId }
    });
    revalidatePath(`/admin/tickets/${ticketId}`);
    revalidatePath(`/admin/tickets`);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}
