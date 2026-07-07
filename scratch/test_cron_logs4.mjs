import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findFirst({ where: { phone: '+256754814117' } });
  
  const logs = await prisma.messageLog.findMany({
    where: { 
      userId: user.id,
      sentAt: { gte: new Date('2026-06-23T00:00:00Z') }
    },
    orderBy: { sentAt: 'desc' }
  });
  console.dir(logs, { depth: null });
}

check().finally(() => prisma.$disconnect());
