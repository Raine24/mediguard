import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Copy, QrCode, TrendingUp, MousePointerClick, Users, DollarSign, Wallet } from "lucide-react";
import QRCodeWrapper from "./QRCodeWrapper";

export default async function AffiliateDashboardPage() {
  const session = await getServerSession(authOptions);
  
  const affiliate = await prisma.affiliateProfile.findUnique({
    where: { userId: session?.user?.id }
  });

  if (!affiliate) return null;

  const conversionRate = affiliate.clicks > 0 ? ((affiliate.conversions / affiliate.clicks) * 100).toFixed(1) : "0.0";
  const refLink = `https://medicintime.com/ref/${affiliate.refCode}`;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Total Clicks</h3>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <MousePointerClick className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{affiliate.clicks}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Conversions</h3>
            <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-slate-800">{affiliate.conversions}</p>
            <span className="text-sm text-slate-500">({conversionRate}%)</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Available Earnings</h3>
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">${affiliate.availableEarnings.toFixed(2)}</p>
          <div className="text-xs text-slate-500 mt-2 flex justify-between">
            <span>Pending: ${affiliate.pendingEarnings.toFixed(2)}</span>
            <span>All Time: ${affiliate.totalEarnings.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-10">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-800">Your Referral Link</h3>
        </div>
        <div className="p-6 md:flex gap-8 items-start">
          <div className="flex-1 mb-6 md:mb-0">
            <p className="text-slate-600 mb-4">Share this link with your audience. Anyone who signs up and pays within 30 days of clicking will earn you a commission.</p>
            
            <div className="flex items-center">
              <input 
                type="text" 
                readOnly 
                value={refLink} 
                className="w-full bg-slate-50 border border-slate-300 rounded-l-lg py-3 px-4 text-slate-700 outline-none"
              />
              <QRCodeWrapper textToCopy={refLink} />
            </div>
            
            <div className="mt-6 flex gap-3">
              <a href={`https://wa.me/?text=Get%20medication%20reminders%20on%20WhatsApp%20with%20MedicinTime!%20Sign%20up%20here:%20${encodeURIComponent(refLink)}`} target="_blank" rel="noreferrer" className="text-sm bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 rounded-lg font-medium transition-colors">
                Share on WhatsApp
              </a>
              <a href={`https://twitter.com/intent/tweet?text=Check%20out%20MedicinTime!&url=${encodeURIComponent(refLink)}`} target="_blank" rel="noreferrer" className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded-lg font-medium transition-colors">
                Share on Twitter
              </a>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center shrink-0 border border-slate-200 rounded-lg p-4 bg-slate-50">
            <QRCodeWrapper textForQR={refLink} />
            <p className="text-xs text-slate-500 mt-2 text-center max-w-[150px]">Scan or download to use in clinics</p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
