"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { format, differenceInSeconds } from "date-fns";

type NextReminderProps = {
  time: string; // e.g., "14:00"
  medicineName: string;
  dosage: string | null;
  targetDateStr: string; // full ISO string of the target datetime
};

export default function NextReminderCard({ reminder }: { reminder: NextReminderProps | null }) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!reminder) return;

    const targetDate = new Date(reminder.targetDateStr);

    const calculateTimeLeft = () => {
      const now = new Date();
      const diffSecs = differenceInSeconds(targetDate, now);

      if (diffSecs <= 0) {
        setTimeLeft("Due now");
        return;
      }

      const hours = Math.floor(diffSecs / 3600);
      const minutes = Math.floor((diffSecs % 3600) / 60);

      if (hours > 0) {
        setTimeLeft(`in ${hours} hr ${minutes} min`);
      } else {
        setTimeLeft(`in ${minutes} min`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // update every minute

    return () => clearInterval(interval);
  }, [reminder]);

  if (!reminder) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-gray-500 font-medium mb-1 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Next Reminder
        </h3>
        <p className="text-gray-900 text-lg">No upcoming reminders for today.</p>
      </div>
    );
  }

  // Parse time for nice display (e.g. 14:00 -> 2:00 PM)
  const [hours, minutes] = reminder.time.split(':').map(Number);
  const displayDate = new Date();
  displayDate.setHours(hours, minutes, 0, 0);
  const formattedTime = format(displayDate, "h:mm a");

  return (
    <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl p-6 shadow-md text-white relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" aria-hidden="true" />
      
      <div className="relative z-10">
        <h3 className="text-teal-50 font-medium mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
          <Clock className="w-4 h-4" />
          Next Reminder
        </h3>
        
        <div className="flex items-end gap-3 mb-1">
          <span className="text-4xl font-bold tracking-tight">{formattedTime}</span>
          <span className="text-teal-100 font-medium mb-1 bg-black/20 px-2 py-0.5 rounded-full text-sm">
            {timeLeft}
          </span>
        </div>
        
        <p className="text-lg font-medium text-white">
          {reminder.medicineName} {reminder.dosage && <span className="text-teal-100 font-normal">({reminder.dosage})</span>}
        </p>
      </div>
    </div>
  );
}
