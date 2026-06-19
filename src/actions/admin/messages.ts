"use server";

import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage, sendWhatsAppTemplate } from "@/lib/bird";
import { revalidatePath } from "next/cache";

export async function getMessageLogs(searchQuery = "", filters: { status?: string, type?: string } = {}, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  let where: any = {};
  
  if (searchQuery) {
    where.user = {
      phone: { contains: searchQuery, mode: "insensitive" }
    };
  }
  
  if (filters.status && filters.status !== "All") {
    where.status = filters.status.toUpperCase();
  }
  
  if (filters.type && filters.type !== "All") {
    where.type = filters.type.toUpperCase();
  }

  const [total, logs] = await Promise.all([
    prisma.messageLog.count({ where }),
    prisma.messageLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { sentAt: "desc" },
      include: {
        user: { select: { phone: true, name: true } },
        medicine: { select: { name: true } }
      }
    })
  ]);

  return {
    logs,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

export async function getFailedAlerts() {
  return await prisma.messageLog.findMany({
    where: { status: "FAILED" },
    orderBy: { sentAt: "desc" },
    include: {
      user: { select: { phone: true, name: true } },
      medicine: { select: { name: true, dosage: true } }
    }
  });
}

export async function resolveFailedMessage(logId: string) {
  try {
    await prisma.messageLog.update({
      where: { id: logId },
      data: { status: "FAILED_RESOLVED" }
    });
    revalidatePath("/admin/messages");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function retryMessage(logId: string) {
  try {
    const log = await prisma.messageLog.findUnique({
      where: { id: logId },
      include: {
        user: true,
        medicine: true
      }
    });

    if (!log || !log.user) return { error: "Log or User not found" };

    let waResponse;
    
    // We attempt to retry by sending the actual template if it was a reminder
    if (log.type === "REMINDER" && log.medicine) {
      waResponse = await sendWhatsAppTemplate(
        log.user.phone, 
        "mediguard_voice_alert_v1",
        [log.user.name, log.medicine.name, log.medicine.dosage || "1 dose"]
      );
    } else {
      // Fallback freeform text
      waResponse = await sendWhatsAppMessage(log.user.phone, "This is a retry message from MediGuard.");
    }

    const status = waResponse.status === "failed" ? "FAILED" : "DELIVERED";

    await prisma.messageLog.update({
      where: { id: logId },
      data: {
        status,
        errorReason: waResponse.error || null,
        sentAt: new Date()
      }
    });

    revalidatePath("/admin/messages");
    if (status === "FAILED") return { error: waResponse.error || "Retry failed again." };
    return { success: true };

  } catch (e: any) {
    return { error: e.message };
  }
}

export async function getTemplates() {
  return await prisma.messageTemplate.findMany({
    orderBy: { updatedAt: "desc" }
  });
}

export async function sendBroadcast(formData: FormData) {
  try {
    const audience = formData.get("audience") as string;
    const messageTemplate = formData.get("template") as string;
    const customMessage = formData.get("customMessage") as string;

    if (!audience) return { error: "Audience is required" };
    if (!messageTemplate && !customMessage) return { error: "A template or custom message is required" };

    // Determine target users
    let whereClause = {};
    if (audience === "basic_only") {
      whereClause = { role: "PATIENT", subscription: { planType: "BASIC", status: "ACTIVE" } };
    } else if (audience === "expired") {
      whereClause = { role: "PATIENT", subscription: { status: "EXPIRED" } };
    } else {
      whereClause = { role: "PATIENT", subscription: { status: "ACTIVE" } };
    }

    const targetUsers = await prisma.user.findMany({
      where: whereClause,
      select: { id: true, phone: true, name: true }
    });

    if (targetUsers.length === 0) {
      return { error: "No users found for the selected audience." };
    }

    let successCount = 0;
    let failedCount = 0;
    const messageLogsToInsert = [];

    // Log the broadcast itself
    const broadcast = await prisma.broadcastMessage.create({
      data: {
        audience,
        content: messageTemplate || customMessage,
        sentCount: 0,
        failureCount: 0,
        sentAt: new Date()
      }
    });

    for (const user of targetUsers) {
      if (!user.phone) {
        failedCount++;
        continue;
      }

      let waResponse;
      if (messageTemplate) {
        // Use the official Bird Template
        waResponse = await sendWhatsAppTemplate(
          user.phone, 
          messageTemplate, 
          [user.name] // Passing user name as variable 1
        );
      } else {
        // Use freeform text
        waResponse = await sendWhatsAppMessage(user.phone, customMessage);
      }

      const status = waResponse.status === "failed" ? "FAILED" : "DELIVERED";
      if (status === "DELIVERED") successCount++;
      else failedCount++;

      messageLogsToInsert.push({
        userId: user.id,
        type: "BROADCAST",
        channel: "WHATSAPP",
        status,
        errorReason: waResponse.error,
        sentAt: new Date()
      });
    }

    if (messageLogsToInsert.length > 0) {
      await prisma.messageLog.createMany({ data: messageLogsToInsert as any });
    }

    await prisma.broadcastMessage.update({
      where: { id: broadcast.id },
      data: { sentCount: successCount, failureCount: failedCount }
    });

    revalidatePath("/admin/messages");
    return { success: true, message: `Broadcast complete. Delivered: ${successCount}, Failed: ${failedCount}` };

  } catch (error: any) {
    console.error("Broadcast failed:", error);
    return { error: "Failed to send broadcast due to an internal error." };
  }
}
