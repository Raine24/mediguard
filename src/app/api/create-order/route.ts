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
    let { amount, currency = "INR", receipt, planType, interval } = body;

    // If amount is not passed in paise, calculate based on planType & interval
    if (amount === undefined || amount === null) {
      if (planType) {
        const basePrices: Record<string, Record<string, number>> = {
          BASIC: { monthly: 2.00, biannual: 8.00, annual: 18.00 },
          STANDARD: { monthly: 4.00, biannual: 16.00, annual: 36.00 },
          FAMILY: { monthly: 8.00, biannual: 32.00, annual: 72.00 },
        };
        const priceInUnits = basePrices[planType]?.[interval || "monthly"] || 2.00;
        // Convert to paise (min 100 paise)
        amount = Math.round(priceInUnits * 100);
      }
    }

    if (amount === undefined || amount === null || typeof amount !== "number" || amount < 100) {
      return NextResponse.json(
        { error: "Amount is required and must be at least 100 paise (1 INR)" },
        { status: 400 }
      );
    }

    const options = {
      amount: Math.round(amount),
      currency: currency || "INR",
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
