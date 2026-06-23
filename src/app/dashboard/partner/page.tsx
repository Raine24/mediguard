import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DollarSign, CheckCircle } from "lucide-react";
export default async function PartnerProgramPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { affiliateProfile: true }
  });

  if (!user) return redirect("/login");



  const hasAffiliate = !!user.affiliateProfile;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Affiliate Program</h1>
        <p className="mt-2 text-gray-600">Choose how you want to be rewarded for sharing MedicINtime with others.</p>
      </div>

      <div className="max-w-2xl">


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
                <Link href="/affiliates/register" className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm">
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
