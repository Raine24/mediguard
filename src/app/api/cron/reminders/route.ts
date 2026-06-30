import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppTemplate } from '@/lib/bird';
import { initiateVoiceReminderCall } from '@/lib/telnyx';
import { formatInTimeZone } from 'date-fns-tz';

export async function GET(req: Request) {
  try {
    // 1. Verify cron secret to prevent unauthorized access (only in production)
    const authHeader = req.headers.get('authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Determine current time in UTC
    const now = new Date();

    // 3. Fetch all active subscriptions with users, medicines, and reminders
    const activeSubscriptions = await prisma.subscription.findMany({
      where: { 
        status: 'ACTIVE',
        OR: [
          { expiryDate: { gt: now } },
          { expiryDate: null }
        ]
      },
      include: {
        user: {
          include: {
            medicines: {
              where: { status: 'ACTIVE' },
              include: { reminders: true }
            }
          }
        }
      }
    });

    const messagesSent = [];

    for (const sub of activeSubscriptions) {
      const user = sub.user;
      if (!user.whatsappVerified) continue;

      const userTimezone = user.timezone || 'UTC';

      let localHour, localMin;
      try {
        localHour = parseInt(formatInTimeZone(now, userTimezone, 'HH'), 10);
        localMin = parseInt(formatInTimeZone(now, userTimezone, 'mm'), 10);
      } catch (err) {
        console.error(`Invalid timezone for user ${user.id}: ${userTimezone}`);
        continue;
      }

      const currentMins = localHour * 60 + localMin;

      const userDateString = formatInTimeZone(now, userTimezone, 'yyyy-MM-dd');

      for (const medicine of user.medicines) {
        // TODO: Handle daysActive logic (Every Day, Weekdays, Weekends)

        for (const reminder of medicine.reminders) {
          const [remHour, remMin] = reminder.time.split(':').map(Number);
          const reminderMins = remHour * 60 + remMin;

          // Check if the reminder is due (current time is >= reminder time)
          // and we are within a 60-minute window to avoid sending yesterday's reminders at midnight
          if (currentMins >= reminderMins && currentMins < reminderMins + 60) {
            
            // Construct a unique exact Date string for THIS reminder on THIS day
            const expectedScheduledFor = new Date(`${userDateString}T${reminder.time}:00.000Z`);

            // Check if we already sent THIS SPECIFIC reminder today
            const recentLog = await prisma.messageLog.findFirst({
              where: {
                medicineId: medicine.id,
                type: 'REMINDER',
                scheduledFor: expectedScheduledFor
              }
            });

            if (!recentLog) {
              const waResponse = await sendWhatsAppTemplate(
                user.phone, 
                "medical_alert_reminder_update", 
                [medicine.name, medicine.dosage || "1 dose"]
              );
              
              // Also trigger the Telnyx Voice Call Reminder
              const voiceResponse = await initiateVoiceReminderCall(
                user.phone,
                medicine.name,
                medicine.dosage || "1 dose"
              );
              
              // Log the WhatsApp message
              await prisma.messageLog.create({
                data: {
                  userId: user.id,
                  medicineId: medicine.id,
                  type: 'REMINDER',
                  channel: 'WHATSAPP',
                  status: waResponse.status !== 'failed' ? 'DELIVERED' : 'FAILED',
                  errorReason: waResponse.status !== 'failed' ? null : waResponse.error,
                  scheduledFor: expectedScheduledFor,
                  sentAt: now,
                }
              });

              // Log the Voice Call attempt
              await prisma.messageLog.create({
                data: {
                  userId: user.id,
                  medicineId: medicine.id,
                  type: 'REMINDER',
                  channel: 'VOICE',
                  status: voiceResponse.status !== 'failed' ? 'DELIVERED' : 'FAILED',
                  errorReason: voiceResponse.status !== 'failed' ? null : voiceResponse.error,
                  scheduledFor: expectedScheduledFor,
                  sentAt: now,
                }
              });

              messagesSent.push({ 
                userId: user.id, 
                medicine: medicine.name, 
                time: reminder.time, 
                waSuccess: waResponse.status !== 'failed',
                voiceSuccess: voiceResponse.status !== 'failed' 
              });

              // If this was a one-off SNOOZE reminder, delete it so it doesn't repeat tomorrow
              if (reminder.time.includes('SNOOZE')) {
                await prisma.reminderTime.delete({ where: { id: reminder.id } });
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, processed: messagesSent.length, details: messagesSent });
  } catch (error: any) {
    console.error('Cron Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
