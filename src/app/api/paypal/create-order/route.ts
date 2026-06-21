import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createOrder } from "@/lib/paypal";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planType, interval = "monthly" } = await req.json();

    if (!["BASIC", "STANDARD", "FAMILY"].includes(planType)) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }
    
    if (!["monthly", "biannual", "annual"].includes(interval)) {
      return NextResponse.json({ error: "Invalid interval" }, { status: 400 });
    }

    const priceMap: Record<string, Record<string, string>> = {
      BASIC: {
        monthly: "2.00",
        biannual: "8.00",
        annual: "18.00"
      },
      STANDARD: {
        monthly: "4.00",
        biannual: "16.00",
        annual: "36.00"
      },
      FAMILY: {
        monthly: "8.00",
        biannual: "32.00",
        annual: "72.00"
      }
    };

    const amount = priceMap[planType][interval];

    let intervalLabel = "1 Month";
    if (interval === "biannual") intervalLabel = "6 Months";
    if (interval === "annual") intervalLabel = "1 Year";

    const { jsonResponse, httpStatusCode } = await createOrder(amount, planType, intervalLabel);
    
    return NextResponse.json(jsonResponse, { status: httpStatusCode });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json({ error: "Failed to create order." }, { status: 500 });
  }
}
