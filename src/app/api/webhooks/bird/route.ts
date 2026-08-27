import { NextResponse } from "next/server";
import { sendWhatsAppAudio } from "@/lib/bird";
import { prisma } from "@/lib/prisma";
import { formatInTimeZone } from "date-fns-tz";

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

    // Stringify the entire message to catch text regardless of nesting
    const messageStr = JSON.stringify(message).toLowerCase();
    console.log("[Webhook] From:", formattedNumber, "| Content:", messageStr);

    // 1. Play Audio Check
    if (messageStr.includes("play audio")) {
      console.log(`[Webhook] User ${formattedNumber} requested audio. Sending...`);
      const audioUrl = "https://medicintime-f3zn.vercel.app/audio.mp3";
      const response = await sendWhatsAppAudio(formattedNumber, audioUrl);
      return NextResponse.json({ success: true, audioSent: true, result: response });
    }

    // 2. Smart Interaction Check (Taken, Skip, Snooze)
    if (messageStr.includes("taken") || messageStr.includes("skip") || messageStr.includes("snooze")) {
      const user = await prisma.user.findFirst({ where: { phone: formattedNumber } });
      
      if (user) {
        // Find the most recent REMINDER sent to this user
        const latestLog = await prisma.messageLog.findFirst({
          where: { userId: user.id, type: 'REMINDER', channel: 'WHATSAPP' },
          orderBy: { sentAt: 'desc' }
        });

        if (latestLog && latestLog.medicineId) {
          if (messageStr.includes("taken")) {
            await prisma.messageLog.update({
              where: { id: latestLog.id },
              data: { interactionStatus: 'TAKEN' }
            });
            console.log(`[Webhook] Marked medicine ${latestLog.medicineId} as TAKEN for ${formattedNumber}`);
            return NextResponse.json({ success: true, action: "TAKEN" });
          } 
          else if (messageStr.includes("skip")) {
            await prisma.messageLog.update({
              where: { id: latestLog.id },
              data: { interactionStatus: 'SKIPPED' }
            });
            console.log(`[Webhook] Marked medicine ${latestLog.medicineId} as SKIPPED for ${formattedNumber}`);
            return NextResponse.json({ success: true, action: "SKIPPED" });
          } 
          else if (messageStr.includes("snooze")) {
            const snoozeMins = 30; // default 30 mins
            const snoozedTime = new Date();
            snoozedTime.setMinutes(snoozedTime.getMinutes() + snoozeMins);

            await prisma.messageLog.update({
              where: { id: latestLog.id },
              data: { interactionStatus: 'SNOOZED', snoozedUntil: snoozedTime }
            });
            
            const userTimezone = user.timezone || 'UTC';
            const snoozedTimeString = formatInTimeZone(snoozedTime, userTimezone, 'HH:mm');
            
            // Schedule one-off snooze reminder
            await prisma.reminderTime.create({
              data: {
                medicineId: latestLog.medicineId,
                time: `${snoozedTimeString} (SNOOZE)`
              }
            });

            console.log(`[Webhook] Snoozed medicine ${latestLog.medicineId} until ${snoozedTimeString} for ${formattedNumber}`);
            return NextResponse.json({ success: true, action: "SNOOZED" });
          }
        }
      }
    }

    return NextResponse.json({ success: true, ignored: true });

  } catch (error: any) {
    console.error("[Webhook] ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
