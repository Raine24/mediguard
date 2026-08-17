"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, Users, CreditCard, Settings } from 'lucide-react';
import clsx from 'clsx';

export default function AffiliateMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-1 -ml-1 text-slate-600 hover:text-slate-900 rounded-md"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sliding Drawer */}
      <div 
        className={clsx(
          "fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          <Link href="/affiliate/dashboard" className="flex items-center" onClick={() => setIsOpen(false)}>
            <img src="/brand-logo.png" alt="MedicINtime" className="h-8 w-auto object-contain" />
          </Link>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded-md"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {[
            { name: "Dashboard", href: "/affiliate/dashboard", icon: LayoutDashboard },
            { name: "Referrals", href: "/affiliate/dashboard/referrals", icon: Users },
            { name: "Payouts", href: "/affiliate/dashboard/payouts", icon: CreditCard },
            { name: "Settings", href: "/affiliate/dashboard/settings", icon: Settings },
          ].map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors font-medium",
                  isActive 
                    ? "bg-teal-600/20 text-teal-400" 
                    : "hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" /> {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
