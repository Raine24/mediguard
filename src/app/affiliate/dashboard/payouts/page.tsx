import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { CreditCard, AlertCircle } from "lucide-react";
import PayoutClient from "./PayoutClient";

export default async function PayoutsPage() {
  const session = await getServerSession(authOptions);
  
  const affiliate = await prisma.affiliateProfile.findUnique({
    where: { userId: session?.user?.id },
    include: {
      affiliatePayouts: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!affiliate) return null;

  // Get minimum payout threshold
  let minPayout = 20;
  const setting = await prisma.systemSetting.findUnique({
    where: { key: "affiliate_min_payout" }
  });
  if (setting && !isNaN(parseFloat(setting.value))) {
    minPayout = parseFloat(setting.value);
  }

  const hasPendingPayout = affiliate.affiliatePayouts.some(p => p.status === 'PENDING');

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <CreditCard className="w-8 h-8 text-teal-600" />
        <h1 className="text-2xl font-bold text-slate-800">Earnings & Payouts</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-medium text-slate-600 mb-2">Available Balance</h2>
          <p className="text-4xl font-bold text-slate-800 mb-6">${affiliate.availableEarnings.toFixed(2)}</p>
          
          <PayoutClient 
            available={affiliate.availableEarnings} 
            minPayout={minPayout} 
            hasPending={hasPendingPayout} 
          />
        </div>

        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-medium text-slate-600 mb-2">Payout Method</h2>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-slate-100 p-2 rounded">
              <CreditCard className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <p className="font-medium text-slate-800">{affiliate.payoutMethod}</p>
              <p className="text-sm text-slate-500">{affiliate.payoutDetails}</p>
            </div>
          </div>
          <p className="text-sm text-slate-500 flex items-start gap-2 mt-4 bg-slate-50 p-3 rounded border border-slate-100">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
            <span>To change your payout method, please contact support.</span>
          </p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-800 mb-4">Payout History</h2>
      
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {affiliate.affiliatePayouts.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-500">No payouts requested yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-6 py-4 font-medium">Date Requested</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Method</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {affiliate.affiliatePayouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">{payout.createdAt.toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">${payout.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">{payout.method}</td>
                    <td className="px-6 py-4">
                      {payout.status === 'PENDING' ? (
                        <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                          Processing
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          Paid
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {payout.paidAt ? payout.paidAt.toLocaleDateString() : '-'}
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
