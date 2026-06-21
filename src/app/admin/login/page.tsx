"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, Lock, User, AlertCircle, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorToken, setTwoFactorToken] = useState("");
  
  const [step, setStep] = useState<"CREDENTIALS" | "2FA">("CREDENTIALS");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      twoFactorToken: step === "2FA" ? twoFactorToken : undefined,
    });

    if (res?.error) {
      setLoading(false);
      if (res.error === "2FA_REQUIRED") {
        setStep("2FA");
      } else {
        setError(res.error);
        if (step === "2FA") {
          // If 2FA fails, we keep them on the 2FA step to try again
          setTwoFactorToken("");
        }
      }
    } else {
      // Success
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 border border-gray-700 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-teal-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">MedicinTime Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Secure Staff Portal</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400 leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {step === "CREDENTIALS" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Admin Email</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none"
                    placeholder="you@medicintime.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <label className="block text-sm font-medium text-gray-300 mb-2">Authenticator Code (2FA)</label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  value={twoFactorToken}
                  onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none tracking-widest text-lg font-mono placeholder:tracking-normal placeholder:font-sans"
                  placeholder="000000"
                />
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Open your authenticator app to view your 6-digit code.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-500 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-teal-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {loading ? "Authenticating..." : step === "CREDENTIALS" ? "Continue" : "Verify & Login"}
            {!loading && step === "CREDENTIALS" && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
