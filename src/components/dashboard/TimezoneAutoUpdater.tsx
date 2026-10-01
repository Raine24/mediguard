'use client';

import { useEffect, useRef } from "react";
import { updateTimezoneAction } from "@/app/dashboard/timezone-action";

export default function TimezoneAutoUpdater({ currentDbTimezone }: { currentDbTimezone: string | null }) {
  const updated = useRef(false);

  useEffect(() => {
    if (updated.current) return;
    
    try {
      const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // If the DB timezone is missing or differs from the real local timezone, update it silently.
      if (localTimezone && localTimezone !== currentDbTimezone) {
        updateTimezoneAction(localTimezone).catch(console.error);
        updated.current = true;
      }
    } catch (e) {
      console.error("Could not detect local timezone:", e);
    }
  }, [currentDbTimezone]);

  return null; // Silent background component
}
