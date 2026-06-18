"use server";

import { prisma } from "@/lib/prisma";
import { startOfMonth, subMonths, endOfMonth, startOfDay, startOfWeek, subDays, subHours } from "date-fns";

export async function getDashboardMetrics() {
  const now = new Date();
  
  // Dates
  const thisMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(lastMonthStart);
  
  const todayStart = startOfDay(now);
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const oneHourAgo = subHours(now, 1);
  const fortyEightHoursAgo = subDays(now, 2);

  // --- 1. KPI Queries ---
  
  // Total Active Subscribers
  const activeSubsPromise = prisma.subscription.count({
    where: { status: "ACTIVE" }
  });
  
  // Last month active subs (Approximation: active now + expired/cancelled this month - created this month)
  // For a perfect metric, we'd need history. For now, let's query subscriptions created before this month that aren't cancelled before this month.
  const activeSubsLastMonthPromise = prisma.subscription.count({
    where: {
      createdAt: { lt: thisMonthStart },
      // Assumes we don't track exact cancellation date without history table, so this is a simplified calculation
    }
  });

  // Revenue
  const revenueThisMonthPromise = prisma.paymentTransaction.aggregate({
    where: { 
      status: "SUCCEEDED",
      createdAt: { gte: thisMonthStart }
    },
    _sum: { amount: true }
  });

  const revenueLastMonthPromise = prisma.paymentTransaction.aggregate({
    where: { 
      status: "SUCCEEDED",
      createdAt: { gte: lastMonthStart, lte: lastMonthEnd }
    },
    _sum: { amount: true }
  });

  // Signups
  const signupsTodayPromise = prisma.user.count({
    where: { 
      role: "PATIENT",
      createdAt: { gte: todayStart }
    }
  });

  const signupsThisWeekPromise = prisma.user.count({
    where: {
      role: "PATIENT",
      createdAt: { gte: thisWeekStart }
    }
  });

  // Reminders
  const remindersSentTodayPromise = prisma.messageLog.count({
    where: {
      type: "REMINDER",
      status: "DELIVERED",
      sentAt: { gte: todayStart }
    }
  });

  const remindersFailedTodayPromise = prisma.messageLog.count({
    where: {
      type: "REMINDER",
      status: "FAILED",
      sentAt: { gte: todayStart }
    }
  });

  // Expiring Subscriptions
  const expiringSubsPromise = prisma.subscription.count({
    where: {
      status: "ACTIVE",
      expiryDate: { lte: in7Days, gte: now }
    }
  });

  // --- 2. Alerts Queries ---
  
  // Reminders failed in last hour
  const recentFailedRemindersPromise = prisma.messageLog.findMany({
    where: {
      status: "FAILED",
      sentAt: { gte: oneHourAgo }
    },
    include: { user: { select: { name: true, phone: true } } },
    orderBy: { sentAt: 'desc' },
    take: 10
  });

  // Payment failed at renewal (recent failed transactions)
  const recentFailedPaymentsPromise = prisma.paymentTransaction.findMany({
    where: {
      status: "FAILED",
      createdAt: { gte: subDays(now, 1) } // Last 24 hrs
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  // Users who paid >48h ago but have 0 medicines
  const noMedicinesSetupPromise = prisma.user.findMany({
    where: {
      role: "PATIENT",
      subscription: { status: "ACTIVE" },
      createdAt: { lte: fortyEightHoursAgo },
      medicines: { none: {} }
    },
    select: { id: true, name: true, phone: true, createdAt: true },
    take: 10
  });

  // API Error Rate
  const totalMessagesLastHourPromise = prisma.messageLog.count({
    where: { sentAt: { gte: oneHourAgo } }
  });
  const failedMessagesLastHourPromise = prisma.messageLog.count({
    where: { status: "FAILED", sentAt: { gte: oneHourAgo } }
  });

  // --- 3. Live Activity Feed ---
  // We'll fetch the latest from multiple tables and sort them in JS
  const recentMessagesPromise = prisma.messageLog.findMany({
    take: 20,
    orderBy: { sentAt: 'desc' },
    include: { user: { select: { name: true, subscription: { select: { planType: true } } } } }
  });

  const recentUsersPromise = prisma.user.findMany({
    where: { role: "PATIENT" },
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { subscription: { select: { planType: true } } }
  });

  const recentPaymentsPromise = prisma.paymentTransaction.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  });

  const recentTicketsPromise = prisma.supportTicket.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, subscription: { select: { planType: true } } } } }
  });

  // Await in small batches of 4-5 to avoid Neon connection pool exhaustion (limit is 9) while keeping latency low
  const batch1 = await Promise.all([
    activeSubsPromise, activeSubsLastMonthPromise, 
    revenueThisMonthPromise, revenueLastMonthPromise, 
    signupsTodayPromise
  ]);
  const [activeSubs, activeSubsLastMonth, revenueThisMonthRes, revenueLastMonthRes, signupsToday] = batch1;

  const batch2 = await Promise.all([
    signupsThisWeekPromise, remindersSentTodayPromise, 
    remindersFailedTodayPromise, expiringSubsPromise, 
    recentFailedRemindersPromise
  ]);
  const [signupsThisWeek, remindersSentToday, remindersFailedToday, expiringSubs, recentFailedReminders] = batch2;

  const batch3 = await Promise.all([
    recentFailedPaymentsPromise, noMedicinesSetupPromise, 
    totalMessagesLastHourPromise, failedMessagesLastHourPromise, 
    recentMessagesPromise
  ]);
  const [recentFailedPayments, noMedicinesSetup, totalMessagesLastHour, failedMessagesLastHour, recentMessages] = batch3;

  const batch4 = await Promise.all([
    recentUsersPromise, recentPaymentsPromise, recentTicketsPromise
  ]);
  const [recentUsers, recentPayments, recentTickets] = batch4;

  const revenueThisMonth = revenueThisMonthRes._sum.amount || 0;
  const revenueLastMonth = revenueLastMonthRes._sum.amount || 0;

  // Calculations
  const subsChange = activeSubsLastMonth === 0 ? 100 : Math.round(((activeSubs - activeSubsLastMonth) / activeSubsLastMonth) * 100);
  const revChange = revenueLastMonth === 0 ? 100 : Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100);
  
  const apiErrorRate = totalMessagesLastHour === 0 ? 0 : (failedMessagesLastHour / totalMessagesLastHour) * 100;

  // Formatting Activity Feed
  const feed: any[] = [];
  
  recentMessages.forEach(msg => feed.push({
    id: `msg_${msg.id}`,
    timestamp: msg.sentAt,
    type: msg.type === "REMINDER" ? (msg.status === "FAILED" ? "Reminder Failed" : "Reminder Sent") : `Message: ${msg.type}`,
    patientName: msg.user?.name || "Unknown",
    plan: msg.user?.subscription?.planType || "None",
    channel: msg.channel,
    status: msg.status === "DELIVERED" ? "success" : "failure"
  }));

  recentUsers.forEach(user => feed.push({
    id: `usr_${user.id}`,
    timestamp: user.createdAt,
    type: "New Subscriber",
    patientName: user.name,
    plan: user.subscription?.planType || "Basic",
    channel: null,
    status: "success"
  }));

  recentPayments.forEach(pay => feed.push({
    id: `pay_${pay.id}`,
    timestamp: pay.createdAt,
    type: "Payment Received",
    patientName: "User " + pay.userId.substring(0, 5), // Would join in real life, simplified here
    plan: pay.planType,
    channel: null,
    status: pay.status === "SUCCEEDED" ? "success" : "failure"
  }));

  recentTickets.forEach(ticket => feed.push({
    id: `tkt_${ticket.id}`,
    timestamp: ticket.createdAt,
    type: "Support Ticket Opened",
    patientName: ticket.user?.name || "Unknown",
    plan: ticket.user?.subscription?.planType || "None",
    channel: null,
    status: "warning" // generic yellow color
  }));

  // Sort feed chronologically descending and take top 50
  feed.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const finalFeed = feed.slice(0, 50).map(f => ({
    ...f,
    timeAgo: formatTimeAgo(f.timestamp)
  }));

  return {
    kpis: {
      activeSubs,
      subsChange,
      revenueThisMonth,
      revChange,
      signupsToday,
      signupsThisWeek,
      remindersSentToday,
      remindersFailedToday,
      expiringSubs
    },
    alerts: {
      failedRemindersCount: recentFailedReminders.length,
      failedPaymentsCount: recentFailedPayments.length,
      noMedicinesCount: noMedicinesSetup.length,
      apiErrorRate: Number(apiErrorRate.toFixed(1))
    },
    feed: finalFeed
  };
}

function formatTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
