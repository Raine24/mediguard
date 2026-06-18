"use client";

import { useEffect, useState, useCallback } from "react";
import { signOut } from "next-auth/react";

const TIMEOUT_MINUTES = 30;
const WARNING_MINUTES = 2;
const TIMEOUT_MS = TIMEOUT_MINUTES * 60 * 1000;
const WARNING_MS = WARNING_MINUTES * 60 * 1000;

export default function SessionTimeout() {
  const [showWarning, setShowWarning] = useState(false);

  const resetTimer = useCallback(() => {
    setShowWarning(false);
    
    const expiryTime = Date.now() + TIMEOUT_MS;
    localStorage.setItem("session_expiry", expiryTime.toString());
  }, []);

  useEffect(() => {
    // Initial setup
    resetTimer();

    const checkTimer = setInterval(() => {
      const expiryTime = parseInt(localStorage.getItem("session_expiry") || "0", 10);
      const now = Date.now();
      
      const timeRemaining = expiryTime - now;

      if (timeRemaining <= 0) {
        // Expired
        signOut({ callbackUrl: "/login?expired=true" });
      } else if (timeRemaining <= WARNING_MS) {
        // Show warning
        setShowWarning(true);
      }
    }, 10000); // Check every 10 seconds

    // Add activity listeners
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    const handleActivity = () => {
      if (!showWarning) {
        resetTimer();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      clearInterval(checkTimer);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [resetTimer, showWarning]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Session Expiring Soon</h3>
        <p className="text-gray-600 mb-6">
          For your security, you will be automatically logged out in 2 minutes due to inactivity.
        </p>
        <button
          onClick={resetTimer}
          className="w-full bg-teal-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-teal-700 transition-colors"
        >
          Stay Logged In
        </button>
      </div>
    </div>
  );
}
