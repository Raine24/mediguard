import { getAppUserId } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import FamilyClient from "@/components/dashboard/FamilyClient";

export default async function FamilyPage() {
  const userId = await getAppUserId();
  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
      familyMembers: {
        include: {
          medicines: {
            include: {
              reminders: {
                orderBy: { time: "asc" }
              }
            },
            orderBy: { createdAt: "desc" }
          }
        },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!user) redirect("/login");

  return <FamilyClient members={user.familyMembers} planType={user.subscription?.planType || "BASIC"} />;
}
