import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import SettingsForm from "./SettingsForm";
import { Settings } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AffiliateSettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const affiliate = await prisma.affiliateProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!affiliate) {
    redirect("/login");
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <Settings className="w-7 h-7 text-teal-600" />
          Settings
        </h1>
        <p className="text-slate-500 mt-2">Manage your payout and account preferences.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-2xl">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-800">Payout Information</h3>
        </div>
        <div className="p-6">
          <SettingsForm 
            initialPayoutMethod={affiliate.payoutMethod} 
            initialPayoutDetails={affiliate.payoutDetails} 
          />
        </div>
      </div>
    </div>
  );
}
