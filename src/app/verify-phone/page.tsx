"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PublicHeader from "@/components/PublicHeader";
import { MessageSquare, ShieldCheck, ArrowRight, Loader2, RefreshCw } from "lucide-react";

export default function VerifyPhonePage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 7) {
      setError("Please enter a valid phone number with country code (e.g. +1234567890)");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send verification code");
      }

      setSuccessMsg("Verification code sent to your WhatsApp!");
      setStep("otp");
      setResendTimer(60);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setError("Please enter the 6-digit verification code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otpCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid verification code");
      }

      setSuccessMsg("WhatsApp verified successfully! Redirecting to dashboard...");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <PublicHeader />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-100">
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#25D366]/10 text-[#25D366] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-[#25D366]/20">
              <svg className="w-9 h-9 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l.399.635-1.156 4.223 4.333-1.136.567.345zm11.233-5.228c-.302-.151-1.785-.882-2.062-.983-.277-.101-.479-.151-.681.151-.202.302-.782.983-.959 1.185-.177.201-.353.226-.655.075s-1.275-.47-2.43-1.498c-.9-.801-1.507-1.79-1.684-2.092-.177-.302-.019-.465.132-.615.136-.135.302-.353.454-.529.151-.176.202-.302.302-.504.101-.202.051-.378-.025-.529-.076-.151-.681-1.638-.933-2.242-.246-.588-.496-.508-.681-.518-.176-.009-.378-.01-.58-.01-.202 0-.529.076-.806.378s-1.059 1.034-1.059 2.521c0 1.487 1.084 2.923 1.235 3.124.151.202 2.134 3.26 5.171 4.571.722.311 1.286.497 1.726.637.725.23 1.385.197 1.906.12.581-.086 1.785-.73 2.037-1.435.252-.705.252-1.309.176-1.435-.075-.126-.277-.202-.579-.353z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Verify WhatsApp Number
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-2">
              MedicINtime sends medicine reminders directly to your WhatsApp. Please verify your phone number to continue.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl text-center">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-xl text-center">
              {successMsg}
            </div>
          )}

          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  WhatsApp Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 font-medium text-base outline-none transition-all"
                />
                <p className="text-xs text-slate-400 mt-1">Include your country code (e.g. +1 for US, +91 for India, +44 for UK)</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    Send WhatsApp Code
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Enter 6-Digit WhatsApp Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 font-mono text-center tracking-[0.5em] text-2xl font-bold outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Proceed to Dashboard
                    <ShieldCheck className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
                >
                  Change phone number
                </button>

                <button
                  type="button"
                  disabled={resendTimer > 0 || loading}
                  onClick={handleSendOtp}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-800 disabled:text-slate-400 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend WhatsApp OTP"}
                </button>
              </div>
            </form>
          )}

        </div>
      </main>
    </div>
  );
}
