import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { captureOrder } from "@/lib/paypal";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderID, planType } = await req.json();

    if (!orderID || !planType) {
      return NextResponse.json({ error: "Missing orderID or planType" }, { status: 400 });
    }

    const { jsonResponse, httpStatusCode } = await captureOrder(orderID);

    if (httpStatusCode >= 200 && httpStatusCode < 300 && jsonResponse.status === "COMPLETED") {
      const capturedAmount = jsonResponse.purchase_units[0]?.payments?.captures[0]?.amount?.value || "0";

      // Extend subscription by 30 days
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + 30);

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
      await prisma.paymentTransaction.create({
        data: {
          userId: session.user.id,
          planType,
          billingCycle: "MONTHLY",
          amount: parseFloat(capturedAmount),
          method: "PayPal",
          gatewayId: orderID,
          status: "SUCCEEDED"
        }
      });

      return NextResponse.json({ success: true, jsonResponse }, { status: 200 });
    }

    return NextResponse.json(jsonResponse, { status: httpStatusCode });
  } catch (error) {
    console.error("Failed to capture order:", error);
    return NextResponse.json({ error: "Failed to capture order." }, { status: 500 });
  }
}
