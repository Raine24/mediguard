import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import SubscriptionGuard from "@/components/dashboard/SubscriptionGuard";
import { prisma } from "@/lib/prisma";
import { isAfter } from "date-fns";
import { currentUser } from "@clerk/nextjs/server";
import crypto from "crypto";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userId: string | null = null;
  let userEmail: string | null = null;
  let userName: string | null = null;

  // 1. Check NextAuth session first
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    userId = session.user.id;
    userEmail = session.user.email || null;
    userName = session.user.name || null;
  }

  // 2. If no NextAuth session, check Clerk user
  if (!userId) {
    try {
      const clerkUser = await currentUser();
      if (clerkUser) {
        userEmail = clerkUser.emailAddresses?.[0]?.emailAddress || null;
        userName = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || userEmail;
      }
    } catch (e) {
      console.error("Clerk currentUser lookup error:", e);
    }
  }

  if (!userEmail && !userId) {
    redirect("/login");
  }

  // 3. Find or auto-provision DB User record
  let user = null;
  if (userId) {
    user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });
  } else if (userEmail) {
    user = await prisma.user.findFirst({
      where: { email: { equals: userEmail, mode: "insensitive" } },
      include: { subscription: true },
    });

    // Auto-create user if signed up via Google / Clerk for the first time
    if (!user) {
      const referralCode = crypto.randomBytes(4).toString("hex").toUpperCase();
      user = await prisma.user.create({
        data: {
          email: userEmail,
          name: userName || "User",
          password: "", // Clerk handles auth
          phone: `clerk_${Date.now()}`,
          country: "Unknown",
          timezone: "UTC",
          whatsappVerified: false,
          referralCode,
          subscription: {
            create: {
              planType: "BASIC",
              status: "ACTIVE", // 3-day free trial
              startDate: new Date(),
              expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            },
          },
        },
        include: { subscription: true },
      });
    }
  }

  if (!user) {
    redirect("/login");
  }

  if (user.role === "AFFILIATE") {
    redirect("/affiliate/dashboard");
  }

  if (!user.whatsappVerified) {
    redirect("/verify-phone");
  }

  const isSubActive = user.subscription?.status === "ACTIVE";
  const expiryDate = user.subscription?.expiryDate ? new Date(user.subscription.expiryDate) : null;
  const isExpired = !isSubActive || (expiryDate !== null && isAfter(new Date(), expiryDate));

  const shellUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  return (
    <DashboardShell user={shellUser}>
      <SubscriptionGuard isExpired={isExpired}>
        {children}
      </SubscriptionGuard>
    </DashboardShell>
  );
}

