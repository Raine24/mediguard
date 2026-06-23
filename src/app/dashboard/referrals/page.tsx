import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { redirect } from "next/navigation";
import ReferralLinkWidget from "@/components/dashboard/ReferralLinkWidget";
import { CheckCircle, Clock, XCircle, Gift, ArrowRight, Users } from "lucide-react";

export const metadata = {
  title: 'My Referrals - MedicINtime',
};

export default async function ReferralsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscription: true,
      referralsGiven: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  // Ensure they have a referral code
  let refCode = user.referralCode;
  if (!refCode) {
    refCode = `MG${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    await prisma.user.update({
      where: { id: user.id },
      data: { referralCode: refCode }
    });
  }

  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/ref/${refCode}`;
  
  const count = user.totalSuccessfulReferrals;
  const tiers = [
    { target: 2, reward: "1 month free" },
    { target: 6, reward: "Up to 12 months free" },
    { target: 12, reward: "12 months free guaranteed" }
  ];

  let currentTierIndex = 0;
  if (count >= 12) currentTierIndex = 3;
  else if (count >= 6) currentTierIndex = 2;
  else if (count >= 2) currentTierIndex = 1;

  const nextTier = tiers[currentTierIndex] || tiers[2];

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Refer a Friend</h1>
          <p className="text-gray-600 mt-2">Share your link and earn free subscription months!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <ReferralLinkWidget link={referralLink} />

            {/* Progress Tracker */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Your Progress</h3>
              
              <div className="relative pt-8 pb-4">
                {/* Progress Line */}
                <div className="absolute top-10 left-0 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-500 transition-all duration-1000"
                    style={{ width: `${Math.min(100, (count / 12) * 100)}%` }}
                  ></div>
                </div>

                {/* Milestones */}
                <div className="relative flex justify-between">
                  {tiers.map((tier, index) => {
                    const isReached = count >= tier.target;
                    return (
                      <div key={tier.target} className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-3 z-10 border-4 box-content ${isReached ? 'bg-teal-600 border-teal-100' : 'bg-white border-gray-200'}`}>
                          {isReached && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-gray-900">{tier.target} Referrals</p>
                          <p className="text-xs text-teal-600 font-medium">{tier.reward}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {currentTierIndex < 3 ? (
                <div className="mt-8 p-4 bg-teal-50 rounded-lg flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold shrink-0">
                    {nextTier.target - count}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">More to go!</p>
                    <p className="text-sm text-gray-600">Refer {nextTier.target - count} more people to reach your next milestone and earn {nextTier.reward}.</p>
                  </div>
                </div>
              ) : (
                <div className="mt-8 p-4 bg-yellow-50 rounded-lg flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-bold shrink-0">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Maximum Rewards Reached!</p>
                    <p className="text-sm text-gray-600">You are a MedicINtime Champion. You've earned the maximum referral rewards.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Referrals List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">My Referrals List</h3>
              </div>
              
              {user.referralsGiven.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Plan / Cycle</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {user.referralsGiven.map((ref, index) => (
                        <tr key={ref.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            Referral {user.referralsGiven.length - index}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {new Date(ref.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-gray-600 capitalize">
                            {ref.planType?.toLowerCase()} / {ref.billingCycle?.toLowerCase()}
                          </td>
                          <td className="px-6 py-4">
                            {ref.status === "PAID" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3" /> Paid
                              </span>
                            ) : ref.status === "REFUNDED" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <XCircle className="w-3 h-3" /> Refunded
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Clock className="w-3 h-3" /> Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p>You haven't referred anyone yet.</p>
                  <p className="text-sm mt-1">Share your link above to get started!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Rewards Summary */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-xl shadow-md p-6 text-white relative overflow-hidden">
              <div className="absolute -right-10 -top-10 opacity-10">
                <Gift className="w-48 h-48" />
              </div>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Gift className="w-5 h-5 text-teal-200" />
                Rewards Earned
              </h3>
              
              <div className="space-y-4">
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/10">
                  <p className="text-teal-100 text-sm font-medium mb-1">Total Free Months</p>
                  <p className="text-3xl font-bold">{user.freeMonthsEarned}</p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/10">
                  <p className="text-teal-100 text-sm font-medium mb-1">Applied to Subscription</p>
                  <p className="text-2xl font-bold">{user.freeMonthsApplied}</p>
                </div>

                {user.subscription?.expiryDate && (
                  <div className="mt-6 pt-6 border-t border-white/20">
                    <p className="text-teal-100 text-sm font-medium mb-1">Current Expiry Date</p>
                    <p className="text-lg font-semibold">{new Date(user.subscription.expiryDate).toLocaleDateString()}</p>
                    {user.freeMonthsEarned > 0 && (
                      <p className="text-xs text-teal-200 mt-2 bg-black/20 p-2 rounded">
                        Your subscription has been extended to this date thanks to your referrals!
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
