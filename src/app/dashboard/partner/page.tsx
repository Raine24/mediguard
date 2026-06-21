import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import crypto from "crypto";
import { Copy, CheckCircle, Gift, DollarSign } from "lucide-react";

export default async function PartnerProgramPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { affiliateProfile: true }
  });

  if (!user) return redirect("/login");

  let refCode = user.referralCode;

  // Auto-generate for existing users who don't have one
  if (!refCode) {
    refCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    await prisma.user.update({
      where: { id: user.id },
      data: { referralCode: refCode }
    });
  }

  const refLink = `https://medicintime.com/ref/${refCode}`;

  const hasAffiliate = !!user.affiliateProfile;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Partner Program</h1>
        <p className="mt-2 text-gray-600">Choose how you want to be rewarded for sharing MedicinTime with others.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Referral Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden flex flex-col relative">
          <div className="absolute top-0 right-0 p-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              Most Popular
            </span>
          </div>
          <div className="p-8 flex-1">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6">
              <Gift className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Referral Rewards</h2>
            <p className="text-gray-600 mb-6 min-h-[48px]">
              Earn free subscription time. For every 2 friends who subscribe, you get matching free time added to your account!
            </p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">2 friends on Monthly = <strong className="text-gray-900">1 Month Free</strong></span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">2 friends on 6-Months = <strong className="text-gray-900">6 Months Free</strong></span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">2 friends on Annual = <strong className="text-gray-900">1 Year Free</strong></span>
              </li>
            </ul>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Your Unique Link</p>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  readOnly 
                  value={refLink} 
                  className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm bg-white"
                />
                <button 
                  // In a real app, you'd add a client-side onClick for clipboard copying
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  onClick="navigator.clipboard.writeText('${refLink}')"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-6 border-t border-gray-100 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Your Progress (towards 2)</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-amber-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">{user.referralsMonthlyCount}</div>
                  <div className="text-xs text-amber-800 font-medium">Monthly</div>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">{user.referralsBiannualCount}</div>
                  <div className="text-xs text-amber-800 font-medium">6-Months</div>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">{user.referralsAnnualCount}</div>
                  <div className="text-xs text-amber-800 font-medium">Annual</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Affiliate Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-8 flex-1">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Affiliate Program</h2>
            <p className="text-gray-600 mb-6 min-h-[48px]">
              Are you an influencer, clinic, or pharmacy? Earn cold hard cash for every patient you refer.
            </p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">Earn up to <strong className="text-gray-900">20% recurring commission</strong> on every payment.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">Get paid directly via Mobile Money or Bank Transfer.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">Access a dedicated dashboard to track clicks and conversions in real-time.</span>
              </li>
            </ul>

            <div className="mt-auto">
              {hasAffiliate ? (
                <Link href="/affiliate/dashboard" className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200 transition-colors">
                  Go to Affiliate Dashboard
                </Link>
              ) : (
                <Link href="/affiliate/register" className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm">
                  Apply to be an Affiliate
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
