"use server";

import { prisma } from "@/lib/prisma";

// Mock helper for missing data
const generateMockCohortData = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  return months.map(m => ({
    cohort: m,
    users: Math.floor(Math.random() * 50) + 100,
    m1: Math.floor(Math.random() * 20) + 80,
    m2: Math.floor(Math.random() * 20) + 70,
    m3: Math.floor(Math.random() * 20) + 60,
    m6: Math.floor(Math.random() * 20) + 40,
    m12: Math.floor(Math.random() * 20) + 20,
  }));
};

const generateMockChurnReasons = () => [
  { name: "Too expensive", value: 45 },
  { name: "No longer taking meds", value: 25 },
  { name: "Technical issues", value: 15 },
  { name: "Found alternative", value: 10 },
  { name: "Other", value: 5 },
];

export async function getGrowthAnalytics() {
  const now = new Date();
  const trailing12m = new Date();
  trailing12m.setMonth(now.getMonth() - 12);

  // Growth by Month Approximation
  const users = await prisma.user.findMany({
    where: { role: "PATIENT", createdAt: { gte: trailing12m } },
    select: { createdAt: true, subscription: { select: { status: true, planType: true } } }
  });

  const monthMap: Record<string, { name: string, newUsers: number, churned: number, active: number }> = {};
  
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mName = d.toLocaleString('default', { month: 'short' });
    monthMap[mName] = { name: mName, newUsers: 0, churned: 0, active: 0 };
  }

  // Very naive approximation for historical churn (assumes currently cancelled/expired users churned in their creation month for chart purposes)
  users.forEach(u => {
    const mName = u.createdAt.toLocaleString('default', { month: 'short' });
    if (monthMap[mName]) {
      monthMap[mName].newUsers++;
      if (u.subscription && (u.subscription.status === 'CANCELLED' || u.subscription.status === 'EXPIRED')) {
        monthMap[mName].churned++;
      } else {
        monthMap[mName].active++;
      }
    }
  });

  const growthData = Object.values(monthMap);

  // Plan Distribution
  const plans = await prisma.subscription.groupBy({
    by: ['planType'],
    _count: { planType: true },
    where: { status: "ACTIVE" }
  });

  const planData = plans.map(p => ({
    name: p.planType,
    value: p._count.planType
  }));

  const totalActive = planData.reduce((acc, p) => acc + p.value, 0);

  return {
    growthData,
    planData,
    totalActive,
    churnReasons: generateMockChurnReasons(),
    cohortData: generateMockCohortData(),
    avgSubscriptionLength: "7.4 Months", // Mocked
    renewalRate: "82%" // Mocked
  };
}

export async function getRevenueAnalytics() {
  const now = new Date();
  const trailing12m = new Date();
  trailing12m.setMonth(now.getMonth() - 12);

  const transactions = await prisma.paymentTransaction.findMany({
    where: { createdAt: { gte: trailing12m } },
    select: { amount: true, status: true, createdAt: true, planType: true }
  });

  const monthMap: Record<string, { name: string, revenue: number }> = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mName = d.toLocaleString('default', { month: 'short' });
    monthMap[mName] = { name: mName, revenue: 0 };
  }

  let totalRevenueAllTime = 0;
  let totalSuccessful = 0;
  let totalFailed = 0;
  let totalRefunded = 0;

  transactions.forEach(t => {
    if (t.status === "SUCCESS") {
      totalRevenueAllTime += t.amount;
      totalSuccessful++;
      const mName = t.createdAt.toLocaleString('default', { month: 'short' });
      if (monthMap[mName]) {
        monthMap[mName].revenue += t.amount;
      }
    } else if (t.status === "FAILED") {
      totalFailed++;
    } else if (t.status === "REFUNDED") {
      totalRefunded++;
    }
  });

  const revenueTrend = Object.values(monthMap);

  const failureRate = totalSuccessful + totalFailed > 0 ? ((totalFailed / (totalSuccessful + totalFailed)) * 100).toFixed(1) : "0.0";
  const refundRate = totalSuccessful + totalRefunded > 0 ? ((totalRefunded / (totalSuccessful + totalRefunded)) * 100).toFixed(1) : "0.0";

  // Active subscriptions for MRR/ARR
  const activeSubs = await prisma.subscription.findMany({
    where: { status: "ACTIVE" },
    select: { planType: true }
  });

  let mrr = 0;
  activeSubs.forEach(sub => {
    let monthlyPrice = 0;
    // Assuming standard monthly pricing for MRR calculation
    if (sub.planType === 'BASIC') monthlyPrice = 5;
    if (sub.planType === 'STANDARD') monthlyPrice = 12;
    if (sub.planType === 'FAMILY') monthlyPrice = 25;
    mrr += monthlyPrice;
  });

  const arr = mrr * 12;
  const arpu = activeSubs.length > 0 ? (mrr / activeSubs.length).toFixed(2) : "0.00";

  return {
    revenueTrend,
    totalRevenueAllTime: totalRevenueAllTime.toFixed(2),
    mrr: mrr.toFixed(2),
    arr: arr.toFixed(2),
    arpu,
    ltv: (parseFloat(arpu) * 7.4).toFixed(2), // ARPU * Avg months
    failureRate: `${failureRate}%`,
    refundRate: `${refundRate}%`
  };
}

export async function getMessagingAnalytics() {
  const logs = await prisma.messageLog.groupBy({
    by: ['status'],
    _count: { status: true }
  });

  let delivered = 0;
  let failed = 0;
  logs.forEach(l => {
    if (l.status === 'DELIVERED') delivered += l._count.status;
    else failed += l._count.status;
  });

  const total = delivered + failed;
  const successRate = total > 0 ? ((delivered / total) * 100).toFixed(1) : "0.0";

  // Mock peak times
  const peakTimes = [
    { hour: '06:00', volume: 450 },
    { hour: '08:00', volume: 1800 },
    { hour: '12:00', volume: 1200 },
    { hour: '18:00', volume: 2100 },
    { hour: '20:00', volume: 1900 },
    { hour: '22:00', volume: 600 },
  ];

  // Most common medicines
  const medCounts = await prisma.medicine.groupBy({
    by: ['name'],
    _count: { name: true },
    orderBy: { _count: { name: 'desc' } },
    take: 10
  });

  const topMedicines = medCounts.map(m => ({ name: m.name, count: m._count.name }));

  return {
    totalMessagesSent: delivered,
    successRate: `${successRate}%`,
    smsFallbackRate: "0.0%", // Hardcoded since we only use WA right now
    peakTimes,
    topMedicines
  };
}

export async function getGeographicAnalytics() {
  const users = await prisma.user.findMany({
    where: { role: "PATIENT" },
    select: { country: true, subscription: { select: { planType: true, status: true } } }
  });

  const countryMap: Record<string, { country: string, users: number, basic: number, standard: number, family: number }> = {};

  users.forEach(u => {
    const c = u.country || "Unknown";
    if (!countryMap[c]) countryMap[c] = { country: c, users: 0, basic: 0, standard: 0, family: 0 };
    
    countryMap[c].users++;
    
    if (u.subscription && u.subscription.status === "ACTIVE") {
      if (u.subscription.planType === "BASIC") countryMap[c].basic++;
      if (u.subscription.planType === "STANDARD") countryMap[c].standard++;
      if (u.subscription.planType === "FAMILY") countryMap[c].family++;
    }
  });

  const countryData = Object.values(countryMap).sort((a, b) => b.users - a.users);

  return {
    countryData
  };
}
