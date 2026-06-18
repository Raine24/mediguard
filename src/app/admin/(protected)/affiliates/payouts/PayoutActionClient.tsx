"use client";

import React, { useState } from "react";
import { markPayoutPaid } from "@/actions/admin/payouts";

export default function PayoutActionClient({ payoutId }: { payoutId: string }) {
  const [loading, setLoading] = useState(false);

  const handleMarkPaid = async () => {
    if (!confirm("Are you sure you want to mark this payout as paid? Ensure you have actually sent the funds.")) return;
    
    setLoading(true);
    await markPayoutPaid(payoutId);
    setLoading(false);
  };

  return (
    <button 
      onClick={handleMarkPaid}
      disabled={loading}
      className="text-sm bg-teal-600 hover:bg-teal-700 text-white py-1.5 px-3 rounded-lg font-medium transition-colors disabled:opacity-50"
    >
      {loading ? "Updating..." : "Mark Paid"}
    </button>
  );
}
