import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, CreditCard, Calendar, BarChart3, Clock, CheckCircle2, XCircle } from "lucide-react";
import AffiliateStatusClient from "./AffiliateStatusClient";

export default async function AffiliateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const affiliate = await prisma.affiliateProfile.findUnique({
    where: { id },
    include: {
      user: true,
      affiliateConversions: {
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      affiliatePayouts: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  });

  if (!affiliate) notFound();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/affiliates" className="p-2 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partner: {affiliate.user.name}</h1>
          <p className="text-gray-500 text-sm mt-1">{affiliate.refCode}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Application Details</h2>
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2"><User className="w-4 h-4"/> Name</p>
                <p className="text-gray-900 font-medium">{affiliate.user.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                <p className="text-gray-900">{affiliate.user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Country</p>
                <p className="text-gray-900">{affiliate.user.country}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Promotion Method</p>
                <p className="text-gray-900">{affiliate.promotionMethod}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2"><CreditCard className="w-4 h-4"/> Payout Info</p>
                <p className="text-gray-900">{affiliate.payoutMethod}: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{affiliate.payoutDetails}</span></p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2"><Calendar className="w-4 h-4"/> Applied On</p>
                <p className="text-gray-900">{affiliate.createdAt.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Recent Conversions</h2>
            {affiliate.affiliateConversions.length === 0 ? (
              <p className="text-gray-500 text-sm">No conversions yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Plan</th>
                      <th className="px-4 py-3 font-medium">Commission</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {affiliate.affiliateConversions.map(conv => (
                      <tr key={conv.id}>
                        <td className="px-4 py-3">{conv.createdAt.toLocaleDateString()}</td>
                        <td className="px-4 py-3">{conv.planType}</td>
                        <td className="px-4 py-3 text-green-600 font-medium">+${conv.commissionAmount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-gray-500">{conv.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Status & Stats */}
        <div className="space-y-6">
          <AffiliateStatusClient 
            id={affiliate.id} 
            currentStatus={affiliate.status} 
            customRate={affiliate.customCommissionRate} 
            commissionType={affiliate.commissionType}
          />

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-400" /> Stats
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Total Clicks</span>
                <span className="font-medium text-gray-900">{affiliate.clicks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Conversions</span>
                <span className="font-medium text-gray-900">{affiliate.conversions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Total Earnings</span>
                <span className="font-medium text-emerald-600">${affiliate.totalEarnings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Available</span>
                <span className="font-medium text-gray-900">${affiliate.availableEarnings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Pending</span>
                <span className="font-medium text-amber-600">${affiliate.pendingEarnings.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
