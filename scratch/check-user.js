const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  let user;
  for (let i = 0; i < 5; i++) {
    try {
      user = await prisma.user.findUnique({ where: { email: 'rayvotech@gmail.com' }, include: { affiliateProfile: true } });
      break;
    } catch (e) {
      console.log('Retry...', e.message);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  console.log(JSON.stringify(user, null, 2));
}
run().finally(() => prisma.$disconnect());
