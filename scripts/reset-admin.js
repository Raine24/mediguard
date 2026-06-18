const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  let admin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' }
  });

  const password = 'SuperSecretPassword123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  if (admin) {
    admin = await prisma.user.update({
      where: { id: admin.id },
      data: { password: hashedPassword }
    });
    console.log(`Updated existing SUPER_ADMIN: ${admin.email}`);
  } else {
    admin = await prisma.user.create({
      data: {
        email: 'admin@mediguard.com',
        password: hashedPassword,
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
        phone: '+1234567890'
      }
    });
    console.log(`Created new SUPER_ADMIN: ${admin.email}`);
  }
  console.log(`Password: ${password}`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
