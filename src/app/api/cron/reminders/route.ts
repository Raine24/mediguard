import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppTemplate } from '@/lib/bird';
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
      where: { status: 'ACTIVE' },
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

      for (const medicine of user.medicines) {
        // TODO: Handle daysActive logic (Every Day, Weekdays, Weekends)

        for (const reminder of medicine.reminders) {
          const [remHour, remMin] = reminder.time.split(':').map(Number);
          const reminderMins = remHour * 60 + remMin;

          // Check if the reminder is due (current time is >= reminder time)
          // and we are within a 60-minute window to avoid sending yesterday's reminders at midnight
          if (currentMins >= reminderMins && currentMins < reminderMins + 60) {
            
            // Check if we already sent a reminder for this medicine within the last 60 minutes
            const recentLog = await prisma.messageLog.findFirst({
              where: {
                medicineId: medicine.id,
                type: 'REMINDER',
                sentAt: {
                  gte: new Date(Date.now() - 60 * 60 * 1000)
                }
              }
            });

            if (!recentLog) {
              const waResponse = await sendWhatsAppTemplate(
                user.phone, 
                "medical_reminder_alert", 
                [user.name, medicine.name, medicine.dosage || "1 dose"]
              );
              
              // Log the message
              await prisma.messageLog.create({
                data: {
                  userId: user.id,
                  medicineId: medicine.id,
                  type: 'REMINDER',
                  channel: 'WHATSAPP',
                  status: waResponse.status !== 'failed' ? 'DELIVERED' : 'FAILED',
                  errorReason: waResponse.status !== 'failed' ? null : waResponse.error,
                  scheduledFor: now,
                  sentAt: now,
                }
              });

              messagesSent.push({ userId: user.id, medicine: medicine.name, success: waResponse.status !== 'failed' });
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
