"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="absolute top-4 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[1200px] flex items-center justify-between px-6 py-3.5 bg-[#FAF8F4]/80 backdrop-blur-md border border-[#0D3D56]/10 rounded-[24px] z-50 transition-all">
        <Link href="/" className="flex items-center gap-2 text-[#0D3D56] font-extrabold text-[1.4rem] italic tracking-tight font-sans">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
          MediGuard
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="/" className="text-[0.875rem] font-medium text-[#3a3a3c] hover:text-[#0D3D56] hidden md:block transition-colors">Home</Link>
          <Link href="/#how-it-works" className="text-[0.875rem] font-medium text-[#3a3a3c] hover:text-[#0D3D56] hidden md:block transition-colors">How it Works</Link>
          <Link href="/#pricing" className="text-[0.875rem] font-medium text-[#3a3a3c] hover:text-[#0D3D56] hidden md:block transition-colors">Pricing</Link>
          <div className="flex items-center gap-3 ml-2">
            <Link href="/login" className="text-[0.9rem] font-semibold text-[#0D3D56] border-[1.5px] border-[#0D3D56] px-[22px] py-[10px] rounded-[50px] hover:bg-[#0D3D56] hover:text-white transition-all hidden sm:inline-flex">Log In</Link>
            <Link href="/register" className="text-[0.9rem] font-semibold bg-[#F4A300] text-[#1C1C1E] px-[22px] py-[10px] rounded-[50px] hover:bg-[#fdb73a] hover:-translate-y-[1px] shadow-[0_4px_16px_rgba(244,163,0,0.3)] hover:shadow-[0_6px_24px_rgba(244,163,0,0.4)] transition-all hidden sm:inline-flex">Get Started</Link>
            <button 
              className="sm:hidden p-2 text-[#0D3D56] hover:bg-[#0D3D56]/5 rounded-full transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed top-[76px] left-6 right-6 bg-[#FAF8F4]/98 backdrop-blur-[10px] rounded-[24px] p-6 shadow-[0_8px_32px_rgba(13,61,86,.14)] z-[999] border border-[#0D3D56]/10 flex flex-col gap-4">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-[1.1rem] text-[#1C1C1E] border-b border-[#0D3D56]/5 pb-3">Home</Link>
          <Link href="/#how-it-works" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-[1.1rem] text-[#1C1C1E] border-b border-[#0D3D56]/5 pb-3">How It Works</Link>
          <Link href="/#pricing" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-[1.1rem] text-[#1C1C1E] border-b border-[#0D3D56]/5 pb-3">Pricing</Link>
          <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-[1.1rem] text-[#1C1C1E] border-b border-[#0D3D56]/5 pb-3">Log In</Link>
          <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-[1.1rem] bg-[#F4A300] text-[#1C1C1E] rounded-[50px] py-3 text-center mt-2 shadow-sm">Get Started</Link>
        </div>
      )}
    </>
  );
}
