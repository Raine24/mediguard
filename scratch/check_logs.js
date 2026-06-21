require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLogs() {
  const logs = await prisma.messageLog.findMany({
    take: 10,
    orderBy: { sentAt: 'desc' },
    include: {
      user: { select: { phone: true, name: true } },
      medicine: { select: { name: true, dosage: true } }
    }
  });
  console.log(JSON.stringify(logs, null, 2));
}

checkLogs().catch(console.error).finally(() => prisma.$disconnect());
