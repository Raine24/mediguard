import { NextResponse } from "next/server";
import { sendWhatsAppAudio } from "@/lib/bird";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log("[Webhook] Received payload:", JSON.stringify(payload).substring(0, 500));

    if (!payload) {
      return NextResponse.json({ success: false, error: "Empty payload" });
    }

    // Bird sends the message object directly at the top level,
    // OR it may wrap it under payload.message or payload.data — handle all cases
    const message = payload.message || payload.data || payload;

    // Only process incoming messages
    if (message.direction !== "incoming") {
      console.log("[Webhook] Skipping non-incoming message, direction:", message.direction);
      return NextResponse.json({ success: true, ignored: true });
    }

    // Extract the sender's phone number
    // Bird uses sender.contact (singular object) for inbound messages
    const fromNumber =
      message.sender?.contact?.identifierValue ||
      message.sender?.contacts?.[0]?.identifierValue ||
      message.meta?.extraInformation?.phonenumber;

    if (!fromNumber) {
      console.log("[Webhook] Could not extract sender phone. Sender:", JSON.stringify(message.sender));
      return NextResponse.json({ success: false, error: "Missing sender" });
    }

    // Ensure phone number has + prefix
    const formattedNumber = fromNumber.startsWith("+") ? fromNumber : `+${fromNumber}`;

    // Stringify the entire message to catch "Play Audio" regardless of nesting
    const messageStr = JSON.stringify(message).toLowerCase();
    console.log("[Webhook] From:", formattedNumber, "| Contains 'play audio':", messageStr.includes("play audio"));

    // Check if the user tapped "Play Audio"
    if (messageStr.includes("play audio")) {
      console.log(`[Webhook] User ${formattedNumber} requested audio. Sending...`);

      const audioUrl = "https://mediguard-f3zn.vercel.app/audio.mp3";

      // Send the audio file back
      const response = await sendWhatsAppAudio(formattedNumber, audioUrl);

      console.log("[Webhook] Audio send result:", JSON.stringify(response));

      return NextResponse.json({ success: true, audioSent: true, result: response });
    }

    return NextResponse.json({ success: true, ignored: true });

  } catch (error: any) {
    console.error("[Webhook] ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
