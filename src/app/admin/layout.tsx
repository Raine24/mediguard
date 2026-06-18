import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !["SUPER_ADMIN", "ADMIN", "SUPPORT_AGENT"].includes(session.user.role)) {
    redirect("/admin/login");
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-gray-900">
      <AdminSidebar userRole={session.user.role} userName={session.user.name || "Admin"} />
      <div className="flex-1 overflow-auto bg-gray-50/50 relative w-full">
        {/* Main Content Area */}
        <main className="p-4 md:p-8 max-w-[1600px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
