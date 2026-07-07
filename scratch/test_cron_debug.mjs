import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkCronLogic() {
  const activeSubscriptions = await prisma.subscription.findMany({
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

  console.log(`Found ${activeSubscriptions.length} ACTIVE subscriptions`);

  for (const sub of activeSubscriptions) {
    const user = sub.user;
    console.log(`\nUser: ${user.name} (${user.phone})`);
    console.log(`- whatsappVerified: ${user.whatsappVerified}`);
    console.log(`- timezone: ${user.timezone}`);
    console.log(`- medicines count: ${user.medicines.length}`);

    for (const med of user.medicines) {
      console.log(`  Medicine: ${med.name}`);
      console.log(`  Reminders:`, med.reminders.map(r => r.time));
    }
  }
}

checkCronLogic().catch(console.error).finally(() => prisma.$disconnect());
