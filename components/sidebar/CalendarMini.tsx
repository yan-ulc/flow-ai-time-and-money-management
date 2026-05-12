"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { format, isToday, isTomorrow, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { ScheduleCard } from "./ScheduleCard";

export function CalendarMini() {
  const { user } = useUser();
  const dbUser = useQuery(api.users.getUserByClerkId, user?.id ? { clerkId: user.id } : "skip");
  
  // Fetch ALL schedules for this user — filter client-side to avoid frozen timestamp issues
  const allSchedules = useQuery(
    api.schedules.getSchedules,
    dbUser ? { userId: dbUser._id } : "skip"
  );

  if (allSchedules === undefined) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-24 bg-muted rounded"></div>
        <div className="h-12 w-full bg-muted rounded"></div>
        <div className="h-12 w-full bg-muted rounded"></div>
      </div>
    );
  }

  // Filter client-side: items from today midnight onwards (wide window)
  const now = Date.now();
  const todayStart = startOfDay(now).getTime();
  const windowEnd = now + 30 * 24 * 60 * 60 * 1000;
  
  const schedules = allSchedules.filter((s) => {
    const isVisibleStatus = s.status === "upcoming" || (s.status === "done" && isToday(s.dateTime));
    return s.dateTime >= todayStart && s.dateTime <= windowEnd && isVisibleStatus;
  });

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2">
        Upcoming
      </h3>
      
      {schedules.length === 0 ? (
        <div className="text-sm text-muted-foreground px-2 py-4 text-center border border-dashed rounded-lg">
          No upcoming events
        </div>
      ) : (
        <div className="space-y-2">
          {schedules.slice(0, 10).map((schedule) => {
            const date = new Date(schedule.dateTime);
            let dayLabel = format(date, "EEE, MMM d");
            if (isToday(date)) dayLabel = "Today";
            else if (isTomorrow(date)) dayLabel = "Tomorrow";

            return <ScheduleCard key={schedule._id} schedule={schedule} dayLabel={dayLabel} />;
          })}
        </div>
      )}
    </div>
  );
}
