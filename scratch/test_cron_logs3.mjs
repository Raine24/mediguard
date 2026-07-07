import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const log = await prisma.messageLog.findFirst({
    where: { scheduledFor: new Date("2026-06-24T17:24:00.000Z") }
  });
  console.log(log);
}

check().finally(() => prisma.$disconnect());
