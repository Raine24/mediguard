"use client";

import { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, Shield, Calendar, AlertTriangle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";

type SubscriptionProps = {
  planType: string;
  status: string;
  startDate: Date | null;
  expiryDate: Date | null;
} | null;

export default function BillingClient({ subscription }: { subscription: SubscriptionProps }) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [interval, setInterval] = useState<"monthly" | "biannual" | "annual">("monthly");

  const planType = subscription?.planType || "BASIC";
  const status = subscription?.status || "INACTIVE";
  
  const handleUpgrade = (plan: string) => {
    setLoadingPlan(plan);
  };

  const createOrder = async (plan: string) => {
    try {
      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: plan, interval }),
      });

      const orderData = await response.json();
      if (orderData.id) {
        return orderData.id;
      } else {
        throw new Error(orderData.error || "Failed to create order");
      }
    } catch (error) {
      console.error(error);
      alert("Could not initiate PayPal checkout");
      setLoadingPlan(null);
    }
  };

  const onApprove = async (data: any) => {
    try {
      const response = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderID: data.orderID, planType: loadingPlan, interval }),
      });

      const orderData = await response.json();
      if (orderData.success) {
        alert("Payment successful! Your subscription is now active.");
        window.location.reload(); // Refresh to get updated DB state
      } else {
        alert("Payment capture failed. Please contact support.");
      }
    } catch (error) {
      console.error(error);
      alert("Error capturing payment.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!subscription?.startDate || !subscription?.expiryDate) return;
    
    const start = new Date(subscription.startDate).getTime();
    const end = new Date(subscription.expiryDate).getTime();
    const now = new Date().getTime();
    
    if (now > end) setProgress(100);
    else if (now < start) setProgress(0);
    else {
      const total = end - start;
      const elapsed = now - start;
      setProgress(Math.min(100, Math.max(0, (elapsed / total) * 100)));
    }
  }, [subscription]);

  const daysRemaining = subscription?.expiryDate 
    ? differenceInDays(new Date(subscription.expiryDate), new Date()) 
    : 0;

  const isExpired = status === "EXPIRED" || daysRemaining <= 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Subscription & Billing</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Manage your plan and payment details</p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
                  {planType} PLAN
                </h2>
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                  status === "ACTIVE" ? "bg-green-100 text-green-700" : 
                  status === "EXPIRED" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                }`}>
                  {status}
                </span>
              </div>
              
              <div className="text-gray-500 flex items-center gap-2 text-sm font-medium">
                <CreditCard className="w-4 h-4" />
                {planType === "BASIC" ? "$4.99 / month" : planType === "STANDARD" ? "$9.99 / month" : "$17.99 / month"}
              </div>
            </div>

            {status !== "INACTIVE" && subscription?.expiryDate && (
              <div className="md:text-right">
                <p className="text-sm text-gray-500 font-medium mb-1 flex items-center md:justify-end gap-1.5">
                  <Calendar className="w-4 h-4" /> Next billing date
                </p>
                <p className={`text-lg font-bold ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                  {format(new Date(subscription.expiryDate), "MMMM do, yyyy")}
                </p>
              </div>
            )}
            
          </div>

          {/* Progress Bar for Active Plans */}
          {status === "ACTIVE" && subscription?.expiryDate && (
            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-gray-600">Plan Duration</span>
                <span className={`text-sm font-bold ${daysRemaining <= 7 ? 'text-amber-600' : 'text-teal-600'}`}>
                  {daysRemaining} days remaining
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-1000 ${daysRemaining <= 7 ? 'bg-amber-500' : 'bg-teal-500'}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              {daysRemaining <= 7 && (
                <div className="mt-4 flex items-start gap-2 text-sm text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-100">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <p>Your subscription is expiring soon. Renew now to avoid interruption to your medication reminders.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pricing Table */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h3 className="text-xl font-bold text-gray-900">Available Plans</h3>
          
          <div className="flex bg-gray-100 p-1 rounded-lg self-start">
            <button 
              onClick={() => setInterval("monthly")}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${interval === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setInterval("biannual")}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${interval === "biannual" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              6 Months
            </button>
            <button 
              onClick={() => setInterval("annual")}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${interval === "annual" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Annually
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Basic Plan */}
          <div className={`bg-white rounded-3xl border p-6 flex flex-col ${planType === 'BASIC' ? 'border-teal-500 shadow-md relative' : 'border-gray-200'}`}>
            {planType === 'BASIC' && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                Current Plan
              </span>
            )}
            <h4 className="text-lg font-bold text-gray-900 uppercase">Basic</h4>
            <div className="my-4">
              <span className="text-4xl font-extrabold text-gray-900">
                ${interval === "monthly" ? "2.00" : interval === "biannual" ? "8.00" : "18.00"}
              </span>
              <span className="text-gray-500 font-medium">/{interval === "monthly" ? "month" : interval === "biannual" ? "6 months" : "year"}</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
                Up to 3 medicines
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
                Up to 3 reminders per day
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
                WhatsApp delivery only
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
                Basic email support
              </li>
            </ul>
            {loadingPlan === 'BASIC' ? (
              <div className="w-full mt-8 flex flex-col items-center">
                <span className="text-sm text-gray-500 mb-2 font-bold animate-pulse">Loading checkout...</span>
                <div className="w-full relative z-0">
                  <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test", currency: "USD" }}>
                    <PayPalButtons 
                      createOrder={() => createOrder('BASIC')}
                      onApprove={onApprove}
                      onCancel={() => setLoadingPlan(null)}
                      onError={() => { alert("PayPal encountered an error"); setLoadingPlan(null); }}
                      style={{ layout: "vertical", shape: "rect", color: "gold" }}
                    />
                  </PayPalScriptProvider>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => handleUpgrade('BASIC')}
                disabled={planType === 'BASIC'}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-colors ${
                  planType === 'BASIC' 
                    ? 'border-2 border-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {planType === 'BASIC' ? "Active" : "Downgrade to Basic"}
              </button>
            )}
          </div>

          {/* Standard Plan */}
          <div className={`bg-white rounded-3xl border p-6 flex flex-col ${planType === 'STANDARD' ? 'border-teal-500 shadow-md relative' : 'border-teal-100 shadow-sm relative overflow-hidden'}`}>
            {planType === 'STANDARD' ? (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                Current Plan
              </span>
            ) : planType === 'BASIC' && (
              <div className="absolute top-0 right-0 bg-teal-500 text-white text-xs font-bold py-1 px-8 translate-x-[30%] translate-y-[50%] rotate-45">
                POPULAR
              </div>
            )}
            <h4 className="text-lg font-bold text-teal-700 uppercase">Standard</h4>
            <div className="my-4">
              <span className="text-4xl font-extrabold text-gray-900">
                ${interval === "monthly" ? "4.00" : interval === "biannual" ? "16.00" : "36.00"}
              </span>
              <span className="text-gray-500 font-medium">/{interval === "monthly" ? "month" : interval === "biannual" ? "6 months" : "year"}</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-2 text-sm text-gray-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
                Up to 10 medicines
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
                Unlimited reminders per day
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
                Reliable WhatsApp delivery
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
                Priority support
              </li>
            </ul>
              {loadingPlan === 'STANDARD' ? (
                <div className="w-full mt-8 flex flex-col items-center">
                  <span className="text-sm text-gray-500 mb-2 font-bold animate-pulse">Loading secure checkout...</span>
                  <div className="w-full relative z-0">
                    <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test", currency: "USD" }}>
                      <PayPalButtons 
                        createOrder={() => createOrder('STANDARD')}
                        onApprove={onApprove}
                        onCancel={() => setLoadingPlan(null)}
                        onError={() => { alert("PayPal encountered an error"); setLoadingPlan(null); }}
                        style={{ layout: "vertical", shape: "rect", color: "gold" }}
                      />
                    </PayPalScriptProvider>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => handleUpgrade('STANDARD')}
                  className={`w-full py-3 px-4 rounded-xl font-bold transition-colors mt-8 ${
                    planType === 'STANDARD' 
                      ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' 
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                  disabled={planType === 'STANDARD'}
                >
                  {planType === 'STANDARD' ? 'Current Plan' : 'Select Standard'}
                </button>
              )}
          </div>

          {/* Family Plan */}
          <div className={`bg-gray-900 text-white rounded-3xl border p-6 flex flex-col ${planType === 'FAMILY' ? 'border-teal-500 shadow-md relative' : 'border-gray-800'}`}>
            {planType === 'FAMILY' && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                Current Plan
              </span>
            )}
            <h4 className="text-lg font-bold text-teal-400 uppercase">Caretaker</h4>
            <div className="my-4">
              <span className="text-4xl font-extrabold text-white">
                ${interval === "monthly" ? "8.00" : interval === "biannual" ? "32.00" : "72.00"}
              </span>
              <span className="text-gray-400 font-medium">/{interval === "monthly" ? "month" : interval === "biannual" ? "6 months" : "year"}</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-2 text-sm text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                Up to 4 patients (4 numbers)
              </li>
              <li className="flex items-start gap-2 text-sm text-white font-bold">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                Up to 10 medicines per person
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                Reliable WhatsApp delivery for all
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                Caretaker admin dashboard
              </li>
            </ul>
            {loadingPlan === 'FAMILY' ? (
              <div className="w-full mt-8 flex flex-col items-center">
                <span className="text-sm text-gray-500 mb-2 font-bold animate-pulse">Loading checkout...</span>
                <div className="w-full relative z-0">
                  <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test", currency: "USD" }}>
                    <PayPalButtons 
                      createOrder={() => createOrder('FAMILY')}
                      onApprove={onApprove}
                      onCancel={() => setLoadingPlan(null)}
                      onError={() => { alert("PayPal encountered an error"); setLoadingPlan(null); }}
                      style={{ layout: "vertical", shape: "rect", color: "gold" }}
                    />
                  </PayPalScriptProvider>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => handleUpgrade('FAMILY')}
                disabled={planType === 'FAMILY'}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-colors mt-8 ${
                  planType === 'FAMILY' 
                    ? 'bg-gray-800 text-teal-400 border border-gray-700 cursor-not-allowed' 
                    : 'bg-white text-gray-900 hover:bg-gray-100'
                }`}
              >
                {planType === 'FAMILY' ? "Active" : "Upgrade to Caretaker"}
              </button>
            )}
          </div>

        </div>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-gray-500 justify-center pt-8">
        <Shield className="w-4 h-4" />
        Payments are secured and encrypted.
      </div>
    </div>
  );
}
