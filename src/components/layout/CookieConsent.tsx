"use client";

import { useState, useEffect } from "react";
import { Shield, X, Check } from "lucide-react";

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("medicintime_cookie_consent");
    if (!consent) {
      // Delay showing the banner slightly for a smoother, less intrusive entry
      const timer = setTimeout(() => setShow(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  const handleAccept = () => {
    setIsClosing(true);
    setTimeout(() => {
      localStorage.setItem("medicintime_cookie_consent", "accepted");
      setShow(false);
    }, 400); // match animation duration
  };

  const handleDecline = () => {
    setIsClosing(true);
    setTimeout(() => {
      localStorage.setItem("medicintime_cookie_consent", "essential_only");
      setShow(false);
    }, 400);
  };

  return (
    <div 
      className={`fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-6 sm:right-auto z-[100] max-w-sm sm:max-w-[420px] w-full transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
        isClosing ? "translate-y-12 opacity-0 scale-95" : "translate-y-0 opacity-100 scale-100"
      }`}
    >
      <div className="bg-white/80 backdrop-blur-2xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-6 overflow-hidden relative group">
        {/* Decorative background gradients */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-teal-400/20 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 group-hover:opacity-100 opacity-70" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 group-hover:opacity-100 opacity-70" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-teal-600 to-teal-400 text-white flex items-center justify-center rounded-xl shadow-[0_2px_10px_rgba(20,184,166,0.3)]">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900 text-[17px] tracking-tight">Your Privacy Matters</h3>
            </div>
            <button 
              onClick={handleDecline}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100/50 rounded-full"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-gray-600 text-[14px] leading-relaxed mb-6 font-medium">
            We use strictly necessary cookies to ensure our platform functions securely. We also use optional cookies to improve your experience and manage our affiliate partnerships. <a href="/cookies" className="text-teal-600 hover:underline">Read our Cookie Policy.</a>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handleAccept}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Check className="w-4 h-4" />
              Accept All
            </button>
            <button 
              onClick={handleDecline}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-sm font-semibold py-2.5 px-4 rounded-xl transition-all active:scale-[0.98] shadow-sm hover:border-gray-300"
            >
              Essential Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
