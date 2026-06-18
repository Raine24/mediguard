import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import MedicinesClient from "@/components/dashboard/MedicinesClient";

export default async function MedicinesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscription: true,
      medicines: {
        include: {
          reminders: {
            orderBy: { time: "asc" }
          }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!user) redirect("/login");

  const isBasicPlan = !user.subscription || user.subscription.planType === "BASIC";

  return <MedicinesClient medicines={user.medicines} isBasicPlan={isBasicPlan} />;
}
