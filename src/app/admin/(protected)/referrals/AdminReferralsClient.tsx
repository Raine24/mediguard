"use client";

import { useState } from "react";
import { removeReferral, awardFreeMonths } from "./actions";
import { User, Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function AdminReferralsClient({ 
  topReferrers, 
  recentReferrals 
}: { 
  topReferrers: any[];
  recentReferrals: any[];
}) {
  const [loading, setLoading] = useState(false);

  const [awardUserId, setAwardUserId] = useState("");
  const [awardMonths, setAwardMonths] = useState(1);
  const [awardReason, setAwardReason] = useState("");

  const handleRemove = async (referralId: string) => {
    const reason = prompt("Enter a reason for removing this referral (logged for audit):");
    if (!reason) return;
    
    setLoading(true);
    try {
      await removeReferral(referralId, reason);
      alert("Referral removed successfully.");
    } catch (e: any) {
      alert("Failed to remove referral: " + e.message);
    }
    setLoading(false);
  };

  const handleAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!awardUserId || !awardReason) return;
    setLoading(true);
    try {
      await awardFreeMonths(awardUserId, Number(awardMonths), awardReason);
      alert("Free months awarded successfully.");
      setAwardUserId("");
      setAwardMonths(1);
      setAwardReason("");
    } catch (e: any) {
      alert("Failed to award free months: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Top 10 Referrers */}
      <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            Top 10 Referrers
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {topReferrers.map((ref, idx) => (
            <div key={ref.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                  #{idx + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{ref.name}</p>
                  <p className="text-xs text-gray-500">{ref.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{ref.totalSuccessfulReferrals}</p>
                <p className="text-xs text-gray-500">referrals</p>
              </div>
            </div>
          ))}
          {topReferrers.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-sm">No referrers yet.</div>
          )}
        </div>
      </div>

      {/* Referral Map / List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Recent Referrals</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="px-6 py-4">Referrer</th>
                  <th className="px-6 py-4">Referred User</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {recentReferrals.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{r.referrer.name}</p>
                      <p className="text-xs text-gray-500">{r.referrer.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{r.referredUser.name}</p>
                      <p className="text-xs text-gray-500">{r.planType} / {r.billingCycle}</p>
                    </td>
                    <td className="px-6 py-4">
                      {r.status === "PAID" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          <CheckCircle className="w-3 h-3" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          <XCircle className="w-3 h-3" /> Refunded
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {r.status === "PAID" && (
                        <button 
                          onClick={() => handleRemove(r.id)}
                          disabled={loading}
                          className="text-xs font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {recentReferrals.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No referrals found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Manual Reward Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-gray-400" />
            <h3 className="font-bold text-gray-900">Manual Reward Override</h3>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Manually award free months to a specific subscriber. This will be logged in the audit trail.
          </p>

          <form onSubmit={handleAward} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
              <input 
                type="text" 
                required
                value={awardUserId}
                onChange={(e) => setAwardUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
                placeholder="cuid..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Free Months to Award</label>
              <input 
                type="number" 
                required
                min="1"
                max="12"
                value={awardMonths}
                onChange={(e) => setAwardMonths(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for override</label>
              <input 
                type="text" 
                required
                value={awardReason}
                onChange={(e) => setAwardReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
                placeholder="e.g. Compensating for missed referral link"
              />
            </div>
            <div className="md:col-span-2 flex justify-end mt-2">
              <button 
                type="submit"
                disabled={loading}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Award Free Months
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}
