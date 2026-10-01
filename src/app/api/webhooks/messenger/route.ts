import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendMessengerMessage } from '@/lib/messenger';

// Verify Webhook for Meta API
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const VERIFY_TOKEN = process.env.MESSENGER_VERIFY_TOKEN || 'medicintime_messenger_secret';

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      return new NextResponse(challenge, { status: 200 });
    } else {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  return new NextResponse('Bad Request', { status: 400 });
}

// Handle Inbound Messenger Events
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.object === 'page') {
      for (const entry of body.entry) {
        const webhookEvent = entry.messaging[0];
        const senderPsid = webhookEvent.sender.id;

        // Check for messaging_optins or postback with a ref (e.g. from m.me link)
        let refParam = null;
        if (webhookEvent.optin && webhookEvent.optin.ref) {
          refParam = webhookEvent.optin.ref;
        } else if (webhookEvent.postback && webhookEvent.postback.referral && webhookEvent.postback.referral.ref) {
          refParam = webhookEvent.postback.referral.ref;
        } else if (webhookEvent.referral && webhookEvent.referral.ref) {
          refParam = webhookEvent.referral.ref;
        }

        // If we got a user ID ref, link the account
        if (refParam) {
          const userId = refParam;
          await prisma.user.update({
            where: { id: userId },
            data: { messengerId: senderPsid }
          });
          
          // Optionally, send a welcome message back via Graph API
          await sendMessengerMessage(senderPsid, "You're all set! MedicINtime will now send your reminders here.");
        } 
        
        // Handle incoming text replies (Taken, Skip, Snooze)
        else if (webhookEvent.message && webhookEvent.message.text) {
          const text = webhookEvent.message.text.toLowerCase().trim();
          
          // Look up user by senderPsid
          const user = await prisma.user.findUnique({
            where: { messengerId: senderPsid }
          });

          if (user) {
            // Find most recent pending or sent reminder
            const recentLog = await prisma.messageLog.findFirst({
              where: { 
                userId: user.id,
                status: 'SENT'
              },
              orderBy: { sentAt: 'desc' }
            });

            if (recentLog) {
              if (text.includes("taken")) {
                await prisma.messageLog.update({
                  where: { id: recentLog.id },
                  data: { interactionStatus: 'TAKEN' }
                });
                await sendMessengerMessage(senderPsid, "Great! Logged as Taken.");
              } else if (text.includes("skip")) {
                await prisma.messageLog.update({
                  where: { id: recentLog.id },
                  data: { interactionStatus: 'SKIPPED' }
                });
                await sendMessengerMessage(senderPsid, "Noted. Logged as Skipped.");
              } else if (text.includes("snooze")) {
                const snoozeUntil = new Date(Date.now() + 30 * 60000); // +30 mins
                await prisma.messageLog.update({
                  where: { id: recentLog.id },
                  data: { interactionStatus: 'SNOOZED', snoozedUntil: snoozeUntil }
                });
                await sendMessengerMessage(senderPsid, "Snoozed! I'll remind you again in 30 minutes.");
              }
            }
          }
        }
      }

      return new NextResponse('EVENT_RECEIVED', { status: 200 });
    } else {
      return new NextResponse('Not Found', { status: 404 });
    }
  } catch (error) {
    console.error('Error handling Messenger webhook:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
