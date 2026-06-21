require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFailures() {
  const logs = await prisma.messageLog.findMany({
    where: { 
      sentAt: { gte: new Date('2026-06-20T06:15:00Z') }
    },
    orderBy: { sentAt: 'desc' },
    include: {
      user: { select: { phone: true, name: true } },
      medicine: { select: { name: true, dosage: true } }
    }
  });
  console.log('Recent Logs:', JSON.stringify(logs, null, 2));
}

checkFailures().catch(console.error).finally(() => prisma.$disconnect());
