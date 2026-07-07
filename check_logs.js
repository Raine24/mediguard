const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLogs() {
  try {
    const logs = await prisma.messageLog.findMany({
      where: {
        channel: 'VOICE'
      },
      orderBy: {
        sentAt: 'desc'
      },
      take: 10
    });
    console.log("Recent Voice Message Logs:");
    console.table(logs);
  } catch (error) {
    console.error("Error querying DB:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLogs();
