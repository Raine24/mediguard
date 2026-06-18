const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log("Checking DB...");
  const logs = await prisma.messageLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { user: { select: { name: true, phone: true } } }
  });
  console.log("Latest Message Logs:", JSON.stringify(logs, null, 2));

  const reminders = await prisma.reminder.findMany({
    take: 5,
    include: { medicine: { select: { name: true, user: { select: { id: true, name: true } } } } }
  });
  console.log("Sample Reminders:", JSON.stringify(reminders, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
