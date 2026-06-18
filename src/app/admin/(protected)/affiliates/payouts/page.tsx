import { prisma } from "@/lib/prisma";
import { CheckCircle2, DollarSign } from "lucide-react";
import PayoutActionClient from "./PayoutActionClient";

export default async function AdminPayoutsPage() {
  const payouts = await prisma.affiliatePayout.findMany({
    include: {
      affiliate: {
        include: {
          user: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payout Requests</h1>
          <p className="text-gray-500 mt-1">Manage and process affiliate payouts</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Partner Name</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Method</th>
                <th className="px-6 py-4 font-medium">Details</th>
                <th className="px-6 py-4 font-medium">Date Requested</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    No payout requests found.
                  </td>
                </tr>
              ) : (
                payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{payout.affiliate.user.name}</div>
                      <div className="text-gray-500 text-xs">{payout.affiliate.user.email}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">${payout.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-600">{payout.method}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">{payout.details}</td>
                    <td className="px-6 py-4 text-gray-600">{payout.createdAt.toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {payout.status === 'PENDING' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Paid on {payout.paidAt?.toLocaleDateString()}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {payout.status === 'PENDING' && (
                        <PayoutActionClient payoutId={payout.id} />
                      )}
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
