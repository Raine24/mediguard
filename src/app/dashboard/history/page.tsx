import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import HistoryClient from "@/components/dashboard/HistoryClient";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  // Fetch last 30 days of logs
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const logs = await prisma.messageLog.findMany({
    where: {
      userId: session.user.id,
      sentAt: {
        gte: thirtyDaysAgo,
      },
      type: "REMINDER",
    },
    include: {
      medicine: {
        select: { name: true }
      }
    },
    orderBy: {
      sentAt: "desc",
    },
  });

  return <HistoryClient logs={logs} />;
}
