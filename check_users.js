const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, email: true, phone: true, whatsappVerified: true, twoFactorSecret: true } });
  console.log(users.map(u => ({ id: u.id, email: u.email, phone: u.phone, whatsappVerified: u.whatsappVerified, secret: u.twoFactorSecret })));
}
main().finally(() => prisma.$disconnect());
