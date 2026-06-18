"use client";

import React, { useState } from 'react';
import { requestPayout } from '@/actions/affiliates/payouts';

export default function PayoutClient({ available, minPayout, hasPending }: { available: number, minPayout: number, hasPending: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRequest = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    const res = await requestPayout();
    
    if (res.error) {
      setError(res.error);
    } else if (res.success) {
      setSuccess(res.message || "Payout requested!");
    }
    
    setLoading(false);
  };

  return (
    <div>
      {error && <div className="text-red-600 text-sm mb-3 bg-red-50 p-2 rounded">{error}</div>}
      {success && <div className="text-green-600 text-sm mb-3 bg-green-50 p-2 rounded">{success}</div>}
      
      <button 
        onClick={handleRequest}
        disabled={loading || available < minPayout || hasPending}
        className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
      >
        {loading ? "Processing..." : hasPending ? "Payout Pending" : `Request Payout (Min $${minPayout})`}
      </button>
      
      {available < minPayout && !hasPending && (
        <p className="text-xs text-slate-500 mt-3 text-center">You need ${Math.max(0, minPayout - available).toFixed(2)} more to request a payout.</p>
      )}
    </div>
  );
}
