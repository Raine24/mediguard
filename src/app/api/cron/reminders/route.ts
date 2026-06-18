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

      // Get current time in the user's local timezone (HH:mm format)
      let localTimeStr;
      try {
        localTimeStr = formatInTimeZone(now, userTimezone, 'HH:mm');
      } catch (err) {
        console.error(`Invalid timezone for user ${user.id}: ${userTimezone}`);
        continue;
      }

      for (const medicine of user.medicines) {
        // TODO: Handle daysActive logic (Every Day, Weekdays, Weekends)

        for (const reminder of medicine.reminders) {
          if (reminder.time === localTimeStr) {
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

    return NextResponse.json({ success: true, processed: messagesSent.length, details: messagesSent });
  } catch (error: any) {
    console.error('Cron Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
