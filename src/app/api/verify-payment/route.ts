import { NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      payment_id,
      order_id,
      signature,
      planType = "STANDARD",
      interval = "monthly",
    } = body;

    const actualPaymentId = payment_id || razorpay_payment_id;
    const actualOrderId = order_id || razorpay_order_id;
    const actualSignature = signature || razorpay_signature;

    if (!actualPaymentId || !actualOrderId || !actualSignature) {
      return NextResponse.json(
        { error: "Missing required parameters: razorpay_payment_id, razorpay_order_id, and razorpay_signature" },
        { status: 400 }
      );
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return NextResponse.json({ error: "Razorpay secret key not configured" }, { status: 500 });
    }

    // Verify HMAC SHA256 signature: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const generatedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(`${actualOrderId}|${actualPaymentId}`)
      .digest("hex");

    if (generatedSignature !== actualSignature) {
      return NextResponse.json(
        { error: "Payment verification failed: Signature mismatch", success: false },
        { status: 400 }
      );
    }

    // Signature verified!
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      const billingCycle = interval === 'biannual' ? 'BIANNUAL' : interval === 'annual' ? 'ANNUAL' : 'MONTHLY';
      let daysToAdd = 30;
      if (billingCycle === 'BIANNUAL') daysToAdd = 180;
      if (billingCycle === 'ANNUAL') daysToAdd = 365;

      const currentSub = await prisma.subscription.findUnique({ where: { userId: session.user.id } });
      const baseDate = currentSub?.expiryDate && currentSub.expiryDate > new Date() ? currentSub.expiryDate : new Date();
      const newExpiryDate = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

      // 1. Update Subscription
      await prisma.subscription.upsert({
        where: { userId: session.user.id },
        update: {
          planType,
          status: "ACTIVE",
          expiryDate: newExpiryDate
        },
        create: {
          userId: session.user.id,
          planType,
          status: "ACTIVE",
          expiryDate: newExpiryDate
        }
      });

      // 2. Record Payment Transaction
      const basePrices: Record<string, Record<string, number>> = {
        BASIC: { monthly: 1.75, biannual: 7.00, annual: 15.75 },
        STANDARD: { monthly: 9.00, biannual: 36.00, annual: 81.00 },
        FAMILY: { monthly: 16.50, biannual: 66.00, annual: 148.50 },
      };
      const amountPaid = basePrices[planType]?.[interval] || 9.00;

      await prisma.paymentTransaction.create({
        data: {
          userId: session.user.id,
          planType,
          billingCycle,
          amount: amountPaid,
          method: "Razorpay",
          gatewayId: actualPaymentId,
          status: "SUCCEEDED"
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      payment_id: actualPaymentId,
      order_id: actualOrderId,
    });
  } catch (error: any) {
    console.error("Razorpay payment verification error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during verification", success: false },
      { status: 500 }
    );
  }
}
