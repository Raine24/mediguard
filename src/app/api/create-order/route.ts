import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return NextResponse.json({ error: "Razorpay credentials not configured" }, { status: 401 });
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const body = await req.json().catch(() => ({}));
    let { amount, currency = "USD", receipt, planType, interval } = body;

    // Convert planType & interval to price if amount is not explicitly provided
    if (amount === undefined || amount === null) {
      if (planType) {
        const basePricesUSD: Record<string, Record<string, number>> = {
          BASIC: { monthly: 2.00, biannual: 11.00, annual: 20.00 },
          STANDARD: { monthly: 5.00, biannual: 20.00, annual: 45.00 },
          FAMILY: { monthly: 12.00, biannual: 48.00, annual: 108.00 },
        };
        const usdPrice = basePricesUSD[planType]?.[interval || "monthly"] || 2.00;

        if (currency.toUpperCase() === "INR") {
          // Convert USD to INR (1 USD ≈ 85 INR) in paise (1 INR = 100 paise)
          const exchangeRateINR = 85;
          amount = Math.round(usdPrice * exchangeRateINR * 100);
        } else {
          // USD in cents (1 USD = 100 cents)
          amount = Math.round(usdPrice * 100);
        }
      }
    }

    const targetCurrency = (currency || "USD").toUpperCase();

    if (amount === undefined || amount === null || typeof amount !== "number" || amount < 50) {
      return NextResponse.json(
        { error: "Amount is required and must be at least 50 cents (or 100 paise for INR)" },
        { status: 400 }
      );
    }

    const options = {
      amount: Math.round(amount),
      currency: targetCurrency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });
  } catch (error: any) {
    console.error("Razorpay create-order error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}
