"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Pill, 
  History, 
  Users, 
  CreditCard, 
  Settings, 
  HelpCircle
} from "lucide-react";
import clsx from "clsx";
import SessionTimeout from "./SessionTimeout";
import SupportModal from "./SupportModal";

const navItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Medicines", href: "/dashboard/medicines", icon: Pill },
  { name: "History", href: "/dashboard/history", icon: History },
  { name: "Family", href: "/dashboard/family", icon: Users },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardShell({
  children,
  user
}: {
  children: React.ReactNode;
  user: any;
}) {
  const pathname = usePathname();
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row pb-16 md:pb-0">
      <SessionTimeout />
      
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            M
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">MediGuard</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name}
                href={item.href} 
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
                  isActive 
                    ? "bg-teal-50 text-teal-700" 
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className={clsx("w-5 h-5", isActive ? "text-teal-600" : "text-gray-500")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button 
            onClick={() => setIsSupportOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 font-medium transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-gray-500" />
            Support
          </button>
          
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {user?.email}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-30 px-4 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">
            M
          </div>
          <span className="text-lg font-bold text-gray-900">MediGuard</span>
        </div>
        <button 
          onClick={() => setIsSupportOpen(true)}
          className="p-2 text-gray-600 hover:text-gray-900 bg-gray-100 rounded-full" 
          aria-label="Support"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation (Persistent) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe">
        <div className="flex items-center justify-around h-16 px-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={clsx(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                  isActive ? "text-teal-600" : "text-gray-500 hover:text-gray-900"
                )}
              >
                <item.icon className={clsx("w-6 h-6", isActive && "fill-teal-50")} />
                <span className="text-[10px] font-medium leading-none">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
    </div>
  );
}
