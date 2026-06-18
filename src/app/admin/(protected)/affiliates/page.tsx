import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock, MoreVertical, Eye } from "lucide-react";

export default async function AdminAffiliatesPage() {
  const affiliates = await prisma.affiliateProfile.findMany({
    include: {
      user: true,
    },
    orderBy: { joinedAt: 'desc' }
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Affiliates</h1>
          <p className="text-gray-500 mt-1">Manage partner applications and accounts</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Partner Name</th>
                <th className="px-6 py-4 font-medium">Ref Code</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Conversions</th>
                <th className="px-6 py-4 font-medium">Total Earnings</th>
                <th className="px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {affiliates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    No affiliates found.
                  </td>
                </tr>
              ) : (
                affiliates.map((affiliate) => (
                  <tr key={affiliate.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{affiliate.user.name}</div>
                      <div className="text-gray-500 text-xs">{affiliate.user.email}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-600">{affiliate.refCode}</td>
                    <td className="px-6 py-4">
                      {affiliate.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                      {affiliate.status === 'ACTIVE' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      )}
                      {affiliate.status === 'SUSPENDED' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          <XCircle className="w-3.5 h-3.5" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{affiliate.conversions}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">${affiliate.totalEarnings.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/affiliates/${affiliate.id}`}
                        className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
