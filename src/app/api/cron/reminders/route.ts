import { NextResponse } from 'next/server';
import { sendWhatsAppTemplate } from '@/lib/bird';
import { initiateVoiceReminderCall } from '@/lib/telnyx';
import { formatInTimeZone } from 'date-fns-tz';
import { Client } from 'pg';
import { randomUUID } from 'crypto';

export async function GET(req: Request) {
  try {
    // 1. Verify cron secret to prevent unauthorized access (only in production)
    const authHeader = req.headers.get('authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const now = new Date();
    const messagesSent = [];

    // Use raw pg client instead of Prisma to bypass Neon DB connection pooling timeouts on Edge/Serverless environments
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    try {
      const query = `
        SELECT 
          u.id as "userId", u.phone, u.timezone, 
          m.id as "medicineId", m.name as "medicineName", m.dosage, 
          r.id as "reminderId", r.time as "reminderTime"
        FROM "Subscription" s
        JOIN "User" u ON s."userId" = u.id
        JOIN "Medicine" m ON m."userId" = u.id
        JOIN "ReminderTime" r ON r."medicineId" = m.id
        WHERE s.status = 'ACTIVE' 
          AND (s."expiryDate" > NOW() OR s."expiryDate" IS NULL)
          AND u."whatsappVerified" = true
          AND m.status = 'ACTIVE'
      `;
      const result = await client.query(query);

      for (const row of result.rows) {
        const { userId, phone, timezone, medicineId, medicineName, dosage, reminderId, reminderTime } = row;
        
        const userTimezone = timezone || 'UTC';
        let localHour, localMin;
        try {
          localHour = parseInt(formatInTimeZone(now, userTimezone, 'HH'), 10);
          localMin = parseInt(formatInTimeZone(now, userTimezone, 'mm'), 10);
        } catch (err) {
          console.error(`Invalid timezone for user ${userId}: ${userTimezone}`);
          continue;
        }

        const currentMins = localHour * 60 + localMin;
        const userDateString = formatInTimeZone(now, userTimezone, 'yyyy-MM-dd');

        const [remHour, remMin] = reminderTime.split(':').map(Number);
        const reminderMins = remHour * 60 + remMin;

        // Check if the reminder is due (current time is >= reminder time)
        // and we are within a 60-minute window
        if (currentMins >= reminderMins && currentMins < reminderMins + 60) {
          const expectedScheduledFor = new Date(`${userDateString}T${reminderTime}:00.000Z`);

          // Check if we already sent THIS SPECIFIC reminder today
          const checkLogQuery = `
            SELECT id FROM "MessageLog" 
            WHERE "medicineId" = $1 AND type = 'REMINDER' AND "scheduledFor" = $2
            LIMIT 1
          `;
          const logRes = await client.query(checkLogQuery, [medicineId, expectedScheduledFor]);

          if (logRes.rowCount === 0) {
            const waResponse = await sendWhatsAppTemplate(
              phone, 
              "medical_alert_reminder_update", 
              [medicineName, dosage || "1 dose"]
            );
            
            const voiceResponse = await initiateVoiceReminderCall(
              phone,
              medicineName,
              dosage || "1 dose"
            );
            
            // Log the WhatsApp message
            await client.query(`
              INSERT INTO "MessageLog" (id, "userId", "medicineId", type, channel, status, "errorReason", "scheduledFor", "sentAt")
              VALUES ($1, $2, $3, 'REMINDER', 'WHATSAPP', $4, $5, $6, $7)
            `, [
              randomUUID(), 
              userId, 
              medicineId, 
              waResponse.status !== 'failed' ? 'DELIVERED' : 'FAILED', 
              waResponse.status !== 'failed' ? null : waResponse.error, 
              expectedScheduledFor, 
              now
            ]);

            // Log the Voice Call attempt
            await client.query(`
              INSERT INTO "MessageLog" (id, "userId", "medicineId", type, channel, status, "errorReason", "scheduledFor", "sentAt")
              VALUES ($1, $2, $3, 'REMINDER', 'VOICE', $4, $5, $6, $7)
            `, [
              randomUUID(), 
              userId, 
              medicineId, 
              voiceResponse.status !== 'failed' ? 'DELIVERED' : 'FAILED', 
              voiceResponse.status !== 'failed' ? null : voiceResponse.error, 
              expectedScheduledFor, 
              now
            ]);

            messagesSent.push({ 
              userId, 
              medicine: medicineName, 
              time: reminderTime, 
              waSuccess: waResponse.status !== 'failed',
              voiceSuccess: voiceResponse.status !== 'failed' 
            });

            // If this was a one-off SNOOZE reminder, delete it so it doesn't repeat tomorrow
            if (reminderTime.includes('SNOOZE')) {
              await client.query(`DELETE FROM "ReminderTime" WHERE id = $1`, [reminderId]);
            }
          }
        }
      }
    } finally {
      await client.end();
    }

    return NextResponse.json({ success: true, processed: messagesSent.length, details: messagesSent });
  } catch (error: any) {
    console.error('Cron Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
