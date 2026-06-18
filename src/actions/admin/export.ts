"use server";

import { prisma } from "@/lib/prisma";
import { startOfDay } from "date-fns";

export async function exportDailyReport() {
  const today = startOfDay(new Date());

  // Fetch signups
  const signups = await prisma.user.findMany({
    where: { role: "PATIENT", createdAt: { gte: today } },
    include: { subscription: true }
  });

  // Fetch payments
  const payments = await prisma.paymentTransaction.findMany({
    where: { createdAt: { gte: today } }
  });

  // Fetch messages
  const messages = await prisma.messageLog.findMany({
    where: { sentAt: { gte: today } }
  });

  // Build CSV
  const rows = [
    ["Type", "Timestamp", "Detail 1", "Detail 2", "Status"]
  ];

  signups.forEach(s => {
    rows.push(["Signup", s.createdAt.toISOString(), s.name, s.subscription?.planType || "None", "ACTIVE"]);
  });

  payments.forEach(p => {
    rows.push(["Payment", p.createdAt.toISOString(), p.amount.toString(), p.planType, p.status]);
  });

  messages.forEach(m => {
    rows.push(["Message", m.sentAt.toISOString(), m.type, m.channel, m.status]);
  });

  const csv = rows.map(r => r.join(",")).join("\n");
  
  return csv;
}
