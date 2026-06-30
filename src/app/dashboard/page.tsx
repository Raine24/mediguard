import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format, isAfter, isSameDay, differenceInDays, parse } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import Link from "next/link";
import { Plus, History, Users, AlertTriangle, CheckCircle2, XCircle, Clock } from "lucide-react";
import NextReminderCard from "@/components/dashboard/NextReminderCard";
import AutoRefresh from "@/components/dashboard/AutoRefresh";

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscription: true,
      medicines: {
        where: { status: "ACTIVE" },
        include: { reminders: true },
      },
    },
  });

  if (!user) redirect("/login");

  // Time calculations
  const timezone = user.timezone || "UTC";
  const now = new Date();
  
  // Get today's logs to check status of reminders
  // We need start and end of day in UTC that corresponds to the user's local day
  const localTodayStr = formatInTimeZone(now, timezone, "yyyy-MM-dd");
  const localStartOfDay = fromZonedTime(`${localTodayStr} 00:00:00`, timezone);
  const localEndOfDay = fromZonedTime(`${localTodayStr} 23:59:59`, timezone);

  const todaysLogs = await prisma.messageLog.findMany({
    where: {
      userId: user.id,
      scheduledFor: {
        gte: localStartOfDay,
        lte: localEndOfDay,
      },
      type: "REMINDER",
    },
  });

  // Build Today's Schedule
  type ScheduleItem = {
    id: string;
    timeStr: string; // HH:mm
    targetDate: Date; // exact UTC datetime this is supposed to trigger
    medicineId: string;
    medicineName: string;
    dosage: string | null;
    status: "UPCOMING" | "SENT" | "FAILED" | "PAUSED";
    errorReason?: string | null;
  };

  let schedule: ScheduleItem[] = [];

  for (const med of user.medicines) {
    // Check if daysActive matches today. For now, assume EVERY_DAY.
    // TODO: proper daysActive checking.
    
    for (const reminder of med.reminders) {
      // Calculate exact UTC time for this reminder today
      const targetDate = fromZonedTime(`${localTodayStr} ${reminder.time}:00`, timezone);
      
      // Find matching log
      const log = todaysLogs.find(l => 
        l.medicineId === med.id && 
        l.scheduledFor && 
        Math.abs(l.scheduledFor.getTime() - targetDate.getTime()) < 60000 // within 1 minute
      );

      let status: ScheduleItem["status"] = "UPCOMING";
      if (user.subscription?.status === "EXPIRED") {
        status = "PAUSED";
      } else if (log) {
        status = log.status === "DELIVERED" ? "SENT" : "FAILED";
      }

      schedule.push({
        id: `${med.id}-${reminder.time}`,
        timeStr: reminder.time,
        targetDate,
        medicineId: med.id,
        medicineName: med.name,
        dosage: med.dosage,
        status,
        errorReason: log?.errorReason,
      });
    }
  }

  // Sort chronologically
  schedule.sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime());

  // Find next reminder
  const nextItem = schedule.find(item => item.status === "UPCOMING" && isAfter(item.targetDate, now));
  
  let nextReminderProps = null;
  if (nextItem) {
    nextReminderProps = {
      time: nextItem.timeStr,
      medicineName: nextItem.medicineName,
      dosage: nextItem.dosage,
      targetDateStr: nextItem.targetDate.toISOString(),
    };
  }

  // Subscription logic
  let isSubActive = user.subscription?.status === "ACTIVE";
  let daysRemaining = user.subscription?.expiryDate 
    ? differenceInDays(new Date(user.subscription.expiryDate), now)
    : 0;

  if (isSubActive && user.subscription?.expiryDate && isAfter(now, new Date(user.subscription.expiryDate))) {
    isSubActive = false;
  }

  const showWarning = !isSubActive || daysRemaining <= 7;

  return (
    <div className="space-y-6">
      <AutoRefresh intervalMs={30000} />

      {/* Warning Banner */}
      {showWarning && (
        <div className={`p-4 rounded-xl flex items-center justify-between ${!isSubActive ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm sm:text-base">
                {!isSubActive ? "Your reminders are paused." : `Subscription expires in ${daysRemaining} days.`}
              </p>
              <p className="text-xs sm:text-sm mt-0.5 opacity-90">
                {!isSubActive ? "Renew to reactivate." : "Renew now to avoid interruption."}
              </p>
            </div>
          </div>
          <Link 
            href="/dashboard/billing" 
            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${!isSubActive ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-amber-600 text-white hover:bg-amber-700'}`}
          >
            Renew Now
          </Link>
        </div>
      )}

      {/* Top Status Bar */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Hi, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {formatInTimeZone(now, timezone, "EEEE, MMMM do")}
          </p>
        </div>

        <div className="text-right">
          <div className="inline-flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isSubActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isSubActive ? 'Active' : 'Expired'}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1 font-medium">
            {user.phone}
          </div>
        </div>
      </div>

      {/* Next Reminder Card */}
      <NextReminderCard reminder={nextReminderProps} />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Link href="/dashboard/medicines" className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-2xl hover:border-teal-500 hover:shadow-md transition-all group">
          <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-2 group-hover:bg-teal-600 group-hover:text-white transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-gray-900">Add Med</span>
        </Link>
        <Link href="/dashboard/history" className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-2xl hover:border-teal-500 hover:shadow-md transition-all group">
          <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-2 group-hover:bg-teal-600 group-hover:text-white transition-colors">
            <History className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-gray-900">History</span>
        </Link>
        {user.subscription?.planType === "FAMILY" && (
          <Link href="/dashboard/family" className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-2xl hover:border-teal-500 hover:shadow-md transition-all group col-span-2 md:col-span-1">
            <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-2 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-gray-900">Caretaker</span>
          </Link>
        )}
      </div>

      {/* Today's Schedule */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          Today's Schedule
        </h2>
        
        {schedule.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-medium mb-1">No medicines scheduled today</h3>
            <p className="text-sm text-gray-500">Tap 'Add Med' to set up your first reminder.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {schedule.map((item, index) => {
                const isPast = item.status !== "UPCOMING" || isAfter(now, item.targetDate);
                
                // Format time to 12-hour
                const [h, m] = item.timeStr.split(':').map(Number);
                const d = new Date();
                d.setHours(h, m, 0, 0);
                const displayTime = format(d, "h:mm a");

                return (
                  <div key={item.id} className={`p-4 sm:p-5 flex items-center gap-4 ${isPast && item.status === 'UPCOMING' ? 'opacity-50' : ''}`}>
                    
                    {/* Status Icon Indicator */}
                    <div className="flex-shrink-0">
                      {item.status === "SENT" ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : item.status === "FAILED" ? (
                        <XCircle className="w-6 h-6 text-red-500" />
                      ) : item.status === "PAUSED" ? (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-teal-500 bg-white"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                        <div>
                          <p className={`text-base font-bold truncate ${item.status === 'FAILED' ? 'text-red-900' : 'text-gray-900'}`}>
                            {item.medicineName} {item.dosage && <span className="font-normal text-gray-500">({item.dosage})</span>}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                              {displayTime}
                            </span>
                            {item.status === "FAILED" && (
                              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                                Failed to send
                              </span>
                            )}
                            {item.status === "SENT" && (
                              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                                Delivered
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {item.status === "FAILED" && item.errorReason && (
                        <p className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                          {item.errorReason}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
