require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function checkReminders() {
  const activeSubs = await prisma.subscription.findMany({
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
  console.log(JSON.stringify(activeSubs.map(s => ({
    user: s.user.name,
    phone: s.user.phone,
    verified: s.user.whatsappVerified,
    tz: s.user.timezone,
    medicines: s.user.medicines.map(m => ({ name: m.name, reminders: m.reminders.map(r => r.time) }))
  })), null, 2));
}
checkReminders().catch(console.error).finally(() => prisma.$disconnect());
