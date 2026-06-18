import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, CreditCard, Megaphone, LogOut, ShieldAlert } from "lucide-react";

export default async function AffiliateLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== "AFFILIATE") {
    redirect("/login");
  }

  const affiliate = await prisma.affiliateProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!affiliate) {
    redirect("/login");
  }

  // Handle Pending or Suspended Status
  if (affiliate.status === "PENDING") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Application Pending</h1>
        <p className="text-slate-600 max-w-md">Your partner application is currently being reviewed by our team. You will receive an email once it is approved.</p>
        <Link href="/api/auth/signout" className="mt-8 text-teal-600 hover:text-teal-700 font-medium">Log out</Link>
      </div>
    );
  }

  if (affiliate.status === "SUSPENDED") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center">
        <ShieldAlert className="w-20 h-20 text-red-500 mb-6" />
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Account Suspended</h1>
        <p className="text-slate-600 max-w-md">Your affiliate account has been suspended. Please contact support for more information.</p>
        <Link href="/api/auth/signout" className="mt-8 text-teal-600 hover:text-teal-700 font-medium">Log out</Link>
      </div>
    );
  }

  // Active Layout
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex fixed h-full z-10">
        <div className="p-6">
          <Link href="/affiliate/dashboard" className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="text-teal-400">Medi</span>Guard <span className="text-xs bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full ml-1 font-medium">Partner</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          <Link href="/affiliate/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/affiliate/dashboard/referrals" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <Users className="w-5 h-5" /> Referrals
          </Link>
          <Link href="/affiliate/dashboard/payouts" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <CreditCard className="w-5 h-5" /> Payouts
          </Link>
          <Link href="/affiliate/dashboard/marketing" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <Megaphone className="w-5 h-5" /> Marketing Assets
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Link href="/api/auth/signout" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" /> Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center">
          <Link href="/affiliate/dashboard" className="text-xl font-bold text-slate-900 tracking-tight">
            <span className="text-teal-600">Medi</span>Guard <span className="text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">Partner</span>
          </Link>
          <Link href="/api/auth/signout" className="text-slate-600">
            <LogOut className="w-5 h-5" />
          </Link>
        </header>

        <div className="p-6 md:p-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
