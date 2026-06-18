"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function addSubscriber(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;
    const planType = formData.get("plan") as "BASIC" | "STANDARD" | "FAMILY";

    if (!name || !email || !phone || !password || !planType) {
      return { error: "All fields are required" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        role: "PATIENT",
        name,
        email,
        phone,
        password: hashedPassword,
        subscription: {
          create: {
            planType,
            status: "ACTIVE",
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        }
      }
    });

    revalidatePath("/admin");
    revalidatePath("/admin/subscribers");
    return { success: true, user };
  } catch (err: any) {
    if (err.code === "P2002") {
      console.log(`[Admin Add] Unique constraint failed. A user with this email or phone already exists.`);
      return { error: "A user with this email or phone already exists." };
    }
    return { error: "Failed to add subscriber" };
  }
}

export async function getSubscribers(
  searchQuery: string = "",
  filters: { plan?: string; status?: string } = {},
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  // Build the Prisma "where" clause
  const where: any = { role: "PATIENT" };

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { email: { contains: searchQuery, mode: "insensitive" } },
      { phone: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  if (filters.plan && filters.plan !== "All") {
    where.subscription = { ...where.subscription, planType: filters.plan.toUpperCase() };
  }
  
  if (filters.status && filters.status !== "All") {
    where.subscription = { ...where.subscription, status: filters.status.toUpperCase() };
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        subscription: true,
        _count: {
          select: { medicines: true }
        }
      }
    })
  ]);

  return {
    subscribers: users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      plan: u.subscription?.planType || "NONE",
      status: u.subscription?.status || "INACTIVE",
      createdAt: u.createdAt.toISOString(),
      medicinesCount: u._count.medicines,
      riskLevel: "Low" // Could be calculated based on missed meds
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

export async function bulkUpdateSubscriptions(userIds: string[], action: "ACTIVATE" | "DEACTIVATE" | "EXTEND", days: number = 0) {
  try {
    if (action === "ACTIVATE") {
      await prisma.subscription.updateMany({
        where: { userId: { in: userIds } },
        data: { status: "ACTIVE" }
      });
    } else if (action === "DEACTIVATE") {
      await prisma.subscription.updateMany({
        where: { userId: { in: userIds } },
        data: { status: "INACTIVE" }
      });
    } else if (action === "EXTEND") {
      // updateMany doesn't support incrementing dates directly, so we must loop
      const subs = await prisma.subscription.findMany({ where: { userId: { in: userIds } } });
      for (const sub of subs) {
        if (sub.expiryDate) {
          const newDate = new Date(sub.expiryDate);
          newDate.setDate(newDate.getDate() + days);
          await prisma.subscription.update({
            where: { id: sub.id },
            data: { expiryDate: newDate }
          });
        }
      }
    }

    revalidatePath("/admin/subscribers");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function bulkDeleteAccounts(userIds: string[], password: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    const adminId = session.user.id;
    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin) return { error: "Admin not found" };

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) return { error: "Incorrect super admin password" };

    await prisma.user.deleteMany({
      where: { id: { in: userIds } }
    });

    revalidatePath("/admin/subscribers");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function resetUserPassword(userId: string, newPassword: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    revalidatePath("/admin/subscribers");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Failed to reset password" };
  }
}
