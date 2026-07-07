import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkLogs() {
  const user = await prisma.user.findFirst({ where: { phone: '+256754814117' } });
  if (!user) return;
  
  const logs = await prisma.messageLog.findMany({
    where: { userId: user.id },
    orderBy: { sentAt: 'desc' },
    take: 10
  });

  console.log("Recent logs for Bwanika Baker:");
  console.dir(logs, { depth: null });
}

checkLogs().catch(console.error).finally(() => prisma.$disconnect());
