import { PrismaClient } from "@prisma/client";
import { subDays, subHours, subMinutes } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Mock Data for Admin Dashboard...");

  // 1. Create a few users
  console.log("Creating Users...");
  const userA = await prisma.user.create({
      data: {
        role: "PATIENT",
        name: "Mock Patient A",
        email: "patient.a@example.com",
        password: "mockpassword",
        phone: "+15550000001",
        createdAt: new Date(), // Today
        subscription: {
          create: {
            planType: "BASIC",
            status: "ACTIVE",
            expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // Expiring in 5 days
          }
        }
      }
    });

  const userB = await prisma.user.create({
      data: {
        role: "PATIENT",
        name: "Mock Patient B",
        email: "patient.b@example.com",
        password: "mockpassword",
        phone: "+15550000002",
        createdAt: subDays(new Date(), 3), // 3 days ago (no medicines setup test)
        subscription: {
          create: {
            planType: "FAMILY",
            status: "ACTIVE",
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        }
      }
    });

  // 2. Add some medicines for User A (User B gets none for the alert trigger)
  console.log("Creating Medicines...");
  const med = await prisma.medicine.create({
    data: {
      userId: userA.id,
      name: "Mock Amlodipine 5mg",
      status: "ACTIVE"
    }
  });

  // 3. Create Payment Transactions
  console.log("Creating Payments...");
  await prisma.paymentTransaction.createMany({
    data: [
      {
        userId: userA.id,
        planType: "BASIC",
        billingCycle: "MONTHLY",
        amount: 4.99,
        method: "Visa 1234",
        status: "SUCCEEDED",
        createdAt: new Date()
      },
      {
        userId: userB.id,
        planType: "FAMILY",
        billingCycle: "MONTHLY",
        amount: 17.99,
        method: "MasterCard 5678",
        status: "FAILED", // For alert trigger
        createdAt: subHours(new Date(), 2)
      }
    ]
  });

  // 4. Create Message Logs
  console.log("Creating Message Logs...");
  await prisma.messageLog.createMany({
    data: [
      {
        userId: userA.id,
        medicineId: med.id,
        type: "REMINDER",
        channel: "WHATSAPP",
        status: "DELIVERED",
        sentAt: subMinutes(new Date(), 10)
      },
      {
        userId: userA.id,
        medicineId: med.id,
        type: "REMINDER",
        channel: "SMS",
        status: "FAILED", // Trigger failed reminder alert
        errorReason: "Number unreachable",
        sentAt: subMinutes(new Date(), 30)
      },
      {
        userId: userA.id,
        type: "WELCOME",
        channel: "WHATSAPP",
        status: "DELIVERED",
        sentAt: subDays(new Date(), 1)
      }
    ]
  });

  // 5. Create a Support Ticket
  console.log("Creating Support Ticket...");
  await prisma.supportTicket.create({
    data: {
      userId: userB.id,
      subject: "Help setting up Family plan",
      status: "OPEN",
      createdAt: subHours(new Date(), 5)
    }
  });

  console.log("Mock data seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
