import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  let retries = 3;
  while (retries > 0) {
    try {
      console.log('Attempting to connect and update password...');
      const hashedPassword = await bcrypt.hash('Medicinetime@2026#!@', 10);
      
      const admin = await prisma.user.update({
        where: { email: 'admin@medicintime.com' },
        data: { password: hashedPassword }
      });
      
      console.log('✅ Password successfully reset for:', admin.email);
      break;
    } catch (e: any) {
      console.error('Error:', e.message);
      retries--;
      if (retries === 0) {
        console.error('Failed after retries.');
        process.exit(1);
      }
      console.log('Retrying in 2 seconds...');
      await new Promise(res => setTimeout(res, 2000));
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect().then(() => process.exit(0)));
