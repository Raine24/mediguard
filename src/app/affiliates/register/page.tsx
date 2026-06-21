"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerAffiliate } from '@/actions/affiliates/register';
import { Building2, User, Mail, Lock, Globe2, Briefcase, CreditCard, ArrowRight } from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';

export default function AffiliateRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await registerAffiliate(formData);
    
    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setSuccess(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <PublicHeader />
      
      <main className="flex-grow flex items-center justify-center pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <div className="bg-slate-900 px-8 py-10 text-center">
            <h2 className="text-3xl font-extrabold text-white mb-2">Partner Application</h2>
            <p className="text-slate-300">Join the MedicinTime Affiliate Network and earn recurring revenue.</p>
          </div>

          <div className="px-8 py-10">
            {success ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Application Received</h3>
                <p className="text-slate-600 mb-8">
                  Thank you for applying to become a MedicinTime partner. Our team will review your application and notify you via email once approved.
                </p>
                <button 
                  onClick={() => router.push('/')}
                  className="bg-slate-900 text-white font-medium py-3 px-6 rounded-lg hover:bg-slate-800 transition-colors w-full"
                >
                  Return to Homepage
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-sm">
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name or Organization</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="h-5 w-5" />
                      </div>
                      <input name="name" type="text" required className="pl-10 block w-full rounded-lg border border-slate-300 py-3 px-4 focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-slate-50" placeholder="John Doe / Clinic Name" />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="h-5 w-5" />
                      </div>
                      <input name="email" type="email" required className="pl-10 block w-full rounded-lg border border-slate-300 py-3 px-4 focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-slate-50" placeholder="partner@example.com" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="h-5 w-5" />
                      </div>
                      <input name="password" type="password" required className="pl-10 block w-full rounded-lg border border-slate-300 py-3 px-4 focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-slate-50" placeholder="••••••••" />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Globe2 className="h-5 w-5" />
                      </div>
                      <select name="country" required className="pl-10 block w-full rounded-lg border border-slate-300 py-3 px-4 focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-slate-50 text-slate-700">
                        <option value="">Select Country</option>
                        <option value="Uganda">Uganda</option>
                        <option value="Kenya">Kenya</option>
                        <option value="Nigeria">Nigeria</option>
                        <option value="South Africa">South Africa</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6 mt-6">
                  <h4 className="text-lg font-medium text-slate-800 mb-4">Partnership Details</h4>
                  
                  {/* Promotion Method */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1">How do you plan to promote MedicinTime?</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <select name="promotionMethod" required className="pl-10 block w-full rounded-lg border border-slate-300 py-3 px-4 focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-slate-50 text-slate-700">
                        <option value="">Select Method</option>
                        <option value="Social Media">Social Media (Facebook, Twitter, Instagram)</option>
                        <option value="Blog or Website">Blog or Website</option>
                        <option value="WhatsApp Groups">WhatsApp Groups</option>
                        <option value="Healthcare Professional">Healthcare Professional</option>
                        <option value="Pharmacy or Clinic">Pharmacy or Clinic</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Payout Method */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Payout Method</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <select name="payoutMethod" required className="pl-10 block w-full rounded-lg border border-slate-300 py-3 px-4 focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-slate-50 text-slate-700">
                          <option value="PayPal">PayPal</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                        </select>
                      </div>
                    </div>

                    {/* Payout Details */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Payout Details</label>
                      <input name="payoutDetails" type="text" required className="block w-full rounded-lg border border-slate-300 py-3 px-4 focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-slate-50" placeholder="PayPal Email or Bank Acc Num" />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Submitting..." : (
                      <>
                        Submit Application <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </button>
                  <p className="text-xs text-center text-slate-500 mt-4">
                    By submitting this application, you agree to our Affiliate Terms & Conditions.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
