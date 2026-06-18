"use client";

import { useState } from "react";
import { User, Shield, AlertOctagon, Key, MapPin, Save, Info, CheckCircle2 } from "lucide-react";
import { updateProfile, requestPasswordReset, deactivateAccount, initiatePhoneChange, verifyPhoneChange } from "@/app/dashboard/settings/actions";
import { signOut } from "next-auth/react";

type UserProps = {
  name: string;
  email: string;
  phone: string;
  timezone: string;
};

export default function SettingsClient({ user }: { user: UserProps }) {
  const [name, setName] = useState(user.name);
  const [timezone, setTimezone] = useState(user.timezone);
  
  const [status, setStatus] = useState<"idle" | "saving" | "success">("idle");
  const [pwdStatus, setPwdStatus] = useState<"idle" | "saving" | "success">("idle");
  
  const [phone, setPhone] = useState(user.phone);
  const [isChangingPhone, setIsChangingPhone] = useState(false);
  const [phoneChangeStep, setPhoneChangeStep] = useState<"input" | "instruction" | "verifying">("input");
  const [verificationCode, setVerificationCode] = useState("");
  const [phoneStatus, setPhoneStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [phoneError, setPhoneError] = useState("");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    try {
      await updateProfile({ name, timezone });
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (e) {
      console.error(e);
      setStatus("idle");
    }
  };

  const handlePasswordReset = async () => {
    setPwdStatus("saving");
    try {
      await requestPasswordReset();
      setPwdStatus("success");
      setTimeout(() => setPwdStatus("idle"), 5000);
    } catch (e) {
      console.error(e);
      setPwdStatus("idle");
    }
  };

  const handleDelete = async () => {
    if (confirm("WARNING: This action is permanent and cannot be undone. All your data, family members, and medical history will be wiped instantly. Are you absolutely sure?")) {
      try {
        await deactivateAccount();
        signOut({ callbackUrl: "/register" });
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Account Settings</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Manage your profile and security</p>
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
          <User className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
        </div>
        
        <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base bg-white"
                >
                  <option value="UTC">UTC (Universal)</option>
                  <option value="America/New_York">Eastern Time (US & Canada)</option>
                  <option value="America/Chicago">Central Time (US & Canada)</option>
                  <option value="America/Denver">Mountain Time (US & Canada)</option>
                  <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                  <option value="Europe/London">London (GMT/BST)</option>
                  <option value="Europe/Paris">Central Europe (CET)</option>
                  <option value="Africa/Nairobi">East Africa (EAT)</option>
                  <option value="Africa/Johannesburg">South Africa (SAST)</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                WhatsApp Number <Info className="w-4 h-4 text-gray-400" />
              </label>
              
              {!isChangingPhone ? (
                <div className="flex gap-3">
                  <input
                    type="text"
                    disabled
                    value={user.phone}
                    className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-gray-500 rounded-xl cursor-not-allowed"
                  />
                  <button 
                    type="button"
                    onClick={() => setIsChangingPhone(true)}
                    className="shrink-0 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  {phoneChangeStep === "input" && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 font-medium">Enter your new WhatsApp number (with country code, e.g. +1234567890):</p>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1234567890"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base"
                      />
                      
                      {phoneError && <p className="text-red-600 text-sm font-medium">{phoneError}</p>}

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsChangingPhone(false);
                            setPhone(user.phone);
                            setPhoneError("");
                          }}
                          className="px-4 py-2 text-gray-500 font-medium hover:text-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={phone === user.phone || !phone.startsWith("+") || phoneStatus === "loading"}
                          onClick={async () => {
                            setPhoneStatus("loading");
                            setPhoneError("");
                            try {
                              await initiatePhoneChange(phone);
                              setPhoneChangeStep("verifying");
                              setPhoneStatus("idle");
                            } catch (e: any) {
                              setPhoneError(e.message || "Failed to send code.");
                              setPhoneStatus("error");
                            }
                          }}
                          className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50"
                        >
                          {phoneStatus === "loading" ? "Sending OTP..." : "Send Verification Code"}
                        </button>
                      </div>
                    </div>
                  )}

                  {phoneChangeStep === "verifying" && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 font-medium">A 6-digit code has been sent to {phone}. Enter it below:</p>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-center tracking-widest text-xl font-bold"
                      />
                      
                      {phoneError && <p className="text-red-600 text-sm font-medium text-center">{phoneError}</p>}
                      {phoneStatus === "success" && <p className="text-green-600 text-sm font-bold text-center flex justify-center items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Number verified!</p>}
                      
                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPhoneChangeStep("instruction");
                            setVerificationCode("");
                          }}
                          className="px-4 py-2 text-gray-500 font-medium hover:text-gray-700"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          disabled={verificationCode.length !== 6 || phoneStatus === "loading"}
                          onClick={async () => {
                            setPhoneStatus("loading");
                            setPhoneError("");
                            try {
                              await verifyPhoneChange(verificationCode);
                              setPhoneStatus("success");
                              setTimeout(() => {
                                setIsChangingPhone(false);
                                setPhoneChangeStep("input");
                                setVerificationCode("");
                                setPhoneStatus("idle");
                                // The layout will refresh from the server revalidation
                              }, 2000);
                            } catch (e: any) {
                              setPhoneError(e.message || "Invalid code.");
                              setPhoneStatus("error");
                            }
                          }}
                          className="flex-1 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50"
                        >
                          {phoneStatus === "loading" ? "Verifying..." : "Verify Code"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-gray-500 rounded-xl cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <button
              type="submit"
              disabled={status === "saving" || (name === user.name && timezone === user.timezone)}
              className="bg-teal-600 text-white font-semibold py-2.5 px-6 rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {status === "saving" ? "Saving..." : "Save Changes"}
            </button>
            {status === "success" && (
              <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Saved successfully
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Security */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
          <Shield className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-bold text-gray-900">Security</h2>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900">Password</h3>
              <p className="text-sm text-gray-500">Receive a secure link to reset your password via WhatsApp/Email.</p>
            </div>
            
            <button
              onClick={handlePasswordReset}
              disabled={pwdStatus === "saving"}
              className="bg-gray-100 text-gray-700 font-semibold py-2.5 px-6 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              {pwdStatus === "saving" ? "Sending..." : "Reset Password"}
            </button>
          </div>
          {pwdStatus === "success" && (
            <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-lg text-sm border border-green-100">
              A password reset link has been sent to your registered contact methods.
            </div>
          )}
        </div>
      </div>

      {/* Account Access */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out text-gray-500"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          <h2 className="text-lg font-bold text-gray-900">Account Access</h2>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900">Log Out</h3>
              <p className="text-sm text-gray-500">Sign out of your account on this device.</p>
            </div>
            
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="bg-gray-100 text-gray-700 font-semibold py-2.5 px-6 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-3xl border border-red-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100 flex items-center gap-3 bg-red-50/50">
          <AlertOctagon className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-bold text-red-700">Danger Zone</h2>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">Delete Account</h3>
              <p className="text-sm text-gray-500 mt-1">
                Permanently delete your account and all associated data. This action is irreversible. All reminders will stop immediately.
              </p>
            </div>
            
            <button
              onClick={handleDelete}
              className="bg-red-50 text-red-600 border border-red-200 font-bold py-2.5 px-6 rounded-xl hover:bg-red-100 hover:text-red-700 transition-colors shrink-0"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
