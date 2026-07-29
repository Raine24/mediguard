"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";

interface RazorpayCheckoutProps {
  planType: string;
  interval: "monthly" | "biannual" | "annual";
  amountInPaise?: number;
  buttonText?: string;
  className?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function RazorpayCheckout({
  planType,
  interval,
  amountInPaise,
  buttonText = "Pay with Razorpay",
  className = "",
  onSuccess,
  onCancel,
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);

  const loadScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const isLoaded = await loadScript();

      if (!isLoaded) {
        alert("Failed to load Razorpay SDK. Please check your internet connection.");
        setLoading(false);
        return;
      }

      // 1. Create order
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType,
          interval,
          amount: amountInPaise,
        }),
      });

      const data = await res.json();

      if (!res.ok || (!data.order_id && !data.id)) {
        alert(data.error || "Failed to create payment order.");
        setLoading(false);
        return;
      }

      const orderId = data.order_id || data.id;

      // 2. Configure Razorpay modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_TJNiivg7TFetFD",
        amount: data.amount,
        currency: data.currency || "USD",
        name: "MedicINtime",
        description: `${planType} Plan (${interval})`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            // 3. Verify Payment
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                planType,
                interval,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              alert("Payment successful! Your subscription is now active.");
              if (onSuccess) {
                onSuccess();
              } else {
                window.location.reload();
              }
            } else {
              alert(verifyData.error || "Payment verification failed.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Error verifying payment.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            console.log("User cancelled Razorpay checkout modal");
            setLoading(false);
            if (onCancel) onCancel();
          },
        },
        theme: {
          color: "#0D9488",
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);

      razorpayInstance.on("payment.failed", function (response: any) {
        console.error("Razorpay Payment Failed:", response.error);
        alert(`Payment Failed: ${response.error.description || response.error.reason || "Declined"}`);
        setLoading(false);
      });

      razorpayInstance.open();
    } catch (err) {
      console.error("Razorpay Checkout Exception:", err);
      alert("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={loading}
      className={
        className ||
        "w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
      }
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4" />
          <span>{buttonText}</span>
        </>
      )}
    </button>
  );
}
