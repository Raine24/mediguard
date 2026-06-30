"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, CreditCard } from "lucide-react";

export default function SubscriptionGuard({
  isExpired,
  children,
}: {
  isExpired: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Do not block the billing page or settings page
  const isAllowedPath = 
    pathname === "/dashboard/billing" || 
    pathname === "/dashboard/settings";

  if (isExpired && !isAllowedPath) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-red-100 min-h-[50vh]">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Subscription Expired</h2>
        <p className="text-gray-500 text-center max-w-md mb-8">
          Your free trial or subscription has expired. You can no longer access the dashboard or send reminders. Please renew your subscription to continue using MedicINtime.
        </p>
        <Link
          href="/dashboard/billing"
          className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-700 transition-colors"
        >
          <CreditCard className="w-5 h-5" />
          Renew Subscription
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
