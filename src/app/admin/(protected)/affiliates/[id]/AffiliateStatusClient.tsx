"use client";

import React, { useState } from "react";
import { updateAffiliateStatus, updateAffiliateCommission } from "@/actions/admin/affiliates";

export default function AffiliateStatusClient({ 
  id, 
  currentStatus,
  customRate,
  commissionType
}: { 
  id: string, 
  currentStatus: string,
  customRate: number | null,
  commissionType: string
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const [rateForm, setRateForm] = useState({
    customRate: customRate !== null ? customRate.toString() : "",
    type: commissionType
  });

  const handleStatusChange = async (newStatus: "ACTIVE" | "SUSPENDED" | "PENDING") => {
    setLoading(true);
    await updateAffiliateStatus(id, newStatus);
    setStatus(newStatus);
    setLoading(false);
  };

  const handleCommissionSave = async () => {
    setLoading(true);
    const rateNum = rateForm.customRate ? parseFloat(rateForm.customRate) : null;
    await updateAffiliateCommission(id, rateNum, rateForm.type as "RECURRING" | "ONE_TIME");
    setLoading(false);
    alert("Commission settings saved");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Account Status</h2>
        <div className="space-y-3">
          <button 
            onClick={() => handleStatusChange("ACTIVE")}
            disabled={loading}
            className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors border ${status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
          >
            {status === 'ACTIVE' ? "✓ Active" : "Set Active"}
          </button>
          <button 
            onClick={() => handleStatusChange("SUSPENDED")}
            disabled={loading}
            className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors border ${status === 'SUSPENDED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
          >
            {status === 'SUSPENDED' ? "✓ Suspended" : "Suspend Account"}
          </button>
          <button 
            onClick={() => handleStatusChange("PENDING")}
            disabled={loading}
            className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors border ${status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
          >
            {status === 'PENDING' ? "✓ Pending" : "Set Pending"}
          </button>
        </div>
      </div>

      <div className="p-6 bg-gray-50">
        <h2 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Commission Override</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Commission Type</label>
            <select 
              value={rateForm.type}
              onChange={(e) => setRateForm({...rateForm, type: e.target.value})}
              className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="RECURRING">Recurring (Monthly)</option>
              <option value="ONE_TIME">One-Time (First Payment Only)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 mb-1">Custom Rate (%)</label>
            <input 
              type="number" 
              value={rateForm.customRate}
              onChange={(e) => setRateForm({...rateForm, customRate: e.target.value})}
              placeholder="Leave blank for system default"
              className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <button 
            onClick={handleCommissionSave}
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
