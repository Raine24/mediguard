import { PrismaClient } from '@prisma/client';
import { formatInTimeZone } from 'date-fns-tz';

const prisma = new PrismaClient();

async function debugCron() {
  const now = new Date();
  console.log("Current Time (UTC):", now.toISOString());

  const user = await prisma.user.findFirst({
    where: { phone: '+256754814117' },
    include: {
      medicines: {
        where: { status: 'ACTIVE' },
        include: { reminders: true }
      }
    }
  });

  if (!user) return console.log("User not found");

  const userTimezone = user.timezone || 'UTC';
  const localHour = parseInt(formatInTimeZone(now, userTimezone, 'HH'), 10);
  const localMin = parseInt(formatInTimeZone(now, userTimezone, 'mm'), 10);
  const currentMins = localHour * 60 + localMin;
  const userDateString = formatInTimeZone(now, userTimezone, 'yyyy-MM-dd');

  console.log(`User local time: ${userDateString} ${localHour}:${localMin} (Mins: ${currentMins})`);

  for (const medicine of user.medicines) {
    for (const reminder of medicine.reminders) {
      const [remHour, remMin] = reminder.time.split(':').map(Number);
      const reminderMins = remHour * 60 + remMin;

      console.log(`Checking reminder ${reminder.time} (Mins: ${reminderMins})`);
      const isDue = currentMins >= reminderMins && currentMins < reminderMins + 60;
      console.log(`  isDue: ${isDue} (currentMins ${currentMins} >= ${reminderMins} && < ${reminderMins + 60})`);

      if (isDue) {
        const expectedScheduledFor = new Date(`${userDateString}T${reminder.time}:00.000Z`);
        console.log(`  expectedScheduledFor: ${expectedScheduledFor.toISOString()}`);
        
        const recentLog = await prisma.messageLog.findFirst({
          where: {
            medicineId: medicine.id,
            type: 'REMINDER',
            scheduledFor: expectedScheduledFor
          }
        });
        console.log(`  recentLog found?`, !!recentLog);
      }
    }
  }
}

debugCron().catch(console.error).finally(() => prisma.$disconnect());
