const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { authenticator } = require('otplib');

const prisma = new PrismaClient();

async function main() {
  const email = 'superadmin@mediguard.com';
  const password = '12345superadmin';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const secret = authenticator.generateSecret();
  const token = authenticator.generate(secret);

  const user = await prisma.user.upsert({
    where: { email },
    update: { 
      role: 'SUPER_ADMIN', 
      password: hashedPassword,
      twoFactorSecret: secret,
      twoFactorEnabled: true,
    },
    create: {
      email,
      password: hashedPassword,
      name: 'Super Admin',
      phone: '+10000000000',
      role: 'SUPER_ADMIN',
      timezone: 'UTC',
      twoFactorSecret: secret,
      twoFactorEnabled: true,
      whatsappVerified: true,
    }
  });

  console.log('=============================================');
  console.log('✅ Super Admin Account created successfully!');
  console.log('=============================================');
  console.log('Email:      ', email);
  console.log('Password:   ', password);
  console.log('2FA Secret: ', secret);
  console.log('Current 2FA:', token);
  console.log('=============================================');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
