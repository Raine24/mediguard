import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";

export default async function ReferralsPage() {
  const session = await getServerSession(authOptions);
  
  const affiliate = await prisma.affiliateProfile.findUnique({
    where: { userId: session?.user?.id },
    include: {
      affiliateConversions: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!affiliate) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Users className="w-8 h-8 text-teal-600" />
        <h1 className="text-2xl font-bold text-slate-800">Your Referrals</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {affiliate.affiliateConversions.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-500 mb-2">You haven't referred anyone yet.</p>
            <p className="text-sm text-slate-400">Share your referral link to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-6 py-4 font-medium">Subscriber ID</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Plan</th>
                  <th className="px-6 py-4 font-medium">Commission</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {affiliate.affiliateConversions.map((conv) => (
                  <tr key={conv.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">Subscriber #{conv.referredUserId.substring(0, 6).toUpperCase()}</td>
                    <td className="px-6 py-4">{conv.createdAt.toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                        {conv.planType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-green-600">
                      +${conv.commissionAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {conv.status === 'PENDING' && (
                        <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                          Pending (14 days)
                        </span>
                      )}
                      {conv.status === 'CLEARED' && (
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          Cleared
                        </span>
                      )}
                      {conv.status === 'PAID' && (
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          Paid Out
                        </span>
                      )}
                      {conv.status === 'CANCELLED' && (
                        <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                          Cancelled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
