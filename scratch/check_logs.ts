import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.messageLog.findMany({
    orderBy: { sentAt: 'desc' },
    take: 5
  });
  console.log(logs);
}
main().catch(console.error).finally(() => prisma.$disconnect());
