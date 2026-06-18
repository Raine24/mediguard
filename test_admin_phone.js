const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = "bakerwebsolution@gmail.com";
  const phone = "+256754814117";

  const userByEmail = await prisma.user.findUnique({ where: { email } });
  const userByPhone = await prisma.user.findUnique({ where: { phone } });

  console.log("User by email:", userByEmail ? `Role: ${userByEmail.role}, ID: ${userByEmail.id}` : "Not found");
  console.log("User by phone:", userByPhone ? `Role: ${userByPhone.role}, ID: ${userByPhone.id}, Email: ${userByPhone.email}` : "Not found");
}

main().finally(() => prisma.$disconnect());
