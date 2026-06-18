import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('12345bwanika', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'bwanikabaker23@gmail.com' },
    update: { 
      role: 'ADMIN', 
      password: hashedPassword 
    },
    create: {
      email: 'bwanikabaker23@gmail.com',
      password: hashedPassword,
      name: 'Baker Bwanika',
      phone: '+256700000000',
      role: 'ADMIN',
      timezone: 'Africa/Kampala'
    }
  });

  console.log('Successfully created admin user:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
