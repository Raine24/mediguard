"use client";

import { useState } from "react";
import { updateAffiliateSettings } from "@/actions/affiliates/updateSettings";
import { Save } from "lucide-react";

export default function SettingsForm({ initialPayoutMethod, initialPayoutDetails }: { initialPayoutMethod: string, initialPayoutDetails: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    
    const result = await updateAffiliateSettings(formData);
    
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result.success) {
      setMessage({ type: "success", text: result.message || "Updated successfully" });
    }
    
    setLoading(false);
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Payout Method
        </label>
        <select
          name="payoutMethod"
          defaultValue={initialPayoutMethod}
          className="w-full bg-slate-50 border border-slate-300 rounded-lg py-3 px-4 text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          required
        >
          <option value="PayPal">PayPal</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Crypto">Crypto (USDT/USDC)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Payout Details
        </label>
        <textarea
          name="payoutDetails"
          defaultValue={initialPayoutDetails}
          rows={3}
          placeholder="e.g. your@paypal.com or IBAN details"
          className="w-full bg-slate-50 border border-slate-300 rounded-lg py-3 px-4 text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          required
        ></textarea>
        <p className="text-xs text-slate-500 mt-2">
          Make sure your payout details are accurate to avoid missing payments.
        </p>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>{loading ? "Saving..." : "Save Settings"}</span>
        </button>
      </div>
    </form>
  );
}
