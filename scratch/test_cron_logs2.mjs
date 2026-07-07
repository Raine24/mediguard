import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findFirst({ where: { phone: '+256754814117' } });
  console.log("User email:", user.email);

  const logs = await prisma.messageLog.findMany({
    where: { userId: user.id },
    orderBy: { sentAt: 'desc' },
    take: 5
  });
  console.log("Logs:", logs);
}

check().finally(() => prisma.$disconnect());
