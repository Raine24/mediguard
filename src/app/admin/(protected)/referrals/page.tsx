import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Users, Gift, Share2, DollarSign, Calendar, TrendingUp } from "lucide-react";
import AdminReferralsClient from "./AdminReferralsClient";

export const metadata = {
  title: 'Referral Program | Admin',
};

export default async function AdminReferralsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/admin/login");

  const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!admin || (admin.role !== "SUPER_ADMIN" && admin.role !== "ADMIN")) {
    redirect("/admin/login");
  }

  // Active Referrers
  const totalActiveReferrers = await prisma.user.count({
    where: { totalSuccessfulReferrals: { gt: 0 } }
  });

  // Total successful referrals (All time)
  const totalReferralsAllTime = await prisma.referral.count({
    where: { status: "PAID" }
  });

  // Total successful referrals (This month)
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const totalReferralsThisMonth = await prisma.referral.count({
    where: { status: "PAID", createdAt: { gte: startOfMonth } }
  });

  // Total free months awarded
  const usersWithFreeMonths = await prisma.user.findMany({
    where: { freeMonthsEarned: { gt: 0 } },
    select: { freeMonthsEarned: true }
  });
  const totalFreeMonthsAllTime = usersWithFreeMonths.reduce((acc, user) => acc + user.freeMonthsEarned, 0);

  // Revenue Influenced
  const paidReferrals = await prisma.referral.findMany({
    where: { status: "PAID" },
    select: { referredUserId: true }
  });
  const referredUserIds = paidReferrals.map(r => r.referredUserId);
  const revenueTx = await prisma.paymentTransaction.findMany({
    where: { userId: { in: referredUserIds }, status: "SUCCEEDED" },
    select: { amount: true }
  });
  const totalRevenueInfluenced = revenueTx.reduce((acc, tx) => acc + tx.amount, 0);

  // Top 10 Referrers
  const topReferrersRaw = await prisma.user.findMany({
    where: { totalSuccessfulReferrals: { gt: 0 } },
    orderBy: { totalSuccessfulReferrals: 'desc' },
    take: 10,
    select: { id: true, name: true, email: true, totalSuccessfulReferrals: true, freeMonthsEarned: true }
  });

  // Referral Map
  const recentReferralsRaw = await prisma.referral.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      referrer: { select: { id: true, name: true, email: true } },
      referredUser: { select: { id: true, name: true, email: true } }
    }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Patient Referral Program</h1>
          <p className="text-gray-500 text-sm">Monitor patient-to-patient referrals and rewards.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-gray-600">Active Referrers</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalActiveReferrers}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-gray-600">Total Referrals</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{totalReferralsAllTime}</p>
            <span className="text-sm text-green-600 font-medium">+{totalReferralsThisMonth} this mo</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <Gift className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-gray-600">Free Months Awarded</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalFreeMonthsAllTime}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-gray-600">Influenced Revenue</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">${totalRevenueInfluenced.toFixed(2)}</p>
        </div>
      </div>

      <AdminReferralsClient 
        topReferrers={topReferrersRaw} 
        recentReferrals={recentReferralsRaw} 
      />
    </div>
  );
}
