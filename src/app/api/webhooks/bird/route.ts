import { NextResponse } from "next/server";
import { sendWhatsAppAudio } from "@/lib/bird";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Basic validation
    if (!payload || !payload.message) {
      return NextResponse.json({ success: false, error: "Invalid payload" });
    }

    const message = payload.message;

    // Only process incoming messages
    if (message.direction !== "incoming") {
      return NextResponse.json({ success: true, ignored: true });
    }

    // Extract the sender's phone number
    const fromNumber = message.sender?.contacts?.[0]?.identifierValue;
    if (!fromNumber) {
      return NextResponse.json({ success: false, error: "Missing sender" });
    }

    // Extract message text (could be in text.text or interactive.button_reply.title etc.)
    const bodyStr = JSON.stringify(message.body || {}).toLowerCase();
    
    // Check if the user tapped "Play Audio"
    if (bodyStr.includes("play audio")) {
      console.log(`[Webhook] User ${fromNumber} requested audio.`);

      // The exact filename placed in the public folder
      const audioFileName = "audio.mp3";
      
      // We need a stable absolute URL. If NEXT_PUBLIC_APP_URL is not set, fallback to vercel URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://mediguard-f3zn.vercel.app");
      const audioUrl = `${baseUrl}/${audioFileName}`;

      // Send the audio file back!
      const response = await sendWhatsAppAudio(fromNumber, audioUrl);
      
      console.log("[Webhook] Audio send response:", response);

      return NextResponse.json({ success: true, audioSent: true });
    }

    return NextResponse.json({ success: true, ignored: true });

  } catch (error: any) {
    console.error("Bird Webhook Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
