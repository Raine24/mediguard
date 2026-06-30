import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import SubscriptionGuard from "@/components/dashboard/SubscriptionGuard";
import { prisma } from "@/lib/prisma";
import { isAfter } from "date-fns";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  if ((session.user as any).role === "AFFILIATE") {
    redirect("/affiliate/dashboard");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { subscription: true }
  });

  if (!user) {
    redirect("/login");
  }

  const isSubActive = user.subscription?.status === "ACTIVE";
  const expiryDate = user.subscription?.expiryDate ? new Date(user.subscription.expiryDate) : null;
  const isExpired = !isSubActive || (expiryDate !== null && isAfter(new Date(), expiryDate));

  return (
    <DashboardShell user={session.user}>
      <SubscriptionGuard isExpired={isExpired}>
        {children}
      </SubscriptionGuard>
    </DashboardShell>
  );
}
