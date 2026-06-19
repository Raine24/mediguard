import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppMessage } from '@/lib/bird';
import { formatInTimeZone } from 'date-fns-tz';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payloadString = JSON.stringify(body).toLowerCase();
    
    // Extract intent
    let intent: 'SNOOZE' | 'STOP' | null = null;
    if (payloadString.includes('"snooze"')) {
      intent = 'SNOOZE';
    } else if (payloadString.includes('"stop"')) {
      intent = 'STOP';
    }

    if (!intent) {
      return NextResponse.json({ success: true, message: 'Ignored: No known intent' });
    }

    // Attempt to extract phone number (sender)
    // Bird payload variations: 
    // 1. body.contact.identifierValue
    // 2. body.message.from
    // 3. body.from
    let senderPhone = body?.contact?.identifierValue 
                   || body?.message?.from 
                   || body?.from;

    if (!senderPhone) {
      // Deep search for a phone-like string in keys like 'from', 'identifierValue', 'phonenumber'
      const match = payloadString.match(/"(?:from|identifiervalue|phonenumber)":"(\+?\d{8,15})"/i);
      if (match && match[1]) {
        senderPhone = match[1];
      }
    }

    if (!senderPhone) {
      console.warn("Bird Webhook: Could not extract sender phone", body);
      return NextResponse.json({ success: true, message: 'Could not identify sender' });
    }

    // Normalize phone
    let user = await prisma.user.findFirst({
      where: { phone: senderPhone }
    });

    if (!user && !senderPhone.startsWith('+')) {
      user = await prisma.user.findFirst({ where: { phone: `+${senderPhone}` } });
    }
    if (!user && senderPhone.startsWith('+')) {
      user = await prisma.user.findFirst({ where: { phone: senderPhone.replace('+', '') } });
    }

    if (!user) {
      console.warn("Bird Webhook: User not found for phone", senderPhone);
      return NextResponse.json({ success: true, message: 'User not found' });
    }

    // Find the most recent message log to know WHICH medicine they are replying to
    const lastLog = await prisma.messageLog.findFirst({
      where: { 
        userId: user.id,
        type: 'REMINDER',
        medicineId: { not: null }
      },
      orderBy: { sentAt: 'desc' },
      include: { medicine: true }
    });

    if (!lastLog || !lastLog.medicine) {
      return NextResponse.json({ success: true, message: 'No recent medicine context found' });
    }

    const medicine = lastLog.medicine;

    if (intent === 'STOP') {
      // Pause the medicine
      await prisma.medicine.update({
        where: { id: medicine.id },
        data: { status: 'PAUSED' }
      });

      await sendWhatsAppMessage(
        user.phone, 
        `Okay! Reminders for ${medicine.name} have been PAUSED. You can resume them anytime from your dashboard.`
      );

      return NextResponse.json({ success: true, action: 'STOP', medicineId: medicine.id });
    }

    if (intent === 'SNOOZE') {
      // Schedule for 15 mins in the future by adding a temporary ReminderTime.
      // The cron job runs continuously. When it hits the new time, it will send the reminder.
      const snoozeDate = new Date(Date.now() + 15 * 60000);
      
      const userTimezone = user.timezone || 'UTC';
      let snoozeTimeStr;
      try {
        snoozeTimeStr = formatInTimeZone(snoozeDate, userTimezone, 'HH:mm');
      } catch (e) {
        snoozeTimeStr = formatInTimeZone(snoozeDate, 'UTC', 'HH:mm');
      }

      await prisma.reminderTime.create({
        data: {
          medicineId: medicine.id,
          time: `${snoozeTimeStr}:SNOOZE`
        }
      });

      await sendWhatsAppMessage(
        user.phone, 
        `Got it! I will remind you again to take ${medicine.name} in 15 minutes. ⏰`
      );

      return NextResponse.json({ success: true, action: 'SNOOZE', scheduled: snoozeTimeStr });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Bird Webhook Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
