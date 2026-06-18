import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'bwanikabaker23@gmail.com' },
    include: { subscription: true }
  });

  if (!user) {
    console.log('User not found!');
    return;
  }

  const expiry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  if (user.subscription) {
    const updated = await prisma.subscription.update({
      where: { id: user.subscription.id },
      data: {
        status: 'ACTIVE',
        startDate: new Date(),
        expiryDate: expiry
      }
    });
    console.log('Updated subscription:', updated);
  } else {
    const created = await prisma.subscription.create({
      data: {
        userId: user.id,
        planType: 'FAMILY', // Giving them the best plan
        status: 'ACTIVE',
        startDate: new Date(),
        expiryDate: expiry
      }
    });
    console.log('Created subscription:', created);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
