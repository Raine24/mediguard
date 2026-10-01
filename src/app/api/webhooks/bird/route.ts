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
    const identifierValue =
      message.sender?.contact?.identifierValue ||
      message.sender?.contacts?.[0]?.identifierValue ||
      message.meta?.extraInformation?.phonenumber;

    if (!identifierValue) {
      console.log("[Webhook] Could not extract sender ID. Sender:", JSON.stringify(message.sender));
      return NextResponse.json({ success: false, error: "Missing sender" });
    }

    // Ensure phone number has + prefix if it looks like a phone
    const formattedSenderId = (identifierValue.match(/^\d+$/) && identifierValue.length >= 10) 
      ? (identifierValue.startsWith("+") ? identifierValue : `+${identifierValue}`)
      : identifierValue; // PSIDs stay as is

    // Stringify the entire message to catch text regardless of nesting
    const messageStr = JSON.stringify(message).toLowerCase();
    console.log("[Webhook] From:", formattedSenderId, "| Content:", messageStr);

    // 0. Handle Messenger Opt-in via m.me?ref=USER_ID
    // When using an m.me link, Bird often passes the ref payload inside the message text or postback
    const refMatch = messageStr.match(/(?:ref[=:]|payload[":])([a-z0-9-]{20,})/i); // UUID match for user.id
    if (refMatch && refMatch[1] && formattedSenderId.length > 13) {
      const userId = refMatch[1];
      console.log(`[Webhook] Linking Messenger PSID ${formattedSenderId} to User ${userId}`);
      await prisma.user.update({
        where: { id: userId },
        data: { messengerId: formattedSenderId }
      });
      // Optionally reply via Bird Messenger API here (but for simplicity we just link it)
      return NextResponse.json({ success: true, linked: true });
    }

    // 1. Play Audio Check
    if (messageStr.includes("play audio")) {
      console.log(`[Webhook] User ${formattedSenderId} requested audio. Sending...`);
      const audioUrl = "https://medicintime-f3zn.vercel.app/audio.mp3";
      const response = await sendWhatsAppAudio(formattedSenderId, audioUrl);
      return NextResponse.json({ success: true, audioSent: true, result: response });
    }

    // 2. Smart Interaction Check (Taken, Skip, Snooze)
    if (messageStr.includes("taken") || messageStr.includes("skip") || messageStr.includes("snooze")) {
      // Find user by either phone OR messengerId
      const user = await prisma.user.findFirst({ 
        where: { 
          OR: [
            { phone: formattedSenderId },
            { messengerId: formattedSenderId }
          ]
        } 
      });
      
      if (user) {
        // Find the most recent REMINDER sent to this user on ANY channel
        const latestLog = await prisma.messageLog.findFirst({
          where: { userId: user.id, type: 'REMINDER' },
          orderBy: { sentAt: 'desc' }
        });

        if (latestLog && latestLog.medicineId) {
          if (messageStr.includes("taken")) {
            await prisma.messageLog.update({
              where: { id: latestLog.id },
              data: { interactionStatus: 'TAKEN' }
            });
            console.log(`[Webhook] Marked medicine ${latestLog.medicineId} as TAKEN for ${formattedSenderId}`);
            return NextResponse.json({ success: true, action: "TAKEN" });
          } 
          else if (messageStr.includes("skip")) {
            await prisma.messageLog.update({
              where: { id: latestLog.id },
              data: { interactionStatus: 'SKIPPED' }
            });
            console.log(`[Webhook] Marked medicine ${latestLog.medicineId} as SKIPPED for ${formattedSenderId}`);
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

            console.log(`[Webhook] Snoozed medicine ${latestLog.medicineId} until ${snoozedTimeString} for ${formattedSenderId}`);
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
