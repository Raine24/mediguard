"use client";

import PublicHeader from "@/components/PublicHeader";
import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "biannually" | "annually">("monthly");

  const plans = {
    basic: {
      monthly: "$2",
      biannually: "$11",
      annually: "$20",
    },
    parental: {
      monthly: "$3.50",
      biannually: "$21",
      annually: "$40",
    }
  };

  return (
    <>
      <PublicHeader />
      
      <main className="min-h-screen bg-[#fafafa] font-sans pt-20 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-gray-600">
              No hidden fees. No complicated tiers. Just reliable medication reminders to keep you and your loved ones healthy.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-white p-1.5 rounded-full shadow-sm border border-gray-200">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                  billingCycle === "monthly" 
                    ? "bg-[#0D3D56] text-white shadow-md" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                1 Month
              </button>
              <button
                onClick={() => setBillingCycle("biannually")}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                  billingCycle === "biannually" 
                    ? "bg-[#0D3D56] text-white shadow-md" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                6 Months
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase">Save</span>
              </button>
              <button
                onClick={() => setBillingCycle("annually")}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                  billingCycle === "annually" 
                    ? "bg-[#0D3D56] text-white shadow-md" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                12 Months
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase">Best Value</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Basic Plan */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-gray-100 flex flex-col relative transition-transform hover:-translate-y-1 duration-300">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Basic Plan</h3>
                <p className="text-sm text-gray-500 mb-6">Perfect for individuals managing their own daily medications.</p>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-slate-900">
                    {plans.basic[billingCycle]}
                  </span>
                  <span className="text-gray-500 font-medium">
                    /{billingCycle === "monthly" ? "mo" : billingCycle === "biannually" ? "6mo" : "yr"}
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-8 flex-grow">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700">1 Personal Profile</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700">Unlimited WhatsApp Reminders</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700">Missed Dose Alerts</span>
                </div>
                <div className="flex items-start gap-3 opacity-50">
                  <XCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <span className="text-gray-500 line-through">Dependent Tracking</span>
                </div>
              </div>

              <Link 
                href="/register" 
                className="w-full inline-flex items-center justify-center px-6 py-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Parental Care Plan */}
            <div className="bg-[#0D3D56] rounded-3xl p-8 md:p-10 shadow-xl border border-[#1a5b7d] flex flex-col relative transition-transform hover:-translate-y-1 duration-300 overflow-hidden">
              {/* Decorative background flare */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-teal-500/20 blur-3xl pointer-events-none"></div>
              
              <div className="mb-8 relative z-10">
                <div className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                  Most Popular
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Parental Care Plan</h3>
                <p className="text-sm text-blue-200 mb-6">Designed for caretakers managing medications for dependents.</p>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-white">
                    {plans.parental[billingCycle]}
                  </span>
                  <span className="text-blue-200 font-medium">
                    /{billingCycle === "monthly" ? "mo" : billingCycle === "biannually" ? "6mo" : "yr"}
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-8 flex-grow relative z-10">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-white">Up to 2 Dependent Profiles</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-white">Unlimited WhatsApp Reminders</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-white">Missed Dose Alerts</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-white">Caretaker Notification Sync</span>
                </div>
              </div>

              <Link 
                href="/register" 
                className="w-full inline-flex items-center justify-center px-6 py-4 rounded-xl font-bold text-[#0D3D56] bg-white hover:bg-gray-50 transition-colors shadow-sm relative z-10"
              >
                Start Free Trial
              </Link>
            </div>

          </div>

          {/* Mini FAQ */}
          <div className="mt-24 max-w-3xl mx-auto border-t border-gray-200 pt-16">
            <h3 className="text-2xl font-bold text-center text-slate-900 mb-10">Frequently Asked Questions</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Can I switch plans later?</h4>
                <p className="text-sm text-gray-600">Yes, you can upgrade from Basic to Parental Care at any time directly from your dashboard.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-2">How does the free trial work?</h4>
                <p className="text-sm text-gray-600">You get 3 days of full access completely free. We don't charge you until the trial is over.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Is there a contract?</h4>
                <p className="text-sm text-gray-600">No, you can cancel your monthly, bi-annual, or annual subscription at any time without penalty.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-2">What payment methods do you accept?</h4>
                <p className="text-sm text-gray-600">We securely accept all major credit cards, debit cards, UPI, and Netbanking through our payment partners.</p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
