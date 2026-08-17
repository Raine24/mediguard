const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
prisma.user.findMany({ where: { phone: { contains: '14028663825' } } })
  .then(users => console.log(users))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
