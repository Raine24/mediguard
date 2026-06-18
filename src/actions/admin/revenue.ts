"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function getFinancialMetrics() {
  const now = new Date();
  
  // 1. Total Revenue All Time
  const allSucceeded = await prisma.paymentTransaction.findMany({
    where: { status: "SUCCEEDED" },
    select: { amount: true, createdAt: true, planType: true, billingCycle: true }
  });

  const totalRevenue = allSucceeded.reduce((sum, tx) => sum + tx.amount, 0);

  // 2. This Month vs Last Month
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const thisMonthRevenue = allSucceeded
    .filter(tx => tx.createdAt >= thisMonthStart)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const lastMonthRevenue = allSucceeded
    .filter(tx => tx.createdAt >= lastMonthStart && tx.createdAt < thisMonthStart)
    .reduce((sum, tx) => sum + tx.amount, 0);

  // 3. This Year vs Last Year
  const thisYearStart = new Date(now.getFullYear(), 0, 1);
  const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);

  const thisYearRevenue = allSucceeded
    .filter(tx => tx.createdAt >= thisYearStart)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const lastYearRevenue = allSucceeded
    .filter(tx => tx.createdAt >= lastYearStart && tx.createdAt < thisYearStart)
    .reduce((sum, tx) => sum + tx.amount, 0);

  // 4. Trailing 12 Months Chart
  const mrrData = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    
    const monthRev = allSucceeded
      .filter(tx => tx.createdAt >= d && tx.createdAt < end)
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    mrrData.push({
      name: d.toLocaleString('default', { month: 'short' }),
      mrr: monthRev
    });
  }

  // 5. Plan Breakdown
  const basicCount = allSucceeded.filter(t => t.planType === "BASIC").length;
  const standardCount = allSucceeded.filter(t => t.planType === "STANDARD").length;
  const familyCount = allSucceeded.filter(t => t.planType === "FAMILY").length;
  
  const planDistribution = [
    { name: 'Basic', value: basicCount || 1 }, // Fallback to 1 if empty for UI aesthetics if totally empty
    { name: 'Standard', value: standardCount || 1 },
    { name: 'Family', value: familyCount || 1 },
  ];

  // 6. MRR and ARR Calculation (Simple approximation based on active subs)
  const activeSubs = await prisma.subscription.findMany({
    where: { status: "ACTIVE" }
  });
  
  let mrr = 0;
  activeSubs.forEach(sub => {
    if (sub.planType === "BASIC") mrr += 4.99;
    else if (sub.planType === "STANDARD") mrr += 9.99;
    else if (sub.planType === "FAMILY") mrr += 17.99;
  });

  const arr = mrr * 12;
  const arpu = activeSubs.length > 0 ? (mrr / activeSubs.length) : 0;

  // 7. Churn Rate Approximation
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const allSubsCount = await prisma.subscription.count();
  const churnedSubs = await prisma.subscription.count({
    where: {
      status: { in: ["EXPIRED", "CANCELLED"] },
      updatedAt: { gte: thirtyDaysAgo }
    }
  });

  const churnRate = allSubsCount > 0 ? (churnedSubs / allSubsCount) * 100 : 0;

  return {
    totalRevenue,
    thisMonthRevenue,
    lastMonthRevenue,
    thisYearRevenue,
    lastYearRevenue,
    mrrData,
    planDistribution,
    mrr,
    arr,
    arpu,
    churnRate,
    activeSubsCount: activeSubs.length
  };
}

export async function getTransactions(searchQuery = "", filters: { status?: string; plan?: string } = {}, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  // Since User is not directly linked to PaymentTransaction in Prisma (it just uses userId), 
  // we fetch matching users first if there's a search query
  let userIdsFilter = undefined;
  if (searchQuery) {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: searchQuery, mode: "insensitive" } },
          { email: { contains: searchQuery, mode: "insensitive" } }
        ]
      },
      select: { id: true }
    });
    userIdsFilter = users.map(u => u.id);
  }

  const where: any = {};
  
  if (userIdsFilter) {
    where.userId = { in: userIdsFilter };
  }
  
  if (filters.status && filters.status !== "All") {
    where.status = filters.status.toUpperCase();
  }
  
  if (filters.plan && filters.plan !== "All") {
    where.planType = filters.plan.toUpperCase();
  }

  const [total, txs] = await Promise.all([
    prisma.paymentTransaction.count({ where }),
    prisma.paymentTransaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    })
  ]);

  // Enrich with User info
  const userIdsToFetch = txs.map(t => t.userId);
  const usersInfo = await prisma.user.findMany({
    where: { id: { in: userIdsToFetch } },
    select: { id: true, name: true, email: true, phone: true }
  });
  
  const userMap = new Map(usersInfo.map(u => [u.id, u]));

  return {
    transactions: txs.map(tx => ({
      ...tx,
      user: userMap.get(tx.userId) || { name: "Unknown", email: "N/A", phone: "N/A" }
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

export async function processRefund(txId: string, reason: string, password: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!admin) return { error: "Admin not found" };

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) return { error: "Incorrect super admin password" };

    const tx = await prisma.paymentTransaction.findUnique({ where: { id: txId } });
    if (!tx || tx.status !== "SUCCEEDED") return { error: "Invalid transaction or not refundable." };

    await prisma.$transaction([
      prisma.paymentTransaction.update({
        where: { id: txId },
        data: { status: "REFUNDED" }
      }),
      prisma.auditLog.create({
        data: {
          adminId: admin.id,
          action: "PROCESSED_REFUND",
          targetId: txId,
          details: `Refunded $${tx.amount} to user ${tx.userId}. Reason: ${reason}`
        }
      })
    ]);

    revalidatePath("/admin/revenue");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function getUpcomingRenewals(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const now = new Date();
  
  const where = {
    expiryDate: { gte: now } // Only future or current renewals
  };

  const [total, subs] = await Promise.all([
    prisma.subscription.count({ where }),
    prisma.subscription.findMany({
      where,
      skip,
      take: limit,
      orderBy: { expiryDate: "asc" },
      include: {
        user: { select: { name: true, email: true, phone: true } }
      }
    })
  ]);

  return {
    renewals: subs,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

export async function extendSubscription(subId: string, days: number, reason: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    const sub = await prisma.subscription.findUnique({ where: { id: subId } });
    if (!sub) return { error: "Subscription not found" };

    const newDate = sub.expiryDate ? new Date(sub.expiryDate) : new Date();
    newDate.setDate(newDate.getDate() + days);

    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: subId },
        data: { expiryDate: newDate, status: "ACTIVE" } // Extending also activates if expired
      }),
      prisma.auditLog.create({
        data: {
          adminId: session.user.id,
          action: "EXTENDED_SUBSCRIPTION",
          targetId: sub.userId,
          details: `Extended subscription by ${days} days. Reason: ${reason}`
        }
      })
    ]);

    revalidatePath("/admin/revenue");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function switchPlan(subId: string, newPlan: string, reason: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    const sub = await prisma.subscription.findUnique({ where: { id: subId } });
    if (!sub) return { error: "Subscription not found" };

    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: subId },
        data: { planType: newPlan.toUpperCase() }
      }),
      prisma.auditLog.create({
        data: {
          adminId: session.user.id,
          action: "SWITCHED_PLAN",
          targetId: sub.userId,
          details: `Switched plan from ${sub.planType} to ${newPlan}. Reason: ${reason}`
        }
      })
    ]);

    revalidatePath("/admin/revenue");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}
