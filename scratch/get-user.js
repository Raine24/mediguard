const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findFirst();
  if (user) {
    console.log(user.email);
  } else {
    console.log("No users found");
  }
  await prisma.$disconnect();
}

run();
