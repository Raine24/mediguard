"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Users, 
  User,
  CreditCard, 
  MessageSquare, 
  Ticket, 
  BarChart3, 
  Settings, 
  ShieldAlert, 
  LogOut,
  Menu,
  X,
  Shield,
  Network,
  Share2
} from "lucide-react";

type Role = "SUPER_ADMIN" | "ADMIN" | "SUPPORT_AGENT";

const navigation = [
  { name: 'Overview Dashboard', href: '/admin', icon: LayoutDashboard, roles: ["SUPER_ADMIN", "ADMIN", "SUPPORT_AGENT"] },
  { name: 'Subscriber Management', href: '/admin/subscribers', icon: Users, roles: ["SUPER_ADMIN", "ADMIN", "SUPPORT_AGENT"] },
  { name: 'Referral Program', href: '/admin/referrals', icon: Share2, roles: ["SUPER_ADMIN", "ADMIN"] },
  { name: 'Affiliates', href: '/admin/affiliates', icon: Network, roles: ["SUPER_ADMIN", "ADMIN"] },
  { name: 'Revenue & Billing', href: '/admin/revenue', icon: CreditCard, roles: ["SUPER_ADMIN", "ADMIN"] },
  { name: 'Message Centre', href: '/admin/messages', icon: MessageSquare, roles: ["SUPER_ADMIN", "ADMIN", "SUPPORT_AGENT"] },
  { name: 'Support Tickets', href: '/admin/tickets', icon: Ticket, roles: ["SUPER_ADMIN", "ADMIN", "SUPPORT_AGENT"] },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, roles: ["SUPER_ADMIN", "ADMIN"] },
  { name: 'System Settings', href: '/admin/settings', icon: Settings, roles: ["SUPER_ADMIN"] },
  { name: 'Audit Log', href: '/admin/audit', icon: ShieldAlert, roles: ["SUPER_ADMIN"] },
];

export default function AdminSidebar({ userRole, userName }: { userRole: string, userName: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const filteredNav = navigation.filter(item => item.roles.includes(userRole as Role));

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 z-50 flex items-center justify-between px-4 border-b border-gray-800 shadow-md">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-teal-400" />
          <span className="text-white font-bold text-lg tracking-tight">Interserver</span>
        </div>
        <button
          type="button"
          className="text-gray-400 hover:text-white"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-gray-900 border-r border-gray-800 pt-5 pb-4 transition-transform translate-x-0 slide-in-from-left">
            <div className="absolute right-0 top-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            
            <SidebarContent nav={filteredNav} pathname={pathname} setMobileMenuOpen={setMobileMenuOpen} />
            <SidebarFooter userName={userName} userRole={userRole} />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex w-64 flex-col bg-gray-900 border-r border-gray-800 shadow-xl">
          <div className="flex h-16 items-center gap-2 px-6 border-b border-gray-800 bg-gray-900/50">
            <Shield className="w-7 h-7 text-teal-400" />
            <span className="text-white font-bold text-xl tracking-tight">Interserver</span>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto">
            <SidebarContent nav={filteredNav} pathname={pathname} />
          </div>
          <SidebarFooter userName={userName} userRole={userRole} />
        </div>
      </div>
    </>
  );
}

function SidebarContent({ nav, pathname, setMobileMenuOpen }: { nav: any[], pathname: string, setMobileMenuOpen?: (val: boolean) => void }) {
  return (
    <nav className="flex-1 space-y-1.5 px-3 py-6">
      {nav.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
            className={`
              group flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200
              ${isActive
                ? 'bg-teal-500/10 text-teal-400'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }
            `}
          >
            <item.icon
              className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-teal-400' : 'text-gray-500 group-hover:text-gray-300'}`}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ userName, userRole }: { userName: string, userRole: string }) {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "ADMIN": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="flex flex-col border-t border-gray-800 p-4 bg-gray-900/50">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 shrink-0">
          <User className="w-5 h-5 text-gray-400" />
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-bold text-white truncate">{userName}</p>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getRoleBadge(userRole)}`}>
            {userRole.replace("_", " ")}
          </span>
        </div>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/admin/login" })}
        className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-bold text-gray-400 bg-gray-800 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
}
