const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fix() {
  const hashedPassword = await bcrypt.hash('Raine@22', 10);
  
  await prisma.user.update({
    where: { email: 'rayvotech@gmail.com' },
    data: {
      password: hashedPassword,
      failedLoginAttempts: 0,
      lockedUntil: null
    }
  });
  console.log("User updated and unlocked!");
}

fix().catch(console.error).finally(() => prisma.$disconnect());
