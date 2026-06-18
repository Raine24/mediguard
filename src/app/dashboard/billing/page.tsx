import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import BillingClient from "@/components/dashboard/BillingClient";

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscription: true,
    }
  });

  if (!user) redirect("/login");

  // We'll pass the subscription data to the client component to handle the UI and checkout logic
  return <BillingClient subscription={user.subscription} />;
}
